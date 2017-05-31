var url = require('url');
var models = require('../database/models');
var pythonShell = require('python-shell');
var pathScriptFit = 'lib\\etrFit.py';
var pathScriptPredict = 'lib\\etrPredict.py';
//var pathScriptFit = 'lib//etrFit.py';
//var pathScriptPredict = 'lib//etrPredict.py';
var Promise = require("bluebird");
var bcrypt = require('bcrypt');
const saltRounds = 10;


//navigation
exports.indexGET = function (req, res) {
    if (req.session.user_id == undefined) {
        res.render('index.ejs', { connected: false });
    }
    else {
        res.redirect('/installations');
    }
};

exports.installationsGET = function (req, res) {
    if (req.session.user_id == undefined) {
        res.redirect('/index');
    }
    else {
        models.location.findAll({
            where: {
                userId: req.session.user_id
            }
        }).then(function (locationListFind) {
            var locationList = [];

            locationListFind.forEach(function (location) {
                locationList.push({
                    id: location.id,
                    formatted_address: location.route + ' ' + location.street_number + ', ' + location.postal_code + ' ' + location.locality + ', ' + location.country
                });
            });

            res.render('installation.ejs', { connected: true, locationList: locationList });
        });
    }
};



//index
exports.sign_upPOST = function (req, res) {
    var email = req.body.email;
    var password = req.body.password;

    models.user.findOne({
        where: {
            email: email
        }
    }).then(function (userFind) {
        if (userFind == null) {
            models.user.create({
                email: email,
                password: bcrypt.hashSync(password, saltRounds)
            }).then(function (userCreate) {
                req.session.user_id = userCreate.get('id');
                res.status(200).send('1');
            }).catch(function (error) {
                res.status(200).send('-2');
            });
        }
        else {
            res.status(200).send('-1');
        }
    }).catch(function (error) {
        res.status(200).send('-3');
    });
};

exports.sign_inPOST = function (req, res) {
    var email = req.body.email;
    var password = req.body.password;

    models.user.findOne({
        where: {
            email: email
        }
    }).then(function (userFind) {
        if (userFind == null) {
            res.status(200).send('-1');
        }
        else {
            if (!bcrypt.compareSync(password, userFind.password)) {
                res.status(200).send('-1');
            }
            else {
                req.session.user_id = userFind.get('id');
                res.status(200).send('1');
            }
        }
    }).catch(function (error) {
        res.status(200).send('-2');
    });
};

exports.logoutGET = function (req, res) {
    req.session.user_id = undefined;
    res.redirect('/index');
}



//installation
exports.add_installationGET = function (req, res) {
    if (req.session.user_id == undefined) {
        res.redirect('/index');
    }
    else {
        models.technology.findAll({
        }).then(function (technologyFind) {
            var currentTechnologies = [];
            technologyFind.forEach(function (technology) {
                currentTechnologies.push({
                    'id': technology.get('id'),
                    'type': technology.get('type')
                });
            });
            res.render('edit_installation.ejs', { connected: true, currentInstallation: null, currentTechnologies: currentTechnologies });
        }).catch(function (error) {
            console.log(error);
            res.redirect('/installations');
        });
    }
}

exports.edit_installationPOST = function (req, res) {
    if (req.session.user_id == undefined) {
        res.redirect('/index');
    }
    else {
        var currentInstallation = {
            location: null,
            installation: null,
            equipmentList: []
        };

        models.location.findOne({
            where: {
                id: req.body.locationId
            }
        }).then(function (locationFind) {
            currentInstallation.location = locationFind;

            models.installation.findOne({
                where: {
                    locationId: locationFind.id
                }
            }).then(function (installationFind) {
                currentInstallation.installation = installationFind;

                models.equipment.findAll({
                    where: {
                        installationId: installationFind.id
                    }
                }).then(function (equipmentListFind) {
                    equipmentListFind.forEach(function (equipment) {
                        currentInstallation.equipmentList.push(equipment);
                    });

                    models.technology.findAll({
                    }).then(function (technologyFind) {
                        var currentTechnologies = [];
                        technologyFind.forEach(function (technology) {
                            currentTechnologies.push({
                                'id': technology.get('id'),
                                'type': technology.get('type')
                            });
                        });
                        res.render('edit_installation.ejs', { connected: true, currentInstallation: currentInstallation, currentTechnologies: currentTechnologies });
                    }).catch(function (error) {
                        console.log(error);
                        res.redirect('/installations');
                    });
                }).catch(function (error) {
                    res.redirect('/installations');
                });
            }).catch(function (error) {
                res.redirect('/installations');
            });
        }).catch(function (error) {
            res.redirect('/installations');
        });
    }
}

exports.delete_installationPOST = function (req, res) {
    if (req.session.user_id == undefined) {
        res.redirect('/index');
    }
    else {
        models.location.destroy({
            where: {
                id: req.body.idLocation
            }
        }).then(function () {
            res.status(200).send('1');
        }).catch(function (error) {
            console.log('Error Destroy Installation ' + req.body.idLocation);
            res.status(200).send('-1');
        });
    }
}

