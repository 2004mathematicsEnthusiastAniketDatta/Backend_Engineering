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
  
  console.log("Creating topics...");
  await admin.createTopics({
    topics: [{
      topic: 'rider-updates',
      numPartitions: 2,
    }]
  });
  console.log("Topics created successfully");
  
  console.log("Disconnecting admin...");
  await admin.disconnect();
  console.log("Admin disconnected");
}

init().catch(console.error);