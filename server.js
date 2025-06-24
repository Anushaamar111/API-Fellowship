import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db.js';
import bookRoutes from './routes/Routes.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api', bookRoutes);
app.get('/', (req, res) => {
    res.send('Server is running');
});

// Export app for testing, and run server only if not in test mode
if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 5000;
  connectDB().then(() => {
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  });
}

export default app;
