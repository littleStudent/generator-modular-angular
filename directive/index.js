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
        this.appPrefix = require(path.join(process.cwd(), 'package.json')).appPrefix;
    } catch (e) {
        this.appPrefix = 'Cant find name from package.json';
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
			name:'module',
			message:'Which module do you want me to use?',
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
				return defaultDir + props.module.replace('.', '/') + '/directive';

        }
    }];

    this.prompt(prompts, function (props) {
        this.needHTML = props.needHTML;
        this.dir = cgUtils.cleanDirectory(props.dir);
		this.purpose = props.purpose;
		this.module = props.module;
        cb();
    }.bind(this));

};


DirectiveGenerator.prototype.files = function files() {

	this.newModule = "";
	this.directiveModule = this.appPrefix + '.' + this.module;
	this.directiveName = _.camelize(this.purpose);

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

			if (template === 'directive.js') {
				that.name = "directive"
			}
			if (template === 'directive.html') {
				that.name = "view"
			}
			if (template === 'directive.less') {
				that.name = "style"
			}

			var customTemplateName = template.replace('directive', that.name);
			var templateFile = path.join(templateDirectory, template);
			//create the file
			that.template(templateFile, that.dir + customTemplateName);
			//inject the file reference into index.html/app.less/etc as appropriate
			cgUtils.doInjection(that.dir + customTemplateName, that.log, that.config);
		});
}


function checkAvailableModule(that, usedModule) {
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
							if (fileData.indexOf("'" + that.directiveModule + "'") > -1) {
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