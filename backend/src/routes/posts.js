import express from 'express';
import {
    addComment,
    createPost,
    deletePost,
    getPosts,
    toggleLike
} from '../controllers/postController.js';

import { protect } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

router
    .route('/')
    .get(getPosts)
    .post(protect, upload.single('image'), createPost);

router
    .route('/:id')
    .delete(protect, deletePost);

router.route('/:id/like').post(protect, toggleLike);
router.route('/:id/comments').post(protect, addComment);

export default router;
