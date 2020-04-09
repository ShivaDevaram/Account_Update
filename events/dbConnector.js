const consumer = require('./consumer.js');
const producer = require('./producer.js');

const db = require('../db');


class DbConnector {

    constructor() {

    }

    init() {
        db.getStandaloneClient(async (client) => {
            try {
                const res = await client.query('SELECT * FROM event_process');
                
                if (res.rows && res.rows.length > 0) {
                    console.log('Querying latest data');
                    console.log(res.rows[0]);
                    await this.queryLatest(client, res.rows[0]);
                }
                else {
                    let now = new Date();
                    console.log('Initializing event process table');
                    await client.query('INSERT INTO event_process(last_event_process_date) values ($1)', [now]);
                }

                const query = client.query('LISTEN profile_update');
                const accQuery = client.query('LISTEN account_update');
                client.on('notification', async (data) => {
                    if(data.channel === 'profile_update'){
                        const payload = JSON.parse(data.payload);
                        this.handleNotification(client, payload,process.env.KAFKA_TOPIC);
                        
                    }else if(data.channel === 'account_update'){
                        const payload = JSON.parse(data.payload);
                        this.handleNotification(client, payload,process.env.KAFKA_ACCOUNT_TOPIC);

                        
                    }
                   
                });

               
            }
            catch (err) {
                console.error('Error while initializing DbConnector', err);
                client.release();
            }


        });
    }

    async queryLatest(client, lastProcess) {
        const recentUserUpdates = await client.query('SELECT * FROM salesforce.user where systemmodstamp > $1 order by systemmodstamp desc', [lastProcess.last_event_process_date]);
        if (recentUserUpdates.rows && recentUserUpdates.rows.length > 0) {
            console.log('Found %d user rows since last processing', recentUserUpdates.rows.length);
            recentUserUpdates.rows.forEach(row => {
                this.handleNotification(client, row,process.env.KAFKA_TOPIC);
            });
        }
        else {
            console.log('No contact rows found to update');
        }

        // Querying the Account Updates
        const recentAccountUpdates = await client.query('SELECT * FROM salesforce.account where systemmodstamp > $1 order by systemmodstamp desc', [lastProcess.last_event_process_date]);
        if (recentAccountUpdates.rows && recentAccountUpdates.rows.length > 0) {
            console.log('Found %d account rows since last processing', recentAccountUpdates.rows.length);
            recentAccountUpdates.rows.forEach(row => {
                this.handleNotification(client, row,process.env.KAFKA_ACCOUNT_TOPIC);
            });
        }
        else {
            console.log('No account rows found to update');
        }


    }

    async updateLastProcessDate(client, recentContactRow) {
        let lastModifiedDate = recentContactRow.systemmodstamp;
        await client.query('UPDATE event_process SET last_event_process_date = $1 WHERE last_event_process_date < $1', [lastModifiedDate]);
    }

    async handleNotification(client, payload,topicName) { 
        console.log('Row Updated: ', payload);

        producer.send({
            topic:topicName,
            partition: 0,
            message: {
                value: JSON.stringify(payload)
            }
        }).catch(err => {
          console.error('Error while sending to topic, ' + err);
        });

        await this.updateLastProcessDate(client, payload);
    }

}


module.exports = { DbConnector };



