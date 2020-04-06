const { Pool, Client } = require('pg')

// Pattern based on: https://node-postgres.com/guides/project-structure

const connectionString = process.env.DATABASE_URL

const pool = new Pool({
    connectionString: connectionString
})

module.exports = {
  query: (text, params, callback) => {
    return pool.query(text, params, callback)
  },
  getStandaloneClient: (callback) => {
    var client = new Client(connectionString);
    client.connect();
    callback(client);
  },
  getClient: (callback) => {
    pool.connect((err, client, done) => {
        if (err) {
            console.error('Error while connecting to database', err);
        }

        callback(err, client, done)
    })
  }
}