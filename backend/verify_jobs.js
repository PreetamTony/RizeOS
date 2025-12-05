import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Job from './src/models/Job.js';

dotenv.config();

const checkJobs = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const jobs = await Job.find().sort({ createdAt: -1 }).limit(5);
        console.log(`Found ${jobs.length} jobs`);
        jobs.forEach(job => {
            console.log(`- ${job.title} (${job.status}) - Created: ${job.createdAt}`);
        });

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

checkJobs();
