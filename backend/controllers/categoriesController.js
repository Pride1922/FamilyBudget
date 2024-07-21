const db = require('../config/database');
const subcategoryModel = require('../models/subcategoryModel');
const merchantModel = require('../models/merchantModel');
const { errorLogger, infoLogger } = require('../config/logger');

// Get All Categories
const getCategories = (req, res) => {
    const query = `
        SELECT c.*, JSON_ARRAYAGG(
            JSON_OBJECT('id', s.id, 'name', s.name)
        ) AS subcategories
        FROM Categories c
        LEFT JOIN Subcategories s ON c.id = s.category_id
        GROUP BY c.id
    `;

    db.query(query, (err, results) => {
        if (err) {
            errorLogger.error(err.message);
            return res.status(500).json({ error: 'Internal server error' });
        }
        res.json(results);
    });
};

// Get Category By ID
const getCategoryById = (req, res) => {
    const { id } = req.params;

    const query = `
        SELECT c.*, JSON_ARRAYAGG(
            JSON_OBJECT('id', s.id, 'name', s.name)
        ) AS subcategories
        FROM Categories c
        LEFT JOIN Subcategories s ON c.id = s.category_id
        WHERE c.id = ?
        GROUP BY c.id
    `;

    db.query(query, [id], (err, results) => {
        if (err) {
            errorLogger.error(err.message);
            return res.status(500).json({ error: 'Internal server error' });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'Category not found' });
        }
        res.json(results[0]);
    });
};

// Add Category
const addCategory = (req, res) => {
    const { name, type, icon } = req.body;
    db.query('INSERT INTO Categories (name, type, icon) VALUES (?, ?, ?)', [name, type, icon], (err, result) => {
        if (err) {
            errorLogger.error(err.message);
            return res.status(500).json({ error: 'Internal server error' });
        }
        res.status(201).json({ id: result.insertId, name, type, icon });
    });
};

// Edit Category
const editCategory = (req, res) => {
    const { id } = req.params;
    const { name, type, icon } = req.body;
    db.query('UPDATE Categories SET name = ?, type = ?, icon = ? WHERE id = ?', [name, type, icon, id], (err, result) => {
        if (err) {
            errorLogger.error(err.message);
            return res.status(500).json({ error: 'Internal server error' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Category not found' });
        }
        res.json({ id, name, type, icon });
    });
};

// Delete Category
const deleteCategory = (req, res) => {
    const { id } = req.params;
    subcategoryModel.deleteSubcategoriesByCategoryId(id, (err) => {
        if (err) {
            errorLogger.error(err.message);
            return res.status(500).json({ error: 'Internal server error' });
        }
        merchantModel.getMerchantsByCategoryId(id, (err) => {
            if (err) {
                errorLogger.error(err.message);
                return res.status(500).json({ error: 'Internal server error' });
            }
            db.query('DELETE FROM Categories WHERE id = ?', [id], (err, result) => {
                if (err) {
                    errorLogger.error(err.message);
                    return res.status(500).json({ error: 'Internal server error' });
                }
                if (result.affectedRows === 0) {
                    return res.status(404).json({ error: 'Category not found' });
                }
                res.status(204).send();
            });
        });
    });
};

module.exports = {
    getCategories,
    getCategoryById,
    addCategory,
    editCategory,
    deleteCategory
};
