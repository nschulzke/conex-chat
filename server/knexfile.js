// Update with your config settings.

module.exports = {

  development: {
    client: 'sqlite3',
    connection: {
      filename: './dev.sqlite3'
    },
    useNullAsDefault: true
  },

  staging: {
    client: 'mariasql',
    connection: {
      unixSocket: '/var/run/mysqld/mysqld.sock',
      user: 'nathan',
      db: 'chat',
      charset: 'utf8'
    }
  },
  
  production: {
    client: 'mariasql',
    connection: {
      unixSocket: '/var/run/mysqld/mysqld.sock',
      user: 'nathan',
      db: 'chat',
      charset: 'utf8'
    }
  }
};
