'use strict';
module.exports = function (sequelize, DataTypes) {
  var equipment = sequelize.define('equipment', {
    nominal_power: DataTypes.FLOAT,
    slope: DataTypes.FLOAT,
    azimuth: DataTypes.FLOAT
  }, {
      classMethods: {
        associate: function (models) {
          models.equipment.belongsTo(models.technology);
        }
      }
    });
  return equipment;
};