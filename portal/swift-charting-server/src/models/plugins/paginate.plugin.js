/**
 * Function to paginate sequelite results.
 *
 * @param {import('sequelize').Model} Model - Sequelize Model.
 * @returns {*} -
 * @example
 * const sequelizePaginate = require('sequelize-paginate')
 *
 * sequelizePaginate(MyModel)
 */
function paginate(Model) {
  /**
   * @typedef {Object} Paginate Sequelize query options
   * @property {number} [paginate=25] Results per page
   * @property {number} [page=1] Number of page
   */
  /**
   * @typedef {import('sequelize').FindOptions & Paginate} paginateOptions
   */
  /**
   * The paginate result
   * @typedef {Object} PaginateResult
   * @property {Array} docs Docs
   * @property {number} pages Number of page
   * @property {number} total Total of docs
   */
  /**
   * Pagination.
   *
   * @param {paginateOptions} [params] - Options to filter query.
   * @returns {Promise<PaginateResult>} Total pages and docs.
   * @example
   * const { docs, pages, total } = await paginate(MyModel, { page: 1, paginate: 25 })
   */
  const pagination = async function ({ page = 1, limit = 25, ...params } = {}) {
    const options = { ...params };
    const includeHasFilter = Array.isArray(options.include)
      && options.include.some((inc) => inc && inc.where);

    const countOptions = Object.keys(options).reduce((acc, key) => {
      if (key === 'include') {
        if (includeHasFilter) {
          // keep include so count respects the same filter as findAll
          // eslint-disable-next-line security/detect-object-injection
          acc[key] = options[key];
        }
        // else: drop it, exactly like the old behavior
        return acc;
      }
      if (!['order', 'attributes'].includes(key)) {
        // eslint-disable-next-line security/detect-object-injection
        acc[key] = options[key];
      }
      return acc;
    }, {});
    if (countOptions.include) {
      countOptions.distinct = true;
      countOptions.col = this.primaryKeyAttribute || 'id';
    }

    let total = await this.count(countOptions);

    if (options.group !== undefined) {
      // @ts-ignore
      total = total.length;
    }

    const pages = Math.ceil(total / limit);
    options.limit = limit;
    options.offset = limit * (page - 1);
    /* eslint-disable no-console */
    if (params.limit) {
      console.warn(`(sequelize-pagination) Warning: limit option is ignored.`);
    }
    if (params.offset) {
      console.warn(`(sequelize-pagination) Warning: offset option is ignored.`);
    }
    /* eslint-enable no-console */
    if (params.order) options.order = params.order;
    const docs = await this.findAll(options);
    return { results: docs, page, totalPages: pages, totalResults: total, limit };
  };

  const instanceOrModel = Model.Instance || Model;
  // @ts-ignore
  instanceOrModel.paginate = pagination;
}

module.exports = paginate;
