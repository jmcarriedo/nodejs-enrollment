const express = require('express');
const router = express.Router();
const {register, login} = require('../controllers/auth');
const registrationController = require('../controllers/auth');
const adminController = require('../controllers/auth');


router.post('/register', registrationController.register);
router.post('/login', registrationController.login);

router.get('/adminlist', adminController.adminlist);
router.get('/studentlist', adminController.studentlist);

router.get('/deleteuser/:email', adminController.deleteuser);
router.get('/updateform/:email', adminController.updateform);
router.post('/updateuser', adminController.updateuser);

router.get('/addform', adminController.addform);
router.post('/adduser', adminController.adduser);



module.exports = router;