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
            alert($routeParams.activityId);
            $scope.userToken = JSON.parse(localStorage.getItem('CurrentUser')).token;
            $scope.liked = null;
            $scope.moodleId;
            console.log($routeParams.activityId);
            Number($routeParams.activityId) == 1049? $scope.moodleId = $routeParams.moodleId     : $scope.moodleId = getMoodleIdFromTreeActivity($routeParams.activityId);
            console.log("$scope.moodleId" + $scope.moodleId);
            $scope.currentActivity = JSON.parse(moodleFactory.Services.GetCacheObject("forum/" + $scope.moodleId));
            $scope.currentDiscussionsIds = moodleFactory.Services.GetCacheJson("currentDiscussionIds");
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
            
            var checkForumExtraPoints = function() {
            
                var activityFromTree = getActivityByActivity_identifier($routeParams.activityId);
                
                /* check over extra points */
                var course = moodleFactory.Services.GetCacheJson("course");
                var forumData = moodleFactory.Services.GetCacheJson("postcounter/" + course.courseid);
                
                if (activityFromTree && activityFromTree.status == 1) {
                    /* sumar uno extra al total */
                    if (forumData.totalExtraPoints < 11) {
                         updateUserForumStars($routeParams.activityId, 50, function (){
                            successPutStarsCallback();
                        });
                    }
                }
            };

            var checkForumProgress = function(callback){
                
                var historicalDiscussions = getForumExtraPointsCounter($scope.currentDiscussionsIds);
                var historicalDiscussionsFinished = _.filter(historicalDiscussions.discussions, function(hd){ return hd.total >= 2; });     
                
                var isActivityFinished = (historicalDiscussionsFinished.length === $scope.currentDiscussionsIds.length);
                var activityFromTree = getActivityByActivity_identifier($routeParams.activityId);
                
                if (isActivityFinished && activityFromTree && activityFromTree.status == 0) {
                    
                    var extraPointsCounter = 0;
                    var extraPoints = 0;
                    
                    /* sumar uno extra al total */
                    if (forumData.totalExtraPoints < 11) {
                         _.each(historicalDiscussions.discussions, function(elem, index, list) {
                                extraPointsCounter += (elem.total - 2);
                            });
                         
                         /* sumar uno extra al total */
                         var availableExtraPoints = (11 - forumData.totalExtraPoints);
                         if (extraPointsCounter > availableExtraPoints) {
                            extraPointsCounter = availableExtraPoints;
                         }
                         
                         extraPoints = (extraPointsCounter * 50);
                    }
                    
                    localStorage.setItem("starsToAssignedAfterFinishActivity", extraPoints);

                    switch (Number($scope.moodleId)) {
                        case 73:
                            $location.path('/ZonaDeVuelo/ForoCierre/' + $routeParams.activityId +'/'+ $scope.discussion.id +'/'+ $scope.moodleId);
                            break;
                        case 64:
                            $location.path('/ZonaDeVuelo/ForoCierre/' + $routeParams.activityId +'/'+ $scope.discussion.id +'/'+ $scope.moodleId);
                            break;
                        case 149:
                                $location.path('/ZonaDeVuelo/ForoCierre/' + $routeParams.activityId +'/'+ $scope.discussion.id +'/'+ $scope.moodleId);
                            break;
                        case 148:
                                $location.path('/ZonaDeVuelo/ForoCierre/' + $routeParams.activityId +'/'+ $scope.discussion.id +'/'+ $scope.moodleId);
                            break;
                        case 147:
                                $location.path('/ZonaDeVuelo/ForoCierre/' + $routeParams.activityId +'/'+ $scope.discussion.id +'/'+ $scope.moodleId);
                            break;

                        case 179:
                                $location.path('/ZonaDeNavegacion/ForoCierre/' + $routeParams.activityId +'/'+ $scope.discussion.id +'/'+ $scope.moodleId);
                            break;
                        case 178:
                            $location.path('/ZonaDeNavegacion/ForoCierre/' + $routeParams.activityId +'/'+ $scope.discussion.id +'/'+ $scope.moodleId);
                            break;
                        case 197:
                            $location.path('/ZonaDeNavegacion/ForoCierre/' + $routeParams.activityId +'/'+ $scope.discussion.id +'/'+ $scope.moodleId);
                            break;
                        case 85:
                            $location.path('/ZonaDeNavegacion/ForoCierre/'+ $routeParams.activityId +'/'+ $scope.discussion.id +'/'+ $scope.moodleId);
                            break;
                        default :
                            $location.path('/ZonaDeAterrizaje/ForoCierre/'+ $routeParams.activityId +'/'+ $scope.discussion.id +'/'+ $scope.moodleId);
                            break;
                        $scope.scrollToTop();
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
                        checkForumExtraPoints();
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
                        checkForumExtraPoints();
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
                        checkForumExtraPoints();
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
                        checkForumExtraPoints();
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
                cordova.exec(function(data) { $scope.attachmentToPost = data; }, function(data) {}, "CallToAndroid", "AttachPicture", []);
            };

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
                        checkForumExtraPoints();
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
                
                forceUpdateForumProgress();
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

            var createModalReferences = function(element, index, array){
                $scope.isCommentModalCollapsed[element.post_id] = true;
            };

            getTopicData();
            
            function forceUpdateForumProgress() {
                checkForumProgress(refreshTopicData);
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

