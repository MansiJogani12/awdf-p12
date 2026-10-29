const taskEvents = require('./events');

// Simulated slow notification work (e.g. sending an email). Default 2 s.
const NOTIFY_DELAY_MS = Number(process.env.NOTIFY_DELAY_MS ?? 2000);
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const now = () => new Date().toISOString();

// Note: emit() calls listeners synchronously, one after another. These listeners are
// async, so emit() returns as soon as each reaches its first `await`. The slow part
// then runs later on the event loop, after the API response has already been sent.

taskEvents.on('task-created', async ({ task, user }) => {
  try {
    console.log(`[Listener] task-created received at ${now()}`);
    await sleep(NOTIFY_DELAY_MS);

    // Demo hook for the error listener: create a task whose title contains "fail-notify"
    if (task.title.includes('fail-notify')) throw new Error(`Notification service rejected "${task.title}"`);

    console.log(
      `[Notification] Task "${task.title}" created for ${user.email} | finished at ${now()} (after ${NOTIFY_DELAY_MS} ms)`
    );
  } catch (err) {
    // Hand the failure to the 'error' listener instead of crashing the process
    taskEvents.emit('error', err);
  }
});

taskEvents.on('task-deleted', async ({ task, user }) => {
  await sleep(NOTIFY_DELAY_MS / 2);
  console.log(`[Notification] Task "${task.title}" was deleted by ${user.email} at ${now()}`);
});

// 'error' is special in EventEmitter: emitting it with no listener throws and
// would crash the server. Registering this listener makes failures just get logged.
taskEvents.on('error', (err) => {
  console.error(`[Notification error] ${err.message} at ${now()}`);
});
