const EventEmitter = require('events');

// One shared emitter for task-related events. Routes emit, listeners.js reacts.
class TaskEvents extends EventEmitter {}

module.exports = new TaskEvents();
