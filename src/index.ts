import * as path from 'path';
import { isMainThread, Worker } from 'worker_threads';

const oldLog = console.log;
console.log = (...args: unknown[]) => {
  oldLog('[index]', ...args);
};

const runService = () => {
  console.log('isMainThread', isMainThread);
  return new Promise((resolve, reject) => {
    const sharedBuffer = new SharedArrayBuffer(4);
    const arrayBuffer = new Int32Array(sharedBuffer);
    arrayBuffer[0] = 1;
    console.log({ arrayBuffer });

    const worker = new Worker(path.resolve(__dirname, './worker.ts'), {
      workerData: {
        string: 'Hello world from index',
        obj: { key: 'value' },
        arrayBuffer,
      },
      execArgv: ['--require', 'ts-node/register'],
    });

    worker.on('message', resolve);
    worker.on('error', reject);
    worker.on('exit', (code) => {
      if (code !== 0)
        reject(new Error(`Worker stopped with exit code ${code}`));

      console.log({ arrayBuffer });
    });

    worker.postMessage('posted from parent');
  });
};

runService().then((result) => {
  console.log('resolved', result);
});
