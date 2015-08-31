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
            _httpFactory = $http;

            $scope.$emit('ShowPreloader'); //show preloader
            $scope.setToolbar($location.$$path,"");
            $rootScope.showFooter = true; 
            $rootScope.showFooterRocks = false;

            $scope.moodleId = $routeParams.moodleid;

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
                console.log('Getting forum data');
                moodleFactory.Services.GetAsyncForumInfo($routeParams.moodleid, getActivityInfoCallback, '');
            }

            function getActivityInfoCallback() {
               $scope.activity = JSON.parse(moodleFactory.Services.GetCacheObject("activity/" + $routeParams.moodleid));
               getForumsProgress();
               $scope.$emit('HidePreloader'); //hide preloader
            }

            getDataAsync();

            $scope.showComentarios = function (discussionId, moodleId) {
              switch (moodleId){
                  case "64":
                      $location.path("/ZonaDeVuelo/Conocete/PuntoDeEncuentro/Comentarios/" + $routeParams.moodleid + "/" + discussionId);
                      break;
                  case "73":
                      $location.path("/ZonaDeVuelo/MisSuenos/PuntosDeEncuentro/Comentarios/" + $routeParams.moodleid + "/" + discussionId);
                      break;
              }

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
              
              $location.path('/ZonaDeVuelo/Dashboard/1');
            }

        }]).controller('tutorialController', function ($scope, $modalInstance) {
            $scope.cancel = function () {
                $modalInstance.dismiss('cancel');
            };
        });   