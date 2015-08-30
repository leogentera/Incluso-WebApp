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
            //$scope.$emit('HidePreloader');
            $scope.$emit('ShowPreloader'); //show preloader
            $rootScope.pageName = "Estación: Conócete"
            $rootScope.navbarBlue = true;
            $rootScope.showToolbar = true;

            $scope.setToolbar($location.$$path,"");
            $rootScope.showFooter = true;
            $rootScope.showFooterRocks = false;

            $scope.userToken = JSON.parse(localStorage.getItem('CurrentUser')).token;
            $scope.liked = null;

            $scope.scrollToTop();

            $scope.forumModals = {
                "isTextCollapsed":true,
                "isLinkCollapsed":true,
                "isVideoCollapsed":true,
                "isAttachmentCollapsed":true
            };
            $scope.clickLikeButton = function(postId){
                console.log('Post id: ' + postId);
                console.log('Like button clicked!!!');
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
                //TODO make this function ablailable trough a service so it can be used by forum controller as well as forum comments controller
                var forumsProgress = localStorage.getItem('currentForumsProgress')? JSON.parse(localStorage.getItem('currentForumsProgress')) : new Array();
                return forumsProgress;

            };

            function updateForumProgress(discussionId){
                var forumsCommentsCountCollection = getForumsProgress();
                var discussionId = discussionId;//$scope.discussion.posts[0].discussion;
                var alreadyCommented = _.find(forumsCommentsCountCollection, function(forum){ return forum.discussionId == discussionId; });
                alreadyCommented? alreadyCommented.commentsCount++ : forumsCommentsCountCollection.push({'discussionId':discussionId, 'commentsCount':1});
                localStorage.setItem('currentForumsProgress', JSON.stringify(forumsCommentsCountCollection));
                console.log('Updated');

            };
            var endForumActivity = function(){
                //TODO Implement check of status activity, if already finished DO NOT finish activity again
                console.log('Finishing activity...');
                var userToken = JSON.parse(localStorage.getItem('CurrentUser')).token;
                var userId = {'userid':JSON.parse(localStorage.getItem('userId'))};
                moodleFactory.Services.PutEndActivity(MoodleIds.forum, userId,'', userToken,
                    function(response){
                        alert('Acabas de completar la actividad de foros.');
                    },
                    function(){
                        alert('Hubo un problema al registrar tus comentarios, por favor vuelve a intentarlo.');
                    })
            };

            var checkForumProgress = function(){
                var forumsCommentsCountCollection = getForumsProgress();
                var isActivityFinished = null;

                for(var topicObjectIndex in forumsCommentsCountCollection){
                    var topicObject =forumsCommentsCountCollection[topicObjectIndex] ;
                    var isTopicFinished = topicObject.commentsCount >= 2;

                    if(isActivityFinished === null && typeof isActivityFinished === "object") isActivityFinished = isTopicFinished;
                    isActivityFinished = isActivityFinished && isTopicFinished;
                };

                //Check for activity status
               var activityFromTree = getActivityByActivity_identifier('1003');

                if(isActivityFinished && activityFromTree.status == 0) endForumActivity();
                getDataAsync();
            };
            //TODO Remove this method call
            //checkForumProgress();


            var _uncollapse = function(element, elementsArray){
                for(var key in elementsArray){
                    key==element? elementsArray[key] = !elementsArray[key] : elementsArray[key] = true;
                };
            };
            $scope.collapseForumButtomsTrigger = function(element){
                _uncollapse(element, $scope.forumModals);
            };

            var createPostDataObject = function( parentId, message, postType){
                var dataObject= {
                    "userid":userId,
                    "discussionid": $scope.discussion.posts[0].discussion,
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
                var dataObejct = createPostDataObject(parentId, that.replyText, 1);
                //$scope.$emit('ShowPreloader');
                moodleFactory.Services.PostAsyncForumPost ('reply', dataObejct,
                    function(){alert('Success!!');
                        $scope.textToPost=null;
                        $scope.isCommentModalCollapsed[parentId] = true;
                        getTopicDataAsync();
                        //updateForumProgress(parentId);
                        updateForumProgress(topicId);
                        checkForumProgress();

                    },
                    function(){alert('Fail!!');
                        $scope.textToPost=null;
                        $scope.isCommentModalCollapsed[parentId] = true;
                        //$scope.$emit('HidePreloader');
                    });
            };

            $scope.textToPost = null;
            $scope.linkToPost = null;
            $scope.videoToPost = null;
            $scope.attachmentToPost = null;

            var userId = localStorage.getItem("userId");
            $scope.postTextToForum = function(){
                var dataObject = {
                    "userid":userId,
                    "discussionid": $scope.discussion.posts[0].discussion,
                    "parentid": $scope.discussion.posts[0].id,
                    "message": $scope.textToPost,
                    "createdtime": $filter('date')(new Date(), 'MM/dd/yyyy'),
                    "modifiedtime": $filter('date')(new Date(), 'MM/dd/yyyy'),
                    "posttype": 1,
                    "fileToUpload":""
                };
                //$scope.$emit('ShowPreloader');
                moodleFactory.Services.PostAsyncForumPost ('new_post', dataObject,
                    function(){
                        alert('Success!!');$scope.textToPost='';
                        $scope.textToPost=null;
                        $scope.collapseForumButtomsTrigger('isTextCollapsed');
                        getTopicDataAsync();
                    },
                    function(){alert('Fail!!');
                        $scope.textToPost=null;
                        $scope.collapseForumButtomsTrigger('isTextCollapsed');
                        //$scope.$emit('HidePreloader');
                    });

            };
            $scope.postLinkToForum = function(){
                var dataObject = {
                    "userid":userId,
                    "discussionid": $scope.discussion.posts[0].discussion,
                    "parentid": $scope.discussion.posts[0].id,
                    "message": $scope.linkToPost,
                    "createdtime": $filter('date')(new Date(), 'MM/dd/yyyy'),
                    "modifiedtime": $filter('date')(new Date(), 'MM/dd/yyyy'),
                    "posttype": 2,
                    "fileToUpload":""
                };
                moodleFactory.Services.PostAsyncForumPost ('new_post', dataObject,
                    function(){
                        alert('Success!!');
                        $scope.linkToPost = null;
                        $scope.collapseForumButtomsTrigger('isLinkCollapsed');
                        getTopicDataAsync();
                    },
                    function(){
                        alert('Fail!!');
                        $scope.linkToPost = null;
                        $scope.collapseForumButtomsTrigger('isLinkCollapsed');
                    });
            };
            $scope.postVideoToForum = function(){
                var dataObject = {
                    "userid":userId,
                    "discussionid": $scope.discussion.posts[0].discussion,
                    "parentid": $scope.discussion.posts[0].id,
                    "message": $scope.videoToPost,
                    "createdtime": $filter('date')(new Date(), 'MM/dd/yyyy'),
                    "modifiedtime": $filter('date')(new Date(), 'MM/dd/yyyy'),
                    "posttype": 3,
                    "fileToUpload":""
                };
                moodleFactory.Services.PostAsyncForumPost ('new_post', dataObject,
                    function(){
                        alert('Success!!');
                        $scope.videoToPost = null;
                        $scope.collapseForumButtomsTrigger('isVideoCollapsed');
                        getTopicDataAsync();
                    },
                    function(){
                        alert('Fail!!');
                        $scope.videoToPost = null;
                        $scope.collapseForumButtomsTrigger('isVideoCollapsed');
                    });
            };
            $scope.postAttachmentToForum = function(){
                console.log($scope.attachmentToPost);
                var dataObject = {
                    "userid":userId,
                    "discussionid": $scope.discussion.posts[0].discussion,
                    "parentid": $scope.discussion.posts[0].id,
                    "message": '',
                    "createdtime": $filter('date')(new Date(), 'MM/dd/yyyy'),
                    "modifiedtime": $filter('date')(new Date(), 'MM/dd/yyyy'),
                    "posttype": 4,
                    "filecontent":$scope.attachmentToPost.base64,
                    "filename": userId + $scope.attachmentToPost.filename
                };
                moodleFactory.Services.PostAsyncForumPost ('new_post', dataObject,
                    function(){
                        alert('Success!!');
                        $scope.videoToPost = null;
                        $scope.collapseForumButtomsTrigger('isAttachmentCollapsed');
                        getTopicDataAsync();
                    },
                    function(){
                        alert('Fail!!');
                        $scope.videoToPost = null;
                        $scope.collapseForumButtomsTrigger('isAttachmentCollapsed');
                    });
            };

            function getTopicDataAsync() {
                moodleFactory.Services.GetAsyncActivity(64, getActivityInfoCallback, null);
                //$scope.$emit('HidePreloader');
            }

            function getActivityInfoCallback() {
                //$scope.activity = JSON.parse(moodleFactory.Services.GetCacheObject("activity/" + $routeParams.moodleid + "/" + $routeParams.discussionId));
                $scope.activity = JSON.parse(moodleFactory.Services.GetCacheObject("activity/" + $routeParams.moodleid ));
                $scope.discussion = _.find($scope.activity.discussions, function(d){ return d.id == $routeParams.discussionId; });
                var posts = $scope.discussion.posts[0].replies;
                posts.forEach(createModalReferences);
                $scope.$emit('HidePreloader'); //hide preloader
            }

            getTopicDataAsync();

            var createModalReferences = function(element, index, array){
                $scope.isCommentModalCollapsed[element.id] = true;
            };

            $scope.back = function () {
                $location.path('ZonaDeVuelo/Conocete/PuntoDeEncuentro/Topicos/'+ MoodleIds.forum);
            };

            $scope.testClick = function(){
                alert("Testing clicks");
            };

            function getDataAsync() {
                //$scope.$emit('ShowPreloader'); //show preloader
                moodleFactory.Services.GetAsyncUserCourse(_getItem("userId"), getDataAsyncCallback, errorCallback);
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
                //$scope.$emit('HidePreloader'); //hide preloader
                $scope.$emit('scrollTop'); //- scroll
            }

        }]);

