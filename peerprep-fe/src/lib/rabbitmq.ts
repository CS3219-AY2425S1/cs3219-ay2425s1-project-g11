/* eslint-disable @typescript-eslint/no-explicit-any */
'use server';

import { connect } from 'amqplib';

export const sendMessageToQueue = async (message: Record<string, any>) => {
  try {
    // 1. Connect to RabbitMQ server
    const connection = await connect(process.env.RABBITMQ_URL!);

    // 2. Create a channel
    const channel = await connection.createChannel();

    // 3. Ensure the queue exists
    const queue = process.env.MATCHING_SERVICE_QUEUE!;
    await channel.assertQueue(queue, {
      durable: true,
    });

    // 4. Send a message to the queue
    const messageBuffer = Buffer.from(JSON.stringify(message));
    channel.sendToQueue(queue, messageBuffer, {
      persistent: true,
    });

    console.log(`Message sent to queue "${queue}":`, message);

    // 5. Close the channel and connection
    setTimeout(() => {
      channel.close();
      connection.close();
    }, 500);
  } catch (err) {
    console.error('Error sending message to RabbitMQ:', err);
    throw err;
  }
};
