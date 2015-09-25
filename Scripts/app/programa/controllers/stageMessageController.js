angular
    .module('incluso.stage.messagecontroller', [])
    .controller('stageMessageController', [
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

            $scope.setToolbar($location.$$path,"");
            $rootScope.showFooter = true;
            $rootScope.showFooterRocks = false;
            $rootScope.showStage1Footer = false;
            $rootScope.showStage2Footer = false;
            $rootScope.showStage3Footer = false;
            $rootScope.activityId = 1;
            $rootScope.userId = 45;

            $scope.scrollToTop();
            $scope.$emit('HidePreloader'); //hide preloader

            $scope.back = function () {
                $location.path('/ProgramaDashboard');
            }

            $scope.endActivity = function(){
                
                _endActivity($rootScope.userId, $rootScope.activityId);
            }
        }]);