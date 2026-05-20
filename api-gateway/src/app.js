require('dotenv').config();

const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

// app.use(express.json());

app.use((req, res, next) => {
    console.log(`[REQUEST] ${req.method} ${req.originalUrl}`);
    next();
});

const proxy = (target, params) =>
    createProxyMiddleware({
        target,
        changeOrigin: true,
        pathRewrite: {
          "^/(.*)": params[0],
          "^/": params[1]
        },
        timeout: 5000,
        proxyTimeout: 5000,

        xfwd: true,

        onError(err, req, res) {
            console.log('❌ Proxy Error:', err.message);

            if (!res.headersSent) {
                res.status(504).json({
                    success: false,
                    message: 'Service timeout / error'
                });
            }
        }
    });

app.use('/api/users', proxy('http://localhost:3001', ["/api/users/$1", "/api/users"]));
app.use('/api/customers', proxy('http://localhost:3002', ["/api/customers/$1", "/api/customers"]));
app.use('/api/products', proxy('http://localhost:3003', ["/api/products/$1", "/api/products"]));
app.use('/api/transactions', proxy('http://localhost:3004', ["/api/transactions/$1", "/api/transactions"]));

app.get('/', (req, res) => {
    res.send('✅ API Gateway Running');
});

app.use((req, res) => {
    res.status(404).json({
        message: `Cannot ${req.method} ${req.originalUrl}`
    });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`🚀 API Gateway running on port ${PORT}`);
});