angular
    .module('incluso.program.alerts', [])
    .controller('AlertsController', [
        '$q',
        '$scope',
        '$location',
        '$routeParams',
        '$timeout',
        '$rootScope',
        '$http',
        '$modal',
        function ($q, $scope, $location, $routeParams, $timeout, $rootScope, $http, $modal) {
                          
            var userNotifications = JSON.parse(localStorage.getItem("notifications"));
            $scope.$emit('ShowPreloader'); //show preloader
            $scope.notifications = _.filter(userNotifications, function(notif){
                    return (notif.status != "pending" && notif.wondate != null);
                });

            //Quantity of notifications to show in an initial load
            var notificationsQuantityInitial = 6;
            
            $scope.notificationsQuantity = notificationsQuantityInitial;
            $scope.notificationsQuantityUnread = notificationsQuantityInitial;
            $scope.notificationsQuantityRead = notificationsQuantityInitial;

            $scope.setToolbar($location.$$path,"Notificaciones");
            $rootScope.showFooter = true;
            $rootScope.showFooterRocks = false;
            $rootScope.showStage1Footer = false;
            $rootScope.showStage2Footer = false;
            $rootScope.showStage3Footer = false;
                                                
            ////// displaying notificacions as carousel ////////
            $scope.myInterval = 5000;
            $scope.noWrapSlides = false;
            var slides = $scope.slides = [];
            
            $scope.addSlide = function() {
                var newWidth = 600 + slides.length + 1;
                slides.push({
                  image: '//placekitten.com/' + newWidth + '/300',
                  text: ['More','Extra','Lots of','Surplus'][slides.length % 4] + ' ' +
                    ['Cats', 'Kittys', 'Felines', 'Cutes'][slides.length % 4]
                });
                $scope.$emit('HidePreloader'); //hide preloader
            };
            
            for (var i=0; i<4; i++) {
                $scope.addSlide();
            }

            $scope.qty = function(type){
                switch(type){
                    case 'All':
                        return this.$index < $scope.notificationsQuantity;
                        break;
                    case 'Read':
                        return this.$index < $scope.notificationsQuantityRead;
                        break;
                    default :
                        return this.$index < $scope.notificationsQuantityUnread;
                        break;
                }
            }
            
            
            $scope.showMore = function(type){                
                switch(type){
                    case 'All':
                        $scope.notificationsQuantity = ($scope.notificationsQuantity + notificationsQuantityInitial);
                        break;
                    case 'Read':
                        $scope.notificationsQuantityRead = ($scope.notificationsQuantityRead + notificationsQuantityInitial);
                        break;
                    default :
                        $scope.notificationsQuantityUnread = ($scope.notificationsQuantityUnread + notificationsQuantityInitial);
                        break;
                }
            }
            
            $scope.showLoadMoreBar = function(type){
                switch(type){
                case 'All':
                    return !($scope.notificationsQuantity >= $scope.notifications.length);
                case 'Read':                    
                    return !($scope.notificationsQuantityRead >= _.where($scope.notifications, {seen_date: !null}).length);
                    break;
                default :
                    return !($scope.notificationsQuantityUnread >= _.where($scope.notifications, {seen_date: null }).length);
                    break;
                }
            }
            
            $scope.$emit('HidePreloader');
            
            $scope.back = function () {
                $location.path('/ProgramaDashboard');
            };
            
            $scope.showAlertDetail = function (notificationId) {
                var userId = localStorage.getItem('userId');                
                
                var seen_date_now = new Date();
                for(var indexNotification = 0; indexNotification < userNotifications.length; indexNotification ++){                    
                    if (userNotifications[indexNotification].id == notificationId) {
                        userNotifications[indexNotification].seen_date = seen_date_now;
                    }else{
                        
                    }                    
                }
                
                
                _setLocalStorageJsonItem("notifications", userNotifications);
                _readNotification(userId,notificationId);

                $scope.navigateTo('/AlertsDetail/' + notificationId, 'null');            
            
            }
            
            var _readNotification = function (currentUserId, currentNotificationId) {
                var seen_date_now = new Date();
            
                var data = {                    
                    notificationid: currentNotificationId,
                    seen_date: seen_date_now                    
                };
            
                moodleFactory.Services.PutUserNotificationRead(currentUserId, data, function () {
                }, function () {
                });
            };        
        }
]);
