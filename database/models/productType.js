module.exports = (sequelize, DataTypes) => {
  const productTypes = sequelize.define("productTypes", {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    }
  });

  return productTypes
};
