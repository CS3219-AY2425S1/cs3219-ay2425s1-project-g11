import express, { Request, Response } from 'express';
import { Collection } from 'mongodb';
import { connectToDB } from '../db/mongoClient';

const router = express.Router();
let questionsCollection: Collection;

// Middleware to connect to MongoDB and get the collection
router.use(async (_, res, next) => {
  try {
    const db = await connectToDB();
    questionsCollection = db.collection('questions');
    next();
  } catch (err) {
    console.error('MongoDB connection error:', err);
    res.status(500).json({ error: `Failed to connect to MongoDB: ${err}` });
  }
});

// DELETE a question
router.delete('/:questionId', async (req: Request, res: Response) => {
  const { questionId } = req.params;

  try {
    const result = await questionsCollection.deleteOne({ _question_id: Number(questionId) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Question not found.' });
    }

    res.status(200).json({ message: 'Question deleted successfully' });
  } catch (error) {
    console.error('Error deleting question:', error);
    res.status(500).json({ error: 'Failed to delete question' });
  }
});

export default router;