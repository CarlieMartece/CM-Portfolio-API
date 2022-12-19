const seed = require('./seed');
const db = require('.');
const data = require('./data');

seed(data).then(() => {
    return db.end();
});
