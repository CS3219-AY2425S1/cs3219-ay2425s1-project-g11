// src/routes/items.ts
import express, { Request, Response } from 'express';
import { Collection, ObjectId } from 'mongodb';
import { connectToDB } from '../db/mongoClient';
import { QuestionsSchema } from '../models/types';
import { z } from 'zod';

const router = express.Router();
type Questions = z.infer<typeof QuestionsSchema>;

let questionsCollection: Collection<Questions>;

// Middleware to connect to MongoDB and get the collection
router.use(async (_, res, next) => {
  try {
    const db = await connectToDB();
    questionsCollection = db.collection<Questions>('questions');
    next();
  } catch (err) {
    res.status(500).json({ error: `Failed to connect to MongoDB, ${err}` });
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

// Update a question
router.put('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const parsedResult = QuestionsSchema.safeParse(req.body);
  if (!parsedResult.success) {
    return res
      .status(400)
      .json({ error: 'Invalid question data. Please check your input.' });
  }

  try {
    const result = await questionsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: parsedResult.data },
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Question not found.' });
    }

    res.status(200).json({
      message: 'Question updated successfully',
      data: [{ _id: id }],
    });
  } catch (error) {
    console.error('Error updating question:', error);
    res.status(500).json({ error: 'Failed to update question' });
  }
});

// POST a new question
router.post('/', async (req: Request, res: Response) => {
  const parseResult = QuestionsSchema.safeParse(req.body);

  if (!parseResult.success) {
    return res
      .status(400)
      .json({ error: 'Invalid question data. Please check your input.' });
  }
  try {
    const result = await questionsCollection.insertOne(parseResult.data);
    res
      .status(201)
      .json({ message: 'Question created successfully', data: [result] });
  } catch (error) {
    res.status(500).json({ error: 'Failed to insert question' });
  }
});

// DELETE a question
router.delete('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const result = await questionsCollection.deleteOne({
      _id: new ObjectId(id),
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Question not found.' });
    }

    res.status(200).json({
      message: 'Question deleted successfully',
      data: [
        {
          _id: id,
        },
      ],
    });
  } catch (error) {
    console.error('Error deleting question:', error);
    res.status(500).json({ error: 'Failed to delete question' });
  }
});

export default router;
