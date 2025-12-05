import Job from '../models/Job.js';
import ErrorResponse from '../utils/errorResponse.js';

// @desc    Get all jobs
// @route   GET /api/jobs
// @access  Public
export const getJobs = async (req, res, next) => {
    try {
        let query;

        // Copy req.query
        const reqQuery = { ...req.query };

        // Fields to exclude
        const removeFields = ['select', 'sort', 'page', 'limit', 'search', 'skills', 'tags', 'minBudget', 'maxBudget', 'location'];

        // Loop over removeFields and delete them from reqQuery
        removeFields.forEach(param => delete reqQuery[param]);

        // Create query string
        let queryStr = JSON.stringify(reqQuery);

        // Create operators ($gt, $gte, etc)
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

        // Finding resource
        let filter = JSON.parse(queryStr);

        // Search by keyword
        if (req.query.search) {
            filter.$or = [
                { title: { $regex: req.query.search, $options: 'i' } },
                { description: { $regex: req.query.search, $options: 'i' } },
                { company: { $regex: req.query.search, $options: 'i' } }
            ];
        }

        // Filter by skills (array overlap)
        if (req.query.skills) {
            const skills = req.query.skills.split(',');
            filter.skills = { $in: skills.map(s => new RegExp(s, 'i')) };
        }

        // Filter by tags
        if (req.query.tags) {
            const tags = req.query.tags.split(',');
            filter.tags = { $in: tags.map(t => new RegExp(t, 'i')) };
        }

        // Only show active jobs by default unless specified
        if (!filter.status) {
            filter.status = 'active';
        }

        // Location filter (regex)
        if (req.query.location) {
            filter.location = { $regex: req.query.location, $options: 'i' };
        }

        // Budget filtering
        if (req.query.minBudget || req.query.maxBudget) {
            filter['budget.min'] = {};
            if (req.query.minBudget) {
                filter['budget.min'].$gte = Number(req.query.minBudget);
            }
            // For max budget, we want jobs where the max budget offered is at least what the user wants?
            // Or jobs where the budget is within the user's range?
            // Usually:
            // User minBudget: "I want at least 50k" -> job.budget.max >= 50k OR job.budget.min >= 50k
            // User maxBudget: "I want up to 100k" (this is weird for a job seeker, usually they want MINIMUM).
            // Let's assume the filters mean:
            // minBudget: Show jobs where budget.max >= minBudget (i.e., the job CAN pay this much)

            // However, standard implementation:
            // minBudget -> job.budget.min >= minBudget
            // maxBudget -> job.budget.max <= maxBudget

            if (req.query.maxBudget) {
                if (!filter['budget.max']) filter['budget.max'] = {};
                filter['budget.max'].$lte = Number(req.query.maxBudget);
            }

            // Clean up empty objects
            if (Object.keys(filter['budget.min']).length === 0) delete filter['budget.min'];
            if (filter['budget.max'] && Object.keys(filter['budget.max']).length === 0) delete filter['budget.max'];
        }

        // Remove the flat fields from filter if they exist (since we mapped them to nested fields)
        delete filter.minBudget;
        delete filter.maxBudget;

        query = Job.find(filter).populate('postedBy', 'name email profile.title profile.avatar');

        // Select Fields
        if (req.query.select) {
            const fields = req.query.select.split(',').join(' ');
            query = query.select(fields);
        }

        // Sort
        if (req.query.sort) {
            const sortBy = req.query.sort.split(',').join(' ');
            query = query.sort(sortBy);
        } else {
            query = query.sort('-createdAt');
        }

        // Pagination
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 20;
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const total = await Job.countDocuments(filter);

        query = query.skip(startIndex).limit(limit);

        // Executing query
        const jobs = await query;

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
            count: jobs.length,
            total,
            pagination,
            data: jobs
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get single job
// @route   GET /api/jobs/:id
// @access  Public
export const getJob = async (req, res, next) => {
    try {
        const job = await Job.findById(req.params.id).populate('postedBy', 'name email profile');

        if (!job) {
            return next(new ErrorResponse(`Job not found with id of ${req.params.id}`, 404));
        }

        res.status(200).json({
            success: true,
            data: job
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Create new job
// @route   POST /api/jobs
// @access  Private
export const createJob = async (req, res, next) => {
    try {
        // Add user to req.body
        req.body.postedBy = req.user.id;

        // Check for published job
        // If user is not an admin, they can only add a certain number of jobs? 
        // For now, no limit.

        const job = await Job.create(req.body);

        res.status(201).json({
            success: true,
            data: job
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Update job
// @route   PUT /api/jobs/:id
// @access  Private
export const updateJob = async (req, res, next) => {
    try {
        let job = await Job.findById(req.params.id);

        if (!job) {
            return next(new ErrorResponse(`Job not found with id of ${req.params.id}`, 404));
        }

        // Make sure user is job owner
        if (job.postedBy.toString() !== req.user.id && req.user.role !== 'admin') {
            return next(new ErrorResponse(`User ${req.user.id} is not authorized to update this job`, 401));
        }

        job = await Job.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            data: job
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Delete job
// @route   DELETE /api/jobs/:id
// @access  Private
export const deleteJob = async (req, res, next) => {
    try {
        const job = await Job.findById(req.params.id);

        if (!job) {
            return next(new ErrorResponse(`Job not found with id of ${req.params.id}`, 404));
        }

        // Make sure user is job owner
        if (job.postedBy.toString() !== req.user.id && req.user.role !== 'admin') {
            return next(new ErrorResponse(`User ${req.user.id} is not authorized to delete this job`, 401));
        }

        await job.deleteOne();

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (err) {
        next(err);
    }
};
