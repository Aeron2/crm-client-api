const express = require('express');
const { route } = require('./ticketRouter');
const router = express.Router();
const { hashPassword, comparePassword } = require('../helpers/bcryptHelper');
const {
  insertUser,
  getUserByEmail,
  getUserById,
  updatePassword,
  storeUserRefreshJWT,
} = require('../model/user/UserModel');
const {
  setPasswordRestPin,
  getPinByEmailPin,
  deletePin,
} = require('../model/restPin/restPinModel');
const { crateAccessJWT, crateRefreshJWT } = require('../helpers/jwtHelper');
const { userAuthorization } = require('../middleware/authorizationMiddleware');
const {
  resetPassReqValidation,
  updatePassValidation,
} = require('../middleware/formValidationMiddleware');
const { emailProcessor } = require('../helpers/emailHelper');
const { deleteJWT } = require('../helpers/redisHelper');

router.all('/', (req, res, next) => {
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

router.post('/reset-password', resetPassReqValidation, async (req, res) => {
  const { email } = req.body;

  const user = await getUserByEmail(email);

  if (user && user._id) {
    const setPin = await setPasswordRestPin(email);

    const result = await emailProcessor({
      email,
      pin: setPin.pin,
      type: 'request-new-pass',
    });

    return res.json({
      status: 'success',
      message:
        'if the email existd in our db, the password will be sent to you shortly',
    });
  }
  return res.json({
    status: 'error',
    message:
      'if the email existd in our db, the password will be sent to you shortly',
  });
});

router.patch('/reset-password', updatePassValidation, async (req, res) => {
  const { email, pin, newPassword } = req.body;
  const getPin = await getPinByEmailPin(email, pin);

  if (getPin?._id) {
    const dbDate = getPin.addedAt;
    const expiresIn = 1;
    let expDate = dbDate.setDate(dbDate.getDate() + expiresIn);
    const today = new Date();
    if (today > expDate) {
      return res.json({
        status: 'error',
        message: 'Invalid or expirerd pin',
      });
    }

    // encrypt the new password
    const hashedPass = await hashPassword(newPassword);
    const user = await updatePassword(email, hashedPass);

    if (user._id) {
      //send email noti

      await emailProcessor({ email, type: 'password-update-succcess' });

      ////delete pion from db
      deletePin(email, pin);

      return res.json({
        status: 'success',
        message: 'Your password has been updated',
      });
    }
  }

  res.json({
    status: 'error',
    message: 'Unable to update teh password plx try again later',
  });
});
router.delete('/logout', userAuthorization, async (req, res) => {
  const { authorization } = req.headers;
  const _id = req.userId;

  //delete jwt
  deleteJWT(authorization);

  const result = await storeUserRefreshJWT(_id, '');

  if (result?._id) {
    return res.json({
      status: 'success',
      message: 'logged out successfully',
    });
  }
  res.json({
    status: 'error',
    message: 'unable to log you out',
  });
});
module.exports = router;
