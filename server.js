var express = require('express');
var session = require('express-session');
var uuid = require('uuid');

var models = require('./database/models');
var Sequelize = require('sequelize'),
sequelize = new Sequelize('stage', 'root', 'root', {
        dialect: "mysql",
        port: 3306,
});

var app = express();
app.set('view engine', 'ejs');
app.set('views', __dirname + '/application/views/');
app.use(express.static('./application/assets/'));
var controller = require('./application/controller.js');
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());
app.use(session({
    secret: 'f5Yhjgf976sd23sdQ',
    resave: true,
    saveUninitialized: true
  }));



//navigation
app.get('/', controller.indexGET);
app.get('/index', controller.indexGET);
app.get('/installations', controller.installationsGET);
app.get('/logout', controller.logoutGET);



//index
app.post('/sign_up', controller.sign_upPOST);
app.post('/sign_in', controller.sign_inPOST);



//installation
app.get('/installation/add', controller.add_installationGET);
app.post('/installation/edit', controller.edit_installationPOST);
app.post('/installation/delete', controller.delete_installationPOST);
app.post('/save', controller.savePOST);



//compare
app.post('/installation/compare', controller.comparePOST);



app.use(function(req, res, next) {
    res.status(404).send('Not found');
});

models.sequelize.sync().then(function() {
    app.listen(80);
});
