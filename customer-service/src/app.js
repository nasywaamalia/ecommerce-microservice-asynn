require('dotenv').config();

const express = require('express');
const app = express();

const customerRoutes = require('./routes/customerRoutes');

app.use(express.json());

// Routes
app.use('/api/customers', customerRoutes);

// Root
app.get('/api', (req, res) => {
    res.send('Customer Service Running');
});

// Port
const PORT = process.env.PORT || 3002;

app.listen(PORT, () => {
    console.log(`Customer Service running on port ${PORT}`);
});