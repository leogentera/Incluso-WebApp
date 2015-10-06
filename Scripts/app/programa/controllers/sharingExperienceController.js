//Controller for Quizzes
angular
.module('incluso.programa.sharingExperience', [])
.controller('sharingExperienceController', [
    '$q',
    '$scope',
    '$location',
    '$routeParams',
    '$timeout',
    '$rootScope',
    '$http',
    '$modal',
    '$filter',
    function ($q, $scope, $location, $routeParams, $timeout, $rootScope, $http, $modal, $filter) {

        $scope.setToolbar($location.$$path, "Album Incluso");
        $rootScope.showFooter = false;
        $rootScope.showFooterRocks = false;
        $rootScope.showStage1Footer = false;
        $rootScope.showStage2Footer = false;
        $rootScope.showStage3Footer = false;
        $scope.isShareCollapsed = false;
        $scope.showSharedAlbum = false;
        $scope.sharedAlbumMessage = null;

        $scope.$emit('ShowPreloader');

        controllerInit();

        function controllerInit() {
                $scope.$emit('HidePreloader');
        }
    }]);