module.exports = (sequelize, DataTypes) => {
  const products = sequelize.define("products", {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    location: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    devis: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    dimension: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    detail: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });

  products.associate = (models) => {
    products.belongsTo(models.productTypes, {
      onDelete: "CASCADE",
      foreignKey: "productTypeId",
    });
  };

  return products;
};