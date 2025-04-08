// auth-middleware.js - Basic authentication middleware
const basicAuth = require('basic-auth');

// This is a simple implementation - for production, use more secure methods
const users = {
    'newmind': 'newmind'  // Change this to your preferred credentials
};

function authentication(req, res, next) {
    const user = basicAuth(req);

    if (!user || !users[user.name] || users[user.name] !== user.pass) {
        res.set('WWW-Authenticate', 'Basic realm="Feedback System"');
        return res.status(401).send('Authentication required');
    }

    return next();
}

module.exports = authentication;