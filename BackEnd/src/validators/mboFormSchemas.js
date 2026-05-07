const { z } = require('zod');
const { REVIEW_DECISION_VALUES } = require('../config/constants');

const objectiveSchema = z.object({
  title: z.string().min(1, 'Objective title is required').trim(),
  keyResults: z
    .array(z.string().min(1))
    .min(1, 'At least one key result is required'),
  progress: z.string().min(1, 'Progress is required'),
  selfScore: z.number().min(1).max(100),
  notes: z.string().optional().default(''),
});

const createMboSchema = z.object({
  quarterId: z.string().min(1, 'Quarter ID is required'),
  objectives: z.array(objectiveSchema).optional().default([]),
});

const updateMboSchema = z.object({
  objectives: z.array(objectiveSchema).min(1, 'At least one objective is required'),
});

const reviewMboSchema = z.object({
  decision: z.enum(REVIEW_DECISION_VALUES),
  comment: z.string().min(1, 'Comment is mandatory when reviewing'),
});

module.exports = {
  createMboSchema,
  updateMboSchema,
  reviewMboSchema,
};
