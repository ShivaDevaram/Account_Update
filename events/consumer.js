const Kafka = require('no-kafka');
const kafkaConfig = require('./kafkaConfig.js');

const consumer = new Kafka.SimpleConsumer(kafkaConfig);

module.exports = { consumer };