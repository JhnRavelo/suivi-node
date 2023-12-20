module.exports = (sequelize, DataTypes) => {
  const productType = sequelize.define("productType", {
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

  return productType
};
