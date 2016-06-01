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
            var currentUser = JSON.parse(localStorage.getItem("CurrentUser"));
            $scope.user = currentUser.alias;
            $scope.profile = JSON.parse(localStorage.getItem("Perfil/" + currentUser.userId));
            
            
            var currentStage = JSON.parse(localStorage.getItem("currentStage"));
            switch (currentStage) {
                case 1:
                    $scope.location = '/ZonaDeVuelo/Dashboard/1/5';
                    $rootScope.showStage1Footer = true;
                    break;
                case 2:
                    $scope.location = 'ZonaDeNavegacion/Dashboard/2/7';
                    $rootScope.showStage2Footer = true;
                    break;
                case 3:
                    $scope.location = "ZonaDeAterrizaje/Dashboard/3/6";
                    $rootScope.showStage3Footer = true;
                    break;
            }
            
            var profileCatalogs = JSON.parse(localStorage.getItem("profileCatalogs"));
            var perfilIncluso = profileCatalogs.messages || [];
            
            
            function getProfile() {
                
                var profilePoints = JSON.parse(localStorage.getItem("profilePoints"));
                var maxProfile = _.max(profilePoints, function(profile){
                    return profile.points;
                });
                
                var possibleMessages = _.where(perfilIncluso, {profileid: maxProfile.id});
                var randomNum = _.random(0, possibleMessages.length - 1);
                $scope.messageProfile = possibleMessages[randomNum];

                if ($scope.messageProfile.description.indexOf("@nombre") > -1){
                    var name = $scope.profile.firstname;
                    $scope.messageProfile.description = $scope.messageProfile.description.replace("@nombre", name);
                }
                if ($scope.messageProfile.description.indexOf("@escudo") > -1){
                    var shield = $scope.profile.shield;
                    $scope.messageProfile.description =  $scope.messageProfile.description.replace("@escudo", shield);
                }
                                
            }
            
            $scope.finishActivity = function(){
                
                
                
            };
            
            function initialLoading() {
                // $scope.showRobot();    
                $scope.$emit('HidePreloader');
                getProfile();
            }
            
            $scope.ToDashboard = function(){
                $location.path($scope.location);
            };
            
        initialLoading();
        
        }
    ]);