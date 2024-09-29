import { z } from 'zod';
import { ObjectId } from 'mongodb';

// object id schema
const objectIdSchema = z.instanceof(ObjectId);
// image file schema
const MAX_FILE_SIZE = 5000000;
const ACCEPTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
];

const imageSchema = z
  .any()
  // To not allow empty files
  .refine((files) => files?.length >= 1, { message: 'Image is required.' })
  // To not allow files other than images
  .refine((files) => ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type), {
    message: '.jpg, .jpeg, .png and .webp files are accepted.',
  })
  // To not allow files larger than 5MB
  .refine((files) => files?.[0]?.size <= MAX_FILE_SIZE, {
    message: `Max file size is 5MB.`,
  });

export const QuestionsSchema = z.object({
  _id: objectIdSchema.optional(), // _id should not be a required field for the api
  difficulty: z.number(),
  description: z.string(),
  examples: z.array(z.string()),
  constraints: z.string(),
  tags: z.array(z.string()),
  title_slug: z.string(),
  title: z.string(),
  pictures: z.array(imageSchema).optional(),
});

export const UserQuestionsSchema = z.object({
  _id: objectIdSchema,
  _user_id: objectIdSchema,
  _question_id: objectIdSchema,
  status: z.enum(['completed', 'in-progress', 'not-started']),
});
