import Post from '../models/Post.js';
import ErrorResponse from '../utils/errorResponse.js';

export const getPosts = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 20;
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const total = await Post.countDocuments();

        const posts = await Post.find()
            .populate('author', 'name email profile.title profile.avatar')
            .populate('comments.user', 'name profile.avatar')
            .sort('-createdAt')
            .skip(startIndex)
            .limit(limit);

        // Pagination result
        const pagination = {};

        if (endIndex < total) {
            pagination.next = {
                page: page + 1,
                limit
            };
        }

        if (startIndex > 0) {
            pagination.prev = {
                page: page - 1,
                limit
            };
        }

        res.status(200).json({
            success: true,
            count: posts.length,
            total,
            pagination,
            data: posts
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Create new post
// @route   POST /api/posts
// @access  Private
export const createPost = async (req, res, next) => {
    try {
        req.body.author = req.user.id;

        if (req.file) {
            // Store relative path to image
            req.body.image = `uploads/${req.file.filename}`;
        }

        const post = await Post.create(req.body);

        // Populate author for immediate display
        await post.populate('author', 'name profile.title profile.avatar');

        res.status(201).json({
            success: true,
            data: post
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Like/Unlike post
// @route   POST /api/posts/:id/like
// @access  Private
export const toggleLike = async (req, res, next) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return next(new ErrorResponse(`Post not found with id of ${req.params.id}`, 404));
        }

        // Check if post has already been liked
        if (post.likes.includes(req.user.id)) {
            // Unlike
            post.likes = post.likes.filter(id => id.toString() !== req.user.id);
        } else {
            // Like
            post.likes.push(req.user.id);
        }

        await post.save();

        res.status(200).json({
            success: true,
            data: post.likes
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Add comment
// @route   POST /api/posts/:id/comments
// @access  Private
export const addComment = async (req, res, next) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return next(new ErrorResponse(`Post not found with id of ${req.params.id}`, 404));
        }

        const comment = {
            user: req.user.id,
            content: req.body.content
        };

        post.comments.push(comment);

        await post.save();

        // Populate comments user
        await post.populate('comments.user', 'name profile.avatar');

        res.status(200).json({
            success: true,
            data: post.comments
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Delete post
// @route   DELETE /api/posts/:id
// @access  Private
export const deletePost = async (req, res, next) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return next(new ErrorResponse(`Post not found with id of ${req.params.id}`, 404));
        }

        // Make sure user is post owner
        if (post.author.toString() !== req.user.id && req.user.role !== 'admin') {
            return next(new ErrorResponse(`User ${req.user.id} is not authorized to delete this post`, 401));
        }

        await post.deleteOne();

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (err) {
        next(err);
    }
};
