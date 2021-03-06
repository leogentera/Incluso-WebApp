angular
    .module('incluso.programa.notificationcontroller', [])
    .controller('programaNotificationController', [
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
            $scope.$emit('ShowPreloader'); //show preloader
            $scope.setToolbar($location.$$path,"Notificaciones");
            $rootScope.showFooter = true;
            $rootScope.showFooterRocks = false;
            $rootScope.showStage1Footer = false;
            $rootScope.showStage2Footer = false;
            $rootScope.showStage3Footer = false;
                                                
            var userNotifications = JSON.parse(localStorage.getItem("notifications"));
                                
            $scope.notification = _.find(userNotifications, function(d){return d.id == $routeParams.id; });
            
            $scope.scrollToTop();
            $scope.$emit('HidePreloader');

            $scope.back = function () {
                $location.path('/ProgramaDashboard');
            }
                                
        }]);