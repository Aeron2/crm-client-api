const express = require('express');
const { route } = require('./ticketRouter');
const router = express.Router();
const { hashPassword, comparePassword } = require('../helpers/bcryptHelper');
const { insertUser, getUserByEmail } = require('../model/user/UserModel');

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

//uaser sign in

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  console.log(req.body);

  if (!email || !password) {
    return res.json({
      status: 'error',
      message: 'Check Email or Password',
    });
  }

  //get user with same email as db
  const user = await getUserByEmail(email);
  console.log(user);
  if (!user) {
    return res.json({
      status: 'error',
      message: 'invalid emailll',
    });
  }

  const passFromDb = user && user._id ? user.password : null;
  if (!passFromDb)
    return res.json({
      status: 'error',
      message: 'invalid user otr password',
    });

  //compare password
  const result = await comparePassword(password, passFromDb);
  if (!result) {
    return res.json({
      status: 'error',
      message: 'invalid user otr password',
    });
  }
  console.log(result);

  res.json({
    status: 'success',
    message: 'login successfully',
  });
});

module.exports = router;
