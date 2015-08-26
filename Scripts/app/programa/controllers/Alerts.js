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
              
            var userCourse = JSON.parse(localStorage.getItem("usercourse"));
            
            //var activitiesperUser = _.filter(userCourse.stages, function(stages){
            //    var st = stages;            
            //    for(i=0; i< stages.challenges.length; i++){
            //        var currentChallenge = stages.challenges[i];
            //        for(j=0; j< currentChallenge.length; j++){                           
            //               return _.where(currentChallenge[j].activity,{status: 0});
            //        }                    
            //    }
            //});
            
            var userNotifications = JSON.parse(localStorage.getItem("notifications"));
            
            $scope.notifications = _.filter(userNotifications, function(notif){
                    return notif.timemodified != null;
                });
                                            
            var notificationsQuantityInitial = 6;
            
            $scope.notificationsQuantity = notificationsQuantityInitial;
            $scope.notificationsQuantityUnread = notificationsQuantityInitial;
            $scope.notificationsQuantityRead = notificationsQuantityInitial;
            
            $rootScope.pageName = "Notificaciones";
            $rootScope.navbarBlue = false;
            $rootScope.showToolbar = true;
            $rootScope.showFooter = true;
            $rootScope.showFooterRocks = false;
                                                
            //////// displaying notificacions as carousel ////////
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
            }
            
            $scope.showAlertDetail = function (alertId) {
                var userId = localStorage.getItem('userId');
                var notificationId = (alertId - 1);
                
                $scope.notifications[alertId -1 ].read = true ;
                localStorage.setItem("notifications", JSON.stringify($scope.notifications));
                _readNotification(userId,notificationId);
                $scope.navigateTo('/AlertsDetail/' + alertId, 'Notificaciones', 'null', 'navbarorange');
            }                    
            
            $scope.navigateTo = function(url,name,sideToggle,navbarColor){
                $location.path(url);
                console.log(navbarColor);
                if(navbarColor == 'navbarorange'){
                    $rootScope.navbarOrange = true;
                    $rootScope.navbarBlue = false;
                }
                if(navbarColor == 'navbarblue'){
                    $rootScope.navbarOrange = false;
                    $rootScope.navbarBlue = true;
                }

                $("#menuton span").text(name);
                
                if(sideToggle == "sideToggle")
                    $rootScope.sidebar = !$rootScope.sidebar;
            };
            
        }
]);
