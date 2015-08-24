angular
    .module('incluso.stage.dashboardcontroller', [])
    .controller('programaEtapaController', [
        '$q',
        '$scope',
        '$location',
        '$routeParams',
        '$timeout',
        '$rootScope',
        '$http',
        '$anchorScroll',
        '$modal',
        function ($q, $scope, $location, $routeParams, $timeout, $rootScope, $http, $anchorScroll, $modal) {

            $rootScope.pageName = "Estación: Conócete"
            $rootScope.navbarBlue = true;
            $rootScope.showToolbar = true;
            $rootScope.showFooter = true; 
            $rootScope.showFooterRocks = false; 

            $scope.scrollToTop();
            $scope.$emit('HidePreloader'); //hide preloader

            $scope.back = function () {
                $location.path('/ProgramaDashboard');
            }
            
            $scope.challengeName = "MIS RRR";
            
            $scope.logroEducativo = {
                "userId" : 53,
                "etapas" : [{"etapa1" : {"name" : "Exploración inicial", "icon" : "assets/images/img-rotator-01-lg.png", "status" : 1}}, 
                            {"etapa2" : {"name" : "Exploración inicial", "icon" : "assets/images/img-rotator-01-lg.png", "status" : 1}}, 
                            {"etapa3" : {"name" : "Exploración inicial", "icon" : "assets/images/img-rotator-01-lg.png", "status" : 1}}
                           ],
                "etapasLogradas" : [1],  //Etapas completadas
                "retos" : [ {"name" : "Exploración inicial", "icon" : "assets/images/img-rotator-01-lg.png", "status" : 1}, 
                            {"name" : "Cuarto de recursos", "icon" : "assets/images/img-rotator-01-lg.png", "status" : 1}, 
                            {"name" : "Conócete",  "icon" : "assets/images/img-rotator-01-lg.png","status" : 1},
                            {"name" : "Mis sueños", "icon" : "assets/images/img-rotator-01-lg.png", "status" : 1},
                            {"name" : "Cabina de soporte", "icon" : "assets/images/img-rotator-01-lg.png", "status" : 1},
                            {"name" : "Exploración final", "icon" : "assets/images/img-rotator-01-lg.png", "status" : 1}
                          ]                            
                };
                

        }]);