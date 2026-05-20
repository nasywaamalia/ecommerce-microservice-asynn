require('dotenv').config();

const express = require('express');

const app = express();

const { listenEvent } = require("./config/queue");
const ProductModel = require("./models/productModel");

const productRoutes =
require('./routes/productRoutes');

app.use(express.json());

app.use('/api/products',
productRoutes);

app.get('/', (req, res) => {

    res.send(
        '✅ Product Service Running'
    );

});

const PORT = process.env.PORT || 3003;

app.listen(PORT, () => {

    console.log(
        `🚀 Product Service running on port ${PORT}`
    );
    listenEvent("UPDATE_PRODUCT_STOCK", updateStock);

async function updateStock(data) {

  await ProductModel.updateStock(
    data.id,
    data.stock
  );

  console.log("✅ Stock updated");
}

});