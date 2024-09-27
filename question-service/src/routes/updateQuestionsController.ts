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

// PUT to update a question
router.put('/:questionId', async (req: Request, res: Response) => {
  const { questionId } = req.params;
  const updatedQuestion: Questions = req.body;

  try {
    if (!updatedQuestion || typeof updatedQuestion !== 'object') {
      return res.status(400).json({ error: 'Invalid question data.' });
    }

    const result = await questionsCollection.updateOne(
      { _question_id: Number(questionId) },
      { $set: updatedQuestion }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Question not found.' });
    }

    res.status(200).json({ message: 'Question updated successfully' });
  } catch (error) {
    console.error('Error updating question:', error);
    res.status(500).json({ error: 'Failed to update question' });
  }
});

export default router;