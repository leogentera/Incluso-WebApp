angular
    .module('incluso.programa.dashboardcontroller', [])
    .controller('programaDashboardController', [
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

            $scope.setToolbar($location.$$path,"Misión Incluso");
            $rootScope.showFooter = true;
            $rootScope.showFooterRocks = false;
            $rootScope.showStage1Footer = false;
            $rootScope.showStage2Footer = false;
            $rootScope.showStage3Footer = false; 

            $scope.scrollToTop();
            $scope.$emit('HidePreloader'); //hide preloader
            
            
            $scope.back = function () {
                $location.path('/ProgramaDashboard');
            }
            

        }]);