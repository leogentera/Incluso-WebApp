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
        
                
            function initialLoading() {
                
                $scope.$emit('HidePreloader');
            }
            
            
            initialLoading();
        
        }]);