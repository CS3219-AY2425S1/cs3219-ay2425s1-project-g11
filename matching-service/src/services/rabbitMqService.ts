import amqp, { Channel } from "amqplib";
import { User } from "../types";
import { processNewUser } from "./matchingService";
import { SECONDS } from "../lib/constants";

let channel: Channel;
const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://localhost";
const QUEUE = process.env.MATCHING_SERVICE_QUEUE || "matching-service";

/**
 * Establish a connection to RabbitMQ
 */
export const initRabbitMQ = async (): Promise<void> => {
  try {
    const connection = await amqp.connect(RABBITMQ_URL);
    channel = await connection.createChannel();
    console.log("Connected to RabbitMQ");

    // Subscribe to the queue upon successful connection
    await subscribeToQueue<User>(QUEUE, processNewUser);

    // when connection close, initiate reconnection
    connection.on("close", async () => {
      await reconnectRabbitMQ();
    });
  } catch (err) {
    console.error(
      "Error initialising connection with RabbitMQ connection error:",
      err,
    );
  }
};

/**
 * This will only trigger after an initial connection is made
 */
export const reconnectRabbitMQ = async (): Promise<void> => {
  const reconnectDelay = 30 * SECONDS;
  while (true) {
    try {
      await initRabbitMQ();
      break; // Break out of the loop if successfully connected
    } catch (err) {
      console.log(
        `Retrying to connect to RabbitMQ in ${reconnectDelay} seconds...`,
      );
      await new Promise((resolve) => setTimeout(resolve, reconnectDelay));
    }
  }
};

/**
 * Get the RabbitMQ channel
 * @returns RabbitMQ channel
 */
export const getChannel = (): amqp.Channel => {
  if (!channel) {
    throw new Error("RabbitMQ channel is not initialized");
  }
  return channel;
};

/**
 * Subscribes to a RabbitMQ queue and calls the callback function when a message is received.
 * @param queue queue to subscribe to
 * @param callback callback when message is received
 */
export const subscribeToQueue = async <T>(
  queue: string,
  callback: (message: T) => void,
): Promise<void> => {
  try {
    if (!channel) throw new Error("RabbitMQ channel is not initialized");

    await channel.assertQueue(queue);
    console.log(`Subscribed to RabbitMQ queue "${queue}"`);

    channel.consume(queue, (msg) => {
      if (msg !== null) {
        const message: T = JSON.parse(msg.content.toString());
        console.log(
          `Received message from RabbitMQ queue "${queue}":`,
          message,
        );
        callback(message);
        channel.ack(msg);
      }
    });
  } catch (err) {
    console.error(`Error subscribing to RabbitMQ queue "${queue}":`, err);
  }
};

/**
 * Sends a payload to a RabbitMQ queue
 * @param queue queue to send payload to
 * @param payload payload object to send
 */
export const sendToQueue = async (
  queue: string,
  payload: Object,
): Promise<void> => {
  try {
    if (!channel) throw new Error("RabbitMQ channel is not initialized");

    await channel.assertQueue(queue);

    await channel.sendToQueue(queue, Buffer.from(JSON.stringify(payload)));
    console.log(`User sent to RabbitMQ queue "${queue}":`, payload);
  } catch (err) {
    console.error(`Error sending to RabbitMQ queue "${queue}":`, err);
  }
};
