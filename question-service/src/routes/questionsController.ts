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

// GET all unique tags
router.get('/tags', async (_: Request, res: Response) => {
  try {
    const uniqueTags = await questionsCollection
      .aggregate([
        { $unwind: '$tags' },
        { $group: { _id: '$tags' } },
        { $project: { _id: 0, tag: '$_id' } },
      ])
      .toArray();

    const tags = uniqueTags.map((item) => item.tag);
    res.status(200).json(tags);
  } catch (error) {
    console.error('Error fetching tags:', error);
    res.status(500).json({ error: 'Failed to fetch tags' });
  }
});

// GET all items with filters
router.get('/', async (req: Request, res: Response) => {
  try {
    const {
      difficulty,
      status,
      topics,
      search,
      page = '1',
      limit = '20',
    } = req.query;

    // Add pagination
    const pageNumber = parseInt(page as string);
    const limitNumber = parseInt(limit as string);
    const skip = (pageNumber - 1) * limitNumber;

    // Build the query object
    const query: Record<string, any> = {};
    const conditions: Record<string, any>[] = [];

    // Add difficulty filter
    if (difficulty) {
      conditions.push({
        difficulty: parseInt(difficulty as string),
      });
    }

    // Add status filter
    if (status) {
      conditions.push({
        status: status as string,
      });
    }

    // Add topics filter
    if (topics && typeof topics === 'string') {
      const topicsArray = topics
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);
      if (topicsArray.length > 0) {
        conditions.push({
          tags: { $all: topicsArray }, // Changed from $in to $all to match all topics
        });
      }
    }

    // Add search filter
    if (search && typeof search === 'string') {
      conditions.push({
        title: {
          $regex: search.trim(),
          $options: 'i',
        },
      });
    }

    // Combine all conditions with $and if there are any
    if (conditions.length > 0) {
      query.$and = conditions;
    }

    // console.log('MongoDB Query:', JSON.stringify(query, null, 2)); // Debug log

    // Execute the query with pagination
    const items = await questionsCollection
      .find(query)
      .sort({ _id: -1 }) // Optional: Add sorting
      .skip(skip)
      .limit(limitNumber)
      .toArray();

    // Get total count for pagination
    const total = await questionsCollection.countDocuments(query);

    res.status(200).json({
      items,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        total,
        totalPages: Math.ceil(total / limitNumber),
      },
    });
  } catch (error) {
    console.error('Error fetching items:', error);
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
    // Check for duplicate question
    const existingQuestion = await questionsCollection.findOne({
      title: parsedResult.data.title,
    });

    // Check if the question already exists with separate id
    if (existingQuestion && existingQuestion._id.toString() !== id) {
      return res.status(409).json({
        error: 'This question title already exist',
      });
    }

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
    // Check for duplicate question
    const existingQuestion = await questionsCollection.findOne({
      title: parseResult.data.title,
    });

    if (existingQuestion) {
      return res.status(409).json({
        error: 'This question title already exist',
      });
    }

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
