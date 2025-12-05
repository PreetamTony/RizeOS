import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Please add a job title'],
            trim: true,
            maxlength: [100, 'Title cannot be more than 100 characters']
        },
        description: {
            type: String,
            required: [true, 'Please add a description'],
            maxlength: [5000, 'Description cannot be more than 5000 characters']
        },
        company: {
            type: String,
            required: [true, 'Please add a company name']
        },
        location: {
            type: String,
            required: [true, 'Please add a location']
        },
        remote: {
            type: Boolean,
            default: false
        },
        type: {
            type: String,
            enum: ['full-time', 'part-time', 'contract', 'freelance', 'internship'],
            default: 'full-time'
        },
        budget: {
            min: Number,
            max: Number,
            currency: {
                type: String,
                default: 'USD'
            },
            rate: {
                type: String,
                enum: ['hourly', 'fixed', 'annual'],
                default: 'fixed'
            }
        },
        skills: {
            type: [String],
            required: true,
            index: true
        },
        tags: [String],
        applicationLink: String,
        postedBy: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: true
        },
        status: {
            type: String,
            enum: ['active', 'closed', 'draft'],
            default: 'active'
        },
        paymentVerified: {
            type: Boolean,
            default: false
        },
        paymentTxHash: String
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

// Reverse populate with virtuals
jobSchema.virtual('applicants', {
    ref: 'Application',
    localField: '_id',
    foreignField: 'job',
    justOne: false
});

export default mongoose.model('Job', jobSchema);
