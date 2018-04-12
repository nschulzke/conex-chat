exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('chats', function(table) {
      table.increments('id').primary();
      table.boolean('accepted').notNullable();
      table.integer('first_id').unsigned().notNullable().references('id').inTable('users');
      table.integer('second_id').unsigned().notNullable().references('id').inTable('users');
    }),
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.dropTable('friends'),
  ]);
};
