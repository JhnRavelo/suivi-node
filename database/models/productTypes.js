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
      allowNull: false,
    },
  });

  productTypes.associate = (models) => {
    productTypes.hasMany(models.products, {
      onDelete: "CASCADE",
      foreignKey: "productTypeId",
    });
  };

  return productTypes;
};
