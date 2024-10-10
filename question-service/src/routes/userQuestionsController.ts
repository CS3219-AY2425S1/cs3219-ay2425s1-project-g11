// src/routes/items.ts
import express, { Request, Response } from 'express';
import { Collection } from 'mongodb';
import { connectToDB } from '../db/mongoClient';
import { UserQuestionsSchema } from '../models/types';
import { z } from 'zod';

const router = express.Router();
let questionsCollection: Collection<UserQuestions>;
type UserQuestions = z.infer<typeof UserQuestionsSchema>;

// Middleware to connect to MongoDB and get the collection
router.use(async (_, res, next) => {
  try {
    const db = await connectToDB();
    questionsCollection = db.collection<UserQuestions>('user_questions');
    next();
  } catch (error) {
    res.status(500).json({ error: 'Failed to connect to MongoDB' });
  }
});

// GET all items
router.get('/', async (_, res: Response) => {
  try {
    const items = await questionsCollection.find().toArray();
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch items' });
  }
});

export default router;
