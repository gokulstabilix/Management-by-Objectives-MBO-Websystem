const AppError = require('../utils/AppError');

/**
 * Factory: validates req.body against a Zod schema.
 * Returns 400 with formatted error messages on failure.
 *
 * Usage: validate(createUserSchema)
 */
const validate = (zodSchema) => (req, _res, next) => {
  const result = zodSchema.safeParse(req.body);

  if (!result.success) {
    console.error('Validation Error Object:', result.error);
    const messages = result.error.issues.map(
      (e) => `${e.path.join('.')}: ${e.message}`
    );
    return next(new AppError(messages.join('; '), 400));
  }

  // Replace body with the validated & transformed data
  req.body = result.data;
  next();
};

/**
 * Factory: validates req.query against a Zod schema.
 */
const validateQuery = (zodSchema) => (req, _res, next) => {
  const result = zodSchema.safeParse(req.query);

  if (!result.success) {
    const messages = result.error.issues.map(
      (e) => `${e.path.join('.')}: ${e.message}`
    );
    return next(new AppError(messages.join('; '), 400));
  }

  req.query = result.data;
  next();
};

module.exports = { validate, validateQuery };
