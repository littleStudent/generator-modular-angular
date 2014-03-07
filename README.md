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
I will bootstraps the application with the necessary files and also used ```Gulp``` for the build process.
```bootstrap```, ```ui.router```, ```ui.utils``` and ```ngAnimate``` are already included.

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
I will encapsulate a feature in its own module so you can easily reuse it. I also give you the option to create a service and a data model for you. The directory path depends on the module name you choose. I will hook up everything in the app.js file, in the index.html file and the roues.js file.
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
