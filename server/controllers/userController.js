import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import AuditLog from '../models/AuditLog.js';
import { generateToken } from '../utils/generateToken.js';

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

export const createUser = asyncHandler(async (req, res) => {
  const { fullName, email, password, role, phone, organization, bio } = req.body;
  
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }
  
  const user = await User.create({
    fullName,
    email,
    password,
    role,
    phone,
    organization,
    bio,
  });
  
  await logAction(req, 'USER_CREATED', 'User', user._id, `User ${email} created with role ${role}`);
  
  res.status(201).json(user);
});

export const getUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search, role, isActive } = req.query;
  const query = {};
  
  if (search) {
    query.$or = [
      { fullName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { organization: { $regex: search, $options: 'i' } },
    ];
  }
  if (role) query.role = role;
  if (isActive !== undefined) query.isActive = isActive === 'true';
  
  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  const [users, total] = await Promise.all([
    User.find(query).sort('-createdAt').skip(skip).limit(parseInt(limit)),
    User.countDocuments(query),
  ]);
  
  res.json({
    users,
    currentPage: parseInt(page),
    totalPages: Math.ceil(total / parseInt(limit)),
    total,
  });
});

export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  res.json(user);
});

export const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  
  const { password, ...updateData } = req.body;
  Object.assign(user, updateData);
  
  if (password) {
    user.password = password;
  }
  
  await user.save();
  await logAction(req, 'USER_UPDATED', 'User', user._id, `User ${user.email} updated`);
  
  res.json(user);
});

export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  
  user.isActive = false;
  await user.save();
  
  await logAction(req, 'USER_DEACTIVATED', 'User', user._id, `User ${user.email} deactivated`);
  
  res.json({ message: 'User deactivated' });
});

export const toggleUserActive = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  
  user.isActive = !user.isActive;
  await user.save();
  
  await logAction(req, 'USER_TOGGLED', 'User', user._id, `User ${user.email} ${user.isActive ? 'activated' : 'deactivated'}`);
  
  res.json(user);
});
