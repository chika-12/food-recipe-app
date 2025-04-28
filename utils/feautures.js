class ApiFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filtering() {
    const queryData = { ...this.queryString };
    const excludeFields = ['sort', 'page', 'pagination', 'fields'];
    excludeFields.forEach((el) => delete queryData[el]);

    // Special Case
    // if (queryData.title) {
    //   queryData.title = { $regex: queryData.title, $options: 'i' };
    // }

    //Advance querying
    let queryString = JSON.stringify(queryData);
    queryString = queryString.replace(
      /\b(gte|gt|lt|lte)\b/g,
      (match) => `$${match}`
    );

    this.query = this.query.find(JSON.parse(queryString));

    return this;
  }
  sorting() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    }
    return this;
  }
  limitFields() {
    if (this.queryString.fields) {
      const fieldData = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fieldData);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }
  pagination() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}
module.exports = ApiFeatures;
