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

            $routeParams.activityId == 1049? $scope.moodleId = $routeParams.moodleId : $scope.moodleId = getMoodleIdFromTreeActivity($routeParams.activityId);
            var currentUser = JSON.parse(moodleFactory.Services.GetCacheObject("CurrentUser"));

             var redirectOnShield = function () {
                 var activityFromTree = getActivityByActivity_identifier($routeParams.activityId);
                 var logicForumTopicsUrl = '/ZonaDeVuelo/Conocete/ZonaDeContacto/Logicos/Topicos/' + $routeParams.activityId + '/'+ activityFromTree.activities[0].coursemoduleid;
                 var artisticForumTopicsUrl = '/ZonaDeVuelo/Conocete/ZonaDeContacto/Artisticos/Topicos/' + $routeParams.activityId + '/'+ activityFromTree.activities[1].coursemoduleid;

                 var shields = [
                     {name: 'Musical', category: 'artistico'},
                     {name: 'Interpersonal', category: 'artistico'},
                     {name: 'Naturalista', category: 'logico'},
                     {name: 'Intrapersonal', category: 'logico'},
                     {name: 'Corporal', category: 'artistico'},
                     {name: 'Espacial', category: 'artistico'},
                     {name: 'Matemática', category: 'logico'},
                     {name: 'Lingüística', category: 'logico'},
                 ];
                 var userId = JSON.parse(localStorage.getItem('userId'));
                 var shield = JSON.parse(localStorage.getItem('profile/' + userId )).shield;
                 console.log('Mofakin shield:' + shield);
                 if (shield && shield != '') {

                     var shieldCategory = _.find(shields, function (s) {
                         return s.name == shield.toLowerCase()
                     });
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

            //if($scope.moodleId == 149) {
            if($routeParams.activityId == 1049) {
                debugger;
              redirectOnShield();
            }

            $scope.$emit('ShowPreloader'); //show preloader
            $scope.setToolbar($location.$$path,"");
            $rootScope.showFooter = true; 
            $rootScope.showFooterRocks = false;

            //$scope.moodleId = $routeParams.moodleid;

            $scope.scrollToTop();

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
                console.log('Moodle ID on dataAsync: ' + $scope.moodleId);
                //var activityFromTree = getActivityByActivity_identifier($routeParams.activityId);
                //activityFromTree.activities? $scope.moodleId = activityFromTree.activities[0].coursemoduleid : $scope.moodleId = activityFromTree.coursemoduleid;
                //$scope.moodleId = getMoodleIdFromTreeActivity($routeParams.activityId);
                $scope.moodleId != 149? moodleFactory.Services.GetAsyncForumDiscussions($scope.moodleId, getForumDiscussionsCallback, null, true):'';
                //$routeParams.moodleid != 149? moodleFactory.Services.GetAsyncForumDiscussions($scope.moodleId, getForumDiscussionsCallback, null, true):'';
            }
            
            function getForumDiscussionsCallback() {
                $scope.activity = JSON.parse(moodleFactory.Services.GetCacheObject("forum/" + $scope.moodleId));
                getForumsProgress();
                getForumsExtraPointsCounter();
               $scope.$emit('HidePreloader'); //hide preloader
            }

            getDataAsync();

            $scope.showComentarios = function (discussionId) {
              var moodleId = $routeParams.moodleId;
              //switch ($scope.moodleId){
                console.log('Moodle ID: ' + $routeParams.moodleId);
                !moodleId? moodleId = getMoodleIdFromTreeActivity($routeParams.activityId): '';
              //switch (Number($routeParams.moodleId)){
              switch (Number(moodleId)){
                  case 64:
                      $location.path("/ZonaDeVuelo/Conocete/PuntoDeEncuentro/Comentarios/" + $routeParams.activityId + "/" + discussionId);
                      break;
                  case 73:
                      $location.path("/ZonaDeVuelo/MisSuenos/PuntosDeEncuentro/Comentarios/" + $routeParams.activityId + "/" + discussionId);
                      break;
                  case 147:
                      $location.path("/ZonaDeVuelo/Conocete/ZonaDeContacto/Logicos/Comentarios/" + $routeParams.activityId + "/" + discussionId + "/"+ $routeParams.moodleId);
                      break;
                  case 148:
                      $location.path("/ZonaDeVuelo/Conocete/ZonaDeContacto/Artisticos/Comentarios/" + $routeParams.activityId + "/" + discussionId + "/"+ $routeParams.moodleId);
                      break;
                  case 179:
                      $location.path("/ZonaDeNavegacion/Transformate/PuntoDeEncuentro/Comentarios/" + $routeParams.activityId + "/" + discussionId);
                      break;
                  case 85:
                      $location.path("/ZonaDeNavegacion/ProyectaTuVida/PuntoDeEncuentro/Comentarios/" + $routeParams.activityId + "/" + discussionId);
                      break;
                  case 93:
                      $location.path("/ZonaDeAterrizaje/EducacionFinanciera/PuntoDeEncuentro/Comentarios/" + $routeParams.activityId + "/" + discussionId);
                      break;
                  case 91:
                      $location.path("/ZonaDeAterrizaje/MapaDelEmprendedor/PuntoDeEncuentro/Comentarios/" + $routeParams.activityId + "/" + discussionId);
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
              
              var moodleId = $scope.moodleId;
              //TODO Add new routes for Zona de Navegación && Zona de Aterrizaje
              switch (moodleId){
                  case 64:
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
                  case "179":
                      $location.path("/ZonaDeNavegacion/Dashboard/2/" + 1);
                      break;
                  case "93":
                      $location.path("/ZonaDeAterrizaje/Dashboard/3/" + 2);
                      break;
                  case "91":
                      $location.path("/ZonaDeAterrizaje/Dashboard/3/" + 3);
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