const { z } = require('zod');

const createQuarterSchema = z.object({
  label: z
    .string()
    .min(1, 'Quarter label is required')
    .trim(),
});

module.exports = { createQuarterSchema };
