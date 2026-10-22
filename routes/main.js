__path = process.cwd()

//_______________________ ┏  Info  ┓ _______________________\\
//
//   Edited BY: MrTomXxX
//   
//   -----------Note ------------
//
//   Api Owner: Bot
//   Don't sell this API,
//   Don't Change this text,
//   Who wants to upload don't forget to credit :),
//   Who does not place credit will take action
//   
//_______________________ ┏ Modified By MrTomXxX ┓ _______________________\\


//―――――――――――――――――――――――――――――――――――――――――― ┏  Modules ┓ ―――――――――――――――――――――――――――――――――――――――――― \\

require('../settings');
const express = require('express');
const router = express.Router();
const passport = require('passport');
require('../controller/passportLocal')(passport);
const authRoutes = require('./auth');
const apiRoutes = require('./api')
const dataweb = require('../model/DataWeb');
const User = require('../model/user');

//_______________________ ┏ Function ┓ _______________________\\

function checkAuth(req, res, next) {
    if (req.isAuthenticated()) {
        res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, post-check=0, pre-check=0');
        next();
    } else {
        req.flash('error_messages', "Please Login to continue !");
        res.redirect('/login');
    }
}

async function getApikey(id) {
  const [limit, user, totalUsers] = await Promise.all([
    dataweb.findOne().lean(),
    User.findById(id).select('apikey username limitApikey isVerified').lean(),
    User.countDocuments(),
  ]);

  if (!user) throw new Error('Authenticated user was not found.');

  return {
    apikey: user.apikey,
    username: user.username,
    checklimit: user.limitApikey,
    isVerified: user.isVerified,
    RequestToday: limit?.RequestToday ?? 0,
    totalUsers,
  };
}


//_______________________ ┏ Router ┓ _______________________\\

router.get('/', (req, res) => {
        res.render("home");
});

router.get('/healthz', (req, res) => {
    const databaseConnected = require('mongoose').connection.readyState === 1;
    res.status(databaseConnected ? 200 : 503).json({
        status: databaseConnected ? 'ok' : 'degraded',
        service: 'Better-Api',
        database: databaseConnected ? 'connected' : 'disconnected',
    });
});

router.get('/docs', checkAuth, async (req, res, next) => {
  try {
    const { apikey, username, checklimit, isVerified, RequestToday, totalUsers } = await getApikey(req.user.id);
    res.render("docs", {
      username,
      verified: isVerified,
      apikey,
      limit: checklimit,
      RequestToday,
      totalUsers,
    });
  } catch (error) {
    next(error);
  }
});


router.get("/logout", (req, res, next) => {
    req.logout(req.user, err => {
      if(err) return next(err);
      res.redirect("/login");
    });
  });



router.use(authRoutes);
router.use(apiRoutes);
module.exports = router;


