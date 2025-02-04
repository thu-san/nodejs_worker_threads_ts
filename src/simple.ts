import { isMainThread, parentPort, Worker, workerData } from 'worker_threads';

const fib = (n: number): number => {
  if (n <= 1) return n;
  return fib(n - 1) + fib(n - 2);
};

const main = async () => {
  const arr = Array.from({ length: 20 });

  console.time('single thread');
  arr.map(() => {
    console.log(fib(40));
  });
  console.timeEnd('single thread');

  console.time('worker thread');
  await Promise.all(
    arr.map(() => {
      return new Promise((resolve, reject) => {
        const worker = new Worker(__filename, {
          workerData: 40,
          execArgv: ['--require', 'ts-node/register'],
        });

        worker.on('message', resolve);
        worker.on('error', reject);
        worker.on('exit', (code) => {
          if (code !== 0)
            reject(new Error(`Worker stopped with exit code ${code}`));
        });
      });
    }),
  );
  console.timeEnd('worker thread');
};

if (isMainThread) {
  main();
} else {
  const data = workerData as number;
  console.log(fib(data));
  parentPort?.postMessage('done from worker');
  parentPort?.close();
}
