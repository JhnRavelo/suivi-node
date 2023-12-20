const { users } = require("../database/models");
const jwt = require("jsonwebtoken");

const refresh = async (req, res) => {
  const { refreshToken } = await req.body;

  if (!refreshToken) return res.sendStatus(403);

  const user = await users.findOne({
    where: {
      refreshToken: refreshToken,
    },
  });

  if (!user) {
    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN,
      async (err, decoded) => {
        if (err) {
          return res.sendStatus(403);
        }
        const hackedUser = await users.findOne({
          where: {
            id: decoded.id,
          },
        });

        hackedUser.refreshToken = "";
        await hackedUser.save();
      }
    );

    return res.sendStatus(403);
  }

  jwt.verify(refreshToken, process.env.REFRESH_TOKEN, async (err, decoded) => {
    if (err) {
      user.refreshToken = "";
      await user.save();
    }
 
    if (err || user.id !== decoded.id) return res.sendStatus(403);
    
    let id = user.id,
      role = user.role,
      newRefreshToken = users.prototype.generateRefreshToken(id),
      accessToken = users.prototype.generateToken(id, role);

    user.refreshToken = newRefreshToken;
    await user.save();
    res.json({
      success: true,
      refreshToken: newRefreshToken,
      accessToken,
      role,
    });
  });
};

module.exports = refresh;
