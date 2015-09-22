angular
    .module('incluso.stage.forumcommentscontroller', ['GlobalAppConstants'])
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
            $scope.moodleId = getMoodleIdFromTreeActivity( $routeParams.activityId);
            
            var showMoreCounter = 1;
            var postPager = { from: 0, to: 0 };
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

            var profile = JSON.parse(localStorage.getItem("profile/" + moodleFactory.Services.GetCacheObject("userId")));
            $scope.clickLikeButton = function(postId){
                var post = _.find($scope.posts, function(a){
                    return a.post_id == postId
                });
                
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

            function updateForumProgress() {

                var forumsCommentsCountCollection = getForumsProgress();
                var alreadyCommented = _.find(forumsCommentsCountCollection, function(forum){ return forum.discussion_id == $scope.discussion.id; });
                alreadyCommented? alreadyCommented.replies_counter++ : forumsCommentsCountCollection.push({'discussion_id': $scope.discussion.id, 'replies_counter':1});
                _setLocalStorageJsonItem('currentForumsProgress', forumsCommentsCountCollection);
            };

            var getForumsExtraPointsCounter = function(){
                var forumExtraPointsCounter = JSON.parse(localStorage.getItem('extraPointsForums'));
                return forumExtraPointsCounter;
            };

            var addExtraForumParticipation = function(discussionId){
              var extraPointsCounter = getForumsExtraPointsCounter();
                var currentDiscussionCounter = _.find(extraPointsCounter, function(discussion){ return discussion.discussion_id == discussionId; });
                if(currentDiscussionCounter){
                    currentDiscussionCounter.extra_replies_counter++;
                } else {
                    extraPointsCounter.push({'discussion_id':discussionId, 'extra_replies_counter':1});
                }

                _setLocalStorageJsonItem('extraPointsForums', extraPointsCounter);
            };

            var checkForumProgress = function(callback){
                var forumsCommentsCountCollection = getForumsProgress();
                var isActivityFinished = null;

                $scope.currentActivity = JSON.parse(moodleFactory.Services.GetCacheObject("forum/" + $scope.moodleId));

                var numberOfDiscussionsWithMoreThan2Replies = _.filter(forumsCommentsCountCollection, function(d) { return d.replies_counter >= 2});
                isActivityFinished = Number(numberOfDiscussionsWithMoreThan2Replies.length) == Number($scope.currentActivity.discussions.length);
                debugger;
                //var activity_identifier = null;
                //if($scope.moodleId == 151){
                //    activity_identifier = 1010;
                //    moodleid = 64;
                //} else if($scope.moodleId == 64){
                //    activity_identifier = 1010;
                //    moodleid = 64;
                //} else if($scope.moodleId == 73){
                //    activity_identifier = 1008;
                //    moodleid = 73;
                //} else if($scope.moodleId == 147){
                //    activity_identifier = 1049;
                //    moodleid = 147;
                //} else if($scope.moodleId == 148){
                //    activity_identifier = 1049;
                //    moodleid = 148;
                //} else if($scope.moodleId == 179){
                //    activity_identifier = 2008;
                //    moodleid = 178;
                //} else if($scope.moodleId == 85){
                //    activity_identifier = 2018;
                //    moodleid = 197;
                //} else if($scope.moodleId == 93){
                //    activity_identifier = 3304;
                //    moodleid = 93;
                //} else if($scope.moodleId == 91){
                //    activity_identifier = 3304;
                //    moodleid = 93;
                //}

                //var activityFromTree = getActivityAtAnyCost(activity_identifier, moodleid).activity;
                var activityFromTree = getActivityByActivity_identifier($routeParams.activityId);

                if(activityFromTree.status == 1){
                    addExtraForumParticipation($scope.discussion.id);
                    var extraPointsCounter = getForumsExtraPointsCounter();
                    var currentDiscussionCounter = _.find(extraPointsCounter, function(discussion){ return discussion.discussion_id == $scope.discussion.id; });
                    if(currentDiscussionCounter.extra_replies_counter <= 10) {
                        updateUserStars($routeParams.activityId, 50 );
                        //updateUserStars(moodleid, 50 );
                    }
                }

                if (isActivityFinished && activityFromTree && activityFromTree.status == 0) {
                    switch ($scope.moodleId) {
                        case "179":
                                $location.path('/ZonaDeNavegacion/ForoCierre/' + $routeParams.activityId +'/'+ 178);
                            break;
                        case "85":
                            $location.path('/ZonaDeNavegacion/ForoCierre/' + $routeParams.activityId);
                            break;
                        default :
                            $location.path('/ZonaDeVuelo/ForoCierre/' + $routeParams.activityId);
                    }
                } else {
                   callback();
                }
            };

            var _uncollapse = function(element, elementsArray){
                for(var key in elementsArray){
                    key==element? elementsArray[key] = !elementsArray[key] : elementsArray[key] = true;
                };
            };
            $scope.collapseForumButtomsTrigger = function(element, callFileBrowser){
                callFileBrowser?clickPostAttachment():'';
                _uncollapse(element, $scope.forumModals);
            };

            var createReplyDataObject = function( parentId, message, postType){
                var userId = localStorage.getItem("userId");
                
                var dataObject= {
                    "userid":userId,
                    "discussionid": $scope.discussion.discussion,
                    "parentid": parentId,
                    "message": message,
                    "createdtime": $filter('date')(new Date(), 'MM/dd/yyyy HH:mm:ss'),
                    "modifiedtime": $filter('date')(new Date(), 'MM/dd/yyyy HH:mm:ss'),
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
                        updateForumProgress();
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
                    "discussionid": $scope.discussion.discussion,
                    "parentid": $scope.discussion.id,
                    "message": message,
                    "createdtime": $filter('date')(new Date(), 'MM/dd/yyyy HH:mm:ss'),
                    "modifiedtime": $filter('date')(new Date(), 'MM/dd/yyyy HH:mm:ss'),
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
                        debugger;
                        updateForumProgress();
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
                        updateForumProgress();
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
                        updateForumProgress();
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
                    "discussionid": $scope.discussion.discussion,
                    "parentid": $scope.discussion.id,
                    "message": '',
                    "createdtime": $filter('date')(new Date(), 'MM/dd/yyyy HH:mm:ss'),
                    "modifiedtime": $filter('date')(new Date(), 'MM/dd/yyyy HH:mm:ss'),
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
                        updateForumProgress();
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
                $scope.activity = JSON.parse(moodleFactory.Services.GetCacheObject("forum/" + $scope.moodleId ));
                $scope.discussion = _.find($scope.activity.discussions, function(d){ return d.discussion == $routeParams.discussionId; });
                
                moodleFactory.Services.GetAsyncDiscussionPosts(moodleFactory.Services.GetCacheJson("CurrentUser").token, $scope.discussion.id, $scope.discussion.discussion, $scope.activity.forumid, postPager.from, postPager.to, 1, "default", getPostsDataCallback, null, true);
            }
            
            function getPostsDataCallback(data, key) {
                
                postPager.from = (postPager.from < 0 && postPager.from < data.maxid) ? postPager.from : data.maxid;
                postPager.to = postPager.to > data.sinceid ? postPager.to : data.sinceid;
                
                var posts = data.posts;
                $scope.morePendingPosts = posts.length === 10;
                posts.forEach(initializeCommentsData);
                $scope.posts.sort(function(a, b) { return Number(b.post_id) - Number(a.post_id); });
                $scope.$emit('HidePreloader');
            }

            var initializeCommentsData = function(element, index, array){
                $scope.isCommentModalCollapsed[index] = false;
                
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

            var refreshTopicData = function(){
                console.log("refreshTopicData");
                moodleFactory.Services.GetAsyncDiscussionPosts(moodleFactory.Services.GetCacheJson("CurrentUser").token, $scope.discussion.id, $scope.discussion.discussion, $scope.activity.forumid, postPager.from, postPager.to, 1, "default", getPostsDataCallback, null, true);
            };

            function getActivityInfoCallback(data) {
                $scope.activity = JSON.parse(moodleFactory.Services.GetCacheObject("forum/" + $routeParams.moodleid ));
                $scope.discussion = _.find($scope.activity.discussions, function(d){ return d.discussion == $routeParams.discussionId; });
                
                var postsKey = "discussion/" + $scope.discussion.id + $scope.discussion.discussion + $scope.activity.forumid + 0 + 0 + 1;
                $scope.posts = moodleFactory.Services.GetCacheObject(postsKey) != null ? JSON.parse(moodleFactory.Services.GetCacheObject(postsKey)) : new Array();
                
                posts.forEach(initializeCommentsData);
                $scope.posts.sort(function(a, b) { return Number(b.post_id) - Number(a.post_id); });
                $scope.isCommentModalCollapsed.push(false);
                $scope.isCommentModalCollapsed.reverse();
                $scope.$emit('HidePreloader');
            }

            var createModalReferences = function(element, index, array){
                $scope.isCommentModalCollapsed[element.post_id] = true;
            };

            getTopicData();
            
            $scope.showPreviousComments = function(postId) {
            
                $scope.showAllCommentsByPost['id' + postId] = 1000000;
            };
            
            $scope.showMore = function() {
                showMoreCounter++;
                
                $scope.$emit('ShowPreloader');
                moodleFactory.Services.GetAsyncDiscussionPosts(moodleFactory.Services.GetCacheJson("CurrentUser").token, $scope.discussion.id, $scope.discussion.discussion, $scope.activity.forumid, postPager.from, postPager.to, 0, "default", getPostsDataCallback, null, true);
            };

            $scope.back = function () {
                var moodleId = getMoodleIdFromTreeActivity($routeParams.activityId);

                switch (moodleId) {
                    case 64:
                        $location.path('ZonaDeVuelo/Conocete/PuntoDeEncuentro/Topicos/' + $routeParams.activityId);
                        break;
                    case 73:
                        $location.path("/ZonaDeVuelo/MisSuenos/PuntosDeEncuentro/Topicos/" + $routeParams.activityId);
                        break;
                    case 197:
                        $location.path("/ZonaDeVuelo/MisSuenos/PuntosDeEncuentro/Topicos/" + $routeParams.activityId);
                        break;
                    case 85:
                        $location.path("/ZonaDeNavegacion/ProyectaTuVida/PuntoDeEncuentro/Topicos/" + $routeParams.activityId);
                        break;
                    case 93:
                        $location.path("/ZonaDeAterrizaje/EducacionFinanciera/PuntoDeEncuentro/Topicos/" + $routeParams.activityId);
                        break;
                    case 179:
                        $location.path("/ZonaDeNavegacion/Transformate/PuntoDeEncuentro/Topicos/" + $routeParams.activityId);
                        break;
                    case 91:
                        $location.path("/ZonaDeAterrizaje/MapaDelEmprendedor/PuntoDeEncuentro/Topicos/" + $routeParams.activityId);
                        break;
                    default:
                        $location.path("/ZonaDeNavegacion/ProyectaTuVida/PuntoDeEncuentro/Topicos/" + $routeParams.activityId);
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

