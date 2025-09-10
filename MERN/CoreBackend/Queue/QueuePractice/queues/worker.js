import {Worker} from 'bullmq';
import {QueueMap} from './queue.js';
import { redisConnection }  from "../connection.js";

export const videoProcessingWorker = new Worker(QueueMap['VIDEO_PROCESSING_QUEUE'], async job => {
    console.log(`Processing job ${job.id} of type ${job.name} with data:`, job.data);
    // Simulate video processing task
    console.log("Transcoding job",{url: job.data.videoUrl});
    await new Promise(resolve => setTimeout(resolve, 5000)); // Simulate a delay for processing
        console.log("Transcoding job done",{status: 'completed', url: job.data.videoUrl});

    console.log(`Completed job ${job.id}`);
    return true;
}, {
    autorun: false,
    connection: redisConnection
});

videoProcessingWorker.on('completed', (job) => {
    console.log(`Job with ID ${job.id} has been completed`);
});

videoProcessingWorker.on('failed', (job, err) => {
    console.error(`Job with ID ${job.id} has failed with error: ${err.message}`);
});

console.log('Video processing worker is running...');