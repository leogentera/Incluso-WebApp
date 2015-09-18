angular
    .module('incluso.stage.dashboardcontrollerDummy', [])
    .controller('stageDashboardControllerDummy', [
       '$q',
        '$scope',
        '$location',
        '$routeParams',
        '$timeout',
        '$rootScope',
        '$http',
        '$modal',
        function ($q, $scope, $location, $routeParams, $timeout, $rootScope, $http, $modal) {            
            /* $routeParams.stageId */
            _timeout = $timeout;
            _httpFactory = $http;
            $scope.Math = window.Math;
            $scope.$emit('HidePreloader'); //show preloader
            $scope.model = JSON.parse(localStorage.getItem("usercourse"));
            $scope.setToolbar($location.$$path,"");
            
            $rootScope.showFooter = true;
            $rootScope.showFooterRocks = false;
            $rootScope.linksFooter = true;
            $scope.scrollToTop();

            $scope.activitiesCompletedInCurrentStage = [];
            $scope.isCollapsed = false;
            $scope.idEtapa = $routeParams['stageId'] - 1; //We are in stage stageId, taken from URL
            $scope.idReto = $routeParams['challengue'];
            $scope.thisStage = $scope.model.stages[$scope.idEtapa];
            $scope.nombreEtapaActual = $scope.thisStage.sectionname;
            _setLocalStorageItem("userCurrentStage", $routeParams['stageId']);   
                            
        }]);
