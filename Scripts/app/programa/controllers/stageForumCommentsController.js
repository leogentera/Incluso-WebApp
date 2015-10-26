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
            $rootScope.showStage1Footer = false;
            $rootScope.showStage2Footer = false;
            $rootScope.showStage3Footer = false;
            
            console.log("moodle id" + $scope.moodleId);

            $scope.userToken = JSON.parse(localStorage.getItem('CurrentUser')).token;
            $scope.liked = null;
            $scope.moodleId;
            console.log($routeParams.activityId);
            Number($routeParams.activityId) == 1049? $scope.moodleId = $routeParams.moodleId     : $scope.moodleId = getMoodleIdFromTreeActivity($routeParams.activityId);
            console.log("$scope.moodleId" + $scope.moodleId);
            $scope.currentActivity = JSON.parse(moodleFactory.Services.GetCacheObject("forum/" + $scope.moodleId));
            $scope.currentDiscussionsIds = loadCurrentDiscussions();
            $scope.currentDiscussionsExtraPoints;
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
            
            function loadCurrentDiscussions() {
                var array = new Array();
                
                var discussions = $scope.currentActivity.discussions;
                
                for(var d = 0; d < discussions.length; d++) {
                    array.push(discussions[d].id);
                }
                
                return array;
            }

            function getForumsProgress(){
                var forumsProgress = localStorage.getItem('currentForumsProgress/' + localStorage.getItem("userId"))? JSON.parse(localStorage.getItem('currentForumsProgress/' + localStorage.getItem("userId"))) : new Array();
                return forumsProgress;
            };

            function updateForumProgress() {
                var forumsCommentsCountCollection = getForumsProgress();
                var alreadyCommented = _.find(forumsCommentsCountCollection, function(forum){ return forum.discussion_id == $scope.discussion.id; });
                if(alreadyCommented){
                    alreadyCommented.replies_counter++;
                    alreadyCommented.replies_counter > 2? addExtraForumParticipation($scope.currentActivity.forumid) : '';
                } else {
                    forumsCommentsCountCollection.push({'discussion_id': $scope.discussion.id, 'replies_counter':1});
                }

                localStorage.setItem('currentForumsProgress/' + localStorage.getItem("userId"), JSON.stringify(forumsCommentsCountCollection));
            };

            var getForumsExtraPointsCounter = function(){
                var forumExtraPointsCounter = JSON.parse(localStorage.getItem('extraPointsForums/' + localStorage.getItem("userId")));
                return forumExtraPointsCounter;
            };

            var addExtraForumParticipation = function(forumId){
              var extraPointsCounter = getForumsExtraPointsCounter();
                var currentDiscussionCounter = _.find(extraPointsCounter, function(forum){ return Number(forum.forumId) == Number(forumId); });
                if(currentDiscussionCounter){
                    currentDiscussionCounter.extra_replies_counter++;
                } else {
                    extraPointsCounter.push({'forumId':forumId, 'extra_replies_counter':1});
                }

                localStorage.setItem('extraPointsForums/' + localStorage.getItem("userId"), JSON.stringify(extraPointsCounter));
            };

            var checkForumProgress = function(callback){
                var forumsCommentsCountCollection = getForumsProgress();
                var isActivityFinished = null;
                var numberOfDiscussionsWithMoreThan2Replies = _.filter(forumsCommentsCountCollection, function(d) { return d.replies_counter >= 2 && _.some($scope.currentDiscussionsIds, function(cdid) { return cdid === d.discussion_id; }) });
                console.log("numberOfDiscussionsWithMoreThan2Replies " + numberOfDiscussionsWithMoreThan2Replies.length);

                isActivityFinished = Number(numberOfDiscussionsWithMoreThan2Replies.length) == Number($scope.currentDiscussionsIds.length);

                var activityFromTree = getActivityByActivity_identifier($routeParams.activityId);
                var extraPointsCounter = getForumsExtraPointsCounter();
                var extraPointsCounter = getForumsExtraPointsCounter();
                var currentDiscussionCounter = _.find(extraPointsCounter, function(discussion){ return discussion.forumId == $scope.activity.forumid; });
                var extraPoints = currentDiscussionCounter? extraPoints = currentDiscussionCounter.extra_replies_counter : extraPoints = 0;

                    if (activityFromTree && activityFromTree.status == 1) {
                        if(extraPoints <= 10) {
                            updateUserStars($routeParams.activityId, 50 );
                        }
                    }
                    
                console.log("isActivityFinished " + isActivityFinished);
                console.log("activityFromTree.status " + activityFromTree.status);
                
                if (isActivityFinished && activityFromTree && activityFromTree.status == 0) {
                    extraPoints *= 50;
                    resetForumDiscussionsProgress();
                    console.log("before switch " + $scope.moodleId);
                    switch (Number($scope.moodleId)) {
                        case 73:
                            $location.path('/ZonaDeVuelo/ForoCierre/' + $routeParams.activityId +'/'+ $scope.discussion.id +'/'+ extraPoints +'/'+ $scope.moodleId);
                            break;
                        case 64:
                            $location.path('/ZonaDeVuelo/ForoCierre/' + $routeParams.activityId +'/'+ $scope.discussion.id +'/'+ extraPoints +'/'+ $scope.moodleId);
                            break;
                        case 149:
                                $location.path('/ZonaDeVuelo/ForoCierre/' + $routeParams.activityId +'/'+ $scope.discussion.id +'/'+ extraPoints +'/'+ $scope.moodleId);
                            break;
                        case 148:
                                $location.path('/ZonaDeVuelo/ForoCierre/' + $routeParams.activityId +'/'+ $scope.discussion.id +'/'+ extraPoints +'/'+ $scope.moodleId);
                            break;
                        case 147:
                                $location.path('/ZonaDeVuelo/ForoCierre/' + $routeParams.activityId +'/'+ $scope.discussion.id +'/'+ extraPoints +'/'+ $scope.moodleId);
                            break;

                        case 179:
                                console.log("location path");
                                $location.path('/ZonaDeNavegacion/ForoCierre/' + $routeParams.activityId +'/'+ $scope.discussion.id +'/'+ extraPoints +'/'+ $scope.moodleId);
                            break;
                        case 178:
                            console.log("location path 178");
                            $location.path('/ZonaDeNavegacion/ForoCierre/' + $routeParams.activityId +'/'+ $scope.discussion.id +'/'+ extraPoints +'/'+ $scope.moodleId);
                            break;
                        case 197:
                            $location.path('/ZonaDeNavegacion/ForoCierre/' + $routeParams.activityId +'/'+ $scope.discussion.id +'/'+ extraPoints +'/'+ $scope.moodleId);
                            break;
                        case 85:
                            $location.path('/ZonaDeNavegacion/ForoCierre/'+ $routeParams.activityId +'/'+ $scope.discussion.id +'/'+ extraPoints +'/'+ $scope.moodleId);
                            break;
                        default :
                            $location.path('/ZonaDeAterrizaje/ForoCierre/'+ $routeParams.activityId +'/'+ $scope.discussion.id +'/'+ extraPoints +'/'+ $scope.moodleId);
                            break;
                        $scope.scrollToTop();
                    }
                } else {
                   callback();
                }
            };
            
            function resetForumDiscussionsProgress() {
                var globalDiscussions = getForumsProgress();
                var discussionIds = $scope.currentDiscussionsIds;
                
                for(var gd = 0; gd < globalDiscussions.length; gd++) {
                    var isCurrentForumDiscussion = _.some(discussionIds, function(id) { return globalDiscussions[gd].discussion_id == id });
                    
                    if (isCurrentForumDiscussion) {
                        globalDiscussions[gd].replies_counter = 0;
                    }
                }
                
                localStorage.setItem('currentForumsProgress/' + localStorage.getItem("userId"), JSON.stringify(globalDiscussions));
            }

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
                    "createdtime": moment(Date.now()).unix(),
                    "modifiedtime": moment(Date.now()).unix(),
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
                    "createdtime": moment(Date.now()).unix(),
                    "modifiedtime": moment(Date.now()).unix(),
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

                        updateForumProgress();
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
                    "createdtime": moment(Date.now()).unix(),
                    "modifiedtime": moment(Date.now()).unix(),
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
                $scope.discussion = _.find($scope.activity.discussions, function(d){ return d.discussion == Number($routeParams.discussionId); });
                
                moodleFactory.Services.GetAsyncDiscussionPosts(moodleFactory.Services.GetCacheJson("CurrentUser").token, $scope.discussion.id, $scope.discussion.discussion, $scope.activity.forumid, postPager.from, postPager.to, 1, "default", getPostsDataCallback, null, true);
                
                forceUpdateForumProgress($scope.discussion.id);
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
            
            function forceUpdateForumProgress(discussionId) {
                if (sessionStorage.getItem("updateForumProgress/" + discussionId) != null) {
                    sessionStorage.removeItem("updateForumProgress/" + discussionId);
                    
                    updateForumProgress();
                    checkForumProgress(refreshTopicData);
                }
            }
            
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

