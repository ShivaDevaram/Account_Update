var brokerUrls = process.env.KAFKA_URL.replace(/\+ssl/g,'');

module.exports = {
    connectionString: brokerUrls,
    ssl: {
      certFile: process.env.KAFKA_CLIENT_CERT, //'./client.crt',
      keyFile: process.env.KAFKA_CLIENT_CERT_KEY //'./client.key'
    }
}