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
            var _userProfile = moodleFactory.Services.GetCacheJson("profile/" + moodleFactory.Services.GetCacheObject("userId"));
            var _currentUser = moodleFactory.Services.GetCacheJson("CurrentUser");
            var _userId = moodleFactory.Services.GetCacheObject("userId");
            var _course = moodleFactory.Services.GetCacheJson("course");
            var _postPager = { from: 0, to: 0 };
            var _currentFilter = "default";
            
            $scope.userToken = _currentUser.token;
            $scope.moodleId = $routeParams.moodleid;
            $scope.forumId = 0;
            $scope.discussion = null;
            $scope.communityModals = _initCommunityModals();
            $scope.morePendingPosts = true;
            $scope.posts = new Array();
            $scope.showedCommentsByPost = new Array();
            $scope.isCommentModalCollapsed = new Array();
            $scope.isReportedAbuseModalCollapsed = new Array();
            $scope.isReportedAbuseSentModalCollapsed = new Array();
            $scope.replyText = null;
            $scope.postTextValue = null;
            $scope.postLinkValue = null;
            $scope.postVideoValue = null;
            $scope.postAttachmentValue = null;
            $scope.filter = "";
            
            /* View settings */
            $rootScope.pageName = "Comunidad"
            $rootScope.navbarBlue = false;
            $rootScope.showToolbar = true;
            $rootScope.showFooter = true;
            $rootScope.showFooterRocks = false;
            $scope.setToolbar($location.$$path,"Comunidad");
            
            function _initCommunityModals() {
                return {
                    "isTextCollapsed":true,
                    "isLinkCollapsed":true,
                    "isVideoCollapsed":true,
                    "isAttachmentCollapsed":true,
                    "isReportCollapsed":true
                };
            };
            
            function _initCommunity() {
                
                $scope.$emit('ShowPreloader');
                moodleFactory.Services.GetAsyncForumDiscussions(_course.community.coursemoduleid, initCommunitySuccessCallback, initCommunityErrorCallback, true);
                
                function initCommunitySuccessCallback (data, key) {
                    $scope.discussion = data.discussions[0];
                    $scope.forumId = data.forumid;

                    moodleFactory.Services.GetAsyncDiscussionPosts(_currentUser.token, $scope.discussion.id, $scope.discussion.discussion, $scope.forumId, _postPager.from, _postPager.to, 1, _currentFilter, getAsyncDiscussionPostsCallback, function() {}, true);
                };
                function initCommunityErrorCallback (data) { $scope.$emit('HidePreloader'); };
            }
            
            $scope.collapseCommunityButtomsTrigger = function(element, callFileBrowser) {
                callFileBrowser ? clickPostAttachment(): '';
                _uncollapse(element, $scope.communityModals);
            };
            
            $scope.showPreviousCommentsByPost = function(postId) {
                $scope.showedCommentsByPost["id" + postId] = 1000000;
            };
            
            $scope.showMorePosts = function() {
                $scope.$emit('ShowPreloader');
                moodleFactory.Services.GetAsyncDiscussionPosts(_currentUser.token, $scope.discussion.id, $scope.discussion.discussion, $scope.forumId, _postPager.from, _postPager.to, 0, _currentFilter, getAsyncDiscussionPostsCallback, null, true);
            };
            
            var getAsyncDiscussionPostsCallback = function(data, key) {
                
                _postPager.from = data.sinceid;
                _postPager.to = _postPager.to < data.maxid ? data.maxid : _postPager.to;
                
                var posts = data.posts;
                $scope.morePendingPosts = posts.length === 10;
                posts.forEach(initializeCommentsData);
                $scope.posts.sort(function(a, b) { return Number(b.post_id) - Number(a.post_id); });
                $scope.$emit('HidePreloader');
            };
            
            $scope.updateFilter = function() {
                
                if (_currentFilter != $scope.filter) {
                    
                    _currentFilter = $scope.filter;
                    _postPager.from = 0;
                    _postPager.to = 0;
                    
                    $scope.posts = new Array();
                    $scope.$emit('ShowPreloader');
                    moodleFactory.Services.GetAsyncDiscussionPosts(_currentUser.token, $scope.discussion.id, $scope.discussion.discussion, $scope.forumId, _postPager.from, _postPager.to, 1, _currentFilter, getAsyncDiscussionPostsCallback, function() {}, true);
                }
            };
            
            var initializeCommentsData = function(element, index, array){
                $scope.isCommentModalCollapsed["id" + element.post_id] = false;
                $scope.isReportedAbuseModalCollapsed["id" + element.post_id] = false;
                $scope.isReportedAbuseSentModalCollapsed["id" + element.post_id] = false;
                
                if ($scope.showedCommentsByPost['id' + element.post_id] != 1000000) {
                    $scope.showedCommentsByPost['id' + element.post_id] = 3;   
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
            
            var refreshTopicData = function() {
                moodleFactory.Services.GetAsyncDiscussionPosts(_currentUser.token, $scope.discussion.id, $scope.discussion.discussion, $scope.forumId, _postPager.from, _postPager.to, 0, _currentFilter, getAsyncDiscussionPostsCallback, null, true);
            };
            
            $scope.reportPost = function(postId) {
                var createdDate = new Date();
                
                var requestData = {
                    "postid": postId,
                    "userid": _userId,
                    "create": createdDate.getMilliseconds(),
                    "forumid": $scope.forumId,
                    "discussionid": $scope.discussion.discussion,
                };
                
                $scope.$emit('ShowPreloader');
                moodleFactory.Services.PostAsyncReportAbuse(null, requestData, function(){
                    
                    $scope.$emit('HidePreloader');
                    $scope.isReportedAbuseModalCollapsed["id" + postId] = false;
                    $scope.isReportedAbuseSentModalCollapsed["id" + postId] = true;
                    
                    }, function(){ $scope.$emit('HidePreloader'); }, true);
            };
            
            $scope.likePost = function(postId) {
                var post = _.find($scope.posts, function(a){ return a.post_id == postId });
                
                if(post.liked == 0) {
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
            
            $scope.replyToPost = function(that, parentId, topicId, isCommentModalCollapsedIndex) {
                
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
                        $scope.replyText = null;
                        $scope.isCommentModalCollapsed[isCommentModalCollapsedIndex] = false;
                        refreshTopicData();
                    },
                    function(){
                        $scope.replyText = null;
                        $scope.isCommentModalCollapsed[isCommentModalCollapsedIndex] = false;
                    }
                );
            };

            $scope.postText = function() {
                
                var requestData = {
                    "userid": _userId,
                    "discussionid": $scope.discussion.discussion,
                    "parentid": $scope.discussion.id,
                    "message": $scope.postTextValue,
                    "createdtime": $filter("date")(new Date(), "MM/dd/yyyy"),
                    "modifiedtime": $filter("date")(new Date(), "MM/dd/yyyy"),
                    "posttype": 1,
                    "fileToUpload": null
                };
                
                $scope.$emit('ShowPreloader');
                moodleFactory.Services.PostAsyncForumPost ('new_post', requestData,
                    function() {
                        $scope.postTextValue = null;
                        $scope.collapseCommunityButtomsTrigger('isTextCollapsed');
                        refreshTopicData();
                    },
                    function(){
                        $scope.postTextValue = null;
                        $scope.collapseCommunityButtomsTrigger('isTextCollapsed');
                    }
                );
            };
            
            $scope.postLink = function() {
                
                var requestData = {
                    "userid": _userId,
                    "discussionid": $scope.discussion.discussion,
                    "parentid": $scope.discussion.id,
                    "message": $scope.postLinkValue,
                    "createdtime": $filter("date")(new Date(), "MM/dd/yyyy"),
                    "modifiedtime": $filter("date")(new Date(), "MM/dd/yyyy"),
                    "posttype": 2,
                    "fileToUpload": null
                };
                
                $scope.$emit('ShowPreloader');
                moodleFactory.Services.PostAsyncForumPost ('new_post', requestData,
                    function() {
                        $scope.postLinkValue = null;
                        $scope.collapseCommunityButtomsTrigger('isLinkCollapsed');
                        refreshTopicData();
                    },
                    function() {
                        $scope.postLinkValue = null;
                        $scope.collapseCommunityButtomsTrigger('isLinkCollapsed');
                    });
            };
            
            $scope.postVideo = function() {
                
                var requestData = {
                    "userid": _userId,
                    "discussionid": $scope.discussion.discussion,
                    "parentid": $scope.discussion.id,
                    "message": $scope.postVideoValue,
                    "createdtime": $filter("date")(new Date(), "MM/dd/yyyy"),
                    "modifiedtime": $filter("date")(new Date(), "MM/dd/yyyy"),
                    "posttype": 3,
                    "fileToUpload": null
                };
                
                moodleFactory.Services.PostAsyncForumPost ('new_post', requestData,
                    function() {
                        $scope.postVideoValue = null;
                        $scope.collapseCommunityButtomsTrigger('isVideoCollapsed');
                        refreshTopicData();
                    },
                    function() {
                        $scope.postVideoValue = null;
                        $scope.collapseCommunityButtomsTrigger('isVideoCollapsed');
                    });
            };
            
            $scope.postAttachment = function() {
                
                var requestData = {
                    "userid": _userId,
                    "discussionid": $scope.discussion.discussion,
                    "parentid": $scope.discussion.id,
                    "message": '',
                    "createdtime": $filter('date')(new Date(), 'MM/dd/yyyy'),
                    "modifiedtime": $filter('date')(new Date(), 'MM/dd/yyyy'),
                    "posttype": 4,
                    "filecontent":$scope.postAttachmentValue.image,
                    "filename": _userId + $scope.postAttachmentValue.fileName,
                    "picture_post_author": _userProfile.profileimageurlsmall
                };

                $scope.$emit('ShowPreloader');
                moodleFactory.Services.PostAsyncForumPost ('new_post', requestData,
                    function() {
                        $scope.postAttachmentValue = {};
                        $scope.collapseCommunityButtomsTrigger('isAttachmentCollapsed');
                        refreshTopicData();
                    },
                    function() {
                        $scope.postAttachmentValue = {};
                        $scope.collapseCommunityButtomsTrigger('isAttachmentCollapsed');
                    });
            };
            
            $scope.clickPostAttachment = function(){
                clickPostAttachment();
            };
            
            clickPostAttachment = function(){
                cordova.exec(SuccessAttachment, FailureAttachment, "CallToAndroid", "AttachPicture", []);
            };

            var SuccessAttachment = function (data) {
                $scope.postAttachmentValue = data;
            }

            var FailureAttachment = function(data) {

            }
            
            $scope.back = function () {
                $location.path('/ProgramaDashboard');
            };
            
            var _uncollapse = function(element, elementsArray){
                for(var key in elementsArray){
                    key==element? elementsArray[key] = !elementsArray[key] : elementsArray[key] = true;
                };
            };
            
            $scope.scrollToTop();
            _initCommunity();
            
        }]);