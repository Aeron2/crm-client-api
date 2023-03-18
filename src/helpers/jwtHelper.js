const jwt = require('jsonwebtoken');

const createAccessJWT = (payload) => {
    const accessJWT = jwt.sign({ payload }, process.env.JWT_ACCESS_SECRET,
    {expiresIn : '15min'});
  return Promise.resolve(accessJWT);
};
const createRefreshJWT = (payload) => {
  const accessJWT = jwt.sign({ payload }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: '30min',
  });
  return Promise.resolve(accessJWT);
};

module.exports = {
  createAccessJWT,
  createRefreshJWT,
};