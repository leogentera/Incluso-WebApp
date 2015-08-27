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

            $rootScope.pageName = "Estación: Conócete"
            $rootScope.navbarBlue = true;
            $rootScope.showToolbar = true;
            $rootScope.showFooter = true;
            $rootScope.showFooterRocks = false;

            $scope.scrollToTop();
            $scope.$emit('HidePreloader'); //hide preloader

            $scope.forumModals = {
                "isTextCollapsed":true,
                "isLinkCollapsed":true,
                "isVideoCollapsed":true,
                "isAttachmentCollapsed":true
            };


            function getForumProgress(){
               return JSON.parse(localStorage.getItem('currentForumsProgress')? localStorage.getItem('currentForumsProgress') : localStorage.setItem('currentForumsProgress')) ;
            };
            var testDataObeject = [
                {'discussion':12, 'commentsCount':2}, {'discussionId':13, 'commentsCount':2}
            ];
            localStorage.setItem('currentForumsProgress', JSON.stringify(testDataObeject));

            function updateForumProgress(discussionId){
                console.log('Discussion Id on forum update: '+ discussionId);
                var forumsCommentsCountCollection = getForumProgress();
                console.log(forumsCommentsCountCollection);
                var discussionId = discussionId;//$scope.discussion.posts[0].discussion;
                var alreadyCommented = _.find(forumsCommentsCountCollection, function(forum){ return forum.discussionId == discussionId; });
                console.log(alreadyCommented);
                alreadyCommented? alreadyCommented.commentsCount++ : forumsCommentsCountCollection.push({'discussionId':discussionId, 'commentsCount':1});
                console.log(forumsCommentsCountCollection);
                localStorage.setItem('currentForumsProgress', JSON.stringify(forumsCommentsCountCollection));
                console.log('Updated');
            };
            var endForumActivity = function(){
                console.log('Finished forum acivity');
            };

            var checkForumProgress = function(){
                var forumsCommentsCountCollection = getForumProgress();
                var isActivityFinished = null;

                for(var topicObjectIndex in forumsCommentsCountCollection){

                    var topicObject =forumsCommentsCountCollection[topicObjectIndex] ;
                    var isTopicFinished = topicObject.commentsCount >= 2;
                    console.log('Topic Finished: ' + isTopicFinished);
                    if(isActivityFinished === null && typeof isActivityFinished === "object") isActivityFinished = isTopicFinished;
                    isActivityFinished = isActivityFinished && isTopicFinished;
                    console.log('Activity Finished: ' + isActivityFinished);
                };
                if(isActivityFinished) endForumActivity();
            };
            checkForumProgress();


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
            $scope.replyToPost = function(that, parentId){
                var dataObejct = createPostDataObject(parentId, that.replyText, 1);
                moodleFactory.Services.PostAsyncForumPost ('reply', dataObejct,
                    function(){alert('Success!!');
                        $scope.textToPost=null;
                        $scope.isCommentModalCollapsed[parentId] = true;
                        getDataAsync();
                        updateForumProgress(parentId);
                        checkForumProgress();
                    },
                    function(){alert('Fail!!');
                        $scope.textToPost=null;
                        $scope.isCommentModalCollapsed[parentId] = true;
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

                moodleFactory.Services.PostAsyncForumPost ('new_post', dataObject,
                    function(){
                        alert('Success!!');$scope.textToPost='';
                        $scope.textToPost=null;
                        $scope.collapseForumButtomsTrigger('isTextCollapsed');
                        getDataAsync();
                    },
                    function(){alert('Fail!!');
                        $scope.textToPost=null;
                        $scope.collapseForumButtomsTrigger('isTextCollapsed');
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
                    },
                    function(){
                        alert('Fail!!');
                        $scope.videoToPost = null;
                        $scope.collapseForumButtomsTrigger('isVideoCollapsed');
                    });
            };
            $scope.postAttachmentToForum = function(){
                alert("Posting ATTACHMENT in the forum " + $scope.attachmentToPost);
            };



            function getDataAsync() {
                moodleFactory.Services.GetAsyncActivity(64, getActivityInfoCallback);
            }

            function getActivityInfoCallback() {
                //$scope.activity = JSON.parse(moodleFactory.Services.GetCacheObject("activity/" + $routeParams.moodleid + "/" + $routeParams.discussionId));
                $scope.activity = JSON.parse(moodleFactory.Services.GetCacheObject("activity/" + $routeParams.moodleid ));
                $scope.discussion = _.find($scope.activity.discussions, function(d){ return d.id == $routeParams.discussionId; });
                var posts = $scope.discussion.posts[0].replies;
                posts.forEach(createModalReferences);
            }

            getDataAsync();

            var createModalReferences = function(element, index, array){
                $scope.isCommentModalCollapsed[element.id] = true;
            };

            $scope.back = function () {
                $location.path('ZonaDeVuelo/Conocete/PuntoDeEncuentro/Topicos/'+ MoodleIds.forum);
            };

            $scope.testClick = function(){
                alert("Testing clicks");
            };

        }]);

