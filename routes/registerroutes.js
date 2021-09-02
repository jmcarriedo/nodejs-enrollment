const express = require('express');
const { route } = require('./auth');
const router = express.Router();

router.get('/', (req,res) => {
    res.render('index')
});

router.get('/login', (req,res) => {
    res.render('login');
});

router.get('/register', (req,res) => {
    res.render('register');
})

router.get('/studentprofile', (req,res) => {
    res.render('studentprofile');
});

router.get('/admission', (req,res) => {
    res.render('admission');
});

router.get('/enrollment', (req,res) => {
    res.render('enrollment');
});

module.exports = router;