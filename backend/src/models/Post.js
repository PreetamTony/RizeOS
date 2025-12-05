import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const postSchema = new mongoose.Schema(
    {
        content: {
            type: String,
            required: [true, 'Please add some content'],
            maxlength: [2000, 'Content cannot be more than 2000 characters']
        },
        author: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: true
        },
        likes: [{
            type: mongoose.Schema.ObjectId,
            ref: 'User'
        }],
        comments: [commentSchema],
        tags: [String],
        image: String
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

export default mongoose.model('Post', postSchema);
