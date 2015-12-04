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
            var _loadedResources = false;
            var _pageLoaded = false;
            _httpFactory = $http;
            _timeout = $timeout;
            $scope.$emit('ShowPreloader');
            
            $scope.validateConnection(initController, offlineCallback);
            
            function offlineCallback() {
                $timeout(function() { $location.path("/Offline"); }, 1000);
            }
            
            function initController() {
                var selectedDiscussionId = null;
                
                Number($routeParams.activityId) == 1049? $scope.moodleId = $routeParams.moodleId : $scope.moodleId = getMoodleIdFromTreeActivity($routeParams.activityId);
                var currentUser = JSON.parse(moodleFactory.Services.GetCacheObject("CurrentUser"));
                $scope.currentActivity = JSON.parse(moodleFactory.Services.GetCacheObject("forum/" + $scope.moodleId));
                var userId = JSON.parse(localStorage.getItem('userId'));
                getContentResources($routeParams.activityId);
    
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
                         {name: 'Matematica', category: 'logico'},
                         {name: 'Linguistica', category: 'logico'},
                     ];                 
                     var shield = JSON.parse(localStorage.getItem('Perfil/' + userId )).shield;
                     if (shield && shield != '') {
    
                         var shieldCategory = _.find(shields, function (s) {
                             return s.name.toUpperCase() == shield.toUpperCase();
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
    
                if($routeParams.activityId == 1049) {
                  redirectOnShield();
                }
    
                //$scope.setToolbar($location.$$path,$scope.contentResources.tool_bar_title);
                $rootScope.showFooter = true;
                $rootScope.showFooterRocks = false;
                $rootScope.showStage1Footer = false;
                $rootScope.showStage2Footer = false;
                $rootScope.showStage3Footer = false;
    
                $scope.scrollToTop();
    
                function getDataAsync() {
                    console.log('Moodle ID on dataAsync: ' + $scope.moodleId);
                    $scope.moodleId != 149? moodleFactory.Services.GetAsyncForumDiscussions($scope.moodleId, currentUser.token, getForumDiscussionsCallback, function() {_pageLoaded = true; if (_loadedResources && _pageLoaded) { $scope.$emit('HidePreloader')};}, true):'';
                    
                    if ($scope.moodleId == 149) {
                        _pageLoaded = true;
                        if (_loadedResources && _pageLoaded) { $scope.$emit('HidePreloader')};
                    }
                }
                
                function getForumDiscussionsCallback(data, key) {
                    $scope.activity = JSON.parse(moodleFactory.Services.GetCacheObject("forum/" + $scope.moodleId));
                    
                    var currentDiscussionIds = [];
                    for(var d = 0; d < data.discussions.length; d++) {
                        currentDiscussionIds.push(data.discussions[d].discussion);
                    }
                    localStorage.setItem("currentDiscussionIds", JSON.stringify(currentDiscussionIds));
                    
                    _pageLoaded = true;
                    if (_loadedResources && _pageLoaded) { $scope.$emit('HidePreloader')};
                }
    
                getDataAsync();
    
                $scope.showComentarios = function (discussionId) {
                    selectedDiscussionId = discussionId;
                    $scope.validateConnection(showComentariosConnectedCallback, offlineCallback);
                }
                
                function showComentariosConnectedCallback() {
                    
                    var discussionId = selectedDiscussionId;
                    var moodleId = $routeParams.moodleId;
                    console.log('Moodle ID: ' + $routeParams.moodleId);
                    !moodleId? moodleId = getMoodleIdFromTreeActivity($routeParams.activityId): '';
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
                  
                  switch (Number($routeParams.activityId)){
                      case 1010:
                         $location.path('/ZonaDeVuelo/Dashboard/1/'+2);
                          break;
                      case 1008:
                          $location.path('/ZonaDeVuelo/Dashboard/1/'+3);
                          break;
                      case 1049:
                          $location.path('/ZonaDeVuelo/Dashboard/1/'+2);
                          break;
                      case 2030:
                          $location.path("/ZonaDeNavegacion/Dashboard/2/" + 2);
                          break;
                      case 2026:
                          $location.path("/ZonaDeNavegacion/Dashboard/2/" + 4);
                          break
                      case 3304:
                          $location.path("/ZonaDeAterrizaje/Dashboard/3/" + 2);
                          break;
                      case 3404:
                          $location.path("/ZonaDeAterrizaje/Dashboard/3/" + 3);
                          break;
                      default:
                          $location.path('/ProgramaDashboard');
                          break;
                  }                                      
                  
                }
    
                function getContentResources(activityIdentifierId) {
                    drupalFactory.Services.GetContent(activityIdentifierId, function (data, key) {
                        _loadedResources = true;
                        $scope.setToolbar($location.$$path,data.node.tool_bar_title);
                        $scope.backButtonText = data.node.back_button_text;
                        if (_loadedResources && _pageLoaded) { $scope.$emit('HidePreloader'); }
    
                    }, function () { _loadedResources = true; if (_loadedResources && _pageLoaded) { $scope.$emit('HidePreloader'); } }, false);
                };   
            }

        }]).controller('tutorialController', function ($scope, $modalInstance) {
            $scope.cancel = function () {
                $modalInstance.dismiss('cancel');
            };
        });   