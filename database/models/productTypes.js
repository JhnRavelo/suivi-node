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
    pdf: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  });

  productTypes.associate = (models) => {
    productTypes.hasMany(models.products, {
      foreignKey: "productTypeId",
    });
    productTypes.hasMany(models.problems, {
      foreignKey: "productTypeId"
    })
  };

  return productTypes;
};
