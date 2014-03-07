##generator-modular-angular

This is a yeoman generator for angularJS applications.

The aim of this generator is the project structure which looks something like this:

* app.js
* app.less
* ```bower_components/```
* bower.json
* ```features/```
  * ```userManagement/```
    * ```registration/```
      * controller.js
      * dataModel.js
      * service.js
      * style.less
      * view.html
    * ```login/```
    * ```settings/```
* gulpfile.js
* index.html
* ```node_modules/```
* package.json
* routes.js

###app
```
yo modular-angular
[?] What would you like the angular app/module name to be? generatorTutorial
```
This bootstraps the application with the necessary files. 

```Gulp``` is used for the build process.

###features
```
yo modular-angular:feature
[?] Which module would you like me to use? userManagement.registration
[?] How shall i call this feature? registration
[?] Shall i create a service for you? Yes
[?] Name your service. registrationService
[?] Shall i create a data model for you? Yes
[?] Name your data model. registrationData
[?] Name your route state. registration
```
###directive
```
yo modular-angular:directive
[?] Which module do you want me to use? userManagement.registration
[?] How shall i call this directive? registration
[?] Shall i create a HTML file for you? Yes
[?] Where would you like to create the directive? features/userManagement/registration/directive
```
###service
```
yo modular-angular:service
[?] Which module would you like me to use? userManagement.registration
[?] How shall i call this service? registerService
[?] Where would you like to create the directive? features/userManagement/registration
```
