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
                var discussionId = discussionId;
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
                        //getTopicDataAsync();
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

            function getTopicDataAsync() {
                $scope.activity = JSON.parse(moodleFactory.Services.GetCacheObject("activity/" + $routeParams.moodleid ));
                $scope.discussion = _.find($scope.activity.discussions, function(d){ return d.discussion_id == $routeParams.discussionId; });
                var posts = $scope.discussion.posts[0].replies? $scope.discussion.posts[0].replies : new Array();
                posts.forEach(initializeCommentsData);
                $scope.$emit('HidePreloader');
            }


            var initializeCommentsData = function(element, index, array){
                $scope.isCommentModalCollapsed[index] = false;
                console.log(element.post_id);
                
                $scope.showAllCommentsByPost[element.post_id] = 3;
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

            getTopicDataAsync();
            
            $scope.showPreviousComments = function(postId) {
            
                $scope.showAllCommentsByPost[postId] = 1000000;
            };
            
            $scope.showMore = function() {
                
                //moodleFactory.Services.GetAsyncForumDiscussions($scope.moodleId, function(data1, data2){
                //    console.log(data1);
                //    console.log(data2);
                //    }, function(){}, true);
                //$scope.moodleId
                

                showMoreCounter++;
                
                $scope.$emit('ShowPreloader');
                var tempPosts = getTempCachePosts($scope.discussion.discussion_id, showMoreCounter);
                
                if (Object.prototype.toString.call($scope.discussion.posts[0].replies) === '[object Array]') {
                    
                    var currentPosts = JSON.parse(JSON.stringify($scope.discussion.posts[0].replies));
                    for(var i = 0; i < tempPosts.length; i++) {
                        currentPosts.push(tempPosts[i]);
                    }
                    
                    currentPosts.forEach(initializeCommentsData);
                    $scope.discussion.posts[0].replies = currentPosts;
                    
                    $scope.morePendingPosts = false;
                }
                
                $scope.$emit('HidePreloader');
            };
            
            function getTempCachePosts(discussionId, page) {
                
                var stringTempPosts = '[{"post_id": "1000", "forumid": "20", "forum_name": "Puntodeencuentro", "activity_type": "forum", "description": "", "discussion_id": "5", "discussion_name": "Tomaelreto", "post_parent": "7", "post_type": "1", "created": "1441576800", "has_attachment": "", "liked": "0", "likes": "0", "message": "uno", "post_autor_id": "392", "picture_post_author": null, "post_author": "ch8", "filename": null, "fileurl": null, "mimetype": null, "replies": [] }, { "post_id": "1001", "forumid": "20", "forum_name": "Puntodeencuentro", "activity_type": "forum", "description": "", "discussion_id": "5", "discussion_name": "Tomaelreto", "post_parent": "7", "post_type": "1", "created": "1441576800", "has_attachment": "", "liked": "0", "likes": "0", "message": "dos", "post_autor_id": "392", "picture_post_author": null, "post_author": "ch8", "filename": null, "fileurl": null, "mimetype": null, "replies": [] }, { "post_id": "1002", "forumid": "20", "forum_name": "Puntodeencuentro", "activity_type": "forum", "description": "", "discussion_id": "5", "discussion_name": "Tomaelreto", "post_parent": "7", "post_type": "1", "created": "1441576800", "has_attachment": "", "liked": "0", "likes": "0", "message": "1-2", "post_autor_id": "394", "picture_post_author": null, "post_author": "ch9", "filename": null, "fileurl": null, "mimetype": null, "replies": [] }, { "post_id": "1003", "forumid": "20", "forum_name": "Puntodeencuentro", "activity_type": "forum", "description": "", "discussion_id": "5", "discussion_name": "Tomaelreto", "post_parent": "7", "post_type": "1", "created": "1441576800", "has_attachment": "", "liked": "0", "likes": "0", "message": "2-2", "post_autor_id": "394", "picture_post_author": null, "post_author": "ch9", "filename": null, "fileurl": null, "mimetype": null, "replies": [] }, { "post_id": "1004", "forumid": "20", "forum_name": "Puntodeencuentro", "activity_type": "forum", "description": "", "discussion_id": "5", "discussion_name": "Tomaelreto", "post_parent": "7", "post_type": "1", "created": "1441576800", "has_attachment": "", "liked": "0", "likes": "0", "message": "3-1", "post_autor_id": "396", "picture_post_author": null, "post_author": "ch10", "filename": null, "fileurl": null, "mimetype": null, "replies": [{ "post_id": "692", "forumid": "20", "forum_name": "Puntodeencuentro", "activity_type": "forum", "description": "", "discussion_id": "5", "discussion_name": "Tomaelreto", "post_parent": "691", "post_type": "1", "created": "1441576800", "has_attachment": "", "liked": "0", "likes": "0", "message": "3-1-1", "post_autor_id": "396", "picture_post_author": null, "post_author": "ch10", "filename": null, "fileurl": null, "mimetype": null, "replies": "1" }, { "post_id": "699", "forumid": "20", "forum_name": "Puntodeencuentro", "activity_type": "forum", "description": "", "discussion_id": "5", "discussion_name": "Tomaelreto", "post_parent": "691", "post_type": "1", "created": "1441576800", "has_attachment": "", "liked": "0", "likes": "0", "message": "dfdfd", "post_autor_id": "395", "picture_post_author": null, "post_author": "root", "filename": null, "fileurl": null, "mimetype": null, "replies": "1"}]}]';
                var jsonTempPosts = JSON.parse(stringTempPosts);
                
                return jsonTempPosts;
            }

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

