const { Op } = require("sequelize");
const { users } = require("../database/models");
const bcrypt = require("bcrypt");

const login = async (req, res) => {
  const { email, password } = await req.body;
  try {
    const userLogin = await users.findOne({
      where: {
        email: {
          [Op.eq]: email,
        },
      },
    });

    if (!userLogin) return res.json({ success: false });

    const match = await bcrypt.compare(password, userLogin.password);

    if (!match) return res.json({ success: false });

    let id = userLogin.id;
    let role = userLogin.role;

    const accesToken = users.prototype.generateToken(id, role);
    const refreshToken = users.prototype.generateRefreshToken(id);

    userLogin.refreshToken = refreshToken;

    await userLogin.save();

    res.json({
      success: true,
      accesToken,
      refreshToken,
      role,
      name: userLogin.name,
      email: userLogin.email,
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false });
  }
};

const logout = async (req, res) => {
  const { refreshToken } = await req.body;

  if (!refreshToken) return res.json({ success: false });

  const userLogout = await users.findOne({
    where: {
      refreshToken: refreshToken,
    },
  });

  if (!userLogout) return res.json({ success: false });

  userLogout.refreshToken = "";
  await userLogout.save();

  res.json({ success: true });
};

const userRead = async (req, res) => {
  const id = await req.user;

  if (!id) return res.json({ success: false });

  const user = await users.findOne({
    where: {
      id: id,
    },
  });

  if (!user) return res.json({ success: false });

  res.json({ success: true, name: user.name, email: user.email });
};

const userLoginWeb = async (req, res) => {
  try {
    const { email, password } = await req.body;

    const cookie = req.cookies;
    console.log("LOGIN")
    if (!email || !password) return res.json({ success: false });

    const userLogged = await users.findOne({
      where: {
        email: {
          [Op.eq]: email,
        },
      },
    });

    if (!userLogged) return res.json({ success: false });

    if (userLogged.role != process.env.PRIME)
      return res.json({
        success: false,
        error: "Vous n'avez pas la permission",
      });

    const match = await bcrypt.compare(password, userLogged.password);

    if (!match)
      return res.json({ success: false, error: "Connexion Invalide" });

    const id = userLogged.id;
    const role = userLogged.role;

    let newRefreshToken = users.prototype.generateRefreshToken(id);
    const accessToken = users.prototype.generateToken(id, role);

    if (cookie?.jwt_ea_suivi) {
      const refreshToken = cookie.jwt_ea_suivi;
      const userFound = await users.findOne({
        where: {
          refreshToken: refreshToken,
        },
      });

      if (!userFound) {
        newRefreshToken = "";
      }

      res.clearCookie("jwt_ea_suivi", {
        httpOnly: true,
        sameSite: "None",
        secure: true,
      });
    }

    userLogged.refreshToken = newRefreshToken;

    await userLogged.save();

    res.cookie("jwt_ea_suivi", newRefreshToken, {
      httpOnly: true,
      sameSite: "None",
      secure: true,
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      accessToken,
      role,
      name: userLogged.dataValues.name,
      email: userLogged.dataValues.email,
    });

  } catch (error) {
    console.log(error);
    res.json({ success: false, error: "Problème de serveur" });
  }
};

const userLogoutWeb = async (req, res) => {
  const cookie = req.cookies;

  if (!cookie?.jwt_ea_suivi) return res.json({success: false});

  const refreshToken = cookie.jwt_ea_suivi;

  const user = await users.findOne({
    where: {
      refreshToken: refreshToken,
    },
  });

  if (!user) {
    res.clearCookie("jwt_ea_suivi", {
      httpOnly: true,
      sameSite: "None",
      secure: true,
    });
    return res.json({success: false});
  }
  console.log("vider");
  user.refreshToken = "";
  await user.save();

  res.clearCookie("jwt_ea_suivi", {
    httpOnly: true,
    sameSite: "None",
    secure: true,
  });
  res.json({success: true})
}

module.exports = { login, logout, userRead, userLoginWeb, userLogoutWeb };
