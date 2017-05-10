'use strict';
module.exports = function (sequelize, DataTypes) {
  var technology = sequelize.define('technology', {
    type: DataTypes.STRING
  }, {
      classMethods: {
        associate: function (models) {
        }
      }
    });
  return technology;
};