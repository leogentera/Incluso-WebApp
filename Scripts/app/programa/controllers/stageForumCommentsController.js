angular
    .module('incluso.stage.forumcommentscontroller', ['GlobalAppConstants', 'naif.base64'])
    .filter('reverse', function() {
        return function(items) {
            return items.slice().reverse();
        };
    })
    .controller('stageForumCommentsController', [
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

            _httpFactory = $http;
            _timeout = $timeout;
            $scope.$emit('ShowPreloader');
            $rootScope.pageName = "Estación: Conócete"
            $rootScope.navbarBlue = true;
            $rootScope.showToolbar = true;
            
            $scope.setToolbar($location.$$path,"");
            $rootScope.showFooter = true;
            $rootScope.showFooterRocks = false;

            $scope.userToken = JSON.parse(localStorage.getItem('CurrentUser')).token;
            $scope.liked = null;
            $scope.moodleId = $routeParams.moodleid;
            
            var showMoreCounter = 1;
            $scope.morePendingPosts = true;
            $scope.showAllCommentsByPost = new Array();
            $scope.posts = new Array();

            $scope.scrollToTop();

            $scope.forumModals = {
                "isTextCollapsed":true,
                "isLinkCollapsed":true,
                "isVideoCollapsed":true,
                "isAttachmentCollapsed":true
            };

            var profile = JSON.parse(localStorage.getItem("profile"));
            $scope.clickLikeButton = function(postId){
                var post = _.find($scope.discussion.posts[0].replies, function(a){
                    return a.post_id == postId
                }) ;
                if(post.liked == 0){
                    post.liked = 1;
                    post.likes = parseInt(post.likes) + 1;
                }
                else{
                    post.liked = 0;
                    post.likes = parseInt(post.likes) - 1;
                }                
                var userIdObject = {'userid': JSON.parse(localStorage.getItem('userId'))};
                moodleFactory.Services.PutForumPostLikeNoCache(postId, userIdObject,
                    function(){

                    },
                    function(){

                    } );
            };

            function getForumsProgress(){
                var forumsProgress = localStorage.getItem('currentForumsProgress')? JSON.parse(localStorage.getItem('currentForumsProgress')) : new Array();
                return forumsProgress;

            };

            function updateForumProgress(discussionId){
                var forumsCommentsCountCollection = getForumsProgress();
                var alreadyCommented = _.find(forumsCommentsCountCollection, function(forum){ return forum.discussion_id == discussionId; });
                alreadyCommented? alreadyCommented.replies_counter++ : forumsCommentsCountCollection.push({'discussion_id':discussionId, 'replies_counter':1});
                _setLocalStorageJsonItem('currentForumsProgress', forumsCommentsCountCollection);
            };

            var getForumsExtraPointsCounter = function(){
                var forumExtraPointsCounter = JSON.parse(localStorage.getItem('extraPointsForums'));
                return forumExtraPointsCounter;
            };

            var addExtraForumParticipation = function(discussionId){
                console.log('Discussion ID: ' + discussionId);
              var extraPointsCounter = getForumsExtraPointsCounter();
                var currentDiscussionCounter = _.find(extraPointsCounter, function(discussion){ return discussion.discussion_id == discussionId; });
                currentDiscussionCounter.extra_replies_counter++;
                //extraPointsCounter.push({"discussion_id":currentDiscussion.post_id, "replies_counter":0});
                _setLocalStorageJsonItem('extraPointsForums', extraPointsCounter);

            };

            var checkForumProgress = function(callback){
                var forumsCommentsCountCollection = getForumsProgress();
                var isActivityFinished = null;
                console.log('Checking forum progress');
                callback();
                $scope.currentActivity = JSON.parse(moodleFactory.Services.GetCacheObject("activity/" + $routeParams.moodleid));

                var numberOfDiscussionsWithMoreThan2Replies = _.filter(forumsCommentsCountCollection, function(d) { return d.replies_counter >= 2});
                isActivityFinished = Number(numberOfDiscussionsWithMoreThan2Replies.length) == Number($scope.currentActivity.discussions.length);

                var activity_identifier = null;
                if($scope.moodleId == 151){
                    activity_identifier = 1010;
                    moodleid = 64;
                } else if($scope.moodleId == 64){
                    activity_identifier = 1010;
                    moodleid = 64;
                } else if($scope.moodleId == 73){
                    activity_identifier = 1008;
                    moodleid = 73;
                } else if($scope.moodleId == 147){
                    activity_identifier = 1049;
                    moodleid = 147;
                } else if($scope.moodleId == 148){
                    activity_identifier = 1049;
                    moodleid = 148;

                }
                var moodleid;

               var activityFromTree = getActivityByActivity_identifier(activity_identifier);
                if(activityFromTree.status == 1){
                    addExtraForumParticipation($scope.discussion.post_id);
                    var extraPointsCounter = getForumsExtraPointsCounter();
                    var currentDiscussionCounter = _.find(extraPointsCounter, function(discussion){ return discussion.discussion_id == $scope.discussion.post_id; });
                    if(currentDiscussionCounter.extra_replies_counter <= 10){
                        updateUserStars(activity_identifier, 50 );
                    }else{}

                    //var commentsCounterCollection = getForumsProgress();
                    //var totalCommentsCounter = 0;
                    //for(var i = 0 ; i < commentsCounterCollection.length ; i++){
                    //    totalCommentsCounter += Number(commentsCounterCollection[i].replies_counter);
                    //}
                    //var totalTopics = commentsCounterCollection.length;
                    //var extraPoints = totalCommentsCounter - (totalTopics * 2);
                    //extraPoints > 10? extraPoints = 10 : '';
                    //var totalExtraPoints = 100 + (extraPoints*50);
                    //
                    ////updateUserStars(activity_identifier, totalExtraPoints );
                }else{}

                if (isActivityFinished && activityFromTree && activityFromTree.status == 0) {
                    $location.path('/ZonaDeVuelo/ForoCierre/' + activity_identifier);                    
                } else {
                   callback();
                }

            };

            var _uncollapse = function(element, elementsArray){
                for(var key in elementsArray){
                    key==element? elementsArray[key] = !elementsArray[key] : elementsArray[key] = true;
                };
            };
            $scope.collapseForumButtomsTrigger = function(element){
                _uncollapse(element, $scope.forumModals);
            };

            var createReplyDataObject = function( parentId, message, postType){
                var userId = localStorage.getItem("userId");    

                var dataObject= {
                    "userid":userId,
                    "discussionid": $scope.discussion.discussion_id,
                    "parentid": parentId,
                    "message": message,
                    "createdtime": $filter('date')(new Date(), 'MM/dd/yyyy'),
                    "modifiedtime": $filter('date')(new Date(), 'MM/dd/yyyy'),
                    "posttype": postType,
                    "fileToUpload":""
                };
                return dataObject;
            };

            $scope.isCommentModalCollapsed= [];
            $scope.replyText = null;
            $scope.replyToPost = function(that, parentId, topicId, isCommentModalCollapsedIndex){
                var dataObejct = createReplyDataObject(parentId, that.replyText, 1);
                $scope.$emit('ShowPreloader');
                moodleFactory.Services.PostAsyncForumPost ('reply', dataObejct,
                    function(){
                        $scope.textToPost=null;
                        //$scope.isCommentModalCollapsed[isCommentModalCollapsedIndex] = true;
                        $scope.isCommentModalCollapsed[isCommentModalCollapsedIndex] = false;
                        $scope.discussion.replies = $scope.discussion.replies + 1;   //add a new reply to the current discussion
                        updateForumProgress(topicId);
                        $scope.$emit('ShowPreloader');
                        checkForumProgress(refreshTopicData);
                    },
                    function(){
                        $scope.textToPost=null;
                        //$scope.isCommentModalCollapsed[isCommentModalCollapsedIndex] = true;
                        $scope.isCommentModalCollapsed[isCommentModalCollapsedIndex] = false;
                        $scope.$emit('HidePreloader');
                    });
            };

            $scope.textToPost = null;
            $scope.linkToPost = null;
            $scope.videoToPost = null;
            $scope.attachmentToPost = null;

            var createPostDataObject = function(message, postType, attachment){
                var userId = localStorage.getItem("userId");
                var dataObject = {
                    "userid":userId,
                    "discussionid": $scope.discussion.discussion_id,
                    "parentid": $scope.discussion.post_id,
                    "message": message,
                    "createdtime": $filter('date')(new Date(), 'MM/dd/yyyy'),
                    "modifiedtime": $filter('date')(new Date(), 'MM/dd/yyyy'),
                    "posttype": postType,
                    "fileToUpload": attachment? attachment.base64 : null
                };
                return dataObject;
            };

            $scope.postTextToForum = function(){
                var dataObject = createPostDataObject($scope.textToPost, 1, null);
                $scope.$emit('ShowPreloader');
                moodleFactory.Services.PostAsyncForumPost ('new_post', dataObject,
                    function(){
                        $scope.textToPost='';
                        $scope.textToPost=null;
                        $scope.collapseForumButtomsTrigger('isTextCollapsed');
                        updateForumProgress($scope.discussion.post_id);
                        //refreshTopicData();
                        checkForumProgress(refreshTopicData);
                    },
                    function(){
                        $scope.textToPost=null;
                        $scope.collapseForumButtomsTrigger('isTextCollapsed');
                        $scope.$emit('HidePreloader');
                    });
            };
            $scope.postLinkToForum = function(){
                var dataObject = createPostDataObject($scope.linkToPost, 2, null);
                $scope.$emit('ShowPreloader');
                moodleFactory.Services.PostAsyncForumPost ('new_post', dataObject,
                    function(){
                        $scope.linkToPost = null;
                        $scope.collapseForumButtomsTrigger('isLinkCollapsed');
                        updateForumProgress($scope.discussion.post_id);
                        //refreshTopicData();
                        checkForumProgress(refreshTopicData);
                    },
                    function(){
                        $scope.linkToPost = null;
                        $scope.collapseForumButtomsTrigger('isLinkCollapsed');
                        $scope.$emit('HidePreloader');
                    });
            };
            $scope.postVideoToForum = function(){
                var dataObject = createPostDataObject($scope.videoToPost, 3, null);
                $scope.$emit('ShowPreloader');
                moodleFactory.Services.PostAsyncForumPost ('new_post', dataObject,
                    function(){
                        $scope.videoToPost = null;
                        $scope.collapseForumButtomsTrigger('isVideoCollapsed');
                        updateForumProgress($scope.discussion.post_id);
                        //refreshTopicData();
                        checkForumProgress(refreshTopicData);
                    },
                    function(){
                        $scope.videoToPost = null;
                        $scope.collapseForumButtomsTrigger('isVideoCollapsed');
                    });
            };
            $scope.clickPostAttachment = function(){
                clickPostAttachment();
            };
            clickPostAttachment = function(){
                cordova.exec(SuccessAttachment, FailureAttachment, "CallToAndroid", "AttachPicture", []);
            };

            var SuccessAttachment = function (data) {
                $scope.attachmentToPost = data;
            }

            var FailureAttachment = function(data) {

            }
            $scope.postAttachmentToForum = function(){
                var userId = localStorage.getItem("userId");
                var dataObject = {
                    "userid":userId,
                    "discussionid": $scope.discussion.discussion_id,
                    "parentid": $scope.discussion.post_id,
                    "message": '',
                    "createdtime": $filter('date')(new Date(), 'MM/dd/yyyy'),
                    "modifiedtime": $filter('date')(new Date(), 'MM/dd/yyyy'),
                    "posttype": 4,
                    "filecontent":$scope.attachmentToPost.image,
                    "filename": userId + $scope.attachmentToPost.fileName,
                    "picture_post_author": profile.profileimageurlsmall
                };

                $scope.$emit('ShowPreloader');
                moodleFactory.Services.PostAsyncForumPost ('new_post', dataObject,
                    function(){
                        $scope.attachmentToPost = null;
                        $scope.collapseForumButtomsTrigger('isAttachmentCollapsed');
                        updateForumProgress($scope.discussion.post_id);
                        //refreshTopicData();
                        checkForumProgress(refreshTopicData);
                    },
                    function(){
                        $scope.videoToPost = null;
                        $scope.collapseForumButtomsTrigger('isAttachmentCollapsed');
                        $scope.$emit('HidePreloader');
                    });
            };

            function getTopicData() {
                $scope.activity = JSON.parse(moodleFactory.Services.GetCacheObject("forum/" + $routeParams.moodleid ));
                $scope.discussion = _.find($scope.activity.discussions, function(d){ return d.discussion == $routeParams.discussionId; });

                //var postsKey = "discussion/" + $scope.discussion.id + $scope.discussion.discussion + $scope.activity.forumid + 1;
                //$scope.posts = oodleFactory.Services.GetCacheObject(postsKey) != null ? JSON.parse(moodleFactory.Services.GetCacheObject(postsKey)) : new Array();
                
                getPostsDataAsync();
            }
            
            function getPostsDataAsync() {
                moodleFactory.Services.GetAsyncDiscussionPosts($scope.discussion.id, $scope.discussion.discussion, $scope.activity.forumid, 1, getPostsDataCallback, null, true);
            }
            
            function getPostsDataCallback(posts, key) {
                $scope.morePendingPosts = posts.length === 10;
                posts.forEach(initializeCommentsData);
                $scope.$emit('HidePreloader');
            }

            var initializeCommentsData = function(element, index, array){
                $scope.isCommentModalCollapsed[index] = false;
                console.log(element.post_id);
                
                $scope.showAllCommentsByPost[element.post_id] = 3;
                $scope.posts.push(element);
            };

            var refreshTopicData = function(){   
                moodleFactory.Services.GetAsyncForumInfo($routeParams.moodleid, $scope.userToken, getActivityInfoCallback, null, true);
            };

            function getActivityInfoCallback(data) {
                $scope.activity = JSON.parse(moodleFactory.Services.GetCacheObject("activity/" + $routeParams.moodleid ));
                console.log($scope.activity);
                $scope.discussion = _.find($scope.activity.discussions, function(d){ return d.discussion_id == $routeParams.discussionId; });
                var posts = $scope.discussion.posts[0].replies? $scope.discussion.posts[0].replies : new Array();
                //posts.forEach(createModalReferences);
                $scope.isCommentModalCollapsed.push(false);
                $scope.isCommentModalCollapsed.reverse();
                $scope.$emit('HidePreloader');
            }

            var createModalReferences = function(element, index, array){
                $scope.isCommentModalCollapsed[element.post_id] = true;
            };

            getTopicData();
            
            $scope.showPreviousComments = function(postId) {
            
                $scope.showAllCommentsByPost[postId] = 1000000;
            };
            
            $scope.showMore = function() {
                showMoreCounter++;
                
                $scope.$emit('ShowPreloader');
                moodleFactory.Services.GetAsyncDiscussionPosts($scope.discussion.id, $scope.discussion.discussion, $scope.activity.forumid, showMoreCounter, getPostsDataCallback, null, true);
            };

            $scope.back = function () {

                switch ($routeParams.moodleid) {
                    case "64":
                        $location.path('ZonaDeVuelo/Conocete/PuntoDeEncuentro/Topicos/' + $routeParams.moodleid);
                        break;
                    case "73":
                        $location.path("/ZonaDeVuelo/MisSuenos/PuntosDeEncuentro/Topicos/" + $routeParams.moodleid);
                        break;
                    default:
                        $location.path("/ZonaDeVuelo/Conocete/ZonaDeContacto/Artisticos/Topicos/" + $routeParams.moodleid);
                        break;
                }
            };

            function getDataAsync() {
                moodleFactory.Services.GetAsyncUserCourse(_getItem("userId"), getDataAsyncCallback, errorCallback, true);
                $scope.$emit('HidePreloader');
            }

            function getDataAsyncCallback(){
                $scope.usercourse = JSON.parse(localStorage.getItem("usercourse"));
                moodleFactory.Services.GetAsyncCourse($scope.usercourse.courseid, function(){
                    $scope.course = JSON.parse(localStorage.getItem("course"));
                    $scope.currentStage = JSON.parse(localStorage.getItem('currentStage')); //getCurrentStage();
                    _setLocalStorageItem("currentStage", $scope.currentStage);

                }, errorCallback);
            }

            function errorCallback(data){

                $scope.$emit('scrollTop');
            }
        }]);