exports.savePOST = function (req, res) {
    var address = req.body.address;
    var installation = req.body.installation;
    var equipmentList = req.body.equipmentList;

    if (req.body.isCreation) {
        models.location.findOne({
            where: {
                google_place_id: address.google_place_id
            }
        }).then(function (locationFind) {
            if (locationFind != null) {
                res.status(200).send('-1');
            }
            else {
                models.location.create({
                    google_place_id: address.google_place_id,
                    lat: address.lat,
                    lng: address.lng,
                    street_number: address.street_number,
                    route: address.route,
                    locality: address.locality,
                    postal_code: address.postal_code,
                    country: address.country,
                    userId: req.session.user_id
                }).then(function (locationCreate) {
                    models.installation.create({
                        production: installation.production,
                        inverter_efficiency: installation.inverter_efficiency,
                        locationId: locationCreate.get('id')
                    }).then(function (installationCreate) {
                        equipmentList.forEach(function (equipment) {
                            models.equipment.create({
                                technologyId: equipment.technologyId,
                                nominal_power: equipment.nominal_power,
                                slope: equipment.slope,
                                azimuth: equipment.azimuth,
                                installationId: installationCreate.get('id')
                            }).catch(function (error) {
                                res.status(200).send('-4');
                            });
                        });
                    }).catch(function (error) {
                        res.status(200).send('-3');
                    });
                }).catch(function (error) {
                    res.status(200).send('-2');
                });

                res.status(200).send('1');
            }
        }).catch(function (error) {
            res.status(200).send('-5');
        });
    }
    else {
        models.location.findOne({
            where: {
                id: address.id
            }
        }).then(function (locationFind) {
            locationFind.google_place_id = address.google_place_id;
            locationFind.lat = address.lat;
            locationFind.lng = address.lng;
            locationFind.street_number = address.street_number;
            locationFind.route = address.route;
            locationFind.locality = address.locality;
            locationFind.postal_code = address.postal_code;
            locationFind.country = address.country;
            locationFind.save().then(function () {
                models.installation.findOne({
                    where: {
                        id: installation.id
                    }
                }).then(function (installationFind) {
                    installationFind.production = installation.production;
                    installationFind.inverter_efficiency = installation.inverter_efficiency;
                    installationFind.save().then(function () {
                        models.equipment.findAll({
                            where: {
                                installationId: installationFind.id
                            }
                        }).then(function (equipmentListFind) {
                            var foundRemove = true;
                            equipmentListFind.forEach(function (equipmentFind) {
                                for (equipment of equipmentList) {
                                    if (equipmentFind.get('id') == equipment.id) {
                                        equipmentFind.technologyId = equipment.technologyId;
                                        equipmentFind.nominal_power = equipment.nominal_power;
                                        equipmentFind.slope = equipment.slope;
                                        equipmentFind.azimuth = equipment.azimuth;
                                        equipmentFind.save().catch(function (error) {
                                            res.status(200).send('-6');
                                        });
                                        foundRemove = false;
                                        break;
                                    }
                                }

                                if (foundRemove) {
                                    equipmentFind.destroy().catch(function (error) {
                                        res.status(200).send('-6');
                                    });
                                }

                                foundRemove = true;
                            });

                            equipmentList.forEach(function (equipment) {
                                if (equipment.id == undefined) {
                                    models.equipment.create({
                                        technologyId: equipment.technologyId,
                                        nominal_power: equipment.nominal_power,
                                        slope: equipment.slope,
                                        azimuth: equipment.azimuth,
                                        installationId: installationFind.id
                                    }).catch(function (error) {
                                        res.status(200).send('-6');
                                    });
                                }
                            });
                        }).catch(function (error) {
                            res.status(200).send('-6');
                        });
                    }).catch(function (error) {
                        res.status(200).send('-6');
                    });
                }).catch(function (error) {
                    res.status(200).send('-6');
                });
            }).catch(function (error) {
                res.status(200).send('-6');
            });

            res.status(200).send('1');

        }).catch(function (error) {
            res.status(200).send('-6');
        });
    }
}



