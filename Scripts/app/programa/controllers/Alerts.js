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
            
            $scope.notifications = _.filter(userNotifications, function(notif){
                    return notif.timemodified != null;
                });

            //Quantity of notifications to show in an initial load
            var notificationsQuantityInitial = 6;
            
            $scope.notificationsQuantity = notificationsQuantityInitial;
            $scope.notificationsQuantityUnread = notificationsQuantityInitial;
            $scope.notificationsQuantityRead = notificationsQuantityInitial;

            $scope.setToolbar($location.$$path,"Notificaciones");
            $rootScope.showFooter = true;
            $rootScope.showFooterRocks = false;
                                                
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
            };
            for (var i=0; i<4; i++) {
                $scope.addSlide();
            }

            $scope.read = function(item){
                return item.read == read;
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
                    return !($scope.notificationsQuantityRead >= _.where($scope.notifications, {read: true}).length);
                    break;
                default :
                    return !($scope.notificationsQuantityUnread >= _.where($scope.notifications, {read: false }).length);
                    break;
                }
            }
            
            $scope.$emit('HidePreloader');
            
            $scope.back = function () {
                $location.path('/ProgramaDashboard');
            };
            
            $scope.showAlertDetail = function (notificationId) {
                var userId = localStorage.getItem('userId');                
                
                for(var indexNotification = 0; indexNotification < $scope.notifications.length; indexNotification ++){                    
                    if ($scope.notifications[indexNotification].id == notificationId) {
                        $scope.notifications[indexNotification].read = true;
                    }else{
                        
                    }                    
                }
                
                
                _setLocalStorageJsonItem("notifications", $scope.notifications);
                _readNotification(userId,notificationId);

                $scope.navigateTo('/AlertsDetail/' + notificationId, 'null');            
            
            }
            
        }
]);
