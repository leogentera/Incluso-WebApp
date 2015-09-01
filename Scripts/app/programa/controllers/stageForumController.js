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
            _timeout = $timeout;
            $scope.moodleId = $routeParams.moodleid;
            var currentUser = JSON.parse(moodleFactory.Services.GetCacheObject("CurrentUser"));

             var redirectOnShield = function (){
                var logicForumTopicsUrl = '/ZonaDeVuelo/Conocete/ZonaDeContacto/Logicos/Topicos/' + 147;
                var artisticForumTopicsUrl = '/ZonaDeVuelo/Conocete/ZonaDeContacto/Artisticos/Topicos/' + 148;

                var shields = [
                    {name: 'musical' , category:'artistico'},
                    {name:'interpersonal' , category: 'artistico'},
                    {name:'naturalista' , category: 'logico'},
                    {name:'intrapersonal' , category: 'logico'},
                    {name:'corporal' , category: 'artistico'},
                    {name:'espacial' , category: 'artistico'},
                    {name:'matematica' , category: 'logico'},
                    {name:'liguistica' , category: 'logico'},
                ];
                var shield = JSON.parse(localStorage.getItem('shield')) ;
                shield ? shield = shield.shield : shield = null;
                var shieldCategory = shield ? _.find(shields, function(s){ return s.name == shield }).category : $location.path('/');
                return shieldCategory == "logico" ?  $location.path(logicForumTopicsUrl) : $location.path(artisticForumTopicsUrl);
                 if(shieldCategory == "logico"){
                     $scope.moodleId = 147;
                     $location.path(logicForumTopicsUrl);
                 } else {
                     $scope.moodleId = 148;
                     $location.path(artisticForumTopicsUrl);
                 }
            };
            if($routeParams.moodleid == 149) redirectOnShield();

            $scope.$emit('ShowPreloader'); //show preloader
            $scope.setToolbar($location.$$path,"");
            $rootScope.showFooter = true; 
            $rootScope.showFooterRocks = false;

            $scope.moodleId = $routeParams.moodleid;

            $scope.scrollToTop();

           $scope.activity = "Here is a value";
           function getForumsProgress(){
              var forumsProgress = localStorage.getItem('currentForumsProgress')? JSON.parse(localStorage.getItem('currentForumsProgress')) : setForumsList();
              console.log(forumsProgress);
              return forumsProgress;

           };
            function setForumsList(){
                var discussionsCollection = [];
                var discussions = $scope.activity.discussions;

                for(var i=0 ; i< discussions.length; i++ ){
                    var currentDiscussion = discussions[i];

                    var topic = _.where(discussionsCollection, function(d){ return d.discussion_id == currentDiscussion.post_id});
                    if(!topic.length>0){
                        discussionsCollection.push({"discussion_id":currentDiscussion.post_id, "replies_counter":0});
                    } else {}
                }
                localStorage.setItem('currentForumsProgress', JSON.stringify(discussionsCollection));
            }

            function getDataAsync() {
                console.log('Getting forum data');
                $routeParams.moodleid != 149? moodleFactory.Services.GetAsyncForumInfo($routeParams.moodleid, currentUser.token, getActivityInfoCallback, ''):'';
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
                  case "147":
                      $location.path("/ZonaDeVuelo/Conocete/ZonaDeContacto/Logicos/Comentarios/" + $scope.moodleId + "/" + discussionId);
                      break;
                  case "148":
                      $location.path("/ZonaDeVuelo/Conocete/ZonaDeContacto/Artisticos/Comentarios/" + $scope.moodleId + "/" + discussionId);
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