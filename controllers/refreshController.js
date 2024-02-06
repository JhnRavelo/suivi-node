const { users } = require("../database/models");
const jwt = require("jsonwebtoken");

const refresh = async (req, res) => {
  try {
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

    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN,
      async (err, decoded) => {
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
      }
    );
  } catch (error) {
    console.log(error);
  }
};

const handleRefreshToken = async (req, res) => {
  try {
    const cookie = await req.cookies;

    if (!cookie?.jwt_ea_suivi) return res.sendStatus(401);

    const refreshToken = cookie.jwt_ea_suivi;
    res.clearCookie("jwt_ea_suivi", {
      httpOnly: true,
      sameSite: "None",
      secure: true,
    });

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
              ID_user: decoded.id,
            },
          });

          hackedUser.refreshToken = "";
          await hackedUser.save();
        }
      );

      return res.sendStatus(403);
    }
    console.log("ERROR");

    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN,
      async (err, decoded) => {
        if (err) {
          user.refreshToken = "";
          await user.save();
        }

        if (err || user.id !== decoded.id) return res.sendStatus(403);

        const id = user.id,
          role = user.role,
          newRefreshToken = users.prototype.generateRefreshToken(id),
          accessToken = users.prototype.generateToken(id, role);

        user.refreshToken = newRefreshToken;
        await user.save();

        res.cookie("jwt_ea_suivi", newRefreshToken, {
          httpOnly: true,
          sameSite: "None",
          secure: true,
          maxAge: 24 * 60 * 60 * 1000,
        });

        res.json({
          success: true,
          role,
          accessToken,
          name: user.name,
          email: user.email,
        });
      }
    );
  } catch (error) {
    console.log(error);
  }
};

module.exports = { refresh, handleRefreshToken };
