const CustomerModel = require('../models/customerModel');
const { sendEvent } = require('../config/queue');

const CustomerController = {

  createCustomer: async (req, res) => {

    const { userId, name, email, phone, address } = req.body;

    if (!userId || !name || !email) {
      return res.status(400).json({
        message: "User ID, name, and email are required"
      });
    }

    try {

      const customerId = await CustomerModel.create(
        userId,
        name,
        email,
        phone,
        address
      );

      await sendEvent("CREATE_CUSTOMER", {
        id: customerId,
        name,
        email
      });

      return res.status(201).json({
        message: "Customer created successfully",
        customerId
      });

    } catch (error) {
      console.error("Error creating customer:", error.message);

      return res.status(500).json({
        message: "Error creating customer",
        error: error.message
      });
    }
  },

  getAllCustomers: async (req, res) => {

    try {
      const customers = await CustomerModel.getAll();
      return res.status(200).json(customers);

    } catch (error) {
      console.error("Error getting customers:", error.message);

      return res.status(500).json({
        message: "Error getting customers"
      });
    }
  },

  getCustomerById: async (req, res) => {

    try {
      const customer = await CustomerModel.findById(req.params.id);

      if (!customer) {
        return res.status(404).json({
          message: "Customer not found"
        });
      }

      return res.status(200).json(customer);

    } catch (error) {
      console.error("Error getting customer:", error.message);

      return res.status(500).json({
        message: "Error getting customer"
      });
    }
  },

  updateCustomer: async (req, res) => {

    const { id } = req.params;
    const { name, email, phone, address } = req.body;

    try {

      const affectedRows = await CustomerModel.update(
        id,
        name,
        email,
        phone,
        address
      );

      if (affectedRows === 0) {
        return res.status(404).json({
          message: "Customer not found or no changes made"
        });
      }

      await sendEvent("UPDATE_CUSTOMER", {
        id,
        name,
        email
      });

      return res.status(200).json({
        message: "Customer updated successfully"
      });

    } catch (error) {
      console.error("Error updating customer:", error.message);

      return res.status(500).json({
        message: "Error updating customer"
      });
    }
  },

  // ======================
  // DELETE CUSTOMER
  // ======================
  deleteCustomer: async (req, res) => {

    try {

      const affectedRows = await CustomerModel.delete(req.params.id);

      if (affectedRows === 0) {
        return res.status(404).json({
          message: "Customer not found"
        });
      }

      return res.status(200).json({
        message: "Customer deleted successfully"
      });

    } catch (error) {
      console.error("Error deleting customer:", error.message);

      return res.status(500).json({
        message: "Error deleting customer"
      });
    }
  }

};

module.exports = CustomerController;