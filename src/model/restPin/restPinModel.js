const { token } = require('morgan');
const { ResetPinSchema } = require('./restPinSchema');

const { randomPinNumber } = require('../../utils/randomGenerator');

const setPasswordRestPin = async (email) => {
  //reand 6 digit
  const pinLength = 6;
  const randPin = await randomPinNumber(pinLength);

  const restObj = {
    email,
    pin: randPin,
  };

  return new Promise((resolve, reject) => {
    ResetPinSchema(restObj)
      .save()
      .then((data) => resolve(data))
      .catch((error) => reject(error));
  });
};

const getPinByEmailPin = (email, pin) => {
  return new Promise(async (resolve, reject) => {
    try {
      const findByEmail1 = await ResetPinSchema.findOne({ email, pin });
      resolve(findByEmail1);
      console.log(findByEmail1);
    } catch (error) {
      reject(findByEmail1);
      console.log(error);
    }
  });
};

const deletePin = async (email, pin) => {
  try {
    const delPin = await ResetPinSchema.findOneAndDelete({ email, pin });
    console.log(delPin);
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  setPasswordRestPin,
  getPinByEmailPin,
  deletePin,
};
