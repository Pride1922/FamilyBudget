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
    console.log('Request body:', req.body); // Debugging line
    const { name, category_id } = req.body; // Fix the property name here
    if (!name || !category_id) {
        console.error('Missing name or category_id'); // Debugging line
        return res.status(400).json({ error: 'Name and category_id are required' });
    }

    categoryModel.getCategoryById(category_id, (err, results) => {
        if (err) {
            errorLogger.error(err.message);
            return res.status(500).json({ error: 'Internal server error' });
        }
        if (!results.length) {
            console.error('Category not found'); // Debugging line
            return res.status(404).json({ error: 'Category not found' });
        }

        subcategoryModel.createSubcategory({ name, categoryId: category_id }, (err, result) => {
            if (err) {
                errorLogger.error(err.message);
                return res.status(500).json({ error: 'Internal server error' });
            }
            infoLogger.info(`Subcategory added to category ${category_id}: ${name}`);
            res.status(201).json({ id: result.insertId, name, categoryId: category_id });
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

    subcategoryModel.getSubcategoryById(id, (err, results) => {
        if (err) {
            errorLogger.error(err.message);
            return res.status(500).json({ error: 'Internal server error' });
        }
        if (!results.length) {
            return res.status(404).json({ error: 'Subcategory not found' });
        }

        subcategoryModel.updateSubcategory(id, { name, categoryId }, (err, result) => {
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

// Get Subcategories By Category ID
const getSubcategoriesByCategoryId = (req, res) => {
    const { categoryId } = req.params;
    subcategoryModel.getSubcategoriesByCategoryId(categoryId, (err, subcategories) => {
        if (err) {
            errorLogger.error(err.message);
            return res.status(500).json({ message: 'Failed to fetch subcategories', error: err.message });
        }
        res.status(200).json(subcategories);
    });
};

module.exports = {
    getSubcategories,
    getSubcategoryById,
    addSubcategory,
    editSubcategory,
    deleteSubcategory,
    getSubcategoriesByCategoryId
};
