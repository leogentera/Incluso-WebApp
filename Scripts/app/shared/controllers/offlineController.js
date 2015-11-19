angular
.module('incluso.shared.offlineController', [])
.controller('offlineController', [
    '$scope',
    '$routeParams',
    function ($scope, $routeParams, $templateCache) {
        
        $rootScope.showFooter = true;
        $rootScope.showFooterRocks = false;
        $rootScope.showStage1Footer = false;
        $rootScope.showStage2Footer = false;
        $rootScope.showStage3Footer = false;
        
        $("#offlineModal").addClass("show");
        
        $scope.$on("$destroy", function() {
            $("#offlineModal").removeClass("show");
        });
    }]);