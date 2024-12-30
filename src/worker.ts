import { isMainThread, parentPort, workerData } from 'worker_threads';

const oldLog = console.log;
console.log = (...args: unknown[]) => {
  oldLog('[worker]', ...args);
};

const data = workerData as {
  str: string;
  obj: Record<string, unknown>;
  arrayBuffer: Int32Array<SharedArrayBuffer>;
};
console.log('isMainThread', isMainThread);
console.log('initial data', data);
console.log(data.obj.key);

// shared memory
data.arrayBuffer[0] = 2;

if (parentPort)
  parentPort.on('message', (message: string) => {
    console.log(message);
    parentPort?.postMessage('done from worker');
    parentPort?.close();
  });
