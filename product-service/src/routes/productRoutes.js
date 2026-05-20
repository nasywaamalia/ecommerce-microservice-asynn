const express = require('express');
const router = express.Router();

const ProductController = require('../controllers/productController');

router.get('/', ProductController.getProducts);
router.get('/:id', ProductController.getProductById);
router.post('/', ProductController.createProduct);
router.put('/:id', ProductController.updateProduct);
router.delete('/:id', ProductController.deleteProduct);

// stock update (kalau dipakai RabbitMQ)
router.patch('/stock/:id', ProductController.updateStock);

module.exports = router;