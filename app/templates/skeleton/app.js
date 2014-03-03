angular.module("<%= _.slugify(appname) %>", [
	'<%= _.slugify(appname) %>.routes',
	'ui.bootstrap',
	'ui.utils',
	//Add New Modules Above
	'ngAnimate'
]);

angular.module("<%= _.slugify(appname) %>").run(function ($rootScope) {

    $rootScope.safeApply = function (fn) {
        var phase = $rootScope.$$phase;
        if (phase === '$apply' || phase === '$digest') {
            if (fn && (typeof(fn) === 'function')) {
                fn();
            }
        } else {
            this.$apply(fn);
        }
    };

});
