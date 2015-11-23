angular
.module('incluso.shared.offlineController', ['GlobalAppConstants'])
.controller('offlineController', [
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
        $rootScope.pageName = "Sin conexión";
        $rootScope.navbarBlue = false;
        $rootScope.showToolbar = true;
        $rootScope.showFooter = true;
        $rootScope.showFooterRocks = false;
        $rootScope.showStage1Footer = false;
        $rootScope.showStage2Footer = false;
        $rootScope.showStage3Footer = false;
        $scope.setToolbar("/ProgramaDashboard","Misión Incluso");
        
        $("#offlineModal").addClass("show");
        
        $scope.$on("$destroy", function() {
            $("#offlineModal").removeClass("show");
        });
    }]);