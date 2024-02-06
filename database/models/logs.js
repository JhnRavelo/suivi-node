module.exports = (sequelize, DataTypes) => {
  const logs = sequelize.define("logs", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    unRead: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  });

  logs.associate = (models) => {
    logs.belongsTo(models.suivis, {
      onDelete: "CASCADE",
      foreignKey: "suiviId",
    });
  };

  return logs;
};
