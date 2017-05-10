'use strict';
module.exports = function (sequelize, DataTypes) {
  var location = sequelize.define('location', {
    google_place_id: DataTypes.STRING,
    lat: DataTypes.STRING,
    lng: DataTypes.STRING,
    street_number: DataTypes.STRING,
    route: DataTypes.STRING,
    locality: DataTypes.STRING,
    postal_code: DataTypes.STRING,
    country: DataTypes.STRING
  }, {
      classMethods: {
        associate: function (models) {
          models.location.hasOne(models.installation, {onDelete: 'CASCADE'});
        }
      }
    });
  return location;
};