angular.module("<%= _.slugify(appPrefix) %>", [
	'<%= _.slugify(appPrefix) %>.routes',
	'ui.bootstrap',
	'ui.utils',
	'ui.router',
	//Add New Modules Above
	'ngAnimate'
]);

angular.module("<%= _.slugify(appPrefix) %>").run(function ($rootScope) {

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
