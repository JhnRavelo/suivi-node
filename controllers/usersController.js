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
    res.json({ success: false });
    console.log("ERROR LOGIN MOBILE", error);
  }
};

const logout = async (req, res) => {
  const { refreshToken } = await req.body;
  try {
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
  } catch (error) {
    res.json({ success: false });
    console.log("ERROR LOGOUT MOBILE", error);
  }
};

const userRead = async (req, res) => {
  const id = await req.user;
  try {
    if (!id) return res.json({ success: false });
    const user = await users.findOne({
      where: {
        id: id,
      },
    });

    if (!user) return res.json({ success: false });
    res.json({ success: true, name: user.name, email: user.email });
  } catch (error) {
    res.json({ success: false });
    console.log("ERROR LOGIN READ", error);
  }
};

const userLoginWeb = async (req, res) => {
  try {
    const { email, password } = await req.body;
    const cookie = req.cookies;

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
      return res.json({
        success: false,
        error: "Connexion Invalide",
      });
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
    res.json({ success: false, error: "Problème de serveur" });
    console.log("ERROR LOGIN WEB", error);
  }
};

const userLogoutWeb = async (req, res) => {
  const cookie = req.cookies;
  try {
    if (!cookie?.jwt_ea_suivi) return res.json({ success: false });
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
      return res.json({ success: false });
    }
    user.refreshToken = "";
    await user.save();
    res.clearCookie("jwt_ea_suivi", {
      httpOnly: true,
      sameSite: "None",
      secure: true,
    });
    res.json({ success: true });
  } catch (error) {
    res.json({ success: false });
    console.log("ERROR LOGOUT WEB", error);
  }
};

const getAllUsers = async (req, res) => {
  try {
    const allUsers = await users.findAll({
      where: {
        role: process.env.PRIME2,
        email: {
          [Op.not]: null,
        },
      },
    });

    if (!allUsers) return res.json({ success: false });
    const finalUsers = allUsers.map((item) => {
      let value = item.dataValues;
      if (value.refreshToken) {
        return {
          id: value.id,
          name: value.name,
          email: value.email,
          phone: value.phone,
          createdAt: value.createdAt,
          connected: true,
        };
      } else {
        return {
          id: value.id,
          name: value.name,
          email: value.email,
          phone: value.phone,
          createdAt: value.createdAt,
          connected: false,
        };
      }
    });
    res.json({ success: true, users: finalUsers });
  } catch (error) {
    res.json({ success: false });
    console.log("ERROR GETALLUSERS", error);
  }
};

const addUser = async (req, res) => {
  const { password, phone, email, name } = await req.body;
  try {
    if (!password || !phone || !email || !name)
      return res.json({ success: false });
    const cryptPassword = await bcrypt.hash(password, 10);
    const createdUser = await users.create({
      name: name,
      email: email,
      password: cryptPassword,
      phone: phone,
      role: process.env.PRIME2,
    });

    if (!createdUser) return res.json({ success: false });
    await getAllUsers(req, res);
  } catch (error) {
    res.json({ success: false });
    console.log("ERROR ADDUSER", error);
  }
};

const updateUser = async (req, res) => {
  const { name, email, password, phone, id } = await req.body;
  try {
    if (!name || !email || !phone || !id) return res.json({ success: false });
    const updatedUser = await users.findOne({
      where: {
        id: id,
      },
    });

    if (!updatedUser) return res.json({ success: false });
    updatedUser.set({ name: name, phone: phone, email: email });

    if (password) {
      const newPassword = await bcrypt.hash(password, 10);
      updatedUser.password = newPassword;
    }
    const result = await updatedUser.save();

    if (!result) return res.json({ success: false });
    await getAllUsers(req, res);
  } catch (error) {
    res.json({ success: false });
    console.log("ERROR UPDATEUSER", error);
  }
};

const deleteUser = async (req, res) => {
  try {
    const id = await req.params.id;

    if (!id) return res.json({ success: false });
    const deletedUser = await users.findOne({
      where: {
        id: id,
      },
    });

    if (!deletedUser) return res.json({ success: false });
    deletedUser.set({
      email: null,
      password: null,
      refreshToken: null,
      phone: null,
      createdAt: null,
      updatedAt: null,
      role: null
    });
    const result = await deletedUser.save();

    if (!result) return res.json({ success: false });
    await getAllUsers(req, res);
  } catch (error) {
    res.json({ success: false });
    console.log("ERROR DELETEUSER", error);
  }
};

module.exports = {
  login,
  logout,
  userRead,
  userLoginWeb,
  userLogoutWeb,
  getAllUsers,
  addUser,
  updateUser,
  deleteUser,
};
