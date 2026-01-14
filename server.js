import express from 'express';
import dotenv from 'dotenv';
import { connectDB } from './config/mongo.js';

// Import routes
import userRoutes from './router/user.router.js'; // Your existing
import bookRoutes from './router/bookRoutes.js';
import customerRoutes from './router/customerRoutes.js';
import orderRoutes from './router/orderRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Connect to MongoDB
connectDB().catch(err => {
  console.error('Failed to connect to MongoDB:', err);
  process.exit(1);
});

// Routes
app.use('/api/users', userRoutes); // Your existing
app.use('/api/books', bookRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/orders', orderRoutes);

app.get('/', (req, res) => {
  res.json({ 
    message: 'Book Store API is running',
    endpoints: {
      users: '/api/users',
      books: '/api/books',
      customers: '/api/customers',
      orders: '/api/orders'
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});