/* Controller to handle offline redirections */
angular
.module('incluso.shared.pendingQueueController', ['GlobalAppConstants'])
.controller('pendingQueueController', [
        '$q',
        '$scope',
        '$location',
        '$routeParams',
        '$timeout',
        '$rootScope',
        '$http',
        '$anchorScroll',
        '$modal',
        '$filter',
        'MoodleIds',
    function ($q, $scope, $location, $routeParams, $timeout, $rootScope, $http, $anchorScroll, $modal, $filter, MoodleIds) {
        $scope.$emit('HidePreloader');
        
        /* header and footer configuration */
        $rootScope.pageName = "¡Espera!";
        $rootScope.navbarBlue = false;
        $rootScope.showToolbar = true;
        $rootScope.showFooter = false;
        $rootScope.showFooterRocks = false;
        $rootScope.showStage1Footer = false;
        $rootScope.showStage2Footer = false;
        $rootScope.showStage3Footer = false;
        $scope.setToolbar("/ProgramaDashboard","Misión Incluso");
        
        /* Shows offline message to prevent a user from using a section that requires connection */
        $("#pendingQueueModal").addClass("show");
        
        $scope.$on("$destroy", function() {
            $("#pendingQueueModal").removeClass("show");
        });

        $('#stayPendingQueue').click(function () {
            $scope.navigateToDashboard();
        });

        $('#leavePendingQueue').click(function () {
            logout($scope, $location, false);
        });

        $scope.navigateToDashboard = function () {
            $("#pendingQueueModal").removeClass("show");
            $location.path('/ProgramaDashboard');
        };

        
    }]);