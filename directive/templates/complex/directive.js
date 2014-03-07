angular.module('<%= directiveModule %>'<%= newModule %>)
	.directive('<%= _.camelize(name) %>', function() {
		return {
			restrict: 'E',
			replace: true,
			scope: {

			},
			templateUrl: '<%= dir %>directive.<%= module %>.html',
			link: function(scope, element, attrs, fn) {


			}
		};
});
