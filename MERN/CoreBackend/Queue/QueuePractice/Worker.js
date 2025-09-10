import { videoProcessingWorker } from "../QueuePractice/queues/worker.js";



async function init(){
    await videoProcessingWorker.run();
}


init();