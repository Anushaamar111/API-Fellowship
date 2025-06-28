import express from 'express';
import { Router} from 'express';
import User from '../models/Models.js';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Book:
 *       type: object
 *       required:
 *         - name
 *         - author
 *         - price
 *         - description
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated id of the book
 *         name:
 *           type: string
 *           description: The name of the book
 *         author:
 *           type: string
 *           description: The author of the book
 *         price:
 *           type: number
 *           description: The price of the book
 *         description:
 *           type: string
 *           description: The description of the book
 *         read:
 *           type: boolean
 *           description: Whether the book has been read
 *           default: false
 *       example:
 *         _id: "60d5ecb54eb5a33d4c8f5a1a"
 *         name: "The Great Gatsby"
 *         author: "F. Scott Fitzgerald"
 *         price: 299
 *         description: "A classic American novel"
 *         read: false
 */

/**
 * @swagger
 * tags:
 *   name: Books
 *   description: The books managing API
 */ 

/**
 * @swagger
 * /api/add:
 *   post:
 *     summary: Create a new book
 *     tags: [Books]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - author
 *               - price
 *               - description
 *             properties:
 *               name:
 *                 type: string
 *               author:
 *                 type: string
 *               price:
 *                 type: number
 *               description:
 *                 type: string
 *               read:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Book created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 savedBook:
 *                   $ref: '#/components/schemas/Book'
 *       400:
 *         description: Bad request
 */
router.post('/add', async (req, res)=> {
    try {
        const book = new User(req.body);
        const savedBook = await book.save();
        res.status(201).json({ message: 'Book added successfully', savedBook });

    } catch (error) {
         res.status(400).json({ error: error.message });
    }
})

/**
 * @swagger
 * /api/books:
 *   get:
 *     summary: Returns the list of all books
 *     tags: [Books]
 *     responses:
 *       200:
 *         description: The list of books
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Book'
 */
router.get('/books', async ( req, res)=> {
    try {
        const books = await User.find();
        res.status(200).json(books);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})

/**
 * @swagger
 * /api/books/{id}:
 *   get:
 *     summary: Get the book by id
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The book id
 *     responses:
 *       200:
 *         description: The book response by id
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Book'
 *       404:
 *         description: The book was not found
 */
router.get('/books/:id', async (req, res) => {
    try {
        const book = await User.findById(req.params.id);
        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }
        res.status(200).json(book);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})

//Delete a book
/**
 * @swagger
 * /api/books/{id}:
 *   delete:
 *     summary: Remove the book by id
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The book id
 *     responses:
 *       200:
 *         description: The book was deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: The book was not found
 */
router.delete('/books/:id', async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Book deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})

//Put a book
/**
 * @swagger
 * /api/books/{id}:
 *   put:
 *     summary: Update the book by the id
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The book id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               author:
 *                 type: string
 *               price:
 *                 type: number
 *               description:
 *                 type: string
 *               read:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: The book was updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 updatedBook:
 *                   $ref: '#/components/schemas/Book'
 *       404:
 *         description: The book was not found
 *       500:
 *         description: Some error happened
 */
router.put('/books/:id', async (req, res) => {
    try {
        const updatedBook = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedBook) {
            return res.status(404).json({ message: 'Book not found' });
        }
        res.status(200).json({ message: 'Book updated successfully', updatedBook });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})

export default router;