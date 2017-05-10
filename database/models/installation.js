'use strict';
module.exports = function (sequelize, DataTypes) {
  var installation = sequelize.define('installation', {
    production: DataTypes.FLOAT,
    inverter_efficiency: DataTypes.FLOAT
  }, {
      classMethods: {
        associate: function (models) {
          models.installation.hasMany(models.equipment, {onDelete: 'CASCADE'});
        }
      }
    });
  return installation;
};