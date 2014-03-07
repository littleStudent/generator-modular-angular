'use strict';
var util = require('util');
var path = require('path');
var yeoman = require('yeoman-generator');


var ModularAngularGen = module.exports = function ModularAngularGen(args, options, config) {
	yeoman.generators.Base.apply(this, arguments);

	this.on('end', function () {
		this.config.set('featureDirectory','features/');
		this.config.set('directiveDirectory','directives/');
		this.config.set('filterDirectory','filters/');
		this.config.set('serviceDirectory','services/');
		this.config.save();
		this.installDependencies({ skipInstall: options['skip-install'] });
	});

	this.pkg = JSON.parse(this.readFileAsString(path.join(__dirname, '../package.json')));
};

util.inherits(ModularAngularGen, yeoman.generators.Base);

ModularAngularGen.prototype.askFor = function askFor() {
	var cb = this.async();

	var prompts = [{
			name: 'appname',
			message: 'What would you like the angular app/module name to be?',
			default: path.basename(process.cwd())
		},
		{
			name: 'appPrefix',
			message: 'Which prefix do you want to use?',
			default: ''
		}];

	this.prompt(prompts, function (props) {
		this.appname = props.appname;
		this.appPrefix = props.appPrefix;
		cb();
	}.bind(this));
};



ModularAngularGen.prototype.app = function app() {
	this.directory('skeleton/','./');
	this.template('skeleton/index.html', 'index.html');
	this.template('skeleton/app.js', 'app.js');
	this.template('skeleton/routes.js', 'routes.js');
};