import asyncHandler from 'express-async-handler';
import Category from '../models/Category.js';
import Event from '../models/Event.js';
import AuditLog from '../models/AuditLog.js';

const logAction = async (req, action, targetModel, targetId, details) => {
  try {
    await AuditLog.create({
      performedBy: req.user?._id,
      action,
      targetModel,
      targetId,
      details,
      ipAddress: req.ip,
    });
  } catch (err) {
    console.error('Audit log error:', err);
  }
};

export const createCategory = asyncHandler(async (req, res) => {
  const { name, description, icon, color } = req.body;
  
  const category = await Category.create({
    name,
    description,
    icon,
    color,
    createdBy: req.user._id,
  });
  
  await logAction(req, 'CATEGORY_CREATED', 'Category', category._id, `Category ${name} created`);
  
  res.status(201).json(category);
});

export const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find().sort('name');
  res.json(categories);
});

export const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }
  
  Object.assign(category, req.body);
  await category.save();
  
  await logAction(req, 'CATEGORY_UPDATED', 'Category', category._id, `Category ${category.name} updated`);
  
  res.json(category);
});

export const deleteCategory = asyncHandler(async (req, res) => {
  const eventsCount = await Event.countDocuments({ category: req.params.id });
  
  if (eventsCount > 0) {
    res.status(400);
    throw new Error('Cannot delete category with associated events');
  }
  
  const category = await Category.findByIdAndDelete(req.params.id);
  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }
  
  await logAction(req, 'CATEGORY_DELETED', 'Category', req.params.id, `Category ${category.name} deleted`);
  
  res.json({ message: 'Category deleted' });
});
