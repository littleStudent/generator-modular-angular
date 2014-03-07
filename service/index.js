'use strict';
var util = require('util');
var yeoman = require('yeoman-generator');
var path = require('path');
var cgUtils = require('../utils.js');
var chalk = require('chalk');
var _ = require('underscore');
var fs = require('fs');

_.str = require('underscore.string');
_.mixin(_.str.exports());

var ServiceGenerator = module.exports = function ServiceGenerator(args, options, config) {

	yeoman.generators.Base.apply(this, arguments);

	try {
		this.appname = require(path.join(process.cwd(), 'package.json')).name;
	} catch (e) {
		this.appname = 'Cant find name from package.json';
	}

};

util.inherits(ServiceGenerator, yeoman.generators.Base);

ServiceGenerator.prototype.askFor = function askFor() {
    var cb = this.async();
    var defaultDir = this.config.get('partialDirectory');
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
			name:'service',
			message:'How shall i call this service?',
			default: ''
		},
		{
			name:'dir',
			message:'Where would you like to create the directive?',
			default: function(props){
				return defaultDir + props.module + '/' + props.service;
			}
		}
    ];

    this.prompt(prompts, function (props) {
        this.dir = cgUtils.cleanDirectory(props.dir);
		this.module = props.module;
		this.service = props.service;

        cb();
    }.bind(this));
};

ServiceGenerator.prototype.files = function files() {

	this.moduleName = this.appname + '.' + this.module;
	this.newModule = "";

	var that = this;
	var usedModule = false;
	usedModule = checkAvailableModules.call(this, that, usedModule);
	if (!usedModule) {
		this.newModule = ", []";
	}

	injectService.call(this, that);

};


function injectService(that) {
	if (this.service.length > 0) {
		this.serviceWithQuotes = ", '" + this.service + "'";
		this.serviceWithoutQuotes = ", " + this.service;
	}
	if (this.service.length > 0) {
		this.template('service.js', this.dir + 'service.' + this.service + "." + this.module+ '.js');
		cgUtils.doInjection(this.dir + this.service + "." + this.module + '.js', that.log, that.config);
	}
}

function checkAvailableModules(that, usedModule) {
	try {
		_.chain(fs.readdirSync(this.config.get('partialDirectory') + this.context))
			.filter(function (template) {
				return template[0] !== '.';
			})
			.each(function (template) {

				var foundPurpose = template;
				var stat = fs.statSync(that.config.get('partialDirectory') + that.context + '/' + template);
				if (stat && stat.isDirectory()) {
					console.log(template);
					_.chain(fs.readdirSync(that.config.get('partialDirectory') + that.context + '/' + template))
						.filter(function (template) {
							return template[0] !== 'controller.';
						})
						.each(function (template) {
							console.log(template);
							var fileData = fs.readFileSync(that.config.get('partialDirectory') + that.context + '/' + foundPurpose + "/" + template, 'utf8');
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