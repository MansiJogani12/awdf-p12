// Set the environment before the app (and its listeners/cache) are loaded
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret';
process.env.NOTIFY_DELAY_MS = '0';

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/taskdb_test';

beforeAll(async () => {
  await mongoose.connect(MONGO_URI);
  await mongoose.connection.dropDatabase(); // start every run from an empty database
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
});

describe('health and routing', () => {
  test('GET / returns 200', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
  });

  test('unknown route returns a JSON 404', async () => {
    const res = await request(app).get('/does-not-exist');
    expect(res.statusCode).toBe(404);
    expect(res.body.error).toBe('Route not found');
  });
});

describe('authentication', () => {
  test('GET /tasks without a token returns 401', async () => {
    const res = await request(app).get('/tasks');
    expect(res.statusCode).toBe(401);
  });

  test('GET /tasks with a tampered token returns 401', async () => {
    const res = await request(app).get('/tasks').set('Authorization', 'Bearer not.a.real.token');
    expect(res.statusCode).toBe(401);
  });

  test('register rejects an invalid email and short password', async () => {
    const res = await request(app).post('/auth/register').send({ email: 'nope', password: '1' });
    expect(res.statusCode).toBe(400);
    expect(res.body.details).toHaveProperty('email');
    expect(res.body.details).toHaveProperty('password');
  });
});

describe('tasks (full flow)', () => {
  let token;

  beforeAll(async () => {
    const credentials = { email: 'ci@example.com', password: 'secret123' };
    await request(app).post('/auth/register').send(credentials).expect(201);
    const res = await request(app).post('/auth/login').send(credentials).expect(200);
    token = res.body.token;
  });

  const auth = (req) => req.set('Authorization', `Bearer ${token}`);

  test('GET /tasks returns 200 and an empty list for a new user', async () => {
    const res = await auth(request(app).get('/tasks'));
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual([]);
  });

  test('POST /tasks creates a task (201) and trims the title', async () => {
    const res = await auth(request(app).post('/tasks')).send({ title: '  Write tests  ', priority: 'high' });
    expect(res.statusCode).toBe(201);
    expect(res.body.title).toBe('Write tests');
    expect(res.body.completed).toBe(false);
  });

  test('POST /tasks without a title is rejected with 400', async () => {
    const res = await auth(request(app).post('/tasks')).send({ description: 'missing title' });
    expect(res.statusCode).toBe(400);
  });

  test('PUT then GET reflects the update (cache is invalidated)', async () => {
    const [task] = (await auth(request(app).get('/tasks'))).body;
    await auth(request(app).put(`/tasks/${task._id}`)).send({ completed: true }).expect(200);
    const res = await auth(request(app).get('/tasks'));
    expect(res.body[0].completed).toBe(true);
  });

  test('DELETE removes the task', async () => {
    const [task] = (await auth(request(app).get('/tasks'))).body;
    await auth(request(app).delete(`/tasks/${task._id}`)).expect(200);
    const res = await auth(request(app).get(`/tasks/${task._id}`));
    expect(res.statusCode).toBe(404);
  });
});
