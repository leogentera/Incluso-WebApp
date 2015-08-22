
var app = angular.module('contactmaster', [
  'ngRoute',
  'mobile-angular-ui',
  'mobile-angular-ui.gestures',
  'ngSanitize',
  'ngResource',
  'ui.bootstrap',
  'ui.bootstrap.tpls',

  'incluso.home',
  'incluso.public.login',
  'incluso.public.recoverPassword',
  'incluso.public.register',
  'incluso.programa.tutorial',
  'incluso.programa.dashboard',
  'incluso.programa.dashboard.etapa',
  'incluso.programa.profile'

]);

app.run(function ($templateCache, $http, $transform) {
    $http.get('Templates/Public/Login.html', { cache: $templateCache });
    $http.get('Templates/Public/RecoverPassword.html', { cache: $templateCache });
    $http.get('Templates/Public/Register.html', { cache: $templateCache });
    $http.get('Templates/Programa/Dashboard.html', { cache: $templateCache });
    
    $http.get('Templates/Programa/profile.html', { cache: $templateCache });
    $http.get('Templates/Programa/editProfile.html', { cache: $templateCache });
    $http.get('Templates/Programa/etapa.html', { cache: $templateCache });
    $http.get('Templates/Programa/Tutorial.html', { cache: $templateCache });
    $http.get('Templates/Programa/AcercaPrograma.html', { cache: $templateCache });
});
 
app.config(function($routeProvider, $locationProvider) {
      $routeProvider.when('/Perfil/Editar', {
          templateUrl: 'Templates/Programa/editProfile.html',
          controller: 'programaProfileController'
      });

      $routeProvider.when('/Perfil', {
          templateUrl: 'Templates/Programa/profile.html',
          controller: 'programaProfileController'
      });

      $routeProvider.when('/ProgramaDashboard', {
        templateUrl: 'Templates/Programa/Dashboard.html',
        controller: 'programaDashboardController'
      });
    
     $locationProvider.html5Mode(false);

        $("#menu #submenu").mouseleave(function() {
            $(this).removeClass("unhovered");
        });

   
           
});

app.controller('RootController', function($rootScope, $scope, $location){
    alert("t1");
 
    $scope.$on('$routeChangeSuccess', function (e, current, previous) {
            $scope.activeViewPath = $location.path();
        });
});