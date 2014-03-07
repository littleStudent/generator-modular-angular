angular.module('<%= directiveModule %>'<%= newModule %>)
	.directive('<%= _.camelize(directiveName) %>', function() {
		return {
			restrict: 'E',
			replace: true,
			scope: {

			},
			templateUrl: 'view.html',
			link: function(scope, element, attrs, fn) {


			}
		};
});
