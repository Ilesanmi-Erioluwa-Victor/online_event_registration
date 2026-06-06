export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: `Role ${req.user.role} is not authorized to access this resource` });
    }
    next();
  };
};

export const isOwnerOrAdmin = (model, paramField = 'id') => {
  return async (req, res, next) => {
    try {
      const resource = await model.findById(req.params[paramField]);
      if (!resource) {
        return res.status(404).json({ message: 'Resource not found' });
      }
      if (req.user.role === 'admin') return next();
      if (resource.organizer && resource.organizer.toString() === req.user._id.toString()) return next();
      if (resource.createdBy && resource.createdBy.toString() === req.user._id.toString()) return next();
      return res.status(403).json({ message: 'Not authorized to modify this resource' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
};
