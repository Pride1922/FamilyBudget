const subcategoryModel = require('../models/subcategoryModel');
const categoryModel = require('../models/categoryModel');
const merchantModel = require('../models/merchantModel');
const { errorLogger, infoLogger } = require('../config/logger');

// Get All Subcategories
const getSubcategories = (req, res) => {
    subcategoryModel.getAllSubcategories((err, results) => {
        if (err) {
            errorLogger.error(err.message);
            return res.status(500).json({ error: 'Internal server error' });
        }
        res.json(results);
    });
};

// Get Subcategory By ID
const getSubcategoryById = (req, res) => {
    const { id } = req.params;
    subcategoryModel.getSubcategoryById(id, (err, result) => {
        if (err) {
            errorLogger.error(err.message);
            return res.status(500).json({ error: 'Internal server error' });
        }
        if (!result.length) {
            return res.status(404).json({ error: 'Subcategory not found' });
        }
        res.json(result[0]);
    });
};

// Add Subcategory
const addSubcategory = (req, res) => {
    const { name, categoryId } = req.body;
    if (!name || !categoryId) {
        return res.status(400).json({ error: 'Name and categoryId are required' });
    }

    // Ensure the categoryId is valid
    categoryModel.getCategoryById(categoryId, (err, results) => {
        if (err) {
            errorLogger.error(err.message);
            return res.status(500).json({ error: 'Internal server error' });
        }
        if (!results.length) {
            return res.status(404).json({ error: 'Category not found' });
        }

        subcategoryModel.createSubcategory({ name, categoryId }, (err, result) => {
            if (err) {
                errorLogger.error(err.message);
                return res.status(500).json({ error: 'Internal server error' });
            }
            infoLogger.info(`Subcategory added to category ${categoryId}: ${name}`);
            res.status(201).json({ id: result.insertId, name, categoryId });
        });
    });
};

// Edit Subcategory
const editSubcategory = (req, res) => {
    const { id } = req.params;
    const { name, categoryId } = req.body;
    if (!name || !categoryId) {
        return res.status(400).json({ error: 'Name and categoryId are required' });
    }

    // Update subcategory
    subcategoryModel.getSubcategoryById(id, (err, results) => {
        if (err) {
            errorLogger.error(err.message);
            return res.status(500).json({ error: 'Internal server error' });
        }
        if (!results.length) {
            return res.status(404).json({ error: 'Subcategory not found' });
        }

        // Assuming you have an update method
        db.query('UPDATE Subcategories SET name = ?, category_id = ? WHERE id = ?', [name, categoryId, id], (err, result) => {
            if (err) {
                errorLogger.error(err.message);
                return res.status(500).json({ error: 'Internal server error' });
            }
            res.json({ id, name, categoryId });
        });
    });
};

// Delete Subcategory
const deleteSubcategory = async (req, res) => {
    const { id } = req.params;
    try {
        // Check if there are merchants associated with the subcategory
        const hasMerchants = await new Promise((resolve, reject) => {
            merchantModel.getMerchantsBySubcategoryId(id, (err, count) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(count > 0);
                }
            });
        });

        if (hasMerchants) {
            return res.status(400).json({ error: 'Cannot delete subcategory with existing merchants' });
        }

        // Delete the subcategory
        subcategoryModel.deleteSubcategory(id, (err, result) => {
            if (err) {
                errorLogger.error(err.message);
                return res.status(500).json({ error: 'Internal server error' });
            }
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Subcategory not found' });
            }

            infoLogger.info(`Subcategory deleted with id: ${id}`);
            res.status(204).send();
        });
    } catch (error) {
        errorLogger.error(error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get Subcategories By Category
const getSubcategoriesByCategory = (req, res) => {
    const categoryId = req.params.categoryId;
    subcategoryModel.getSubcategoriesByCategoryId(categoryId, (err, results) => {
        if (err) {
            errorLogger.error(err.message);
            return res.status(500).json({ error: 'Internal server error' });
        }
        res.json(results);
    });
};

module.exports = {
    getSubcategories,
    getSubcategoryById,
    addSubcategory,
    editSubcategory,
    deleteSubcategory,
    getSubcategoriesByCategory
};
