import redisClient from "../config/redisConfig";
import { User } from "../types";

/**
 * Store a user in an ordered set in Redis, where the key represents the location
 * and the user is stored with a score based on the current timestamp.
 *
 * @param key key to store user in
 * @param user The user object to store, which will be serialized to JSON.
 * @returns The number of elements added to the sorted set (not including all the elements already present).
 *          If an error occurs, it returns null.
 */
export const storeUserToKey = async (
  key: string,
  user: User,
): Promise<number | null> => {
  console.log(`Storing user in key: ${key} for user: ${JSON.stringify(user)}`);
  return redisClient.zAdd(key, [
    { score: Date.now(), value: JSON.stringify(user) },
  ]);
};

/**
 * Remove a user from an ordered set in Redis.
 *
 * This function removes the specified user from the ordered set identified by the given key.
 *
 * @param key - The key of the ordered set from which the user will be removed.
 * @param user - The string representation of the user to be removed from the ordered set.
 * @returns The number of elements removed from the sorted set (1 if the user was removed, 0 if the user was not found).
 *          Returns null if an error occurs during the operation.
 */
export const removeUserFromKey = async (
  key: string,
  user: string,
): Promise<number | null> => {
  console.log(`Removing user from: ${key} for user: ${user}`);
  return redisClient.zRem(key, user);
};

/**
 * Transfers user to the difficulty queue based on the user's difficulty level.
 */
export const transferToDifficultyQueue = async (user: User): Promise<void> => {
  const difficultyKey = `difficulty:${user.difficulty}`;
  const res = await storeUserToKey(difficultyKey, user);
  if (res === null) {
    console.error(
      `Error storing user in difficulty queue for difficulty: ${user.difficulty}`,
    );
  }
};

/**
 * Transfers user to the topic queue based on the user's topic.
 */
export const transferToTopicQueue = async (user: User): Promise<void> => {
  const topicKey = `topic:${user.topic}`;
  const res = await storeUserToKey(topicKey, user);
  if (res === null) {
    console.error(`Error storing user in topic queue for topic: ${user.topic}`);
  }
};
