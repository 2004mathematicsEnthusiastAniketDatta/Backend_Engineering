import express from 'express';
import { z } from 'zod';
const app = express();
import { videoProcessingQueue } from './queues/queue.js';
const port = process.env.PORT ?? 3000;
app.use(express.json());
const requestVideoPostRequestSchema = z.object({
    videoUrl: z.string(),
    userId: z.uuid().optional()
});
app.get('/', (_, res) => {
    return res.json({status: 'Server is up and running'});
});
app.post('/video-process', async (req,res)=>{
   const validationResult = await requestVideoPostRequestSchema.safeParseAsync(req.body);
    if(validationResult.error){
        return res.status(400).json({error: validationResult.error});
    }

    const { videoUrl } = validationResult.data;
    const job = await videoProcessingQueue.add(`video-${videoUrl}`, { videoUrl });
    return res.json({ status: 'Enqueued video : Video processing job added to the queue', jobId: job.id });

});
app.listen(port, () =>{
    console.log(`Server is running on port ${port}`);
});