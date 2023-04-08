const express = require('express');
const { route } = require('./ticketRouter');
const router = express.Router();
const { hashPassword, comparePassword } = require('../helpers/bcryptHelper');
const {
  insertUser,
  getUserByEmail,
  getUserById,
} = require('../model/user/UserModel');
const { setPasswordRestPin } = require('../model/restPin/restPinModel');
const { crateAccessJWT, crateRefreshJWT } = require('../helpers/jwtHelper');
const { userAuthorization } = require('../middleware/authorizationMiddleware');
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

  const accessJWT = await crateAccessJWT(user.email, `${user._id}`);

  const refreshJWT = await crateRefreshJWT(user.email);

  res.json({
    status: 'success',
    message: 'login successfully',
    accessJWT,
    refreshJWT,
  });
});

router.get('/', userAuthorization, async (req, res) => {
  const _id = req.userId;

  const userProf = await getUserById(_id);

  res.json({ user: userProf });
});

router.post('/reset-password', async (req, res) => {
  const { email } = req.body;

  const user = await getUserByEmail(email);

  if (user && user._id) {
    const setPin = await setPasswordRestPin(email);
    return res.json(setPin);
  }
  res.json({
    status: 'error',
    message:
      ' if the email exists in ourt db then the pin will be sent shortly!!!',
  });
});

module.exports = router;
