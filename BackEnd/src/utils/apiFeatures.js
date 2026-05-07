/**
 * Reusable query helper for pagination, filtering, sorting.
 * Works with any Mongoose query.
 *
 * Usage:
 *   const features = new APIFeatures(Model.find(), req.query)
 *     .filter()
 *     .sort()
 *     .paginate();
 *   const docs = await features.query;
 */
class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  /**
   * Basic field-equality filtering.
   * Strips out pagination/sort/fields params.
   */
  filter() {
    const excluded = ['page', 'limit', 'sort', 'fields'];
    const filterObj = { ...this.queryString };
    excluded.forEach((key) => delete filterObj[key]);

    // Allow advanced operators like gte, gt, lte, lt
    let filterStr = JSON.stringify(filterObj);
    filterStr = filterStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    this.query = this.query.find(JSON.parse(filterStr));
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  paginate() {
    const page = Math.max(parseInt(this.queryString.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(this.queryString.limit, 10) || 20, 1), 100);
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);
    this.page = page;
    this.limit = limit;
    return this;
  }
}

module.exports = APIFeatures;
