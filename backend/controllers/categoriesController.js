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
const deleteCategory = async (req, res) => {
    const { id } = req.params;

    try {
        // Check if there are any merchants associated with the category
        const merchants = await new Promise((resolve, reject) => {
            merchantModel.getMerchantsByCategoryId(id, (err, results) => {
                if (err) {
                    return reject(new Error('Error fetching merchants for the category.'));
                }
                resolve(results);
            });
        });

        if (merchants.length > 0) {
            return res.status(400).json({ error: 'Category cannot be deleted because there are associated merchants. Please remove the merchants before deleting the category.' });
        }

        // Check if there are any subcategories associated with the category
        const subcategories = await new Promise((resolve, reject) => {
            subcategoryModel.getSubcategoriesByCategoryId(id, (err, results) => {
                if (err) {
                    return reject(new Error('Error fetching subcategories for the category.'));
                }
                resolve(results);
            });
        });

        if (subcategories.length > 0) {
            return res.status(400).json({ error: 'Category cannot be deleted because there are existing subcategories. Please remove the subcategories before deleting the category.' });
        }

        // Delete the category itself
        db.query('DELETE FROM Categories WHERE id = ?', [id], (err, result) => {
            if (err) {
                errorLogger.error(`Database error while deleting category with ID ${id}: ${err.message}`);
                return res.status(500).json({ error: 'An error occurred while attempting to delete the category. Please try again later.' });
            }
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Category not found. It may have already been deleted.' });
            }
            res.status(204).send(); // Successfully deleted
        });
    } catch (error) {
        errorLogger.error(`Error in deleteCategory function: ${error.message}`);
        res.status(500).json({ error: 'An unexpected error occurred. Please try again later.' });
    }
};




module.exports = {
    getCategories,
    getCategoryById,
    addCategory,
    editCategory,
    deleteCategory
};
