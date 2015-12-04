angular
    .module('incluso.program.rewardDetail', [])
    .controller('rewardDetailController', [
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
            //$scope.$emit('ShowPreloader'); //show preloader
            $scope.setToolbar($location.$$path,"Notificaciones");
            $rootScope.showFooter = true;
            $rootScope.showFooterRocks = false;
            $rootScope.showStage1Footer = false;
            $rootScope.showStage2Footer = false;
            $rootScope.showStage3Footer = false;
                                                
            //var userNotifications = JSON.parse(localStorage.getItem("notifications"));
              
            var profile = JSON.parse(localStorage.getItem("Perfil/" + moodleFactory.Services.GetCacheObject("userId")));
            
                                
            $scope.rewardDetail = _.find(profile.rewards, function(d){return d.id == $routeParams.id; });
            
            var rewardId = $scope.rewardDetail.id;
            
            if (rewardId) {
                $scope.rewardDetail.image = getFileName(rewardId);
            }
                    
            $scope.scrollToTop();
            $scope.$emit('HidePreloader'); //hide preloader

            $scope.back = function () {
                $location.path('/MyStars');
            }                   
                   
                   
            function getFileName(id) {
                var filename = "";

                switch (id) {                   
                    case 24:
                        filename = "assets/images/cursos-ingles.jpg";
                        break;
                    case 25:
                        filename = "assets/images/smartphone.jpg";
                        break;                   
                    default:
                        filename = "assets/images/cursos-ingles.png";
                }

                return filename;
            }
                                
        }]);