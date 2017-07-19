var db = require('../../db');

module.exports = {
    getUserByEmail: function (email, done) {
        db.query('SELECT * FROM users WHERE email = ? LIMIT 1', [email], function (err, result, fields) {
            if (err) {
                throw err
            }

            done(err, result[0]);
        });
    }
};