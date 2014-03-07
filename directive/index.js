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

var DirectiveGenerator = module.exports = function DirectiveGenerator(args, options, config) {

    yeoman.generators.Base.apply(this, arguments);

    try {
        this.appname = require(path.join(process.cwd(), 'package.json')).name;
    } catch (e) {
        this.appname = 'Cant find name from package.json';
    }

};

util.inherits(DirectiveGenerator, yeoman.generators.NamedBase);

DirectiveGenerator.prototype.askFor = function askFor() {
    var cb = this.async();
    var defaultDir = this.config.get('featureDirectory');
    if (!_(defaultDir).endsWith('/')) {
        defaultDir += '/';
    }

    var prompts = [
		{
			name:'context',
			message:'Which context do you want me to use?',
			default: ''
		}, {
			name:'purpose',
			message:'How shall i call this directive?',
			default: ''
		}, {
			type:'confirm',
			name: 'needHTML',
			message: 'Shall i create a HTML file for you?',
			default: true
   		 }, {
			name:'dir',
			message:'Where would you like to create the directive?',
			default: function(props){
				return defaultDir + props.context + '/' + props.purpose + '/directive';
        }
    }];

    this.prompt(prompts, function (props) {
        this.needHTML = props.needHTML;
        this.dir = cgUtils.cleanDirectory(props.dir);
		this.purpose = props.purpose;
		this.context = props.context;
		this.newModule = props.newModule;
        cb();
    }.bind(this));

};


DirectiveGenerator.prototype.files = function files() {

	this.newModule = "";
	this.directiveModule = this.appname + '.' + this.context;
	this.name = _.camelize(this.context + this.purpose);
	this.moduleName = this.appname + '.' + this.context;

	var that = this;
	var usedModule = false;

	usedModule = checkAvailableModule.call(this, that, usedModule);

	if (!usedModule) {
		this.newModule = ", []";
	}


	injectTemplates.call(this, that);
};


function injectTemplates(that) {
	var templateDirectory = path.join(path.dirname(this.resolved), 'templates', 'simple');
	if (this.config.get('directiveSimpleTemplates')) {
		templateDirectory = path.join(process.cwd(), this.config.get('directiveSimpleTemplates'));
	}

	if (this.needHTML) {
		templateDirectory = path.join(path.dirname(this.resolved), 'templates', 'complex');
		if (this.config.get('directiveComplexTemplates')) {
			templateDirectory = path.join(process.cwd(), this.config.get('directiveComplexTemplates'));
		}
	}

	_.chain(fs.readdirSync(templateDirectory))
		.filter(function (template) {
			return template[0] !== '.';
		})
		.each(function (template) {
			var customTemplateName = template.replace('directive', 'directive.' + that.context + '.' + that.purpose);
			var templateFile = path.join(templateDirectory, template);
			//create the file
			that.template(templateFile, that.dir + customTemplateName);
			//inject the file reference into index.html/app.less/etc as appropriate
			cgUtils.doInjection(that.dir + customTemplateName, that.log, that.config);
		});
}


function checkAvailableModule(that, usedModule) {
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