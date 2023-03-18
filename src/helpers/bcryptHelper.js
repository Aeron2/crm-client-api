const bcrypt = require('bcrypt');
const saltRounds = 10;

exports.hashPassword = (plainPassword) => {
  return new Promise((resolve) => {
    resolve(bcrypt.hashSync(plainPassword, saltRounds));
  });

  //   bcrypt.hash(myPlaintextPassword, saltRounds, function (err, hash) {
  //     // Store hash in your password DB.
  //   });
};

exports.comparePassword = (plainPass, passFromDb) => {
  return new Promise((resolve, reject) => {
    bcrypt.compare(plainPass, passFromDb, function (err, result) {
      if (err) reject(err);
      resolve(result);
    });
  });
};
