/*jshint strict:false */
"use strict";

angular.module("<%= _.slugify(appPrefix) %>.routes", ['ui.router'])

	// configure views; the authRequired parameter is used for specifying pages
	// which should only be available while logged in
	.config(['$locationProvider', '$stateProvider', '$urlRouterProvider', function ($locationProvider, $stateProvider, $urlRouterProvider) {
		$stateProvider
			//Add New State in Router Above
		;
		$urlRouterProvider.otherwise('/home');
	}]);