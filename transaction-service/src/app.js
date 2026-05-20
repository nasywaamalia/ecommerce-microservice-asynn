require('dotenv').config(); 
const express = require('express'); 
const {listenEvent} = require('./config/queue');
const CustomerModel = require('./models/CustomerModel');
const ProductModel = require('./models/ProductModel');

const app = express();

const transactionRoutes = require("./routes/transactionRoutes");

app.use(express.json());

function initRabbitMQ() {
  try {
    listenEvent("CREATE_CUSTOMER", createCustomer);
    listenEvent("UPDATE_CUSTOMER", updateCustomer);
    listenEvent("CREATE_PRODUCT", createProduct);
    listenEvent("UPDATE_PRODUCT", updateProduct);

    console.log("✅ RabbitMQ Consumers started");
  } catch (error) {
    console.error("❌ RabbitMQ error:", error.message);
  }
}

async function createProduct(data) {
  try {
    console.log("CREATE_PRODUCT:", data);

    await ProductModel.create(data.id, data.name, data.imageUrl);

    console.log(`✅ Product ${data.id} saved`);
  } catch (error) {
    console.error("createProduct error:", error.message);
  }
}

async function updateProduct(data) {
  try {
    console.log("UPDATE_PRODUCT:", data);

    await ProductModel.update(data.id, data.name, data.imageUrl);

    console.log(`✅ Product ${data.id} updated`);
  } catch (error) {
    console.error("updateProduct error:", error.message);
  }
}

async function createCustomer(data) {
  try {
    await CustomerModel.create(data.id, data.name, data.email);
    console.log(`Customer ${data.id} created`);
  } catch (e) {
    console.error("createCustomer error:", e.message);
  }
}

async function updateCustomer(data) {
  try {
    await CustomerModel.update(data.id, data.name, data.email);
    console.log(`Customer ${data.id} updated`);
  } catch (e) {
    console.error("updateCustomer error:", e.message);
  }
}

app.use("/api/transactions", transactionRoutes);

app.get("/", (req, res) => {
  res.send("🚀 Transaction Service Running");
});

const PORT = process.env.PORT || 3004;

app.listen(PORT, () => {
  console.log(`🚀 Transaction Service running on port ${PORT}`);

  initRabbitMQ();
});