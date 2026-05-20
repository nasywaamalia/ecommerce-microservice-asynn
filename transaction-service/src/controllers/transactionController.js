const axios = require("axios");
const { sendEvent } = require("../config/queue");
const CustomerModel = require("../models/customerModel");
const ProductModel = require("../models/productModel");
const TransactionModel = require("../models/transactionModel");

const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL;

const TransactionController = {

  // ================= CREATE TRANSACTION =================
  createTransaction: async (req, res) => {
    const { customerId, items } = req.body;

    if (!customerId || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        message: "Customer ID and items are required",
      });
    }

    // VALIDASI: Memastikan URL Product Service terbaca dari env
    if (!PRODUCT_SERVICE_URL) {
      return res.status(500).json({
        message: "Internal Server Error: PRODUCT_SERVICE_URL is not defined in .env"
      });
    }

    try {
      const customer = await CustomerModel.findById(customerId);
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }

      let totalAmount = 0;
      const processedItems = [];

      for (const item of items) {
        // Menggunakan block try-catch kecil khusus axios agar ketahuan jika axios gagal
        let product;
        try {
          const response = await axios.get(
            `${PRODUCT_SERVICE_URL}/api/products/${item.productId}`
          );
          product = response.data;
        } catch (axiosError) {
          return res.status(400).json({
            message: `Failed to fetch product ${item.productId} from Product Service`,
            error: axiosError.message
          });
        }

        if (!product) {
          return res.status(404).json({
            message: `Product ${item.productId} not found`,
          });
        }

        if (product.stock < item.quantity) {
          return res.status(400).json({
            message: `Stock not enough for ${product.name}`,
          });
        }

        totalAmount += product.price * item.quantity;

        processedItems.push({
          productId: product.id,
          quantity: item.quantity,
          pricePerItem: product.price,
        });

        // update stock via RabbitMQ
        sendEvent("UPDATE_PRODUCT_STOCK", {
          id: product.id,
          stock: product.stock - item.quantity,
        });
      }

      const transactionId = await TransactionModel.createTransaction(
        customerId,
        totalAmount,
        "pending"
      );

      for (const item of processedItems) {
        await TransactionModel.addTransactionItem(
          transactionId,
          item.productId,
          item.quantity,
          item.pricePerItem
        );
      }

      return res.status(201).json({
        message: "Transaction created successfully",
        transactionId,
      });

    } catch (error) {
      // Menampilkan error asli ke console terminal agar kamu bisa membacanya saat debugging
      console.error("🔴 Detail Error POST Transaction:", error);

      return res.status(500).json({
        message: "Error creating transaction",
        error: error.message || error // Jika .message kosong, tampilkan objek error mentah
      });
    }
  },
  // ================= GET ALL =================
  getAllTransactions: async (req, res) => {
    try {
      const data = await TransactionModel.getAll();

      return res.status(200).json(data);
    } catch (error) {
      return res.status(500).json({
        message: error.message,
      });
    }
  },

  // ================= GET BY ID =================
  getTransactionById: async (req, res) => {
    try {
      const items = await TransactionModel.findById(req.params.id);

      if (!items || items.length === 0) {
        return res.status(404).json({ message: "Transaction not found" });
      }

      const result = await Promise.all(
        items.map(async (item) => {
          const response = await axios.get(
            `${PRODUCT_SERVICE_URL}/api/products/${item.product_id}`
          );

          const product = response.data;

          return {
            item_id: item.item_id,
            product_id: item.product_id,
            product_name: product?.name || "Unknown",
            quantity: item.quantity,
            price_per_item: item.price_per_item,
          };
        })
      );

      return res.json({
        transaction_id: req.params.id,
        items: result,
      });

    } catch (error) {
      return res.status(500).json({
        message: error.message,
      });
    }
  },

  // ================= BY CUSTOMER =================
  getTransactionsByCustomerId: async (req, res) => {
    try {
      const items = await TransactionModel.findByCustomerId(req.params.customerId);

      if (!items.length) {
        return res.status(404).json({ message: "No transactions found" });
      }

      const grouped = new Map();

      const enriched = await Promise.all(
        items.map(async (item) => {
          const response = await axios.get(
            `${PRODUCT_SERVICE_URL}/api/products/${item.product_id}`
          );

          const product = response.data;

          return {
            transaction_id: item.id,
            customer_id: item.customer_id,
            product_id: item.product_id,
            product_name: product?.name || "Unknown",
            quantity: item.quantity,
            price_per_item: item.price_per_item,
          };
        })
      );

      enriched.forEach((item) => {
        if (!grouped.has(item.transaction_id)) {
          grouped.set(item.transaction_id, {
            id: item.transaction_id,
            customer_id: item.customer_id,
            items: [],
          });
        }
        grouped.get(item.transaction_id).items.push(item);
      });

      return res.json([...grouped.values()]);

    } catch (error) {
      return res.status(500).json({
        message: error.message,
      });
    }
  },

  // ================= UPDATE STATUS =================
  updateTransactionStatus: async (req, res) => {
    try {
      const { status } = req.body;

      const allowed = ["pending", "completed", "cancelled"];
      if (!allowed.includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      await TransactionModel.updateStatus(req.params.id, status);

      return res.json({ message: "Status updated" });

    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },

  // ================= DELETE =================
  deleteTransaction: async (req, res) => {
    try {
      await TransactionModel.delete(req.params.id);
      return res.json({ message: "Deleted successfully" });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

};

module.exports = TransactionController;