// src/routes/questions.ts
import express, { Request, Response } from 'express';
import { Collection } from 'mongodb';
import { connectToDB } from '../db/mongoClient';
import { Questions } from '../models/types';

const router = express.Router();
let questionsCollection: Collection<Questions>;

// Middleware to connect to MongoDB and get the collection
router.use(async (_, res, next) => {
  try {
    const db = await connectToDB();
    questionsCollection = db.collection<Questions>('questions');
    next();
  } catch (err) {
    console.error('MongoDB connection error:', err);
    res.status(500).json({ error: `Failed to connect to MongoDB: ${err}` });
  }
});

// POST a new question
router.post('/', async (req: Request, res: Response) => {
  try {
    const newQuestion: Questions = req.body; // Assume the body contains a question object
    
    const { _question_id, difficulty, description, examples, constraints, tags, title_slug, title, pictures } = newQuestion;

    if (
      typeof _question_id !== 'number' ||
      typeof difficulty !== 'number' ||
      typeof description !== 'string' ||
      !Array.isArray(examples) ||
      typeof constraints !== 'string' ||
      !Array.isArray(tags) ||
      typeof title_slug !== 'string' ||
      typeof title !== 'string'
    ) {
      return res.status(400).json({ error: 'Invalid question data. Please check your input.' });
    }

    const result = await questionsCollection.insertOne(newQuestion);

    res.status(201).json({ message: 'Question inserted successfully', questionId: result.insertedId });
  } catch (error) {
    console.error('Error inserting question:', error);
    res.status(500).json({ error: 'Failed to insert question' });
  }
});

export default router;
