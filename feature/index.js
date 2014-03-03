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
			message:'Which module would you like to use?',
			default: ''
		},
		{
			name:'purpose',
			message:'How would you call this feature?',
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
        cb();
    }.bind(this));
};

PartialGenerator.prototype.files = function files() {

    this.ctrlname = _.camelize(_.classify(this.module + this.purpose)) + 'Controller';
	this.moduleName = this.appname + '.' + this.module;
	this.newModule = ",[]";



    var templateDirectory = path.join(path.dirname(this.resolved),'templates');
    if(this.config.get('partialTemplates')){
        templateDirectory = path.join(process.cwd(),this.config.get('partialTemplates'));
    }

	var controllerFile = "";
    var that = this;
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
	cgUtils.injectModule(this.appname + '.' + that.module,that.log,that.config);
};
