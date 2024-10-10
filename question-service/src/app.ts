import express from 'express';
import cors from 'cors';

import * as dotenv from 'dotenv';
import questionsRouter from './routes/questionsController';
import userQuestionsRouter from './routes/userQuestionsController';

dotenv.config({ path: '.env.dev' });

const app = express();
const PORT = process.env.PORT || 4001; // 4001 to prevent conflicts
const corsFrontendUrl =
  process.env.CORS_FRONTEND_URL || 'http://localhost:3000';

app.use(express.json());

const apiVersion = '/api/v1';

app.use(
  cors({
    origin: corsFrontendUrl, // Allow requests from your frontend
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Specify the methods allowed
    credentials: true, // Allow credentials if needed
  }),
);

// different routes
app.use(`${apiVersion}/questions`, questionsRouter);
app.use(`${apiVersion}/userquestions`, userQuestionsRouter);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
