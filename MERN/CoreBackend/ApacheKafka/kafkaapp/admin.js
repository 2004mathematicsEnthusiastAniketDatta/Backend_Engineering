const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'my-app',
  brokers: ['http://192.168.1.8:9092'] // Replace with your Kafka broker addresses
});
async function init(){
    const admin = kafka.admin();
    console.log("Admin connecting...");
    await admin.connect();
    console.log("Admin connected");
}