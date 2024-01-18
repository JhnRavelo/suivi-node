module.exports = (sequelize, DataTypes) => {
    const suivis = sequelize.define("suivis", {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      observation: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      problem: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      solution: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
    });
  
    suivis.associate = (models) => {
      suivis.belongsTo(models.products, {
        onDelete: "CASCADE",
        foreignKey: "productId",
      });
      suivis.belongsTo(models.users, {
        foreignKey: "userId",
      });
    };
  
    return suivis;
  };