angular
    .module('incluso.stage.gameretomultiplecontroller', [])
    .controller('stageGameRetoMultipleController', [
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
        function ($q, $scope, $location, $routeParams, $timeout, $rootScope, $http, $anchorScroll, $modal, $filter) {
         var _loadedResources = false;
         var _pageLoaded = true;

            _timeout = $timeout;
            _httpFactory = $http;

            drupalFactory.Services.GetContent("1039", function (data, key) {
               _loadedResources = true;
                $scope.contentResources = data.node;
                if (_loadedResources && _pageLoaded) { $scope.$emit('HidePreloader'); }
            }, function () { _loadedResources = true; if (_loadedResources && _pageLoaded) { $scope.$emit('HidePreloader'); } }, false);

            $scope.setToolbar($location.$$path,"");
            $rootScope.showFooter = true;
            $rootScope.showFooterRocks = false;
            $rootScope.showStage1Footer = false;
            $rootScope.showStage2Footer = false;
            $rootScope.showStage3Footer = false;

            $scope.scrollToTop();
            if (_loadedResources && _pageLoaded) { $scope.$emit('HidePreloader')};
            var currentUser = JSON.parse(moodleFactory.Services.GetCacheObject("CurrentUser")); 
            $scope.activitiesToPost = 0;
            _setLocalStorageItem("retoMultipleActivities", null);
            $scope.user = moodleFactory.Services.GetCacheJson("Perfil/" + moodleFactory.Services.GetCacheObject("userId"));
            $scope.activities = moodleFactory.Services.GetCacheJson("activityManagers");
            $scope.retoMultipleActivities = moodleFactory.Services.GetCacheJson("retoMultipleActivities");
            $scope.retosMultipleChallenge = _.find($scope.activities, function(a) { return a.activity_identifier == $routeParams.moodleid});
            if ($scope.retosMultipleChallenge) {
              $scope.stars = $scope.retosMultipleChallenge.points;
              _.each($scope.retosMultipleChallenge.activities, function(a){
                $scope.stars += a.points;
              });
            }

            $scope.isInstalled = false;

            var loadData = function(){
              $scope.retoMultipleActivities = [];
              if ($scope.retosMultipleChallenge) {
                retoMultipleArray = $scope.retosMultipleChallenge.activities;
                
                var filteredActivities = _.filter($scope.retosMultipleChallenge.activities,function(e){
                  return (e.activityname.toLowerCase() != "resultados" && e.activityname.toLowerCase() != "puntajes");
               });
               
               $scope.retosMultipleChallenge.activities = filteredActivities;
                
               for(var i = 0; i < $scope.retosMultipleChallenge.activities.length; i++){
                  var activity = moodleFactory.Services.GetCacheJson("activity/" + $scope.retosMultipleChallenge.activities[i].coursemoduleid);
                  if (activity) {
                    $scope.retoMultipleActivities.push(activity);
                  } else {
                    moodleFactory.Services.GetAsyncActivity($scope.retosMultipleChallenge.activities[i].coursemoduleid, currentUser.token, function(data) {
                      $scope.retoMultipleActivities.push(data);
                      assignCourseModuleId(true, data);
                    }, function(obj) {
                        $scope.$emit('HidePreloader');
                    });
                  }
                  if ($scope.retoMultipleActivities.length > 0) {
                    assignCourseModuleId(false, $scope.retosMultipleChallenge.activities[i]);
                  }
                
               }
              }
            }

            var assignCourseModuleId = function(asyncRequest, data){
              $scope.retoMultipleActivities[$scope.retoMultipleActivities.length - 1]["coursemoduleid"] = 
              ( asyncRequest ? _.find($scope.retosMultipleChallenge.activities, function(r){ return r.activityname == data.name }).coursemoduleid : data.coursemoduleid);
              if ($scope.retoMultipleActivities.length == $scope.retosMultipleChallenge.activities.length) {
                $scope.$emit('HidePreloader');
                $scope.retoMultipleActivities = _.sortBy($scope.retoMultipleActivities, function(r){ return r.coursemoduleid; });
                getActivities();
              }
            }

            var getActivities = function() {
                var getCompleted = function (){
                  $scope.completedActivities = moodleFactory.Services.GetCacheJson("retoMultipleCompleted");
                  if ($scope.completedActivities) {
                    createRequest();
                  }else{
                    moodleFactory.Services.GetAsyncMultipleChallengeInfo(currentUser.token, function(){
                      $scope.completedActivities = moodleFactory.Services.GetCacheJson("retoMultipleCompleted");
                      $scope.completedActivities = !$scope.completedActivities ? [] : $scope.completedActivities;
                      createRequest();
                    }, function(){
                        $scope.$emit('HidePreloader');
                    }, true);
                  }
                }
                $scope.partialActivities = moodleFactory.Services.GetCacheJson("retoMultiplePartials");
                if ($scope.partialActivities){
                  getCompleted();
                }else{
                  moodleFactory.Services.GetAsyncMultipleChallengeInfo(currentUser.token, function(){
                    $scope.partialActivities = moodleFactory.Services.GetCacheJson("retoMultiplePartials");
                    $scope.partialActivities = !$scope.partialActivities ? [] : $scope.partialActivities;
                    getCompleted();
                  }, function(){
                      $scope.$emit('HidePreloader');
                  }, true);
                }
            }

            var createRequest = function(){
              if (!$routeParams.retry) {
               
               var filteredActivities = _.filter($scope.retoMultipleActivities,function(e){
                  return (e.name.toLowerCase() != "resultados" && e.name.toLowerCase() != "puntajes");
               });
               
               $scope.retoMultipleActivities = filteredActivities;
                                             
                $scope.challengesStructure = [{"name":"Naturalista", "type":"1"},{"name":"Lingüística", "type":"1"},{"name":"Corporal", "type":"2"},{"name":"Espacial", "type":"2"},{"name":"Musical", "type":"2"},{"name":"Matemática", "type":"2"},{"name":"Intrapersonal", "type":"3"},{"name":"Interpersonal", "type":"3"}];
                var request = {
                  "userId": "" + $scope.user.id,
                  "alias": $scope.user.username,
                  "actividad": "Reto múltiple",
                  "pathImagen": "",
                  "actividadTerminada": ($scope.completedActivities.length == $scope.retoMultipleActivities.length ? "Si" : "No"),
                  "subactividades": []
                };
                _.each($scope.retoMultipleActivities, function(localActivity){
                  var activityName = localActivity.name.toLowerCase();
                  if (activityName.indexOf("resultados") < 0 && activityName.indexOf("puntajes") < 0) {
                    var challengeType = _.find($scope.challengesStructure, function(c){ return c.name.toLowerCase().indexOf(activityName) >= 0 });
                    var activity = _.find($scope.partialActivities, function(p){ return p.subactivity.toLowerCase().indexOf(activityName) >= 0 });
                    var completedActivity = _.find($scope.completedActivities, function(c){ return c.subactivity.toLowerCase().indexOf(activityName) >= 0 });                      
                    if (activity) {
                      activity["nivelmaximo"] = (completedActivity && completedActivity.nivelmaximo && completedActivity.nivelmaximo != "" ? 
                        completedActivity.nivelmaximo : "0");
                    }else if (completedActivity){
                      activity = completedActivity;
                    }
                    var subactivity = {
                        "estrellas": "300",
                        "subactividad": localActivity.name,
                        "puntajeFinal": (activity && activity.puntaje ? activity.puntaje : ""),
                        "nivelInteligencia" : (activity && activity.nivelmaximo && activity.nivelmaximo != "" ? activity.nivelmaximo : "0")
                    };
                    if (challengeType.type == 1 || challengeType.type == 2) {
                      subactivity["fechaInicio"] = activity && activity.datestart && activity.datestart > 0 ? $filter('date')(activity.datestart*1000,'yyyy-MM-dd HH:mm:ss') : "";
                      subactivity["detalleAciertos"] = activity && activity.detalleaciertos ? JSON.parse(activity.detalleaciertos) : fillArray("-1", "-1", 9);
                      subactivity["detallePuntaje"] = activity && activity.detallepuntaje ? JSON.parse(activity.detallepuntaje) : fillArray("-1","-1", 9);
                    }
                    if (challengeType.type == 2) {
                      subactivity["tiempoIntentos"] = (activity && activity.detalletiempo && activity.detalletiempo != "" ? JSON.parse(activity.detalletiempo) : fillArray("-1", "-1", 9));
                    }
                    if (challengeType.type == 3) {
                      subactivity["detallePreguntas"] = (activity && activity.detallepreguntas && activity.detallepreguntas != "" ? JSON.parse(activity.detallepreguntas) : fillArray("-1", "-1", 8));
                    }
                    request.subactividades.push(subactivity);
                  }
                });
                $scope.$emit('HidePreloader');
                
                var userCourseUpdated = JSON.parse(localStorage.getItem("usercourse"));
               var parentActivityIdentifier = $routeParams.moodleid;
               var parentActivity = getActivityByActivity_identifier(parentActivityIdentifier, userCourseUpdated);
               request.fechaModificación=parentActivity.modifieddate;
                  try {
                     cordova.exec(successGame, failureGame, "CallToAndroid", "openApp", [request]);
                  }
                  catch (e) {
                     successGame(
                       {"userId":"103","actividad":"Reto múltiple","fechaModificación": "06\/10\/2016 11:08:18","imagenRecortada":"avatar_id.jpg","escudo":"Musical","actividadTerminada":"Si","inteligenciaPredominante":[{"inteligencia":"Musical","puntuación":"15500"},{"inteligencia":"Matemático","puntuación":"2000"},{"inteligencia":"Corporal","puntuación":"43200"}],"resultado":[{"subactividad":"Musical","duración":"240","fechaInicio":"2016-06-15 14:23:12","fechaFin":"2016-07-15 14:28:12","puntajeInterno":"5000","detallePuntaje":["10000","5000","12222","3333","10","14","13","13","12"],"tiempoIntentos":["30","20","23","44","31","41","51","61","71"],"detalleAciertos":["4","2","3","4","2","3","5","7","2"],"nivelInteligencia":"3","preguntas":[{"pregunta":"¿Qué tanto se me facilita tocar un instrumento?","respuesta":"9"},{"pregunta":"¿Qué tanto me gusta usar audífonos todo el tiempo?","respuesta":"1"},{"pregunta":"¿Qué tanto me gusta aprenderme canciones e interpretarlas?","respuesta":"9"},{"pregunta":"¿Te gustó la actividad?","respuesta":"Si"}]},{"subactividad":"Interpersonal","duración":"75","fechaInicio":"2015-07-15 14:23:12","fechaFin":"2015-07-15 14:28:12","puntajeInterno":"30000","detallePreguntas":["2","2","2","2","0","0","2","2"],"nivelInteligencia":"1","preguntas":[{"pregunta":"¿Qué tanto me gusta ser el centro de atención de la fiesta?","respuesta":"9"},{"pregunta":"¿Qué tanto me gusta resolver los conflictos de mis amigos?","respuesta":"1"},{"pregunta":"¿Qué tanto me gusta relacionarme con todo tipo de personas?","respuesta":"9"},{"pregunta":"¿Te gustó la actividad?","respuesta":"Si"}]},{"subactividad":"Naturalista","duración":"5","fechaInicio":"2015-07-15 14:23:12","fechaFin":"2015-07-15 14:28:12","puntajeInterno":"200","detalleAciertos":["1","1","1","1","1","1","1","1","1"],"detallePuntaje":["1","1","1","1","1","1","1","1","1"],"nivelInteligencia ":"1","preguntas":[{"pregunta":"¿Qué tanto me gusta observar el cielo, la luna y las estrellas?","respuesta":"9"},{"pregunta":"¿Qué tanto disfruto los documentales sobre el reino animal y su hábitat?","respuesta":"1"},{"pregunta":"¿Qué tanto me gusta reciclar y cuidar el medio ambiente?","respuesta":"9"},{"pregunta":"¿Te gustó la actividad?","respuesta":"Si"}]},{"subactividad":"Intrapersonal","duración":"5","fechaInicio":"2015-07-15 14:23:12","fechaFin":"2015-07-15 14:28:12","puntajeInterno":"1000","detallePreguntas":["0","0","0","0","0","0","0","0"],"nivelInteligencia":"3","preguntas":[{"pregunta":"¿Qué tanto me gusta reflexionar sobre mis sentimientos? ","respuesta":"9"},{"pregunta":"¿Qué tanto me gusta escribir un diario?","respuesta":"1"},{"pregunta":"¿Qué tanto me gusta jugar y hacer mis trabajos escolares solo?","respuesta":"9"},{"pregunta":"¿Te gustó la actividad?","respuesta":"Si"}]},{"subactividad":"Corporal","duración":"5","fechaInicio":"2015-07-15 14:23:12","fechaFin":"2015-07-15 14:28:12","puntajeInterno":"2000","detalleAciertos":["3","4","2","3","3","5","7","17","1"],"tiempoIntentos":["1","3","2","4","6","8","9","0","3"],"detallePuntaje":["3","3","2","4","6","8","9","2","4"],"nivelInteligencia":"2","preguntas":[{"pregunta":"¿Qué tanto me gusta correr, brincar y saltar?","respuesta":"9"},{"pregunta":"¿Qué tanto disfrutas crear cosas con plastilina, barro, cera, etc.?","respuesta":"1"},{"pregunta":"¿Qué tanto me gusta bailar distintos ritmos?","respuesta":"9"},{"pregunta":"¿Te gustó la actividad?","respuesta":"Si"}]},{"subactividad":"Espacial","duración":"5","fechaInicio":"2015-07-15 14:23:12","fechaFin":"2015-07-15 14:28:12","puntajeInterno":"122","detalleAciertos":["123","1","21","31","41","51","61","71","81"],"tiempoIntentos":["91","81","71","61","51","41","31","21","11"],"detallePuntaje":["221","111","221","341","551","661","781","21","451"],"nivelInteligencia":"2","preguntas":[{"pregunta":"¿Cuándo me dirijo a un lugar nuevo, me es fácil ubicarme?","respuesta":"9"},{"pregunta":"¿Qué tanto se me facilita encontrar las diferencias entre dos imágenes que parecen similares?","respuesta":"1"},{"pregunta":"¿Qué tanto disfrutas leer mapas?","respuesta":"9"},{"pregunta":"¿Te gustó la actividad?","respuesta":"Si"}]},{"subactividad":"Matemática","duración":"5","fechaInicio":"2015-07-15 14:23:12","fechaFin":"2015-07-15 14:28:12","puntajeInterno":"2000","detalleAciertos":["3","1","61","71","91","51","21","41","51"],"tiempoIntentos":["2","1","61","71","81","51","61","51","41"],"detallePuntaje":["31","541","61","71","81","31","61","61","81"],"nivelInteligencia":"2","preguntas":[{"pregunta":"¿Qué tanto se me facilita hacer rompecabezas y armar figuras?","respuesta":"9"},{"pregunta":"¿Qué tanto te entretienen los videojuegos?","respuesta":"1"},{"pregunta":" ¿Qué tanto se te facilitan los juegos de mesa (dominó, cartas, damas chinas, etc.)?","respuesta":"9"},{"pregunta":"¿Te gustó la actividad?","respuesta":"Si"}]},{"subactividad":"Lingüística","duración":"5","fechaInicio":"2015-07-15 14:23:12","fechaFin":"2015-07-15 14:28:12","puntajeInterno":"3","detalleAciertos":["7","5","8","1","1","1","1","1","1"],"detallePuntaje":["3550","2000","4000","1","1","1","1","1","1"],"nivelInteligencia":"1","preguntas":[{"pregunta":"¿Qué tanto disfruto contar cuentos, chistes y chismes?","respuesta":"9"},{"pregunta":"¿Me gustan los juegos de palabras y los crucigramas? ","respuesta":"1"},{"pregunta":"¿Qué tanto participo o doy mi opinión en un debate o discusión?","respuesta":"9"},{"pregunta":"¿Te gustó la actividad?","respuesta":"Si"}]}]}
                       );
                  }
              }
              else{
                _loadedDrupalResources = true;
                
                try {
                document.addEventListener("deviceready",  function() { cordova.exec(successGame, failureGame, "CallToAndroid", "setRetoMultipleCallback", [])}, false);
                }
                catch (e) {
                  successGame(
                    {"userId":"103","actividad":"Reto múltiple","fechaModificación": "06/10/2016 11:08:18","imagenRecortada":"avatar_id.jpg","escudo":"Musical","actividadTerminada":"Si","inteligenciaPredominante":[{"inteligencia":"Musical","puntuación":"15500"},{"inteligencia":"Matemático","puntuación":"2000"},{"inteligencia":"Corporal","puntuación":"43200"}],"resultado":[{"subactividad":"Musical","duración":"240","fechaInicio":"2016-06-15 14:23:12","fechaFin":"2016-07-15 14:28:12","puntajeInterno":"5000","detallePuntaje":["10000","5000","12222","3333","10","14","13","13","12"],"tiempoIntentos":["30","20","23","44","31","41","51","61","71"],"detalleAciertos":["4","2","3","4","2","3","5","7","2"],"nivelInteligencia":"3","preguntas":[{"pregunta":"¿Qué tanto se me facilita tocar un instrumento?","respuesta":"9"},{"pregunta":"¿Qué tanto me gusta usar audífonos todo el tiempo?","respuesta":"1"},{"pregunta":"¿Qué tanto me gusta aprenderme canciones e interpretarlas?","respuesta":"9"},{"pregunta":"¿Te gustó la actividad?","respuesta":"Si"}]},{"subactividad":"Interpersonal","duración":"75","fechaInicio":"2015-07-15 14:23:12","fechaFin":"2015-07-15 14:28:12","puntajeInterno":"30000","detallePreguntas":["2","2","2","2","0","0","2","2"],"nivelInteligencia":"1","preguntas":[{"pregunta":"¿Qué tanto me gusta ser el centro de atención de la fiesta?","respuesta":"9"},{"pregunta":"¿Qué tanto me gusta resolver los conflictos de mis amigos?","respuesta":"1"},{"pregunta":"¿Qué tanto me gusta relacionarme con todo tipo de personas?","respuesta":"9"},{"pregunta":"¿Te gustó la actividad?","respuesta":"Si"}]},{"subactividad":"Naturalista","duración":"5","fechaInicio":"2015-07-15 14:23:12","fechaFin":"2015-07-15 14:28:12","puntajeInterno":"200","detalleAciertos":["1","1","1","1","1","1","1","1","1"],"detallePuntaje":["1","1","1","1","1","1","1","1","1"],"nivelInteligencia ":"1","preguntas":[{"pregunta":"¿Qué tanto me gusta observar el cielo, la luna y las estrellas?","respuesta":"9"},{"pregunta":"¿Qué tanto disfruto los documentales sobre el reino animal y su hábitat?","respuesta":"1"},{"pregunta":"¿Qué tanto me gusta reciclar y cuidar el medio ambiente?","respuesta":"9"},{"pregunta":"¿Te gustó la actividad?","respuesta":"Si"}]},{"subactividad":"Intrapersonal","duración":"5","fechaInicio":"2015-07-15 14:23:12","fechaFin":"2015-07-15 14:28:12","puntajeInterno":"1000","detallePreguntas":["0","0","0","0","0","0","0","0"],"nivelInteligencia":"3","preguntas":[{"pregunta":"¿Qué tanto me gusta reflexionar sobre mis sentimientos? ","respuesta":"9"},{"pregunta":"¿Qué tanto me gusta escribir un diario?","respuesta":"1"},{"pregunta":"¿Qué tanto me gusta jugar y hacer mis trabajos escolares solo?","respuesta":"9"},{"pregunta":"¿Te gustó la actividad?","respuesta":"Si"}]},{"subactividad":"Corporal","duración":"5","fechaInicio":"2015-07-15 14:23:12","fechaFin":"2015-07-15 14:28:12","puntajeInterno":"2000","detalleAciertos":["3","4","2","3","3","5","7","17","1"],"tiempoIntentos":["1","3","2","4","6","8","9","0","3"],"detallePuntaje":["3","3","2","4","6","8","9","2","4"],"nivelInteligencia":"2","preguntas":[{"pregunta":"¿Qué tanto me gusta correr, brincar y saltar?","respuesta":"9"},{"pregunta":"¿Qué tanto disfrutas crear cosas con plastilina, barro, cera, etc.?","respuesta":"1"},{"pregunta":"¿Qué tanto me gusta bailar distintos ritmos?","respuesta":"9"},{"pregunta":"¿Te gustó la actividad?","respuesta":"Si"}]},{"subactividad":"Espacial","duración":"5","fechaInicio":"2015-07-15 14:23:12","fechaFin":"2015-07-15 14:28:12","puntajeInterno":"122","detalleAciertos":["123","1","21","31","41","51","61","71","81"],"tiempoIntentos":["91","81","71","61","51","41","31","21","11"],"detallePuntaje":["221","111","221","341","551","661","781","21","451"],"nivelInteligencia":"2","preguntas":[{"pregunta":"¿Cuándo me dirijo a un lugar nuevo, me es fácil ubicarme?","respuesta":"9"},{"pregunta":"¿Qué tanto se me facilita encontrar las diferencias entre dos imágenes que parecen similares?","respuesta":"1"},{"pregunta":"¿Qué tanto disfrutas leer mapas?","respuesta":"9"},{"pregunta":"¿Te gustó la actividad?","respuesta":"Si"}]},{"subactividad":"Matemática","duración":"5","fechaInicio":"2015-07-15 14:23:12","fechaFin":"2015-07-15 14:28:12","puntajeInterno":"2000","detalleAciertos":["3","1","61","71","91","51","21","41","51"],"tiempoIntentos":["2","1","61","71","81","51","61","51","41"],"detallePuntaje":["31","541","61","71","81","31","61","61","81"],"nivelInteligencia":"2","preguntas":[{"pregunta":"¿Qué tanto se me facilita hacer rompecabezas y armar figuras?","respuesta":"9"},{"pregunta":"¿Qué tanto te entretienen los videojuegos?","respuesta":"1"},{"pregunta":" ¿Qué tanto se te facilitan los juegos de mesa (dominó, cartas, damas chinas, etc.)?","respuesta":"9"},{"pregunta":"¿Te gustó la actividad?","respuesta":"Si"}]},{"subactividad":"Lingüística","duración":"5","fechaInicio":"2015-07-15 14:23:12","fechaFin":"2015-07-15 14:28:12","puntajeInterno":"3","detalleAciertos":["7","5","8","1","1","1","1","1","1"],"detallePuntaje":["3550","2000","4000","1","1","1","1","1","1"],"nivelInteligencia":"1","preguntas":[{"pregunta":"¿Qué tanto disfruto contar cuentos, chistes y chismes?","respuesta":"9"},{"pregunta":"¿Me gustan los juegos de palabras y los crucigramas? ","respuesta":"1"},{"pregunta":"¿Qué tanto participo o doy mi opinión en un debate o discusión?","respuesta":"9"},{"pregunta":"¿Te gustó la actividad?","respuesta":"Si"}]}]}
                  );
               }
              }
            }

            $scope.downloadGame = function () {
              $scope.$emit('ShowPreloader');
              loadData();
            }
            
            var successGame = function (data){
              $timeout(function(){
                $scope.$apply(function() {
                  if (data) {
                      $rootScope.retoMultipleTerminado = data.actividadTerminada;
                    var userCourseUpdated = JSON.parse(localStorage.getItem("usercourse"));
                    var parentActivityIdentifier = $routeParams.moodleid;
                    var parentActivity = getActivityByActivity_identifier(parentActivityIdentifier, userCourseUpdated);
                     console.log("return game");
                     console.log(JSON.stringify(data));
                     if (data.imageB64) {
                        //var currUser = JSON.parse(localStorage.getItem("CurrentUser"));
                        console.log(data.imageB64);
                        currentUser.base64Image = 'data:image/png;base64,' + data.imageB64;
                        currentUser.retoMultipleAvatar = 'data:image/png;base64,' + data.imageB64;
                        localStorage.setItem("CurrentUser", JSON.stringify(currentUser));
                     };
                    
                    $scope.IsComplete = (data.actividadTerminada && data.actividadTerminada == "Si");
                    var partials = {"IsPartial":true, "data":[]};
                    var quizzes = [];

                    var subactivitiesCompleted = [];
                    
                    var request = {
                      "userid": $scope.user.id,
                      "moduleid": $scope.retosMultipleChallenge.coursemoduleid,
                      "type":"assign",
                      "activities": []
                    }

                    _.each($scope.retoMultipleActivities, function(activityCache){
                      var activity = _.find(data.resultado, function(r){ return activityCache.name.toLowerCase().indexOf(r.subactividad.toLowerCase()) > -1 });
                      if (activity) {
                        var activityName = activity.subactividad.toLowerCase();
                        var partialActivityIndex = $scope.partialActivities.getIndexBy("subactivity", activityName);
                        var completedActivityIndex = $scope.completedActivities.getIndexBy("subactivity", activityName);
                        var partialRequest = {
                          "userId": $scope.user.id,
                          "moduleid": activityCache.coursemoduleid, 
                          "subactivity": activity.subactividad, 
                          "datestart": (activity.fechaInicio != "" ? moment(new Date(activity.fechaInicio.split("-").join("/"))).unix() : 0),
                          "dateend": (activity.fechaFin != "" ? moment(new Date(activity.fechaFin.split("-").join("/"))).unix() : 0),
                          "detalleaciertos": (activity.detalleAciertos ? JSON.stringify(activity.detalleAciertos) : ""), 
                          "detallepuntaje": (activity.detallePuntaje ? JSON.stringify(activity.detallePuntaje) : ""), 
                          "detalletiempo": (activity.tiempoIntentos ? JSON.stringify(activity.tiempoIntentos) :  ""),
                          "action": activity.puntajeInterno && activity.puntajeInterno != "" ? "delete" : "add"
                        };
                        if (partialActivityIndex >= 0) {
                          $scope.partialActivities.splice(partialActivityIndex, 1);
                        } //if finished
                        if (activity.puntajeInterno && activity.puntajeInterno != "") {
                          var activityRequest = {
                              "answers": [],
                              "like_status": (activity.preguntas[3].respuesta == "No" ? 0 : 1),
                              "moduleid": activityCache.coursemoduleid,
                              "datestart": (activity.fechaInicio != "" ? moment(new Date(activity.fechaInicio.split("-").join("/"))).unix() : 0),
                              "dateend": (activity.fechaFin != "" ? moment(new Date(activity.fechaFin.split("-").join("/"))).unix() : 0),
                              "type":"quiz",
                              "subactivity":activity.subactividad,
                              "puntaje":activity.puntajeInterno,
                              "detallepuntaje": (activity.detallePuntaje ? JSON.stringify(activity.detallePuntaje) : ""),
                              "detalleaciertos": (activity.detalleAciertos ? JSON.stringify(activity.detalleAciertos) : ""),
                              "detallepreguntas":(activity.detallePreguntas ? JSON.stringify(activity.detallePreguntas) : ""),
                              "detalletiempo": (activity.tiempoIntentos ? JSON.stringify(activity.tiempoIntentos) : ""),
                              "nivelmaximo": (activity.nivelInteligencia ? activity.nivelInteligencia : "0")
                          }
                          if (partialActivityIndex >= 0) {
                            partials.data.push(partialRequest);
                          }
                          if (completedActivityIndex >= 0) {
                            var completedActivity = $scope.completedActivities[completedActivityIndex];
                            completedActivity["datestart"] = (activity.fechaInicio != "" ? moment(new Date(activity.fechaInicio.split("-").join("/"))).unix() : 0);
                            completedActivity["dateend"] = (activity.fechaFin != "" ? moment(new Date(activity.fechaFin.split("-").join("/"))).unix() : 0),
                            completedActivity["puntaje"] = activity.puntajeInterno;
                            completedActivity["detallepuntaje"] = (activity.detallePuntaje ? JSON.stringify(activity.detallePuntaje) : "");
                            completedActivity["detalleaciertos"] = (activity.detalleAciertos ? JSON.stringify(activity.detalleAciertos) : "");
                            completedActivity["detallepreguntas"] = (activity.detallePreguntas ? JSON.stringify(activity.detallePreguntas) : "");
                            completedActivity["detalletiempo"] = (activity.tiempoIntentos ? JSON.stringify(activity.tiempoIntentos) : "");
                            completedActivity["nivelmaximo"] = (completedActivity.nivelmaximo && completedActivity.nivelmaximo != "" ? 
                              (completedActivity.nivelmaximo > activity.nivelInteligencia ? completedActivity.nivelmaximo : activity.nivelInteligencia) : activity.nivelInteligencia);
                          }else{
                            $scope.completedActivities.push(activityRequest);
                          }
                          for (var i = 0; i < activity.preguntas.length - 1; i++) {
                              activityCache.questions[i]["userAnswer"] = (activityCache.questions[i]["userAnswer"] == "" ? activity.preguntas[i].respuesta : activityCache.questions[i]["userAnswer"] );
                              activityRequest.answers.push(activityCache.questions[i]["userAnswer"]);
                          }
                          activityCache.questions[3]["userAnswer"] = !activity.nivelInteligencia || activity.nivelInteligencia == "" ? "0" : activity.nivelInteligencia;
                          activityRequest.answers.push(activityCache.questions[3]["userAnswer"]);
                          request.activities.push(activityRequest);
                          subactivitiesCompleted.push(activityCache.coursemoduleid);
                        }else{
                          $scope.activitiesToPost++;
                          partials.data.push(partialRequest);
                          $scope.partialActivities.push(partialRequest);
                        }
                        if (data.inteligenciaPredominante && data.inteligenciaPredominante.length > 0) {
                          var isAlto = _.find(data.inteligenciaPredominante, function(p) { return p.inteligencia == activity.subactividad; });
                          activityCache.score = (isAlto) ? 3 : 1;
                          activityCache.total_score = activity.puntajeInterno;
                        }
                      }
                    });

                    if ($scope.IsComplete) {
                      parentActivity.onlymodifieddate=false;
                      if (parentActivity.status == 0) {
                        if (data.escudo && data.escudo != "" && $scope.user) {
                          var shield = ( data.escudo.toLowerCase().indexOf('matem') > -1 ? 'Matematica' : ( data.escudo.toLowerCase().indexOf('ling') > -1 ? 'Linguistica' : data.escudo ));
                          $scope.user["shield"] = shield;
                          currentUser.shield = shield;
                          var careers = {
                            "Linguistica":["Escritor","Locutor de radio o TV","Periodista","Abogado","Editor de textos","Traductor","Dramaturgo","Bibliotecario","Orador"],
                            "Matematica":["Tecnólogo","Contador","Matemático","Científico","Economista","Ingeniero","Informático","Auditor","Físico"], 
                            "Espacial":["Ingeniero","Topógrafo","Arquitecto","Dibujante","Pintor","Fotógrafo","Diseñador","Marino","Escultor"], 
                            "Musical":["DJ","Fabricante de instrumentos","Afinador de pianos","Compositor","Ingeniero de sonidos","Corista","Cantante","Profesor de música","Productor musical"],
                            "Corporal": ["Actor","Profesor de Educación Física","Coreógrafo","Cirujano","Mecánico","Deportista","Bailarín"], 
                            "Interpersonal":["Sociólogo","Psicólogo social","Vendedor","Publicista","Político","Sacerdote","Educador","Trabajador social","Enfermera"], 
                            "Intrapersonal":["Consejero","Psicólogo clínico","Terapeuta","Filósofo","Teólogo","Maestro de yoga","Coach"], 
                            "Naturalista":["Biólogo","Nutriólogo","Agrónomo","Vererinario","Meteorólogo","Ecologista","Geólogo","Antropóloogo","Chef","Biotecnólogo"]
                          };
                          $scope.user["recomendedBachelorDegrees"] = careers[shield];
                          $scope.user["strengths"] = [];
                          $scope.user["windowOfOpportunity"] = [];

                          _.each($scope.retoMultipleActivities, function(a){
                            if (a.score == 3) {
                              $scope.user["strengths"].push(a.name);
                            }else if(a.score != -1){
                              $scope.user["windowOfOpportunity"].push(a.name);
                            }
                          });

                          var profileCatalogs = JSON.parse(localStorage.getItem("profileCatalogs"));
                          
                          var profilePoints = [];
                          for(var i= 0; i< $scope.user["strengths"].length; i++){
                              var intelligenceId = _.findWhere(profileCatalogs.intelligences, { name : $scope.user["strengths"][i] }).id;
                              console.log("intelligence id " + intelligenceId);
                              var profilesByIntelligence = _.where(profileCatalogs.intelligences_profile, { intelligenceid : intelligenceId});
                              for (var j =0; j < profilesByIntelligence.length; j++) {
                                  var profileIntelligence = profilesByIntelligence[j];
                                  var pointsByIntelligence = { "profileid": profileIntelligence.profileid , "score": 1 };
                                  profilePoints.push(pointsByIntelligence);
                              };
                          };

                           var groupedProfiles = _(profilePoints).groupBy('profileid');
                           var sumOfGroupedProfiles = _(groupedProfiles).map(function(g,key){
                              return {
                                   profileid: key,
                                   score: _(g).reduce(function(m,x){return m + x.score},0),
                                   moduleid : $scope.retosMultipleChallenge.coursemoduleid
                               };
                           });
                           
                          console.log(JSON.stringify(sumOfGroupedProfiles)); 
                          fillProfilePoints(sumOfGroupedProfiles);
                          
                          _setLocalStorageJsonItem("Perfil/" + $scope.user.id, $scope.user);
                          _setLocalStorageJsonItem("CurrentUser", currentUser);

                          $scope.saveUser();
                        }
                        
                        if (data.imagenRecortada && data.imagenRecortada != "") {
                          var pathImagen = "assets/avatar/avatar_" + $scope.user.id + ".png";
                          encodeImageWithUri(pathImagen, "image/png", function(b64){
                            var avatarInfo = [{
                              "userid": $scope.user.id,
                              "filecontent": b64,
                              "onlypicture": true
                            }];
                            moodleFactory.Services.PostAsyncAvatar(avatarInfo[0], function(){}, function(obj){
                                $scope.$emit('HidePreloader');                              
                            });
                          })
                        }else{
                          _loadedResources = false;
                          _pageLoaded = true;
                          drupalFactory.Services.GetContent("1039Robot", function (data, key) {
                              _loadedResources = true;
                              if (_loadedResources && _pageLoaded) { $scope.$emit('HidePreloader'); }
                              var modalInstance = $modal.open({
                                  templateUrl: 'RetoMultipleModal.html',
                                  controller: 'stageGameRetoMultipleModalController',
                                  resolve: {
                                      content: function () {
                                          return data.node;
                                      }
                                  },
                                  windowClass: 'closing-stage-modal user-help-modal'
                              });
                          }, function () { _loadedResources = true; if (_loadedResources && _pageLoaded) { $scope.$emit('HidePreloader'); } }, false);                      
                        }
                        _endActivity(parentActivity, function(){
                              $scope.$emit('HidePreloader');
                           }, function(){
                            $scope.$emit('HidePreloader');
                        }, true);
                        parentActivity.status = 1;
                        if (parentActivity.activities) {
                          updateMultipleSubactivityStars(parentActivity, subactivitiesCompleted, false, function(){
                              $scope.$emit('HidePreloader');
                          }, true);
                        }
                      }
                    }
                    parentActivity.modifieddate=data.fechaModificación || '';
                     parentActivity.onlymodifieddate=true;
                     _endActivity(parentActivity, function(){
                           $scope.$emit('HidePreloader');
                        }, function(obj) {//Error handler
                         $scope.$emit('HidePreloader');
                     }, true);

                    if (request.activities.length > 0) {
                      $scope.activitiesToPost++;
                      quizzes.push(request);
                      _setLocalStorageJsonItem("retoMultipleCompleted", $scope.completedActivities);
                    }
                    if (partials.data.length > 0) {
                      quizzes.push(partials);
                      _setLocalStorageJsonItem("retoMultiplePartials", $scope.partialActivities);
                    }
                    if (quizzes.length > 0) {
                      userCourseUpdated = updateMultipleSubActivityStatuses(parentActivity, subactivitiesCompleted, true, $scope.IsComplete);
                      userCourseUpdated.isMultipleChallengeActivityFinished = $scope.IsComplete;
                      $scope.$emit('ShowPreloader');
                      $scope.saveQuiz(quizzes, userCourseUpdated);
                      _setLocalStorageJsonItem("retoMultipleActivities", $scope.retoMultipleActivities);
                      _setLocalStorageJsonItem("usercourse", userCourseUpdated);
                    }else{
                      $timeout(function(){
                        $scope.$apply(function() {
                            $location.path('/ZonaDeVuelo/Dashboard/1/2');
                        });
                      }, 1000);
                    }
                  }else{
                    $timeout(function(){
                      $scope.$apply(function() {
                          $location.path('/ZonaDeVuelo/Dashboard/1/2');
                      });
                    }, 1000);
                  }
                });
              }, 2000);
            }

         $scope.saveQuiz = function(quizzes, userCourseUpdated) {
              var activityPosted = 0;
              var checkActivitiesPosted = function(){
                activityPosted++;
                if (activityPosted == $scope.activitiesToPost) {
                  finishedPosting(true);
                }
              }

              var finishedPosting = function(success){
                if (success && $routeParams.retry) {
                  _forceUpdateConnectionStatus(function() {
                      if (_isDeviceOnline) {
                          moodleFactory.Services.ExecuteQueue();
                      }
                  }, function() {} );
                }
                $timeout(function(){
                  $scope.$emit('HidePreloader');
                  var url = "";
                  if ($scope.IsComplete && success) {
                    url = '/ZonaDeVuelo/Conocete/RetoMultipleFichaDeResultados';  
                  }else{
                    url = '/ZonaDeVuelo/Dashboard/1/2';
                  }
                  $scope.$apply(function() {
                      $location.path(url);
                  });
                }, 1000);
              }

            _.each(quizzes, function(quiz){
               if (quiz.IsPartial) {
                  _.each(quiz.data, function(q){
                     moodleFactory.Services.PutMultipleActivities("usercourse", q, userCourseUpdated, 'partialactivities', function(){
                        checkActivitiesPosted();
                     }, function(obj){
                        finishedPosting();
                        $scope.$emit('HidePreloader');
                     }, true);
                  });
               }else{
                  moodleFactory.Services.PostMultipleActivities("usercourse", quiz, userCourseUpdated, 'multipleactivities', function(){
                     checkActivitiesPosted();
                  }, function(obj){
                     finishedPosting();
                     $scope.$emit('HidePreloader');
                  }, true);
               }
            });              
         }

            $scope.saveUser = function () {
                moodleFactory.Services.PutAsyncProfile($scope.user.id, $scope.user, function() {}, function() {
                    $scope.$emit('HidePreloader');
                }, false, true);
            };
                
            var failureGame = function (data){
              $location.path('/ZonaDeVuelo/Dashboard/1/2');
            }

            $scope.back = function () {
                $location.path('/ZonaDeVuelo/Dashboard/1/2');
            }

            var fillArray = function(values, fill, length){
              var result = (typeof values == 'string' ? values.split(";") : values );
              for (var i = result.length; i < length; i++) {
                result.push(fill);
              }
              return result;
            }

            if(!$routeParams.retry){
              try {
                cordova.exec(function(data) { $scope.isInstalled = data.isInstalled }, function() {} , "CallToAndroid", " isInstalled", []);
              }
              catch (e) {
                $scope.isInstalled = true;
              }
            }else{
              loadData();
            }

            Array.prototype.getIndexBy = function (name, value) {
                for (var i = 0; i < this.length; i++) {
                  var thisValue = typeof value == 'string' ? this[i][name].toLowerCase() : this[i][name];
                  if (thisValue == value) {
                      return i;
                  }
                }
            }
        }])
        .controller('stageGameRetoMultipleModalController', ['$scope', '$modalInstance', 'content', function ($scope, $modalInstance, content) {
          $scope.message = content.mensaje;
          $scope.title = content.titulo;
          $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
          };
        }]);