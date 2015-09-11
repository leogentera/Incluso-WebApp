angular
    .module('incluso.programa.comunidad', ['GlobalAppConstants', 'naif.base64'])
    .controller('programaComunidadController', [
        '$q',
        '$scope',
        '$location',
        '$routeParams',
        '$timeout',
        '$rootScope',
        '$http',
        '$anchorScroll',
        '$modal',
        '$filter',
        'MoodleIds',
        function ($q, $scope, $location, $routeParams, $timeout, $rootScope, $http, $anchorScroll, $modal, $filter, MoodleIds) {
            
            /* global variables */
            _httpFactory = $http;
            _timeout = $timeout;
            
            /* local view variables */
            _currentUser = moodleFactory.Services.GetCacheJson("CurrentUser");
            _userId = moodleFactory.Services.GetCacheObject("userId");
            
            $scope.userToken = _currentUser.token;
            $scope.moodleId = $routeParams.moodleid;
            $scope.communityModals = _initCommunityModals();
            $scope.showedCommentsByPost = new Array();
            $scope.showPreviousCommentsByPost = _showPreviousCommentsByPost;
            $scope.showMorePosts = _showMorePosts;
            $scope.likePost = _likePost;
            $scope.replyToPost = _replyToPost;
            $scope.postText = _postText;
            
            /* View settings */
            $rootScope.pageName = "Comunidad"
            $rootScope.navbarBlue = false;
            $rootScope.showToolbar = true;
            $rootScope.showFooter = true;
            $rootScope.showFooterRocks = false;
            $scope.setToolbar($location.$$path,"Comunidad");
            
            /*  functions initializers */
            $scope.scrollToTop();
            
            $scope.$emit('ShowPreloader');
            $timeout(function() { $scope.$emit('HidePreloader'); }, 3000);
            
            
            function _initCommunityModals() {
                return {
                    "isTextCollapsed":true,
                    "isLinkCollapsed":true,
                    "isVideoCollapsed":true,
                    "isAttachmentCollapsed":true,
                    "isReportCollapsed":true
                };
            };
            
            var _showPreviousCommentsByPost = function(postId) {
                $scope.showedCommentsByPost["id" + postId] = 1000000;
            };
            
            var _showMorePosts = function() {
                $scope.$emit('ShowPreloader');
                //moodleFactory.Services.GetAsyncDiscussionPosts($scope.discussion.id, $scope.discussion.discussion, $scope.activity.forumid, postPager.from, postPager.to, 0, getPostsDataCallback, null, true);
            };
            
            var getAsyncDiscussionPostsCallback = function(data, key) {
            };
            
            var _likePost = function(postId) {
                var post = _.find($scope.posts, function(a){ return a.post_id == postId });
                
                if(post.liked === 0) {
                    post.liked = 1;
                    post.likes = parseInt(post.likes) + 1;
                } else {
                    post.liked = 0;
                    post.likes = parseInt(post.likes) - 1;
                }
                
                var userIdObject = {
                    "userid": _userId
                };
                
                moodleFactory.Services.PutForumPostLikeNoCache(postId, userIdObject, function(){ }, function(){});
            };
            
            var _replyToPost = function(that, parentId, topicId, isCommentModalCollapsedIndex) {
                
                var requestData = {
                    "userid": _userId,
                    "discussionid": $scope.discussion.discussion,
                    "parentid": parentId,
                    "message": that.replyText,
                    "createdtime": $filter("date")(new Date(), "MM/dd/yyyy"),
                    "modifiedtime": $filter("date")(new Date(), "MM/dd/yyyy"),
                    "posttype": 1,
                    "fileToUpload": ""
                };
                
                $scope.$emit('ShowPreloader');
                moodleFactory.Services.PostAsyncForumPost ('reply', requestData,
                    function(){
                        $scope.textToPost=null;
                        $scope.isCommentModalCollapsed[isCommentModalCollapsedIndex] = false;
                        $scope.$emit('HidePreloader');
                    },
                    function(){
                        $scope.textToPost=null;
                        $scope.isCommentModalCollapsed[isCommentModalCollapsedIndex] = false;
                        $scope.$emit('HidePreloader');
                    }
                );
            };

            var _postText = function(){
                
                var requestData = {
                    "userid": _userId,
                    "discussionid": $scope.discussion.discussion,
                    "parentid": $scope.discussion.id,
                    "message": $scope.textToPost,
                    "createdtime": $filter("date")(new Date(), "MM/dd/yyyy"),
                    "modifiedtime": $filter("date")(new Date(), "MM/dd/yyyy"),
                    "posttype": 1,
                    "fileToUpload": null
                };
                
                $scope.$emit('ShowPreloader');
                moodleFactory.Services.PostAsyncForumPost ('new_post', requestData,
                    function(){
                        $scope.textToPost=null;
                        $scope.collapseForumButtomsTrigger('isTextCollapsed');
                        $scope.$emit('HidePreloader');
                    },
                    function(){
                        $scope.textToPost=null;
                        $scope.collapseForumButtomsTrigger('isTextCollapsed');
                        $scope.$emit('HidePreloader');
                    }
                );
            };
            
            $scope.collapseForumButtomsTrigger = function(element){
                for(var key in $scope.forumModals){
                    key==element? $scope.forumModals[key] = !$scope.forumModals[key] : $scope.forumModals[key] = true;
                };
            };
            
            $scope.back = function () {
                $location.path('/ProgramaDashboard');
            }

        }]);