import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../server.js';
import User from '../models/Models.js';

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterEach(async () => {
  await User.deleteMany(); // Clean up after each test
});

afterAll(async () => {
  await mongoose.connection.close();
  await mongoServer.stop();
});

describe('Book API', () => {
  it('should create a new book', async () => {
    const res = await request(app).post('/api/add').send({
      name: 'Test Book',
      author: 'Test Author',
      price: 299,
      description: 'A test book used for testing.'
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.savedBook).toHaveProperty('_id');
    expect(res.body.savedBook.name).toBe('Test Book');
  });

  it('should fetch all books', async () => {
    await User.create({
      name: 'Book A',
      author: 'Author A',
      price: 100,
      description: 'First book'
    });

    const res = await request(app).get('/api/books');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(1);
  });

  it('should update a book by ID', async () => {
    const book = await User.create({
      name: 'Book B',
      author: 'Author B',
      price: 200,
      description: 'Second book'
    });

    const res = await request(app).put(`/api/books/${book._id}`).send({
      name: 'Updated Book B',
      author: 'Updated Author',
      price: 250,
      description: 'Updated description'
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.updatedBook.name).toBe('Updated Book B');
  });

  it('should delete a book by ID', async () => {
    const book = await User.create({
      name: 'Book C',
      author: 'Author C',
      price: 300,
      description: 'Third book'
    });

    const res = await request(app).delete(`/api/books/${book._id}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Book deleted successfully');
  });
});
