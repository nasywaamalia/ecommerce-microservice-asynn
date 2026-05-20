const ProductModel = require('../models/productModel');
const { sendEvent } = require("../config/queue");

const ProductController = {

  getProducts: async (req, res) => {
    try {
      const products = await ProductModel.getAll();
      res.status(200).json(products);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  getProductById: async (req, res) => {
    try {
      const product = await ProductModel.findById(req.params.id);
      res.status(200).json(product);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  createProduct: async (req, res) => {

    const { name, description, price, stock, imageUrl } = req.body;

    try {

      const productId = await ProductModel.create(
        name,
        description,
        price,
        stock,
        imageUrl
      );

      await sendEvent("CREATE_PRODUCT", {
        id: productId,
        name,
        imageUrl,
      });

      res.status(201).json({
        message: "Product created successfully",
        productId,
      });

    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: "Error creating product",
      });
    }
  },

  updateProduct: async (req, res) => {

    const { id } = req.params;
    const { name, description, price, stock, imageUrl } = req.body;

    try {

      const affectedRows = await ProductModel.update(
        id,
        name,
        description,
        price,
        stock,
        imageUrl
      );

      if (affectedRows === 0) {
        return res.status(404).json({
          message: "Product not found",
        });
      }

      await sendEvent("UPDATE_PRODUCT", {
        id,
        name,
        imageUrl,
      });

      res.status(200).json({
        message: "Product updated successfully",
      });

    } catch (error) {
      res.status(500).json({
        message: "Error updating product",
      });
    }
  },

  deleteProduct: async (req, res) => {

    try {

      const affectedRows = await ProductModel.delete(req.params.id);

      if (affectedRows === 0) {
        return res.status(404).json({
          message: "Product not found",
        });
      }

      res.status(200).json({
        message: "Product deleted successfully",
      });

    } catch (error) {
      res.status(500).json({
        message: "Error deleting product",
      });
    }
  },

  updateStock: async (req, res) => {

    try {

      await ProductModel.updateStock(
        req.params.id,
        req.body.stock
      );

      res.json({
        success: true,
        message: "Stock updated"
      });

    } catch (error) {
      res.status(500).json({
        message: error.message
      });
    }
  }

};

module.exports = ProductController;