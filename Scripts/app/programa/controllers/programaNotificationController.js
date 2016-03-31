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
                                                
            var userNotifications = JSON.parse(localStorage.getItem("notifications"));
                                
            $scope.notification = _.find(userNotifications, function(notif){return notif.usernotificationid == $routeParams.id; });
            
            if ($scope.notification && $scope.notification.postid) {
                //request al servicio de post;
                var currentUser = JSON.parse(moodleFactory.Services.GetCacheObject("CurrentUser"));
                moodleFactory.Services.GetAsyncDiscussionDetail($scope.notification.postid,currentUser.token,function(data){
                    var posts = data.posts;
                    posts.forEach(initializeCommentsData);
                    },function(data){},true );                
            }
            
            $scope.showPreviousComments = function(postId) {
            
                $scope.showAllCommentsByPost['id' + postId] = 1000000;
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