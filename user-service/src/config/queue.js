const amqp = require("amqplib");

let channel, connection;

async function connectQueue() {
  connection = await amqp.connect(process.env.QUEUE_SERVICE_URL);
  channel = await connection.createChannel();
  console.log("✅ RabbitMQ Connected");
}

async function sendEvent(queueName, message) {
  if (!channel) await connectQueue();

  await channel.assertQueue(queueName, { durable: true });

  channel.sendToQueue(
    queueName,
    Buffer.from(JSON.stringify(message))
  );
}

async function listenEvent(queueName, onProcess) {
  if (!channel) await connectQueue();

  await channel.assertQueue(queueName, { durable: true });

  channel.consume(queueName, async (data) => {
    if (data !== null) {
      onProcess(JSON.parse(data.content.toString()));
      channel.ack(data);
    }
  });
}

module.exports = { sendEvent, listenEvent, connectQueue };