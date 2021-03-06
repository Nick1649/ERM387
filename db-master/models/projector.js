"use strict";

module.exports = function(sequelize, DataTypes) {
  var Projector = sequelize.define("Projector", {
    itemId: {type: DataTypes.INTEGER(), allowNull: false, autoIncrement: true, primaryKey: true},
    resourceId : {type: DataTypes.INTEGER(), allowNull: false, unique: true}
  },{
    tableName: 'Projector',
    classMethods: {
      associate: function(models) {
        Projector.belongsTo(models.Resource, {foreignKey: 'resourceId', onDelete: "CASCADE", onUpdate: "CASCADE"});
      }
    }
  });

  return Projector;
};
