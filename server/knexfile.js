// Update with your config settings.

module.exports = {
  development: {
    client: 'mariasql',
    connection: {
      unixSocket: '/var/run/mysqld/mysqld.sock',
      user: 'nathan',
      db: 'chat',
      charset: 'utf8'
    }
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
