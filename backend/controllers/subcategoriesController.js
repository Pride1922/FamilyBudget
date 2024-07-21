const db = require('../models/subcategoryModel');
const merchantModel = require('../models/merchantModel');
const { errorLogger, infoLogger } = require('../config/logger');

// Get All Subcategories
const getSubcategories = (req, res) => {
    db.getAllSubcategories((err, results) => {
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
    db.getSubcategoryById(id, (err, result) => {
        if (err) {
            errorLogger.error(err.message);
            return res.status(500).json({ error: 'Internal server error' });
        }
        if (!result) {
            return res.status(404).json({ error: 'Subcategory not found' });
        }
        res.json(result);
    });
};

// Add Subcategory
const addSubcategory = async (req, res) => {
    const { name, category_id } = req.body;
    try {
        if (!name || !category_id) {
            return res.status(400).json({ error: 'Name and category_id are required' });
        }

        const newSubcategory = new db.Subcategory({ name, category_id });
        await newSubcategory.save();

        infoLogger.info(`Subcategory added: ${name}`);
        res.status(201).json(newSubcategory);
    } catch (error) {
        errorLogger.error(error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Edit Subcategory
const editSubcategory = async (req, res) => {
    const { id } = req.params;
    const { name, category_id } = req.body;
    try {
        if (!name || !category_id) {
            return res.status(400).json({ error: 'Name and category_id are required' });
        }

        const updatedSubcategory = await db.Subcategory.findByIdAndUpdate(
            id,
            { name, category_id },
            { new: true }
        );

        if (!updatedSubcategory) {
            return res.status(404).json({ error: 'Subcategory not found' });
        }

        infoLogger.info(`Subcategory updated: ${name}`);
        res.json(updatedSubcategory);
    } catch (error) {
        errorLogger.error(error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Delete Subcategory
const deleteSubcategory = async (req, res) => {
    const { id } = req.params;
    try {
        const hasMerchants = await merchantModel.Merchant.exists({ subcategory_id: id });
        if (hasMerchants) {
            return res.status(400).json({ error: 'Cannot delete subcategory with existing merchants' });
        }

        const deletedSubcategory = await db.Subcategory.findByIdAndDelete(id);
        if (!deletedSubcategory) {
            return res.status(404).json({ error: 'Subcategory not found' });
        }

        infoLogger.info(`Subcategory deleted: ${deletedSubcategory.name}`);
        res.status(204).send();
    } catch (error) {
        errorLogger.error(error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    getSubcategories,
    getSubcategoryById,
    addSubcategory,
    editSubcategory,
    deleteSubcategory
};
