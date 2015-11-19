angular
.module('incluso.shared.offlineController', [])
.controller('offlineController', [
    '$scope',
    '$routeParams',
    function ($scope, $routeParams, $templateCache) {
        $("#offlineModal").addClass("show");
        
        $scope.$on("$destroy", function() {
            $("#offlineModal").removeClass("show");
        });
    }]);