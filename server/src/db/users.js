const knex = require('./knex/db');

module.exports = {
  getUser(field, value, columns) {
    if (columns !== undefined)
      return this.getUser(field, value).select(...columns);
    else
      return knex('users').where(field, value).first();
  },

  getUsers(...columns) {
    return knex('users').select(...columns);
  },

  add(user) {
    return knex('users').insert(user);
  },

  update(field, value, update) {
    return knex('users').where(field, value).update(update);
  },

  updateAll(update) {
    return knex('users').update(update);
  }
}
