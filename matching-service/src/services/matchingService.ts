import redisClient from "../config/redisConfig";
import { SECONDS } from "../lib/constants";
import {
  transferToTopicQueue,
  removeUserFromKey,
  transferToDifficultyQueue,
} from "../model/userModel";
import { User } from "../types";
import { sendToQueue } from "./rabbitMqService";

/**
 * Check match in queue, if there is a match, we will remove that user from the queue, and return
 * a response to rabbit.
 * If there is no match, we will return null.
 *
 * @param topic
 * @returns User if there is a match, null if there is no match
 */
export const checkMatch = async (key: string): Promise<User | null> => {
  const match = await redisClient.zRange(key, 0, 0); // Get the first user in the topic queue

  // Match found, remove the user from the key value store
  if (match.length > 0) {
    const user = JSON.parse(match[0]) as User;
    const res = await removeUserFromKey(key, match[0]);
    if (res === null) {
      console.error(`Error removing user from queue for key: ${key}`);
    }
    return user;
  }
  return null;
};

/**
 * Transfers users from the topic queue to the difficulty queue if they are older than 15 seconds.
 * If they are older than 45 seconds in the difficulty queue, they will be removed.
 */
export const processOldUsers = async (): Promise<void> => {
  const allTopics = await redisClient.keys("topic:*");
  const thresholdTime = Date.now() - 15 * SECONDS;

  for (const topicKey of allTopics) {
    // Getting all users in the topic queue that are older than 15 seconds
    const usersToTransfer = await redisClient.zRangeByScore(
      topicKey,
      0,
      thresholdTime,
    );
    for (const userString of usersToTransfer) {
      const user = JSON.parse(userString) as User;
      await removeUserFromKey(topicKey, userString); // Remove from topic queue

      // Check if there is a match in the difficulty queue
      const match = await checkMatch(`difficulty:${user.difficulty}`);
      if (match) {
        // Send to user subscribed queues if there is a match
        await sendToQueue(match._id, {
          status: "matched",
          user1: match,
          user2: user,
        });
        await sendToQueue(user._id, {
          status: "matched",
          user1: match,
          user2: user,
        });
        continue;
      }

      // Transfer to difficulty queue if there is no match
      await transferToDifficultyQueue(user);
    }
  }

  // Get rid of users older than 45 seconds in the difficulty queue
  // This is to give enough time for user to match by difficulty
  const allDifficulties = await redisClient.keys("difficulty:*");
  const thresholdTime2 = Date.now() - 45 * SECONDS;

  for (const difficultyKey of allDifficulties) {
    const usersToRemove = await redisClient.zRangeByScore(
      difficultyKey,
      0,
      thresholdTime2,
    );
    for (const userString of usersToRemove) {
      await removeUserFromKey(difficultyKey, userString);

      const user = JSON.parse(userString) as User;

      await sendToQueue(user._id, { status: "no match" });
    }
  }
};

// Process a new user and attempt matching
export const processNewUser = async (user: User): Promise<void> => {
  const match = await checkMatch(`topic:${user.topic}`);

  // match found
  if (match) {
    await sendToQueue(match._id, {
      status: "matched",
      user1: match,
      user2: user,
    });
    await sendToQueue(user._id, {
      status: "matched",
      user1: match,
      user2: user,
    });
  } else {
    // Add to the topic queue if no match
    await transferToTopicQueue(user);
  }
};

// Start background transfer process, polling every 5 sec
export const startBackgroundTransfer = () => {
  setInterval(async () => {
    await processOldUsers();
  }, 5 * SECONDS);
};
