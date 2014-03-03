var path = require('path');
var fs = require('fs');
var _ = require('underscore');
var chalk = require('chalk');

_.str = require('underscore.string');
_.mixin(_.str.exports());

exports.addToFile = function(filename,lineToAdd,beforeMarker,spacing){
	try {
		var fullPath = path.join(process.cwd(),filename);
		var fileSrc = fs.readFileSync(fullPath,'utf8');

		var indexOf = fileSrc.indexOf(beforeMarker);
		fileSrc = fileSrc.substring(0,indexOf) + lineToAdd + "\n" + spacing + fileSrc.substring(indexOf);

		fs.writeFileSync(fullPath,fileSrc);

	} catch(e) {
		throw e;
	}
};

exports.JS_MARKER = "<!-- Add New Component JS Above -->";
exports.JS_MODULES_MARKER = "//Add New Modules Above";
exports.JS_ROUTES_MARKER = "//Add New State in Router Above";
exports.LESS_MARKER = "/* Add Component LESS Above */";

exports.ROUTE_MARKER = "/* Add New Routes Above */";
exports.STATE_MARKER = "/* Add New States Above */";


exports.cleanDirectory = function(directoryName) {

	if (_(directoryName).startsWith('/') || _(directoryName).startsWith('\\')) {
		directoryName = directoryName.substring(1);
	}

	if (_(directoryName).endsWith('/') || _(directoryName).endsWith('\\')) {
		directoryName = directoryName.substring(0,directoryName.length - 1);
	}

	return directoryName + '/';
};


exports.injectRoute = function(routeName,route,logger,config) {
	if (config.get('injector')) {
		var overridenInjector = require(path.join(process.cwd(),config.get('injector')));
		if (overridenInjector(filename,logger)) {
			return;
		}
	}

	exports.addToFile('routes.js',
		".state('" + routeName + "', {\n" +
			"				url: " + "'" + route.url + "',\n" +
			"				templateUrl: " + "'" + route.templateUrl + "',\n" +
			"				controller: " + "'" + route.controller + "',\n" +
			"			})\n"
		,exports.JS_ROUTES_MARKER
		,'			');

};


exports.injectModule = function(moduleName,logger,config) {
	if (config.get('injector')) {
		var overridenInjector = require(path.join(process.cwd(),config.get('injector')));
		if (overridenInjector(filename,logger)) {
			return;
		}
	}

	fs.readFile('app.js', 'utf8', function (err,data) {
		if (err) {
			return console.log(err);
		}
		if (data.indexOf("'" + moduleName + "',")  < 0) {
			exports.addToFile('app.js',"'" + moduleName + "',",exports.JS_MODULES_MARKER,'    ');
		}
	});
};

exports.doInjection = function(filename,logger,config) {
	if (config.get('injector')) {
		var overridenInjector = require(path.join(process.cwd(),config.get('injector')));
		if (overridenInjector(filename,logger)) {
			return;
		}
	}
	exports.defaultInjector(filename,logger);
};

exports.defaultInjector = function(filename,logger) {
	if (path.extname(filename) === '.js' && !_(filename).endsWith('-spec.js')) {
		exports.addToFile('index.html','<script src="' + filename + '"></script>',exports.JS_MARKER,'  ');
		logger.writeln(chalk.green(' updating') + ' %s','index.html');
	} else if (path.extname(filename) === '.less') {
		exports.addToFile('app.less','@import "' + filename + '";',exports.LESS_MARKER,'');
		logger.writeln(chalk.green(' updating') + ' %s','app.less');
	}

};
