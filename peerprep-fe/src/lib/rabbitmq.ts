/* eslint-disable @typescript-eslint/no-explicit-any */
import { Client, IFrame, IMessage } from '@stomp/stompjs';

let isConnected = false;

const sendMessageToQueue = async (message: Record<string, any>) => {
  const uri = process.env.NEXT_PUBLIC_RABBITMQ_URL;
  const user = process.env.NEXT_PUBLIC_RABBITMQ_USER;
  const pass = process.env.NEXT_PUBLIC_RABBITMQ_PW;

  if (isConnected) {
    return; // Prevent sending if already connected
  }

  try {
    const client = new Client({
      brokerURL: uri, // WebSocket URL for RabbitMQ Broker
      connectHeaders: {
        login: user!,
        passcode: pass!,
      },
      reconnectDelay: 5000, // auto-reconnect after 5 seconds if connection fails
    });

    client.onConnect = () => {
      isConnected = true; // Update connection status
      const queue = process.env.NEXT_PUBLIC_QUEUE;
      const messageStr = JSON.stringify(message);

      client.publish({
        destination: queue!,
        body: messageStr,
        headers: { persistent: 'true' },
      });

      console.log(`Message sent to queue "${queue}":`, message);
      client.deactivate(); // Deactivate client after sending
      isConnected = false; // Reset connection status
    };

    client.onStompError = (error: IFrame) => {
      console.error('STOMP Error:', error);
      throw new Error('Error connecting to RabbitMQ via STOMP');
    };

    client.activate();
  } catch (err) {
    console.error('Error sending message to RabbitMQ:', err);
    throw err;
  }
};

const consumeMessageFromQueue = async (
  queue: string,
  onMessage: (message: any) => void,
) => {
  const uri = process.env.NEXT_PUBLIC_RABBITMQ_URL;
  const user = process.env.NEXT_PUBLIC_RABBITMQ_USER;
  const pass = process.env.NEXT_PUBLIC_RABBITMQ_PW;
  try {
    const client = new Client({
      brokerURL: uri, // WebSocket URL for RabbitMQ
      connectHeaders: {
        login: user!,
        passcode: pass!,
      },
      reconnectDelay: 5000,
    });

    client.onConnect = () => {
      client.subscribe(queue, (msg: IMessage) => {
        const messageContent = JSON.parse(msg.body);
        console.log(`Received:`, messageContent);
        onMessage(messageContent);
        client.deactivate();
      });

      console.log(`Waiting for messages in ${queue}...`);
    };

    client.onStompError = (error: IFrame) => {
      console.log('STOMP Error:', error);
      throw new Error('Error connecting to RabbitMQ via STOMP: ' + error.headers['message']);
    };

    client.activate();
  } catch (error) {
    console.error('Error in consuming messages:', error);
    throw error;
  }
};

export { sendMessageToQueue, consumeMessageFromQueue };