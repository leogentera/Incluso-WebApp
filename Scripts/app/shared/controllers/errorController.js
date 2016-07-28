/* Controller to handle offline redirections */
angular
.module('incluso.shared.errorController', ['GlobalAppConstants'])
.controller('errorController', [
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
        $rootScope.showFooter = false;
        $rootScope.showFooterRocks = false;
        $rootScope.showStage1Footer = false;
        $rootScope.showStage2Footer = false;
        $rootScope.showStage3Footer = false;
        $scope.setToolbar("/ProgramaDashboard","Misión Incluso");
        
        /* Shows offline message to prevent a user from using a section that requires connection */
        $("#errorConnectionModal").addClass("show");         
        
        $scope.$on("$destroy", function() {
            $("#errorConnectionModal").removeClass("show");
        });

        $('#errorConnectionRedirect').click(function () {
            $scope.navigateToDashboard();
        });

        $scope.navigateToDashboard = function () {
            $("#errorConnectionModal").removeClass("show");
            $location.path('/ProgramaDashboard');
        };

        
    }]);