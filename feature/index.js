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
        this.appPrefix = require(path.join(process.cwd(), 'package.json')).appPrefix;
    } catch (e) {
        this.appPrefix = 'Cant find name from package.json';
    }

};

util.inherits(PartialGenerator, yeoman.generators.Base);

PartialGenerator.prototype.askFor = function askFor() {
    var cb = this.async();
    var defaultDir = this.config.get('featureDirectory');
   	console.log(defaultDir);
	var  moduleNames = [];
	var  purposeNames = [];
	var  serviceNames = [];
	var  routeNames = [];

    if (!_(defaultDir).endsWith('/')) {
        defaultDir += '/';
    }

    var prompts = [
		{
			name:'module',
			message:'Which module would you like me to use?',
			default: ''
		},
		{
			when: function(props) {
				moduleNames.push(props.module.replace(".", ""));
				return true;
			},
			name:'purpose',
			message:'How shall i call this feature?',
			default: moduleNames
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
				routeNames.push(props.purpose);
				return true;
			},
			name:'route',
			message:'Name your route state.',
			default: routeNames
		}
    ];

    this.prompt(prompts, function (props) {
        this.dir = defaultDir + props.module.replace('.', '/') + "/";
		this.purpose = props.purpose;
		this.module = props.module;
		this.route = props.route;
		if (props.data) {
			this.data = props.data[0];
		}
		if (props.service) {
			this.service = props.service[0];
		}

        cb();
    }.bind(this));
};



PartialGenerator.prototype.files = function files() {

	this.ctrlname = _.camelize(_.classify(this.module.replace(".", ""))) + 'Controller';
	this.moduleName = this.appPrefix + '.' + this.module;
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

	if (this.data.length) {
		this.dataWithQuotes = ", '" + this.data + "'";
		this.dataWithoutQuotes = ", " + this.data;
	}

	if (this.service) {
		this.serviceWithQuotes = ", '" + this.service + "'";
		this.serviceWithoutQuotes = ", " + this.service;
	}

	injectTemplates.call(this, that);

	injectRoute.call(this, that);

	injectData.call(this, that);

	injectService.call(this, that);

	cgUtils.injectModule(this.appPrefix + '.' + that.module,that.log,that.config);

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
	if (this.data.length) {
		this.template('data.js', this.dir + this.data + '.js');
		cgUtils.doInjection(this.dir + this.data + '.js', that.log, that.config);
	}
}

function injectService(that) {
	if (this.service) {
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
			//create the file
			that.template(templateFile, that.dir + customTemplateName);
			//inject the file reference into index.html/app.less/etc as appropriate
			cgUtils.doInjection(that.dir + customTemplateName, that.log, that.config);
		});
}

function checkAvailableModules(that, usedModule) {
	try {
		_.chain(fs.readdirSync(this.config.get('featureDirectory') + that.module.replace('.', '/')))
			.filter(function (template) {
				return template[0] !== '.';
			})
			.each(function (template) {

				var foundPurpose = template;
				var stat = fs.statSync(that.config.get('featureDirectory') + that.module.replace('.', '/') + '/' + template);
				if (stat && stat.isDirectory()) {
					_.chain(fs.readdirSync(that.config.get('featureDirectory') + that.module.replace('.', '/') + '/' + template))
						.filter(function (template) {
							return template[0] !== 'controller.';
						})
						.each(function (template) {
							var fileData = fs.readFileSync(that.config.get('featureDirectory') + that.module.replace('.', '/') + '/' + foundPurpose + "/" + template, 'utf8');
							if (fileData.indexOf("'" + that.moduleName + "'") > -1) {
								usedModule = true;
							}
						});
				}

			});
	} catch (e) {
//		console.log(e);
	}
	return usedModule;
}


String.prototype.capitalize = function() {
	return this.charAt(0).toUpperCase() + this.slice(1);
}