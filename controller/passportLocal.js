//―――――――――――――――――――――――――――――――――――――――――― ┏  Modules ┓ ―――――――――――――――――――――――――――――――――――――――――― \\

const user = require('../model/user');
const bcryptjs = require('bcryptjs');
var localStrategy = require('passport-local').Strategy;

module.exports = function (passport) {
    passport.use(new localStrategy({ usernameField: 'email' }, async (email, password, done) => {
        try {
            const identifier = String(email || '').trim();
            const data = await user.findOne({
                $or: [
                    { email: identifier.toLowerCase() },
                    { username: identifier },
                ],
            });
            if (!data) {
                return done(null, false, { message: "User Doesn't Exist !" });
            }
            const match = await bcryptjs.compare(password, data.password);
            if (!match) {
                return done(null, false, { message: "Password Doesn't match !" });
            }
            return done(null, data);
        } catch (error) {
            return done(error);
        }
    }));

    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(async function (id, done) {
        try {
            const account = await user.findById(id);
            return done(null, account);
        } catch (error) {
            return done(error);
        }
    });

}

//―――――――――――――――――――――――――――――――――――――――――― ┏  Modified By MrTomXxX ┓ ―――――――――――――――――――――――――――――――――――――――――― \\
