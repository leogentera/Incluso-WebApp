angular
    .module('incluso.stage.forumcontroller', [])
    .controller('stageForumController', [
        '$q',
        '$scope',
        '$location',
        '$routeParams',
        '$timeout',
        '$rootScope',
        '$http',
        '$anchorScroll',
        '$modal',
        function ($q, $scope, $location, $routeParams, $timeout, $rootScope, $http, $anchorScroll, $modal) {

            $scope.$emit('ShowPreloader'); //show preloader
            $scope.setToolbar($location.$$path,"");
            $rootScope.showFooter = true; 
            $rootScope.showFooterRocks = false; 

            $scope.scrollToTop();

           $scope.activity = "Here is a value";
           function getForumsProgress(){
              //TODO make this function ablailable trough a service so it can be used by forum controller as well as forum comments controller
              var forumsProgress = localStorage.getItem('currentForumsProgress')? JSON.parse(localStorage.getItem('currentForumsProgress')) : setForumsList();
              console.log(forumsProgress);
              return forumsProgress;

           };
           function setForumsList(){
              var discussionsCollection = new Array();
               var discussions = $scope.activity.discussions;
              for(var discussionId in discussions){
                 var postsCollection = discussions[discussionId].posts[0].replies;
                 for(var postCollectionId in postsCollection){
                    var topic = _.find(discussionsCollection, function(discussion){ return discussion.discussionId == postsCollection[postCollectionId].parent;});
                     //topic? topic.commentsCount++ :  discussionsCollection.push({'discussionId':postsCollection[postCollectionId].parent , 'commentsCount':0});
                     topic? '' :  discussionsCollection.push({'discussionId':postsCollection[postCollectionId].parent , 'commentsCount':0});
                 }
              }
              console.log(discussionsCollection);
              localStorage.setItem('currentForumsProgress', JSON.stringify(discussionsCollection));
           }

            function getDataAsync() {
               //TODO Use MoodleIds forum id from the global app constants
                moodleFactory.Services.GetAsyncActivity(64, getActivityInfoCallback);
//                moodleFactory.Services.GetAsyncActivity($routeParams.moodleid, getActivityInfoCallback);
            }

            function getActivityInfoCallback() {
               $scope.activity = JSON.parse(moodleFactory.Services.GetCacheObject("activity/" + 64));
               getForumsProgress();
               $scope.$emit('HidePreloader'); //hide preloader
            }

            getDataAsync();

            $scope.showComentarios = function (discussionId) {
              $location.path("/ZonaDeVuelo/Conocete/PuntoDeEncuentro/Comentarios/" + $routeParams.moodleid + "/" + discussionId);
            }

            $scope.back = function (size) {
              
              setTimeout(function(){ 
                    var modalInstance = $modal.open({
                        animation: $scope.animationsEnabled,
                        templateUrl: 'tutorialModal.html',
                        controller: 'tutorialController',
                        size: size,
                        windowClass: 'user-help-modal'
                    });
                    console.log("modal open");
                }, 1000);
              
              $location.path('/ZonaDeVuelo/Dashboard');
            }

        }]).controller('tutorialController', function ($scope, $modalInstance) {
            $scope.cancel = function () {
                $modalInstance.dismiss('cancel');
            };
        });   