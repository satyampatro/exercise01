var MongoClient = require('mongodb').MongoClient;

global.mongo = null;
module.exports = async function (mongoString) {
    mongo = await MongoClient.connect(mongoString, {
        useNewUrlParser: true,
        poolSize: 10
    });
    mongo.on('close', () => {
        console.error('Lost mongo connection.');
    });
    mongo.on('reconnect', () => {
        console.error('Reconnected mongo connection automatically.');
    });
}