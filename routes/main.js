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
    let limit = await dataweb.findOne();
    let users = await User.findOne({_id: id})
    return {apikey: users.apikey, username: users.username, checklimit: users.limitApikey, isVerified : users.isVerified, RequestToday: limit.RequestToday};
}


//_______________________ ┏ Router ┓ _______________________\\

router.get('/', (req, res) => {
        res.render("home");
});

router.get('/docs',  checkAuth, async (req, res) => {
  let getinfo =  await getApikey(req.user.id)
  let { apikey, username, checklimit, isVerified , RequestToday } = getinfo
    res.render("docs", { username: username, verified: isVerified, apikey: apikey, limit: checklimit , RequestToday: RequestToday });
    
});


router.get("/logout", (req, res) => {
    req.logout(req.user, err => {
      if(err) return next(err);
      res.redirect("/login");
    });
  });



router.use(authRoutes);
router.use(apiRoutes);
module.exports = router;


