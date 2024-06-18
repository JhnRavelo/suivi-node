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
      allowNull: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    phone: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    role: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: process.env.PRIME2,
    },
    refreshToken: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    avatar: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  });

  users.prototype.generateToken = (id, role) => {
    const accesToken = jwt.sign(
      {
        id,
        role,
      },
      process.env.ACCESS_TOKEN,
      {
        expiresIn: "3600s",
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
  users.associate = (models) => {
    users.hasMany(models.suivis, {
      foreignKey: "userId",
    });
    users.hasMany(models.products, {
      foreignKey: "userProductId",
    });
  };

  return users;
};
