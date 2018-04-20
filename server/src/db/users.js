const knex = require('./knex/db');

module.exports = {
  get(field, value, columns) {
    if (columns !== undefined)
      return this.getUser(field, value).select(...columns);
    else
      return knex('users').where(field, value).first();
  },

  getAll() {
    return knex('users').select('id', 'username', 'active');
  },

  create(user) {
    return knex('users').insert(user);
  },

  update(field, value, update) {
    return knex('users').where(field, value).update(update);
  },

  updateAll(update) {
    return knex('users').update(update);
  }
}
