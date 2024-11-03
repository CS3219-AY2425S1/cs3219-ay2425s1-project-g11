import crypto from "crypto";

export const generateMatchId = (userId: string, matchId: string): string => {
  // Concatenate the IDs
  const combinedIds = `${userId}-${matchId}`;

  // Hash the concatenated string using SHA-256
  return crypto.createHash("sha256").update(combinedIds).digest("hex");
};
