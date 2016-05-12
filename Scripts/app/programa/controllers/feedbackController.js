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
    ]).controller('feedbackMessageController', function ($scope, $modalInstance, $location) {
        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };

        //drupalFactory.Services.GetContent("2000", function (data, key) {
        //
        //    if (data.node != null) {
        //        $scope.title = data.node.titulo_cierre_robot;
        //        $scope.message = data.node.robot_stage_close;
        //    }
        //}, function () {}, false);

        $scope.navigateToDashboard = function () {
            $modalInstance.dismiss('cancel');
            $location.path('/ProgramaDashboard');
        };
        
    });