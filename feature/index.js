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
    var name = this.name;
	var module = this.module;
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
			name:'purpose',
			message:'How shall i call this feature?',
			default: ''
		},
		{
			name:'service',
			message:'Name your service. (empty for no service)',
			default: ''
		},
		{
			name:'data',
			message:'Name your data model. (empty for no model)',
			default: ''
		},
		{
			name:'route',
			message:'Name your route state. (empty for no route)',
			default: ''
		}
    ];

    this.prompt(prompts, function (props) {
        this.dir = defaultDir + props.module + '/' + props.purpose + '/';
		this.purpose = props.purpose;
		this.module = props.module;
		this.route = props.route;
		this.data = props.data;
		this.service = props.service;
        cb();
    }.bind(this));
};

PartialGenerator.prototype.files = function files() {

    this.ctrlname = _.camelize(_.classify(this.module + this.purpose)) + 'Controller';
	this.moduleName = this.appname + '.' + this.module;
	this.dataWithQuotes = "";
	this.dataWithoutQuotes = "";
	this.newModule = "";

	var that = this;

	console.log(this.config.get('partialDirectory') + this.module);

	var usedModule = false;

	try {
		_.chain(fs.readdirSync(this.config.get('partialDirectory') + this.module))
			.filter(function(template){
				return template[0] !== '.';
			})
			.each(function(template){

				var foundPurpose = template;
				var stat = fs.statSync(that.config.get('partialDirectory') + that.module + '/' + template);
				if (stat && stat.isDirectory()) {
					console.log(template);
					_.chain(fs.readdirSync(that.config.get('partialDirectory') + that.module + '/' + template))
						.filter(function(template){
							return template[0] !== 'controller.';
						})
						.each(function(template){
							console.log(template);
							var fileData = fs.readFileSync(that.config.get('partialDirectory') + that.module + '/' + foundPurpose + "/" + template, 'utf8');
							if (fileData.indexOf("'" + that.moduleName + "'")  > -1) {
								usedModule = true;
							}
						});
				}

			});
	} catch (e) {
		console.log(e);
	}

	if (!usedModule) {
		this.newModule = ", []";
	}



	if (this.data.length > 0) {
		this.dataWithQuotes = ", '" + this.data + "'";
		this.dataWithoutQuotes = ", " + this.data;
	}


    var templateDirectory = path.join(path.dirname(this.resolved),'templates');
    if(this.config.get('partialTemplates')){
        templateDirectory = path.join(process.cwd(),this.config.get('partialTemplates'));
    }

	var controllerFile = "";
    _.chain(fs.readdirSync(templateDirectory))
        .filter(function(template){
            return template[0] !== '.';
        })
        .each(function(template){

			if (template === 'partial-spec.js') {
				that.name = "spec." + that.module + "." + that.purpose
			}
			if (template === 'partial.html') {
				that.name = "view." + that.module + "." + that.purpose
			}
			if (template === 'partial.js') {
				that.name = "controller." + that.module + "." + that.purpose
			}
			if (template === 'partial.less') {
				that.name = "style." + that.module + "." + that.purpose
			}
			if (template === 'data.js' || template === 'service.js') {
				return;
			}

            var customTemplateName = template.replace('partial',that.name);
            var templateFile = path.join(templateDirectory,template);
			console.log(customTemplateName);
            //create the file
            that.template(templateFile,that.dir + customTemplateName);
            //inject the file reference into index.html/app.less/etc as appropriate
            cgUtils.doInjection(that.dir + customTemplateName,that.log,that.config);
        });
	if (this.route.length > 0) {
		var x = {};
		x.url =  "/" + that.route;
		x.templateUrl = this.dir + "view." + this.module + "." + this.purpose + ".html";
		x.controller = this.ctrlname;
		cgUtils.injectRoute(that.route,x,that.log,that.config);
	}
	if (this.data.length > 0) {
		this.template('data.js', this.dir + 'data.' + this.module + "." + this.purpose + '.js');
	}
	if (this.service.length > 0) {

	}
	cgUtils.injectModule(this.appname + '.' + that.module,that.log,that.config);
};
