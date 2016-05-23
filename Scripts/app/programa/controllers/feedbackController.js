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
            
            $scope.location = "";
            $scope.messageProfile = "";
            $scope.user = "";
            $scope.currentUser = JSON.parse(localStorage.getItem("CurrentUser"));
            if ($scope.currentUser) {
                $scope.user = $scope.currentUser.alias;
            }
            
            
            var currentStage = JSON.parse(localStorage.getItem("currentStage"));
            switch (currentStage) {
                case 1:
                    $scope.location = '/ZonaDeVuelo/Dashboard/1/5';
                    $rootScope.showStage1Footer = true;
                    break;
                case 2:
                    $scope.location = 'ZonaDeNavegacion/Dashboard/1/5';
                    $rootScope.showStage2Footer = true;
                    break;
            }
            
            var perfilIncluso = [
                {
                    IdProfile: 1,
                    ProfileName: "Deportista",
                    ProfileMessage: "Hola " + $scope.user + " Felicidades, haz obtenido el perfil deportista"},
                {
                    IdProfile: 2,
                    ProfileName: "Artístico",
                    ProfileMessage: "Hola " + $scope.user + " Felicidades, haz obtenido el perfil artístico"},
                {
                    IdProfile: 3,
                    ProfileName: "Social",
                    ProfileMessage: "Hola " + $scope.user + " Felicidades, haz obtenido el perfil social"},
                {
                    IdProfile: 4,
                    ProfileName: "Intelectual",
                    ProfileMessage: "Hola " + $scope.user + " Felicidades, haz obtenido el perfil intelectual"}
            ];
                
            function initialLoading() {
                // $scope.showRobot();    
                $scope.$emit('HidePreloader');
                
                var random = getRandom(perfilIncluso.length +1);
                $scope.messageProfile = _.findWhere(perfilIncluso, {IdProfile: random});
            }
            
            function getRandom(amount) {
                return Math.floor(Math.random() * (amount - 1) + 1 );
            }
            
            
            $scope.ToDashboard = function(){
                $location.path($scope.location);
            };
            
        initialLoading();
        
        }
    ]);