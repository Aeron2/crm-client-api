const { verifyAccessJWT } = require('../helpers/jwtHelper');
const { getJWT, deleteJWT } = require('../helpers/redisHelper');

const userAuthorization = async (req, res, next) => {
  const { authorization } = req.headers;

  const decoded = await verifyAccessJWT(authorization);

  if (decoded.email) {
    const userId = await getJWT(authorization);
    if (!userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    req.userId = userId;

    return next();
  }

  deleteJWT(authorization);

  return res.status(403).json({ message: 'Forbidden' });
};

module.exports = {
  userAuthorization,
};
