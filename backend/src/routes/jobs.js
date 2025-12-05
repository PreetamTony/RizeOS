import express from 'express';
import {
    createJob,
    deleteJob,
    getJob,
    getJobs,
    updateJob
} from '../controllers/jobController.js';

import { protect } from '../middleware/auth.js';

const router = express.Router();

router
    .route('/')
    .get(getJobs)
    .post(protect, createJob);

router
    .route('/:id')
    .get(getJob)
    .put(protect, updateJob)
    .delete(protect, deleteJob);

export default router;
