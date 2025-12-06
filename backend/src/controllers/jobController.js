import Job from '../models/Job.js';
import ErrorResponse from '../utils/errorResponse.js';

export const getJobs = async (req, res, next) => {
    try {
        let query;

        const reqQuery = { ...req.query };

        const removeFields = ['select', 'sort', 'page', 'limit', 'search', 'skills', 'tags', 'minBudget', 'maxBudget', 'location'];

        removeFields.forEach(param => delete reqQuery[param]);

        let queryStr = JSON.stringify(reqQuery);
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

        let filter = JSON.parse(queryStr);

        if (req.query.search) {
            filter.$or = [
                { title: { $regex: req.query.search, $options: 'i' } },
                { description: { $regex: req.query.search, $options: 'i' } },
                { company: { $regex: req.query.search, $options: 'i' } }
            ];
        }

        if (req.query.skills) {
            const skills = req.query.skills.split(',');
            filter.skills = { $in: skills.map(s => new RegExp(s, 'i')) };
        }

        if (req.query.tags) {
            const tags = req.query.tags.split(',');
            filter.tags = { $in: tags.map(t => new RegExp(t, 'i')) };
        }

        if (!filter.status) {
            filter.status = 'active';
        }

        if (req.query.location) {
            filter.location = { $regex: req.query.location, $options: 'i' };
        }

        if (req.query.minBudget || req.query.maxBudget) {
            filter['budget.min'] = {};
            if (req.query.minBudget) {
                filter['budget.min'].$gte = Number(req.query.minBudget);
            }


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

export const createJob = async (req, res, next) => {
    try {
        req.body.postedBy = req.user.id;

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
