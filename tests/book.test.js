import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../server.js'; 
import User from '../models/Models.js';

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await User.deleteMany(); // clean up after each test
});

describe('Book API', () => {
  it('should create a new book', async () => {
    const res = await request(app).post('/api/add').send({
      title: 'Clean Code',
      author: 'Robert Martin',
      year: 2008,
      genre: 'Programming'
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.savedBook).toHaveProperty('_id');
  });

  it('should fetch all books', async () => {
    await User.create({ title: 'Test Book', author: 'Test', year: 2000, genre: 'Test' });

    const res = await request(app).get('/api/books');
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(1);
  });

  it('should update a book by ID', async () => {
    const book = await User.create({ title: 'Old', author: 'A', year: 1999, genre: 'X' });
    const res = await request(app)
      .put(`/api/books/${book._id}`)
      .send({ title: 'New Title' });

    expect(res.statusCode).toBe(200);
    expect(res.body.updatedBook.title).toBe('New Title');
  });

  it('should delete a book by ID', async () => {
    const book = await User.create({ title: 'To Delete', author: 'A', year: 1999, genre: 'X' });
    const res = await request(app).delete(`/api/books/${book._id}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/deleted/i);
  });
});
