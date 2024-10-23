import express from 'express';
import questionRoutes from './questionRoutes';
import authRoutes from './authRoutes';
import matchingRoutes from './matchingRoutes';
import usersRoutes from './usersRoute';

const router = express.Router();

router.use('/questions', questionRoutes);
router.use('/auth', authRoutes);
router.use('/matching', matchingRoutes);
router.use('/users', usersRoutes);

export default router;
