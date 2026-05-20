const db = require('../config/db');

const Transaction = {

    createTransaction: async (customer_id, total_amount, status) => {
        try {
            const [results] = await db.query(
                `INSERT INTO transactions (customer_id, total_amount, status)
                 VALUES (?, ?, ?)`,
                [customer_id, total_amount, status]
            );
            // Mengembalikan ID transaksi yang baru dibuat
            return results.insertId; 
        } catch (error) {
            throw error;
        }
    },

    addTransactionItem: async (transaction_id, product_id, quantity, price_per_item) => {
        try {
            const [results] = await db.query(
                `INSERT INTO transaction_items
                (transaction_id, product_id, quantity, price_per_item)
                VALUES (?, ?, ?, ?)`,
                [transaction_id, product_id, quantity, price_per_item]
            );
            return results;
        } catch (error) {
            throw error;
        }
    },

    getAll: async () => {
        try {
            const [rows] = await db.query(`SELECT * FROM transactions ORDER BY id DESC`);
            return rows;
        } catch (error) {
            throw error;
        }
    },

    findById: async (id) => {
        try {
            const [rows] = await db.query(
                `SELECT 
                    t.id,
                    t.customer_id,
                    t.total_amount,
                    t.status,
                    ti.product_id,
                    ti.quantity,
                    ti.price_per_item
                FROM transactions t
                JOIN transaction_items ti ON t.id = ti.transaction_id
                WHERE t.id = ?`,
                [id]
            );
            return rows;
        } catch (error) {
            throw error;
        }
    }

};

module.exports = Transaction;