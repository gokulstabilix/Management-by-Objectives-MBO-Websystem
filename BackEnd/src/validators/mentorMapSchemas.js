const { z } = require('zod');

const assignMentorSchema = z.object({
  employeeId: z.string().min(1, 'Employee ID is required'),
  mentorId: z.string().min(1, 'Mentor ID is required'),
});

const updateMentorSchema = z.object({
  mentorId: z.string().min(1, 'Mentor ID is required'),
});

module.exports = { assignMentorSchema, updateMentorSchema };
