class APIFeature {
  constructor(model, query) {
    this.model = model;
    this.query = query;
  }

  filter() {
    /**
     * exclude the specific query string
     **/
    const query = { ...this.query };
    const field = ['sort', 'page', 'limit', 'fields'];
    field.forEach((el) => delete query[el]);

    // replace lt gt... operator into mongodb operator $gt $lt...
    let queryStr = JSON.stringify(query);
    queryStr = queryStr.replace(/\b(lt|lte|gt|gte)\b/g, (match) => `$${match}`);
    this.model = this.model.find(JSON.parse(queryStr));
    return this;
  }

  sort() {
    if (!this.query.sort) {
      this.model = this.model.sort('-createdAt ');
      return this;
    }
    const sort = this.query.sort.split(',').join(' ');
    // <string> 預設是降冪, 可用 -<string> 來升冪
    // '<query1> <query2> <query3>...' 可進行多種類排序
    this.model.sort(sort);
    return this;
  }

  limitField() {
    if (!this.query.fields) {
      this.model.select('-__v');
      return this;
    }
    const includeFields = this.query.fields.split(',').join(' ');
    this.model.select(includeFields);
    return this;
  }

  pagination() {
    const page = this.query.page * 1 || 1;
    const limit = this.query.limit * 1 || 10;
    const skip = (page - 1) * limit;
    this.model.skip(skip).limit(limit);
    return this;
  }
}

module.exports = APIFeature;
