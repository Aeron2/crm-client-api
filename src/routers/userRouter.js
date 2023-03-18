const express = require('express');
const { route } = require('./ticketRouter');
const router = express.Router();
const {hashPassword} = require('../helpers/bcryptHelper');
const { insertUser } = require('../model/user/UserModel');

router.all('/', (req, res, next) => {
  // res.json({
  //   // message: ' return from user router ',
  // });
  next();
});

router.post('/', async (req, res) => {
  try {
    const { name, company, address, phone, email, password } = req.body;

    //hash password
    const hashedPass = await hashPassword(password);

    const newUserObj = {
      name,
      company,
      address,
      phone,
      email,
      password: hashedPass,
    };

    const result = await insertUser(newUserObj);
    console.log(result);
    res.json({
      message: 'New User Inserted',
      result,
    });
  } catch (error) {
    console.log(error);
    res.json({
      status: 'fail to insert',
      message: error.message,
    });
  }
});

module.exports = router;
