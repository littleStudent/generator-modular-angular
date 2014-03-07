'use strict';
var util = require('util');
var yeoman = require('yeoman-generator');
var path = require('path');
var fs = require('fs');
var cgUtils = require('../utils.js');
var _ = require('underscore');
var chalk = require('chalk');
var fs = require('fs');

_.str = require('underscore.string');
_.mixin(_.str.exports());

var PartialGenerator = module.exports = function PartialGenerator(args, options, config) {

    yeoman.generators.Base.apply(this, arguments);

    try {
        this.appname = require(path.join(process.cwd(), 'package.json')).name;
    } catch (e) {
        this.appname = 'Cant find name from package.json';
    }

};

util.inherits(PartialGenerator, yeoman.generators.Base);

PartialGenerator.prototype.askFor = function askFor() {
    var cb = this.async();
	var context = this.context;
    var defaultDir = this.config.get('featureDirectory');
   	console.log(defaultDir);
	var  purposeNames = [];
	var  serviceNames = [];
	var  routeNames = [];

    if (!_(defaultDir).endsWith('/')) {
        defaultDir += '/';
    }

    var prompts = [
		{
			name:'context',
			message:'Which context would you like me to use?',
			default: ''
		},
		{
			name:'purpose',
			message:'How shall i call this feature?',
			default: ''
		},
		{
			type:'confirm',
			name: 'createService',
			message: 'Shall i create a service for you?',
			default: true
		},
		{
			when: function(props) {
				purposeNames.push(props.purpose + "Service");
				return props.createService;
			},
			name:'service',
			message:'Name your service.',
			default: purposeNames
		},
		{
			type:'confirm',
			name: 'createData',
			message: 'Shall i create a data model for you?',
			default: true
		},
		{
			when: function(props) {
				serviceNames.push(props.purpose + "Data");
				return props.createData;
			},
			name:'data',
			message:'Name your data model.',
			default: serviceNames
		},
		{
			when: function(props) {
				routeNames.push(props.context + props.purpose.capitalize());
				return true;
			},
			name:'route',
			message:'Name your route state.',
			default: routeNames
		}
    ];

    this.prompt(prompts, function (props) {
        this.dir = defaultDir + props.context + '/' + props.purpose + '/';
		this.purpose = props.purpose;
		this.context = props.context;
		this.route = props.route;
		this.data = props.data;
		this.service = props.service;
        cb();
    }.bind(this));
};



PartialGenerator.prototype.files = function files() {

	this.ctrlname = _.camelize(_.classify(this.context + this.purpose)) + 'Controller';
	this.moduleName = this.appname + '.' + this.context;
	this.dataWithQuotes = "";
	this.dataWithoutQuotes = "";
	this.serviceWithQuotes = "";
	this.serviceWithoutQuotes = "";
	this.newModule = "";


	var that = this;
	var usedModule = false;
	usedModule = checkAvailableModules.call(this, that, usedModule);
	if (!usedModule) {
		this.newModule = ", []";
	}


	injectTemplates.call(this, that);

	injectRoute.call(this, that);

	injectData.call(this, that);

	injectService.call(this, that);

	cgUtils.injectModule(this.appname + '.' + that.context,that.log,that.config);
};



function injectRoute(that) {
	if (this.route.length > 0) {
		var x = {};
		x.url = "/" + that.route;
		x.templateUrl = this.dir + "view.html";
		x.controller = this.ctrlname;
		cgUtils.injectRoute(("" + that.route).replace('/', '.'), x, that.log, that.config);
	}
}

function injectData(that) {
	if (this.data.length > 0) {
		this.dataWithQuotes = ", '" + this.data + "'";
		this.dataWithoutQuotes = ", " + this.data;
	}
	if (this.data.length > 0) {
		this.template('data.js', this.dir + this.data + '.js');
		cgUtils.doInjection(this.dir + this.data + '.js', that.log, that.config);
	}
}

function injectService(that) {
	if (this.service.length > 0) {
		this.serviceWithQuotes = ", '" + this.service + "'";
		this.serviceWithoutQuotes = ", " + this.service;
	}
	if (this.service.length > 0) {
		this.template('service.js', this.dir + this.service + '.js');
		cgUtils.doInjection(this.dir + this.service + '.js', that.log, that.config);
	}
}

function injectTemplates(that) {
	var templateDirectory = path.join(path.dirname(this.resolved), 'templates');
	if (this.config.get('partialTemplates')) {
		templateDirectory = path.join(process.cwd(), this.config.get('partialTemplates'));
	}

	_.chain(fs.readdirSync(templateDirectory))
		.filter(function (template) {
			return template[0] !== '.';
		})
		.each(function (template) {

			if (template === 'partial-spec.js') {
				that.name = "spec"
			}
			if (template === 'partial.html') {
				that.name = "view"
			}
			if (template === 'partial.js') {
				that.name = "controller"
			}
			if (template === 'partial.less') {
				that.name = "style"
			}
			if (template === 'data.js' || template === 'service.js') {
				return;
			}

			var customTemplateName = template.replace('partial', that.name);
			var templateFile = path.join(templateDirectory, template);
			console.log(customTemplateName);
			//create the file
			that.template(templateFile, that.dir + customTemplateName);
			//inject the file reference into index.html/app.less/etc as appropriate
			cgUtils.doInjection(that.dir + customTemplateName, that.log, that.config);
		});
}

function checkAvailableModules(that, usedModule) {
	try {
		_.chain(fs.readdirSync(this.config.get('featureDirectory') + this.context))
			.filter(function (template) {
				return template[0] !== '.';
			})
			.each(function (template) {

				var foundPurpose = template;
				var stat = fs.statSync(that.config.get('featureDirectory') + that.context + '/' + template);
				if (stat && stat.isDirectory()) {
					console.log(template);
					_.chain(fs.readdirSync(that.config.get('featureDirectory') + that.context + '/' + template))
						.filter(function (template) {
							return template[0] !== 'controller.';
						})
						.each(function (template) {
							console.log(template);
							var fileData = fs.readFileSync(that.config.get('featureDirectory') + that.context + '/' + foundPurpose + "/" + template, 'utf8');
							if (fileData.indexOf("'" + that.moduleName + "'") > -1) {
								usedModule = true;
							}
						});
				}

			});
	} catch (e) {
		console.log(e);
	}
	return usedModule;
}


String.prototype.capitalize = function() {
	return this.charAt(0).toUpperCase() + this.slice(1);
}