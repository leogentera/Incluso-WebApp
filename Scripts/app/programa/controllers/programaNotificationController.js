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
            $scope.usersLikedCount = "";
            
            var userNotifications = JSON.parse(localStorage.getItem("notifications"));
            $scope.usercourse = JSON.parse(localStorage.getItem("usercourse"));
            $scope.user = moodleFactory.Services.GetCacheJson("CurrentUser");
            $scope.userToken = $scope.user.token != '' ? $scope.user.token : "";
            var userId = _getItem("userId");
                        
            var _readNotification = function (currentUserId, notificationId,usernotificationId, userNotifications) {
                
                
                for(var indexNotification = 0; indexNotification < userNotifications.length; indexNotification ++){                    
                    if (userNotifications[indexNotification].usernotificationid == usernotificationId) {
                        var seen_date_now = new Date();
                        userNotifications[indexNotification].seen_date = seen_date_now;
                    }
                }
                
                _setLocalStorageJsonItem("notifications", userNotifications);
                
                var data = {                    
                    notificationid: notificationId,
                    seen_date: seen_date_now,
                    usernotificationid: usernotificationId
                    
                };
            
                moodleFactory.Services.PutUserNotificationRead(currentUserId, data, function () {
                    document.addEventListener("deviceready",function(){
                            cordova.exec(function () { }, function () { }, "CallToAndroid", "seenNotification", [usernotificationId]);
                        }, false);
                }, function (obj) {
                                $scope.$emit('HidePreloader');
                                if (obj && obj.statusCode && obj.statusCode == 408) {//Request Timeout
                                  $timeout(function () {
                                    $location.path('/Offline'); //This behavior could change
                                  }, 1);
                                } else {//Another kind of Error happened
                                  $timeout(function () {
                                      console.log("Another kind of Error happened");
                                      $scope.$emit('HidePreloader');
                                      $location.path('/connectionError');
                                  }, 1);
                                }
                            }, true);
            };

            function initialLoading(){
                if ($routeParams.usernotificationId == "undefined" || $routeParams.usernotificationId == "-1") {
                    $scope.notification = _.find(userNotifications, function(not){return not.notificationid == $routeParams.notificationId;});                    
                }else{
                    $scope.notification = _.find(userNotifications, function(notif){return notif.usernotificationid == $routeParams.usernotificationId;});
                    getPost();
                    _readNotification(userId, $routeParams.notificationId, $routeParams.usernotificationId, userNotifications);
                }

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
                    }, function (obj) {
                                $scope.$emit('HidePreloader');
                                if (obj && obj.statusCode && obj.statusCode == 408) {//Request Timeout
                                  $timeout(function () {
                                    $location.path('/Offline'); //This behavior could change
                                  }, 1);
                                } else {//Another kind of Error happened
                                  $timeout(function () {
                                      console.log("Another kind of Error happened");
                                      $scope.$emit('HidePreloader');
                                      $location.path('/connectionError');
                                  }, 1);
                                }
                            }, true);
                }
            }
            
            function getUserNotifications(courseid) {

                moodleFactory.Services.GetUserNotification(userId, courseid, $scope.user.token, function () {
                    var userNotifications = JSON.parse(localStorage.getItem("notifications"));
                    $scope.notification = _.find(userNotifications, function(notif){return notif.usernotificationid == $routeParams.usernotificationId; });                    
                    getPost();
                }, function (obj) {
                                $scope.$emit('HidePreloader');
                                if (obj && obj.statusCode && obj.statusCode == 408) {//Request Timeout
                                  $timeout(function () {
                                    $location.path('/Offline'); //This behavior could change
                                  }, 1);
                                } else {//Another kind of Error happened
                                  $timeout(function () {
                                      console.log("Another kind of Error happened");
                                      $scope.$emit('HidePreloader');
                                      $location.path('/connectionError');
                                  }, 1);
                                }
                            }, true);
            }
            
            initialLoading();
            
            $scope.showPreviousComments = function(postId) {
            
                $scope.showAllCommentsByPost['id' + postId] = 1000000;
            };
            
            $scope.urlify = function (text) {
                var urlRegex = /(https?:\/\/[^\s]+)/g;
                return text.replace(urlRegex, function(url) {
                    return '<a class="urlify" href="' + url + '">' + url + '</a>';
                });
            };
                

            var initializeCommentsData = function(element, index, array){
                //$scope.isCommentModalCollapsed[index] = false;
                if ($scope.showAllCommentsByPost['id' + element.post_id] != 1000000) {
                    $scope.showAllCommentsByPost['id' + element.post_id] = 3;   
                }
                
                var existingPost = false;
                
                for(p = 0; p < $scope.posts.length; p++){
                        if ($scope.posts[p].post_id === element.post_id) {
                            element.message = restoreHtmlTag(element.message);
                            $scope.posts[p] = element;
                            existingPost = true;
                            break;
                        }
                    }
                
                if (!existingPost) {
                    element.message = restoreHtmlTag(element.message);
                    $scope.posts.push(element);
                }
            };
            
            $scope.scrollToTop();
            $scope.$emit('HidePreloader');

            $scope.back = function () {
                $location.path('/ProgramaDashboard');
            }
                                
        }]);