//Compare
exports.comparePOST = function (req, res) {
    if (req.session.user_id == undefined) {
        res.redirect('/index');
    }
    else {
        var currentInstallation = {
            location: null,
            installation: null,
            equipmentList: []
        };
        var X = [];
        var Y = [];
        var inverter_efficiency_average = 0;
        var slope_average = 0;
        var azimuth_average = 0;
        var nominal_power_average = 0;

        models.location.all().then(function (locationListFind) {
            var allData = Promise.map(locationListFind, function (locationFind) {
                if (locationFind.get('id') == req.body.locationId) {
                    currentInstallation.location = locationFind;
                }
                return models.installation.findOne({
                    where: {
                        locationId: locationFind.id
                    }
                }).then(function (installationFind) {
                    if (currentInstallation.location != null && installationFind.locationId == currentInstallation.location.get('id')) {
                        currentInstallation.installation = installationFind;
                    }
                    return models.equipment.findOne({
                        where: {
                            installationId: installationFind.id
                        }
                    }).then(function (equipmentFind) {
                        if (currentInstallation.installation != null && equipmentFind.installationId == currentInstallation.installation.get('id')) {
                            currentInstallation.equipmentList.push(equipmentFind);
                        }
                        else {
                            inverter_efficiency_average += installationFind.get('inverter_efficiency');
                            slope_average += equipmentFind.get('slope');
                            azimuth_average += equipmentFind.get('azimuth');
                            nominal_power_average += equipmentFind.get('nominal_power');

                            var add = [
                                Number(locationFind.get('lat')),
                                Number(locationFind.get('lng')),
                                installationFind.get('inverter_efficiency'),
                                equipmentFind.get('technologyId'),
                                equipmentFind.get('nominal_power'),
                                equipmentFind.get('slope'),
                                equipmentFind.get('azimuth')
                            ];
                            X.push(add);
                            Y.push(installationFind.get('production'));
                        }
                    });
                });
            });

            Promise.all(allData).then(function () {
                var nbElements = Y.length; //X or Y is the same
                if (nbElements != 0) {
                    var averages = [];
                    var jsonX = JSON.stringify(X);
                    var jsonY = JSON.stringify(Y);                    
                    console.log('X: ' + jsonX);
                    console.log('Y: ' + jsonY);

                    inverter_efficiency_average = inverter_efficiency_average / nbElements;
                    slope_average = slope_average / nbElements;
                    azimuth_average = azimuth_average / nbElements;
                    nominal_power_average = nominal_power_average / nbElements;
                    averages.push(inverter_efficiency_average.toFixed(3));
                    averages.push(slope_average.toFixed(3));
                    averages.push(azimuth_average.toFixed(3));
                    averages.push(nominal_power_average.toFixed(3));

                    var optionsFit = {
                        args: [jsonX, jsonY]
                    };

                    pythonShell.run(pathScriptFit, optionsFit, function (err) {
                        if (err) {
                            console.log(err);
                            res.redirect('/installations');
                        }
                        else {
                            var dataPredict = [];
                            dataPredict.push([
                                Number(currentInstallation.location.get('lat')),
                                Number(currentInstallation.location.get('lng')),
                                currentInstallation.installation.get('inverter_efficiency'),
                                currentInstallation.equipmentList[0].get('technologyId'),
                                currentInstallation.equipmentList[0].get('nominal_power'),
                                currentInstallation.equipmentList[0].get('slope'),
                                currentInstallation.equipmentList[0].get('azimuth')
                            ]);
                            var jsonDataPredict = JSON.stringify(dataPredict);
                            console.log('predict: ' + jsonDataPredict);

                            var optionsPredict = {
                                args: [jsonDataPredict]
                            };

                            pythonShell.run(pathScriptPredict, optionsPredict, function (err, resultPredict) {
                                if (err) {
                                    console.log(err);
                                    res.redirect('/installations');
                                }
                                else {
                                    models.technology.findAll({
                                    }).then(function (technologyFind) {
                                        var currentTechnologies = [];
                                        technologyFind.forEach(function (technology) {
                                            if (technology.id == currentInstallation.equipmentList[0].technologyId) {
                                                currentInstallation.equipmentList[0].technologyId = technology.type;
                                            }
                                        });
                                        var theoricalProduction = Number(resultPredict[0]).toFixed(3);
                                        res.render('compare.ejs', { connected: true, currentInstallation: currentInstallation, theoricalProduction: theoricalProduction, averages: averages });
                                    }).catch(function (error) {
                                        console.log(error);
                                        res.redirect('/installations');
                                    });
                                }
                            });
                        }
                    });
                }
                else {
                    res.redirect('/installations');
                }
            });
        });
    }
}






































exports.get_installationPOST = function (req, res) {
    // var bounds = req.body.bounds;

    // var north_east = {
    //     lat: bounds.north,
    //     lng: bounds.east
    // };

    // var south_west = {
    //     lat: bounds.south,
    //     lng: bounds.west
    // };

    var postal_code = req.body.postal_code;

    var producerList = models.producer.findAll({
        where: {
            postal_code: postal_code
        }
    }).then(function (producerList) {
        res.status(200).send(getCoordinateProducer(producerList));
    });
}

function getCoordinateProducer(producerList) {
    var coordinateProducerList = [];

    producerList.forEach(function (producer) {
        coordinateProducerList.push({
            id: producer.id,
            lng: producer.lng,
            lat: producer.lat
        });
    });

    return coordinateProducerList;
}

exports.calculatePOST = function (req, res) {
    var postal_code = req.body.postal_code;

    var query = new YQL('select * from weather.forecast where (location = 94089)');

    query.exec(function (err, data) {
        var location = data.query.results.channel.location;
        var condition = data.query.results.channel.item.condition;

        console.log('The current weather in ' + location.city + ', ' + location.region + ' is ' + condition.temp + ' degrees.');
    });
}