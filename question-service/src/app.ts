import express from 'express';
import cors from 'cors';

import * as dotenv from 'dotenv';
import questionsRouter from './routes/questionsController';
import userQuestionsRouter from './routes/userQuestionsController';

dotenv.config({ path: '.env.dev' });

const app = express();
const PORT = process.env.PORT || 4001; // 4001 to prevent conflicts

app.use(express.json());
app.use(cors()); // config cors so that front-end can use
app.options('*', cors());

const apiVersion = '/api/v1';

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*'); // "*" -> Allow all links to access

  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization',
  );

  // Browsers usually send this before PUT or POST Requests
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'GET, POST, DELETE, PUT, PATCH');
    return res.status(200).json({});
  }

  // Continue Route Processing
  next();
});

// different routes
app.use(`${apiVersion}/questions`, questionsRouter);
app.use(`${apiVersion}/userquestions`, userQuestionsRouter);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
