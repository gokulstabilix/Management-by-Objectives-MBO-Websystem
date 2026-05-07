const { z } = require('zod');
const { ROLE_VALUES, LEVEL_VALUES } = require('../config/constants');

const createUserSchema = z.object({
  name: z.string().min(1, 'Name is required').trim(),
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.preprocess((val) => (typeof val === 'string' ? val.toLowerCase() : val), z.enum(ROLE_VALUES)).default('employee'),
  level: z.preprocess((val) => (typeof val === 'string' ? val.toLowerCase() : val), z.enum(LEVEL_VALUES)).nullable().optional(),
  department: z.string().trim().nullable().optional(),
});

const updateUserSchema = z.object({
  name: z.string().min(1).trim().optional(),
  level: z.preprocess((val) => (typeof val === 'string' ? val.toLowerCase() : val), z.enum(LEVEL_VALUES)).optional(),
  department: z.string().trim().nullable().optional(),
});

module.exports = { createUserSchema, updateUserSchema };
