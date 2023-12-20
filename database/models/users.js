const jwt = require("jsonwebtoken");
require("dotenv").config();

module.exports = (sequelize, DataTypes) => {
  const users = sequelize.define("users", {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    refreshToken: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  });

  users.prototype.generateToken = (id, role) => {
    const accesToken = jwt.sign(
      {
        id,
        role,
      },
      process.env.ACCESS_TOKEN,
      {
        expiresIn: "10m",
      }
    );

    return accesToken;
  };
  users.prototype.generateRefreshToken = (id) => {
    const refreshToken = jwt.sign(
      {
        id,
      },
      process.env.REFRESH_TOKEN,
      {
        expiresIn: "1d",
      }
    );

    return refreshToken;
  };

  return users;
};
