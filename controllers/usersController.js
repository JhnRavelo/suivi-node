const { Op } = require("sequelize");
const { users } = require("../database/models");
const bcrypt = require("bcrypt");

const login = async (req, res) => {
  const { email, password } = await req.body;

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
};

const logout = async(req, res)=>{
  const {refreshToken} = await req.body

  if(!refreshToken) return res.json({success: false})

  const userLogout = await users.findOne({
    where: {
      refreshToken: refreshToken
    }
  })

  if(!userLogout) return res.json({success: false})

  userLogout.refreshToken = ""
  await userLogout.save()

  res.json({success: true})

}

const userRead = async(req, res)=>{
const id = await req.user

if(!id) return res.json({success: false})

const user = await users.findOne({where: {
  id: id
}})

if(!user) return res.json({success: false})

res.json({success: true, name: user.name, email: user.email})
}

module.exports = { login, logout, userRead };
