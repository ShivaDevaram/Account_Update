var brokerUrls = process.env.KAFKA_URL.replace(/\+ssl/g,'');

module.exports = {
    connectionString: brokerUrls,
    ssl: {
      certFile: './client.crt',
      keyFile: './client.key'
    }
}