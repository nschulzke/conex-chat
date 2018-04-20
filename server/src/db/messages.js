const knex = require('./knex/db');

module.exports = {
  create(message) {
    return knex('messages').insert(message);
  },

  get(id) {
    return knex('messages').join('users', 'users.id', 'messages.from_id')
      .where('messages.id', id).select('username', 'text', 'sent_at', 'from_id', 'to_id').first();
  },

  getAll(user_id) {
    return knex('users').join('messages', 'users.id', 'messages.from_id')
      .where('from_id', user_id).orWhere('to_id', user_id)
      .select('username', 'text', 'sent_at', 'from_id', 'to_id');
  }
}
