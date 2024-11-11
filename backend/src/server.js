import dotenv from 'dotenv';
dotenv.config();
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';
import foodRouter from './routers/food.router.js';
import userRouter from './routers/user.router.js';
import orderRouter from './routers/order.router.js';
import uploadRouter from './routers/upload.router.js';
import restaurantRouter from './routers/restaurant.router.js';

import { dbconnect } from './config/database.config.js';
import path, { dirname } from 'path';
dbconnect();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(express.json());
app.use(
  cors({
    credentials: true,
    origin: process.env.NODE_ENV === 'production' ? '*' : ['http://localhost:3000'],
  })
);

app.use('/api/foods', foodRouter);
app.use('/api/users', userRouter);
app.use('/api/orders', orderRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/restaurants', restaurantRouter);

const publicFolder = process.env.NODE_ENV === 'production' 
    ? path.join(__dirname, '../../frontend/build')
    : path.join(__dirname, 'public');

app.use(express.static(publicFolder));

app.get('*', (req, res) => {
  const indexFilePath = process.env.NODE_ENV === 'production'
    ? path.join(__dirname, '../../frontend/build/index.html')
    : path.join(publicFolder, 'index.html');
  res.sendFile(indexFilePath);
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log('listening on port ' + PORT);
});
