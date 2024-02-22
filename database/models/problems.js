module.exports = (sequelize, DataTypes) => {
  const problems = sequelize.define("problems", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });

  problems.associate = (models) => {
    problems.belongsTo(models.productTypes, { foreignKey: "productTypeId" });
    problems.hasMany(models.suivis, { foreignKey: "problemId" });
  };

  return problems;
};
