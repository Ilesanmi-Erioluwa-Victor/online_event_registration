export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePhone = (phone) => {
  if (!phone) return true;
  const re = /^[\d\s+()-]{7,20}$/;
  return re.test(phone);
};

export const validatePassword = (password) => {
  if (!password || password.length < 6) return 'Password must be at least 6 characters';
  return null;
};

export const getPasswordStrength = (password) => {
  if (!password) return { strength: 0, label: 'None' };
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  
  if (score <= 2) return { strength: 1, label: 'Weak', color: 'bg-red-500' };
  if (score === 3) return { strength: 2, label: 'Medium', color: 'bg-yellow-500' };
  if (score === 4) return { strength: 3, label: 'Strong', color: 'bg-green-500' };
  return { strength: 4, label: 'Very Strong', color: 'bg-green-600' };
};
