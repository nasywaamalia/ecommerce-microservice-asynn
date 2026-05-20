require('dotenv').config();

const express = require('express');
const app = express();

const userRoutes = require('./routes/userRoutes');


connectQueue();

app.use(express.json());

// Routes
app.use('/api/users', userRoutes);

// Root
app.get('/', (req, res) => {
    res.send('User Service Running');
});

// Port
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log(`User Service running on port ${PORT}`);
});