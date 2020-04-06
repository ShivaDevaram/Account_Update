const Kafka = require('no-kafka');
const kafkaConfig = require('./kafkaConfig.js');

const producer = new Kafka.Producer(kafkaConfig);

producer.init().then(function(){
    console.log('Producer initialized');
});

module.exports = producer;