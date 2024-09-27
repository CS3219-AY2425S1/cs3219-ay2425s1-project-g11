import express from 'express';

import * as dotenv from 'dotenv';
import questionsRouter from './routes/questionsController';
import userQuestionsRouter from './routes/userQuestionsController';
import insertQuestionsRouter from './routes/insertQuestionsController';
import updateQuestionsRouter from './routes/updateQuestionsController';
import deleteQuestionsRouter from './routes/deleteQuestionsController';

dotenv.config({ path: '.env.dev' });

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// different routes
app.use('/questions', questionsRouter);
app.use('/userquestions', userQuestionsRouter);
app.use('/createquestion', insertQuestionsRouter);
app.use('/updatequestion', updateQuestionsRouter);
app.use('/deletequestion', deleteQuestionsRouter);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
