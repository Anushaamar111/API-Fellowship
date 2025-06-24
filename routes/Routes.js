import express from 'express';
import { Router} from 'express';
import User from '../models/Models.js';

const router = express.Router(); 

router.post('/add', async (req, res)=> {
    try {
        const book = new User(req.body);
        const savedBook = await book.save();
        res.status(201).json({ message: 'Book added successfully', savedBook });

    } catch (error) {
         res.status(400).json({ error: error.message });
    }
})

router.get('/books', async ( req, res)=> {
    try {
        const books = await User.find();
        res.status(200).json(books);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})

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
router.delete('/books/:id', async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Book deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})

//Put a book

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