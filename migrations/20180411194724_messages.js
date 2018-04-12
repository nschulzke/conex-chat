exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('messages', function(table) {
      table.increments('id').primary();
      table.string('text').notNullable();
      table.integer('from_id').unsigned().notNullable().references('id').inTable('users');
      table.integer('to_id').unsigned().notNullable().references('id').inTable('users');
    }),
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.dropTable('messages'),
  ]);
};
