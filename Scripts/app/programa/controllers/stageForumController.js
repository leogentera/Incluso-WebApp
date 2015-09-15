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

             var redirectOnShield = function () {
                 var logicForumTopicsUrl = '/ZonaDeVuelo/Conocete/ZonaDeContacto/Logicos/Topicos/' + 147;
                 var artisticForumTopicsUrl = '/ZonaDeVuelo/Conocete/ZonaDeContacto/Artisticos/Topicos/' + 148;

                 var shields = [
                     {name: 'musical', category: 'artistico'},
                     {name: 'interpersonal', category: 'artistico'},
                     {name: 'naturalista', category: 'logico'},
                     {name: 'intrapersonal', category: 'logico'},
                     {name: 'corporal', category: 'artistico'},
                     {name: 'espacial', category: 'artistico'},
                     {name: 'matematica', category: 'logico'},
                     {name: 'liguistica', category: 'logico'},
                 ];

                 var shield = JSON.parse(localStorage.getItem('profile')).shield;
                 //shield ? shield = shield.shield : shield = null;
                 if (shield && shield != '') {

                     var shieldCategory = _.find(shields, function (s) {
                         return s.name == shield.toLowerCase()
                     });
                     //return shieldCategory == "logico" ?  $location.path(logicForumTopicsUrl) : $location.path(artisticForumTopicsUrl);
                     if (shieldCategory) {
                       if (shieldCategory.category == "logico") {
                           $scope.moodleId = 147;
                           $location.path(logicForumTopicsUrl);
                       } else if (shieldCategory.category == "artistico") {
                           $scope.moodleId = 148;
                           $location.path(artisticForumTopicsUrl);
                       }
                     }
                 } else {
                  var userCurrentStage = localStorage.getItem("currentStage");
                    $location.path('/ZonaDeVuelo/Dashboard/' + userCurrentStage);
                 }
            };

            if($routeParams.moodleid == 149) {
              redirectOnShield();
            }

            $scope.$emit('ShowPreloader'); //show preloader
            $scope.setToolbar($location.$$path,"");
            $rootScope.showFooter = true; 
            $rootScope.showFooterRocks = false;

            $scope.moodleId = $routeParams.moodleid;

            $scope.scrollToTop();

           $scope.activity = "Here is a value";
           function getForumsProgress(){
              var forumsProgress = localStorage.getItem('currentForumsProgress')? JSON.parse(localStorage.getItem('currentForumsProgress')) : setForumsList();
              return forumsProgress;

           };
            function setForumsList(){
                var discussionsCollection = [];
                var discussions = $scope.activity.discussions;

                for(var i=0 ; i< discussions.length; i++ ){
                    var currentDiscussion = discussions[i];

                    var topic = _.where(discussionsCollection, function(d){ return d.discussion == currentDiscussion.id});
                    if(!topic.length>0){
                        discussionsCollection.push({"discussion_id":currentDiscussion.id, "replies_counter":0});
                    } else {}
                }
                _setLocalStorageJsonItem('currentForumsProgress', discussionsCollection);
            }
            var getForumsExtraPointsCounter = function(){
                var forumExtraPointsCounter = localStorage.getItem('extraPointsForums')? JSON.parse(localStorage.getItem('extraPointsForums')) : setExtraPointsCounters();
                return forumExtraPointsCounter;
            };
            var setExtraPointsCounters = function(){
                var extraPointsCounter = [];
                var discussions = $scope.activity.discussions;

                for(var i=0 ; i< discussions.length; i++ ){
                    var currentDiscussionCounter = discussions[i];

                    var topic = _.where(extraPointsCounter, function(exCount){ return exCount.discussion == currentDiscussionCounter.id});
                    if(!topic.length>0){
                        extraPointsCounter.push({"discussion_id":currentDiscussionCounter.id, "extra_replies_counter":0});
                    } else {}
                }
                _setLocalStorageJsonItem('extraPointsForums', extraPointsCounter);
            };

            function getDataAsync() {
                
                $routeParams.moodleid != 149? moodleFactory.Services.GetAsyncForumDiscussions($scope.moodleId, getForumDiscussionsCallback, null, true):'';
                
                //$routeParams.moodleid != 149? moodleFactory.Services.GetAsyncForumInfo($routeParams.moodleid, currentUser.token, getActivityInfoCallback, '', true):'';
            }
            
            function getForumDiscussionsCallback() {
                $scope.activity = JSON.parse(moodleFactory.Services.GetCacheObject("forum/" + $routeParams.moodleid));
                getForumsProgress();
                getForumsExtraPointsCounter();
               $scope.$emit('HidePreloader'); //hide preloader
            }

            function getActivityInfoCallback() {
               $scope.activity = JSON.parse(moodleFactory.Services.GetCacheObject("activity/" + $routeParams.moodleid));
               getForumsProgress();
                getForumsExtraPointsCounter();
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
                  case "179":
                      $location.path("/ZonaDeNavegacion/Transformate/PuntoDeEncuentro/Comentarios/" + $scope.moodleId + "/" + discussionId);
                      break;
                  case "85":
                      $location.path("/ZonaDeNavegacion/ProyectaTuVida/PuntoDeEncuentro/Comentarios/" + $scope.moodleId + "/" + discussionId);
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
                }, 1000);
              
              var moodleId = $routeParams.moodleid;
              
              switch (moodleId){
                  case "64":
                     $location.path('/ZonaDeVuelo/Dashboard/1/'+2);
                      break;
                  case "73":
                      $location.path('/ZonaDeVuelo/Dashboard/1/'+3);
                      break;
                  case "147":
                      $location.path('/ZonaDeVuelo/Dashboard/1/'+2);
                      break;
                  case "148":
                      $location.path('/ZonaDeVuelo/Dashboard/1/'+2);
                      break;
                  default:
                      $location.path('/ZonaDeVuelo/Dashboard/1');
                      break;
              }                                      
              
            }

        }]).controller('tutorialController', function ($scope, $modalInstance) {
            $scope.cancel = function () {
                $modalInstance.dismiss('cancel');
            };
        });   