angular
    .module('incluso.programa.notificationcontroller', [])
    .controller('programaNotificationController', [
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
            $scope.$emit('ShowPreloader'); //show preloader
            $scope.setToolbar($location.$$path,"Notificaciones");
            $rootScope.showFooter = true;
            $rootScope.showFooterRocks = false;
            $rootScope.showStage1Footer = false;
            $rootScope.showStage2Footer = false;
            $rootScope.showStage3Footer = false;
            $scope.posts = new Array();
            $scope.showAllCommentsByPost = new Array();
            $scope.notification = [];
            
            var userNotifications = JSON.parse(localStorage.getItem("notifications"));
            $scope.usercourse = JSON.parse(localStorage.getItem("usercourse"));
            $scope.user = moodleFactory.Services.GetCacheJson("CurrentUser");
            var userId = _getItem("userId");
                        
            function initialLoading(){
                $scope.notification = _.find(userNotifications, function(notif){return notif.usernotificationid == $routeParams.id; });
                getPost();                
            }
            
            function getPost() {
                if (!$scope.notification) {
                    getUserNotifications($scope.usercourse.courseid);
                    return;
                }
                
                if ($scope.notification && $scope.notification.postid) {
                   moodleFactory.Services.GetAsyncDiscussionDetail($scope.notification.postid, $scope.user.token,function(data){
                        var posts = data.posts;
                        posts.forEach(initializeCommentsData);
                    },function(data){},true );
                }
            }
            
            function getUserNotifications(courseid) {
                
                
                moodleFactory.Services.GetUserNotification(userId, courseid, $scope.user.token, function () {
                    var userNotifications = JSON.parse(localStorage.getItem("notifications"));
                    $scope.notification = _.find(userNotifications, function(notif){return notif.usernotificationid == $routeParams.id; });
                    _readNotification(userId, $routeParams.id, userNotifications);
                    getPost();
                }, function(){}, true);
            }
            
            initialLoading();
            
            $scope.showPreviousComments = function(postId) {
            
                $scope.showAllCommentsByPost['id' + postId] = 1000000;
            };
            
            var _readNotification = function (currentUserId, currentNotificationId, userNotifications) {
                
                var seen_date_now = new Date();
                for(var indexNotification = 0; indexNotification < userNotifications.length; indexNotification ++){                    
                    if (userNotifications[indexNotification].usernotificationid == currentNotificationId) {
                        userNotifications[indexNotification].seen_date = seen_date_now;
                    }
                }
                
                _setLocalStorageJsonItem("notifications", userNotifications);
                
                var data = {                    
                    notificationid: currentNotificationId,
                    seen_date: seen_date_now                    
                };
            
                moodleFactory.Services.PutUserNotificationRead(currentUserId, data, function () {
                    cordova.exec(function () { }, function () { }, "CallToAndroid", "seenNotification", [currentNotificationId]);
                }, function () {
                },true);
            };
            
            
            
            var initializeCommentsData = function(element, index, array){
                //$scope.isCommentModalCollapsed[index] = false;
                if ($scope.showAllCommentsByPost['id' + element.post_id] != 1000000) {
                    $scope.showAllCommentsByPost['id' + element.post_id] = 3;   
                }
                
                var existingPost = false;
                
                for(p = 0; p < $scope.posts.length; p++){
                    if ($scope.posts[p].post_id === element.post_id) {
                        $scope.posts[p] = element;
                        existingPost = true;
                        break;
                    }
                }
                
                if (!existingPost) {
                    $scope.posts.push(element);
                }
            };
            
            $scope.scrollToTop();
            $scope.$emit('HidePreloader');

            $scope.back = function () {
                $location.path('/ProgramaDashboard');
            }
                                
        }]);