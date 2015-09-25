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
                                                
            //var userNotifications = JSON.parse(localStorage.getItem("notifications"));
              
            var profile = JSON.parse(localStorage.getItem("profile/" + moodleFactory.Services.GetCacheObject("userId")));
            
                                
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
                        filename = "assets/images/CursosIngles.png";
                        break;
                    case 25:
                        filename = "assets/images/iphone.png";
                        break;                   
                    default:
                        filename = "assets/images/CursosIngles.png";
                }

                return filename;
            }
                                
        }]);