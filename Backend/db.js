const mariadb = require('mariadb');

const pool = mariadb.createPool({
  host: 'localhost',
  user: 'simon',        // your DB user
  password: 'Javajuma', // your DB password
  connectionLimit: 5
});

module.exports = pool;
