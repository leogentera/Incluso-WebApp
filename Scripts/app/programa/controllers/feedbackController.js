angular
    .module('incluso.programa.feedbackcontroller', [])   
    .controller('programafeedbackcontroller', [
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
            $rootScope.showFooter = false;
            $rootScope.showFooterRocks = false;
            $rootScope.showStage1Footer = false;
            $rootScope.showStage2Footer = false;
            $rootScope.showStage3Footer = false;
                
            function initialLoading() {
                // $scope.showRobot();    
                $scope.$emit('HidePreloader');
            }
            
            $scope.ToDashboard = function(){
                
                $location.path('/ZonaDeVuelo/Dashboard/1/5');
                
            };
            
            //$scoe.showRobot = function(size){
            //    var modalInstance = $modal.open({
            //        animation: $scope.animationsEnabled,
            //        templateUrl: 'ClosingStageTwoModal.html',
            //        controller: 'feedbackMessageController',
            //        size: size,
            //        windowClass: 'closing-stage-modal user-help-modal'
            //    });
            //    $scope.$emit('HidePreloader');
            //};
4
            initialLoading();
        
        }
    ]);