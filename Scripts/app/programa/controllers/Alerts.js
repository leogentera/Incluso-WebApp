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
            
            var newNotifications = [
                {
                    notificationId: 1,
                    notificationTitle:'Has ganado una estrella',
                    read:'false',
                    notificationDate: new Date('01/02/2005'),
                    notificationDetail : 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras venenatis velit magna, vitae commodo metus volutpat a. Morbi euismod mauris lectus. Praesent suscipit consequat felis, a aliquet nibh porttitor vitae. Praesent volutpat tortor ipsum, tempor lacinia justo aliquet ut. Maecenas dolor mauris, vestibulum non varius a, feugiat in elit. Nulla libero elit, gravida quis orci pulvinar, consequat rhoncus ex. Praesent a ultrices nisi. Ut vel volutpat tortor, a ultrices nisl. Nullam at faucibus velit. Nunc pharetra lacus nisi.'},
                {
                    notificationId: 2,
                    notificationTitle:'Has completado una act',
                    read:'false',
                    notificationDate: new Date('01/02/2005'),
                    notificationDetail : 'nteger ut convallis felis. Fusce in tincidunt nisl. Pellentesque quis neque leo. Aliquam eget lectus at sem gravida eleifend bibendum vel nulla. Curabitur quis augue non urna vestibulum sodales. Maecenas nec sem bibendum, pharetra turpis efficitur, hendrerit mi. Donec sit amet est ac dui ultricies dignissim. Fusce ac sodales tortor, in gravida leo. Nulla sem purus, varius sit amet nisi nec, interdum accumsan nisi. Fusce dolor urna, hendrerit quis interdum at, fringilla a orci. Sed dignissim ornare lectus, et tristique erat hendrerit eu. Vivamus ut consectetur ex, eu suscipit libero.'},
                {
                    notificationId: 3,
                    notificationTitle:'Has completado una etapa',
                    read:'false',
                    notificationDate: new Date('01/02/2004'),
                    notificationDetail : 'Ut consequat tristique est ac ultrices. Donec et euismod nisi. Proin sapien est, imperdiet quis ligula ac, efficitur sollicitudin metus. Sed nec risus arcu. Nam id blandit orci. Nam ornare fermentum lorem vel fermentum. Vivamus ex diam, eleifend et bibendum ac, varius a mi. Mauris commodo dolor neque, sed pretium lacus ultrices vitae'},
                {
                    notificationId: 4,
                    notificationTitle:'Has ganado una estrella',
                    read:'false',
                    notificationDate: new Date('01/02/2010'),
                    notificationDetail : 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras venenatis velit magna, vitae commodo metus volutpat a. Morbi euismod mauris lectus. Praesent suscipit consequat felis, a aliquet nibh porttitor vitae. Praesent volutpat tortor ipsum, tempor lacinia justo aliquet ut. Maecenas dolor mauris, vestibulum non varius a, feugiat in elit. Nulla libero elit, gravida quis orci pulvinar, consequat rhoncus ex. Praesent a ultrices nisi. Ut vel volutpat tortor, a ultrices nisl. Nullam at faucibus velit. Nunc pharetra lacus nisi.'},
                {
                    notificationId: 5,
                    notificationTitle:'Has completado una act',
                    read:'false',
                    notificationDate: new Date('01/02/2015'),
                    notificationDetail : 'nteger ut convallis felis. Fusce in tincidunt nisl. Pellentesque quis neque leo. Aliquam eget lectus at sem gravida eleifend bibendum vel nulla. Curabitur quis augue non urna vestibulum sodales. Maecenas nec sem bibendum, pharetra turpis efficitur, hendrerit mi. Donec sit amet est ac dui ultricies dignissim. Fusce ac sodales tortor, in gravida leo. Nulla sem purus, varius sit amet nisi nec, interdum accumsan nisi. Fusce dolor urna, hendrerit quis interdum at, fringilla a orci. Sed dignissim ornare lectus, et tristique erat hendrerit eu. Vivamus ut consectetur ex, eu suscipit libero.'},
                {
                    notificationId: 6,
                    notificationTitle:'Has completado una etapa',
                    read:'false',
                    notificationDate: new Date('01/02/2002'),
                    notificationDetail : 'Ut consequat tristique est ac ultrices. Donec et euismod nisi. Proin sapien est, imperdiet quis ligula ac, efficitur sollicitudin metus. Sed nec risus arcu. Nam id blandit orci. Nam ornare fermentum lorem vel fermentum. Vivamus ex diam, eleifend et bibendum ac, varius a mi. Mauris commodo dolor neque, sed pretium lacus ultrices vitae'},
                {
                    notificationId: 7,
                    notificationTitle:'Has ganado una estrella',
                    read:'false',
                    notificationDate: new Date('01/02/2014'),
                    notificationDetail : 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras venenatis velit magna, vitae commodo metus volutpat a. Morbi euismod mauris lectus. Praesent suscipit consequat felis, a aliquet nibh porttitor vitae. Praesent volutpat tortor ipsum, tempor lacinia justo aliquet ut. Maecenas dolor mauris, vestibulum non varius a, feugiat in elit. Nulla libero elit, gravida quis orci pulvinar, consequat rhoncus ex. Praesent a ultrices nisi. Ut vel volutpat tortor, a ultrices nisl. Nullam at faucibus velit. Nunc pharetra lacus nisi.'},
                {
                    notificationId: 8,
                    notificationTitle:'Has completado una act',
                    read:'false',
                    notificationDate: new Date('01/02/2011'),
                    notificationDetail : 'nteger ut convallis felis. Fusce in tincidunt nisl. Pellentesque quis neque leo. Aliquam eget lectus at sem gravida eleifend bibendum vel nulla. Curabitur quis augue non urna vestibulum sodales. Maecenas nec sem bibendum, pharetra turpis efficitur, hendrerit mi. Donec sit amet est ac dui ultricies dignissim. Fusce ac sodales tortor, in gravida leo. Nulla sem purus, varius sit amet nisi nec, interdum accumsan nisi. Fusce dolor urna, hendrerit quis interdum at, fringilla a orci. Sed dignissim ornare lectus, et tristique erat hendrerit eu. Vivamus ut consectetur ex, eu suscipit libero.'},
                {
                    notificationId: 9,
                    notificationTitle:'Has completado una etapa',
                    read:'false',
                    notificationDate: new Date('01/02/2009'),
                    notificationDetail : 'Ut consequat tristique est ac ultrices. Donec et euismod nisi. Proin sapien est, imperdiet quis ligula ac, efficitur sollicitudin metus. Sed nec risus arcu. Nam id blandit orci. Nam ornare fermentum lorem vel fermentum. Vivamus ex diam, eleifend et bibendum ac, varius a mi. Mauris commodo dolor neque, sed pretium lacus ultrices vitae'},
                {
                    notificationId: 10,
                    notificationTitle:'Has ganado una estrella',
                    read:'false',
                    notificationDate: new Date('01/02/2015'),
                    notificationDetail : 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras venenatis velit magna, vitae commodo metus volutpat a. Morbi euismod mauris lectus. Praesent suscipit consequat felis, a aliquet nibh porttitor vitae. Praesent volutpat tortor ipsum, tempor lacinia justo aliquet ut. Maecenas dolor mauris, vestibulum non varius a, feugiat in elit. Nulla libero elit, gravida quis orci pulvinar, consequat rhoncus ex. Praesent a ultrices nisi. Ut vel volutpat tortor, a ultrices nisl. Nullam at faucibus velit. Nunc pharetra lacus nisi.'},
                {
                    notificationId: 11,
                    notificationTitle:'Has completado una act',
                    read:'false',
                    notificationDate: new Date('01/02/2014'),
                    notificationDetail : 'nteger ut convallis felis. Fusce in tincidunt nisl. Pellentesque quis neque leo. Aliquam eget lectus at sem gravida eleifend bibendum vel nulla. Curabitur quis augue non urna vestibulum sodales. Maecenas nec sem bibendum, pharetra turpis efficitur, hendrerit mi. Donec sit amet est ac dui ultricies dignissim. Fusce ac sodales tortor, in gravida leo. Nulla sem purus, varius sit amet nisi nec, interdum accumsan nisi. Fusce dolor urna, hendrerit quis interdum at, fringilla a orci. Sed dignissim ornare lectus, et tristique erat hendrerit eu. Vivamus ut consectetur ex, eu suscipit libero.'},
                {
                    notificationId: 12,
                    notificationTitle:'Has completado una etapa',
                    read:'false',
                    notificationDate: new Date('01/02/2002'),
                    notificationDetail : 'Ut consequat tristique est ac ultrices. Donec et euismod nisi. Proin sapien est, imperdiet quis ligula ac, efficitur sollicitudin metus. Sed nec risus arcu. Nam id blandit orci. Nam ornare fermentum lorem vel fermentum. Vivamus ex diam, eleifend et bibendum ac, varius a mi. Mauris commodo dolor neque, sed pretium lacus ultrices vitae'}                    
            ];
            
            var notificationsLocalStorage = localStorage.getItem("notifications");            
                        
            $scope.notifications = notificationsLocalStorage ? JSON.parse(notificationsLocalStorage) : newNotifications;
            
           
            
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
                    return !($scope.notificationsQuantity == $scope.notifications.length);
                case 'Read':                    
                    return !($scope.notificationsQuantityRead >= _.where($scope.notifications, {read:'true'}).length);
                    break;
                default :
                    return !($scope.notificationsQuantityUnread >= _.where($scope.notifications, {read:'false'}).length);
                    break;
                }
            }
            
            $scope.$emit('HidePreloader');
            
            $scope.back = function () {
                $location.path('/ProgramaDashboard');
            }
            
            $scope.showAlertDetail = function (alertId) {
                $scope.notifications[alertId -1 ].read = "true";
                localStorage.setItem("notifications", JSON.stringify($scope.notifications));
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
