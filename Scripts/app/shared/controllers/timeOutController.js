/* Controller to handle offline redirections */
angular
.module('incluso.shared.timeOut', ['GlobalAppConstants'])
.controller('timeOutController', [
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
        $rootScope.pageName = "Sin conexión";
        $rootScope.navbarBlue = false;
        $rootScope.showToolbar = true;
        $rootScope.showFooter = true;
        $rootScope.showFooterRocks = false;
        $rootScope.showStage1Footer = false;
        $rootScope.showStage2Footer = false;
        $rootScope.showStage3Footer = false;
        $scope.setToolbar("/ProgramaDashboard","Misión Incluso");
        
        /* Shows offline message to prevent a user from using a section that requires connection */
        $("#timeoutModal").addClass("show");
        
        $scope.$on("$destroy", function() {
            $("#timeoutModal").removeClass("show");
        });

        $('#timeOutRedirect').click(function () {
            $scope.navigateToDashboard();
        });

        $scope.navigateToDashboard = function () {
            $("#timeoutModal").removeClass("show");
            $location.path('/ProgramaDashboard');
        };


    }]);