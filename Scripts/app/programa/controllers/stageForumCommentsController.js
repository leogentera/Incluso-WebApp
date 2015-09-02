angular
    .module('incluso.stage.forumcommentscontroller', ['GlobalAppConstants', 'naif.base64'])
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

            $scope.scrollToTop();

            $scope.forumModals = {
                "isTextCollapsed":true,
                "isLinkCollapsed":true,
                "isVideoCollapsed":true,
                "isAttachmentCollapsed":true
            };

            var profile = JSON.parse(localStorage.getItem("profile"));
            $scope.clickLikeButton = function(postId){
                console.log('Post id: ' + postId);
                console.log('Like button clicked!!!');                
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
                        console.log('Liked!!');
                    },
                    function(){
                        console.log('Unlike =( !!');
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
                localStorage.setItem('currentForumsProgress', JSON.stringify(forumsCommentsCountCollection));
            };

            var assignStars = function(numStars){
                var userId = JSON.parse(localStorage.getItem('userId'));

                var data={
                    userId: userId,
                    stars: numStars,
                    instance: $routeParams.moodleid,
                    instanceType: 0,
                    date: getdate()
                };
                moodleFactory.Services.PutStars(data,null, $scope.userToken,successfullCallBack, errorCallback);
                function successfullCallBack(){};
                function errorCallback(){};
            };

            var checkForumProgress = function(callback){

                var forumsCommentsCountCollection = getForumsProgress();
                var isActivityFinished = null;

                var numberOfDiscussionsWithMoreThan2Replies = _.filter($scope.activity.discussions, function(d) { return d.replies >= 2});
                isActivityFinished = numberOfDiscussionsWithMoreThan2Replies.length == $scope.activity.discussions.length;

                //Check for activity status
                var activity_identifier = null;
                var moodleid;
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

               var activityFromTree = getActivityByActivity_identifier(activity_identifier);

                if (isActivityFinished && activityFromTree) { // && activityFromTree.status == 0) {
                    $location.path('/ZonaDeVuelo/ForoCierre/' + activity_identifier);                    
                } else {
                   callback();
                   // getDataAsync();
                }

            };
            //TODO implement adding points to user
            var addPointsToUser = function(){

            };
            //TODO Check if this call is needed
            //checkForumProgress();


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
            $scope.replyToPost = function(that, parentId, topicId){                
                var dataObejct = createReplyDataObject(parentId, that.replyText, 1);
                $scope.$emit('ShowPreloader');
                moodleFactory.Services.PostAsyncForumPost ('reply', dataObejct,
                    function(){
                        //alert('Tu cometario fue registrado.');
                        $scope.textToPost=null;
                        $scope.isCommentModalCollapsed[parentId] = true;
                        //getTopicDataAsync();

                        //updateForumProgress(parentId);
                        $scope.discussion.replies = $scope.discussion.replies + 1;   //add a new reply to the current discussion
                        updateForumProgress(topicId);
                        $scope.$emit('ShowPreloader');
                        checkForumProgress(refreshTopicData);
                        //$scope.$emit('HidePreloader');
                    },
                    function(){alert('Tu comentario no pudo ser registrado.');
                        $scope.textToPost=null;
                        $scope.isCommentModalCollapsed[parentId] = true;
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
                        alert('Tu aportación fue registrada');
                        $scope.textToPost='';
                        $scope.textToPost=null;
                        $scope.collapseForumButtomsTrigger('isTextCollapsed');
                        //getTopicDataAsync();
                        refreshTopicData();
                    },
                    function(){
                        alert('Fail!!');
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
                        alert('Tu aportación fue registrada');
                        $scope.linkToPost = null;
                        $scope.collapseForumButtomsTrigger('isLinkCollapsed');
                        //getTopicDataAsync();
                        refreshTopicData();
                    },
                    function(){
                        alert('Tu comenatrio no pudo ser registrado');
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
                        alert('Tu aportación fue registrada');
                        $scope.videoToPost = null;
                        $scope.collapseForumButtomsTrigger('isVideoCollapsed');
                        //getTopicDataAsync();
                        refreshTopicData();
                    },
                    function(){
                        alert('Tu comenatrio no pudo ser registrado');
                        $scope.videoToPost = null;
                        $scope.collapseForumButtomsTrigger('isVideoCollapsed');
                        alert('Tu comenatrio no pudo ser registrado');
                    });
            };
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
                    "filecontent":$scope.attachmentToPost.base64,
                    "filename": userId + $scope.attachmentToPost.filename,
                    "picture_post_author": profile.profileimageurlsmall
                };

                $scope.$emit('ShowPreloader');
                moodleFactory.Services.PostAsyncForumPost ('new_post', dataObject,
                    function(){
                        alert('Tu aportación fue registrada');
                        $scope.attachmentToPost = null;
                        $scope.collapseForumButtomsTrigger('isAttachmentCollapsed');
                        //getTopicDataAsync();
                        refreshTopicData();
                    },
                    function(){
                        alert('Tu comenatrio no pudo ser registrado');
                        $scope.videoToPost = null;
                        $scope.collapseForumButtomsTrigger('isAttachmentCollapsed');
                        $scope.$emit('HidePreloader');
                    });
            };

            function getTopicDataAsync() {
                $scope.activity = JSON.parse(moodleFactory.Services.GetCacheObject("activity/" + $routeParams.moodleid ));
                $scope.discussion = _.find($scope.activity.discussions, function(d){ return d.discussion_id == $routeParams.discussionId; });
                var posts = $scope.discussion.posts[0].replies? $scope.discussion.posts[0].replies : new Array();
                posts.forEach(createModalReferences);
                $scope.$emit('HidePreloader');
                //moodleFactory.Services.GetAsyncForumInfo($routeParams.moodleid, getActivityInfoCallback, null, true);
                //$scope.$emit('HidePreloader');
            }

            var createModalReferences = function(element, index, array){
                $scope.isCommentModalCollapsed[element.post_id] = true;
            };

            var refreshTopicData = function(){   
                moodleFactory.Services.GetAsyncForumInfo($routeParams.moodleid, $scope.userToken, getActivityInfoCallback, null, true);
            };

            function getActivityInfoCallback(data) {
                //$scope.activity = JSON.parse(moodleFactory.Services.GetCacheObject("activity/" + $routeParams.moodleid + "/" + $routeParams.discussionId));
                $scope.activity = JSON.parse(moodleFactory.Services.GetCacheObject("activity/" + $routeParams.moodleid ));
                $scope.discussion = _.find($scope.activity.discussions, function(d){ return d.discussion_id == $routeParams.discussionId; });
                var posts = $scope.discussion.posts[0].replies? $scope.discussion.posts[0].replies : new Array();
                posts.forEach(createModalReferences);
                $scope.$emit('HidePreloader');
            }

            getTopicDataAsync();

            $scope.back = function () {

                switch ($routeParams.moodleid) {
                    case "64":
                        $location.path('ZonaDeVuelo/Conocete/PuntoDeEncuentro/Topicos/' + $routeParams.moodleid);
                        break;
                    case "73":
                        $location.path("/ZonaDeVuelo/MisSuenos/PuntosDeEncuentro/Topicos/" + $routeParams.moodleid);
                        break;
                }
            };

            function getDataAsync() {
                moodleFactory.Services.GetAsyncUserCourse(_getItem("userId"), getDataAsyncCallback, errorCallback, true);
                $scope.$emit('HidePreloader');
            }

                //TODO cambiar esta lógica, demasiados requests
            function getDataAsyncCallback(){
                $scope.usercourse = JSON.parse(localStorage.getItem("usercourse"));
                moodleFactory.Services.GetAsyncCourse($scope.usercourse.courseid, function(){
                    $scope.course = JSON.parse(localStorage.getItem("course"));
                    $scope.currentStage = JSON.parse(localStorage.getItem('currentStage')); //getCurrentStage();
                    localStorage.setItem("currentStage", $scope.currentStage);

                }, errorCallback);
            }

            function errorCallback(data){

                $scope.$emit('scrollTop');
            }
        }]);

