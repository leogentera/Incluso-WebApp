angular
    .module('incluso.programa.notificationlikescontroller', [])   
    .controller('programaNotificationLikesController', [
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
        
        $scope.likes = [];
        
                function initialLoading() {
                    var post = JSON.parse(localStorage.getItem("forumDetail/" + $routeParams.id));
                    if (post.posts && post.posts[0].likes) {
                        $scope.likes = post.posts[0].likes;
                    }
                    $scope.$emit('HidePreloader');
                }
                
                
                initialLoading();
        
        }]);