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
        function ($q, $scope, $location, $routeParams, $timeout, $rootScope, $http, $anchorScroll, $modal) {
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
            var activitiesPosted = 0;
            _setLocalStorageItem("retoMultipleActivities", null);
            $scope.user = moodleFactory.Services.GetCacheJson("Perfil/" + moodleFactory.Services.GetCacheObject("userId"));
            $scope.activities = moodleFactory.Services.GetCacheJson("activityManagers");
            $scope.profile = moodleFactory.Services.GetCacheJson("Perfil/" + moodleFactory.Services.GetCacheObject("userId"));
            $scope.retoMultipleActivities = moodleFactory.Services.GetCacheJson("retoMultipleActivities");
            $scope.retosMultipleChallenge = _.find($scope.activities, function(a) { return a.activity_identifier == $routeParams.moodleid});
            if ($scope.retosMultipleChallenge) {
              $scope.stars = $scope.retosMultipleChallenge.points;
              _.each($scope.retosMultipleChallenge.activities, function(a){
                $scope.stars += a.points;
              });
            }

            $scope.isInstalled = false;

            if(!$routeParams.retry){
              for(var key in localStorage){  
                  if(key.indexOf("retoMultipleScores") > -1 && key.indexOf($scope.user.id) < 0){
                      localStorage.removeItem(key);  
                  }
              }
              try {
                cordova.exec(function(data) { $scope.isInstalled = data.isInstalled }, function() {} , "CallToAndroid", " isInstalled", []);
              }
              catch (e) {
                $scope.isInstalled = true;
              }
            }

            var loadData = function(hidePreloader){
              $scope.retoMultipleActivities = [];
              if ($scope.retosMultipleChallenge) {
                retoMultipleArray = $scope.retosMultipleChallenge.activities;
                for(var i = 0; i < $scope.retosMultipleChallenge.activities.length; i++){
                  var activity = moodleFactory.Services.GetCacheJson("activity/" + $scope.retosMultipleChallenge.activities[i].coursemoduleid);
                  if (activity) {
                    $scope.retoMultipleActivities.push(activity);
                  } else {
                    moodleFactory.Services.GetAsyncActivity($scope.retosMultipleChallenge.activities[i].coursemoduleid, currentUser.token, function(data) {
                      $scope.retoMultipleActivities.push(data);
                      assignCourseModuleId(true, data);
                    });
                  }
                  if ($scope.retoMultipleActivities.length > 0) {
                    assignCourseModuleId(false, $scope.retosMultipleChallenge.activities[i]);
                  }
                }
              }
            };

            var assignCourseModuleId = function(asyncRequest, data){
              $scope.retoMultipleActivities[$scope.retoMultipleActivities.length - 1]["coursemoduleid"] = 
              ( asyncRequest ? _.find($scope.retosMultipleChallenge.activities, function(r){ return r.activityname == data.name }).coursemoduleid : data.coursemoduleid);
              if ($scope.retoMultipleActivities.length == $scope.retosMultipleChallenge.activities.length) {
                $scope.$emit('HidePreloader');
                $scope.retoMultipleActivities = _.sortBy($scope.retoMultipleActivities, function(r){ return r.coursemoduleid; });
                createRequest();
              }
            }

            var createRequest = function() {
                var request = {
                  "userId": "" + $scope.user.id,
                  "alias": $scope.user.username,
                  "actividad": "Reto múltiple",
                  "pathImagen": "",
                  "actividadTerminada":"",
                  "subactividades": []
                };
                var scoresActivity;
                _.each($scope.retoMultipleActivities, function(activity){
                  if (activity.name.toLowerCase().indexOf("resultados") < 0) {
                    var subactivity = {
                        "estrellas": "300",
                        "subactividad": activity.name,
                        "puntajeFinal": "0"
                    };
                    request.subactividades.push(subactivity);
                  }
                  else  if (activity.name.toLowerCase().indexOf("resultados") >= 0){
                    scoresActivity = activity;
                  }
                });
                var activityAnswers = moodleFactory.Services.GetCacheJson("retoMultipleScores/" + $scope.user.id);
                if (activityAnswers) {
                  setUserAnswers(request, activityAnswers, scoresActivity);
                }else{
                  moodleFactory.Services.GetAsyncActivity(scoresActivity.coursemoduleid + "?userid=" + $scope.user.id, currentUser.token, function(data){
                    data["coursemoduleid"] = scoresActivity.coursemoduleid;
                    setUserAnswers(request, data, scoresActivity);
                  }); 
                }
            }
         
            var setUserAnswers = function(request, scores, scoresActivity){
              var equalsLength = (scores.questions != null && scores.questions.length == scoresActivity.questions.length);
              var isFinished = equalsLength;
              scores.questions = (scores.questions ? scores.questions : scoresActivity.questions);
              _.each(request.subactividades, function(subactividad) {
                var currentQuestions = _.filter(scores.questions, function(q) { return q.title.toLowerCase().indexOf(subactividad.subactividad.toLowerCase()) >= 0 });
                _.each(currentQuestions, function(question) {
                  var questionTitle = question.title.toLowerCase();
                  if (questionTitle.indexOf("tiempo") < 0 && questionTitle.indexOf("intento") < 0) {
                    var answer;
                    if (questionTitle.indexOf("detalle") >= 0) {
                      answer = (question.userAnswer == "" ? fillArray("-1", "-1", 9) : question.userAnswer.split(";"));
                    }else{
                      answer = (question.userAnswer == "" ? "0" : question.userAnswer);
                    }
                    var detail = "";
                    if (questionTitle.indexOf("puntaje") >= 0) {
                      if (questionTitle.indexOf("detalle") >= 0) {
                        detail = "detallePuntaje";
                        question.userAnswer = getAnswer(answer, true);
                        isFinished = isFinished && (typeof answer == 'object' ? !(_.countBy(answer, function(a){ return a==-1 ? 'unanswered':'answered' }).unanswered) : true);
                      }else{
                        detail = "puntajeFinal";
                      }
                    }else if (questionTitle.indexOf("nivel") >= 0){
                      detail = "nivelInteligencia";
                    }else if(questionTitle.indexOf("aciertos") >= 0){
                      detail = "detalleAciertos";
                    }else if (questionTitle.indexOf("preguntas") >= 0) {
                      isFinished = isFinished && (typeof answer == 'object' ? !(_.countBy(answer, function(a){ return a==0 ? 'unanswered':'answered' }).unanswered) : true);
                      detail = "detallePreguntas";
                    }
                    subactividad[detail] = answer;
                  }
                });
              });
              _setLocalStorageJsonItem("retoMultipleScores/" + $scope.user.id, scores);
              request.actividadTerminada = (isFinished ? "Si" : "No");
              $scope.$emit('HidePreloader');
              if (!$routeParams.retry) {
                try {
                  cordova.exec(successGame, failureGame, "CallToAndroid", "openApp", [request]);
                }
                catch (e) {
                  successGame(
                    //{"pathImagen":"user_293.png","imagenRecortada":"user_293.png","userid":"103","resultado":[{"subactividad":"Musical","duración":"240","fechaInicio":"2015/07/15 14:23:12","fechaFin":"2015/07/15 14:28:12","puntajeInterno":"0","detallePuntaje":["10000","5000","0","0","0","0","0","0","0"],"tiempoIntentos":["30","20","0","0","0","0","0","0","0"],"detalleAciertos":["4","2","0","0","0","0","0","0","0"],"nivelInteligencia":"1","preguntas":[{"pregunta":"¿Qué tanto se me facilita tocar un instrumento?","respuesta":"2"},{"pregunta":"¿Qué tanto me gusta usar audífonos todo el tiempo?","respuesta":"1"},{"pregunta":"¿Qué tanto me gusta aprenderme canciones e interpretarlas?","respuesta":"3"},{"pregunta":"¿Te gustó la actividad?","respuesta":"Si"}]},{"subactividad":"Interpersonal","duración":"75","fechaInicio":"2015/07/15 14:23:12","fechaFin":"2015/07/15 14:28:12","puntajeInterno":"15500","detallePreguntas":["2","1","2","3","3","1","2","3"],"nivelInteligencia":"1","preguntas":[{"pregunta":"¿Qué tanto me gusta ser el centro de atención de la fiesta?","respuesta":"2"},{"pregunta":"¿Qué tanto me gusta resolver los conflictos de mis amigos?","respuesta":"1"},{"pregunta":"¿Qué tanto me gusta relacionarme con todo tipo de personas?","respuesta":"4"},{"pregunta":"¿Te gustó la actividad?","respuesta":"Si"}]},{"subactividad":"Naturalista","duración":"5","fechaInicio":"2015/07/15 14:23:12","fechaFin":"2015/07/15 14:28:12","puntajeInterno":"0","detalleAciertos":["-1","-1","-1","-1","-1","-1","-1","-1",],"detallePuntaje":["-1","-1","-1","-1","-1","-1","-1","-1",],"nivelInteligencia":"1","preguntas":[{"pregunta":"¿Qué tanto me gusta observar el cielo, la luna y las estrellas?","respuesta":""},{"pregunta":"¿Qué tanto disfruto los documentales sobre el reino animal y su hábitat?","respuesta":""},{"pregunta":"¿Qué tanto me gusta reciclar y cuidar el medio ambiente?","respuesta":""},{"pregunta":"¿Te gustó la actividad?","respuesta":""}]},{"subactividad":"Intrapersonal","duración":"5","fechaInicio":"2015/07/15 14:23:12","fechaFin":"2015/07/15 14:28:12","puntajeInterno":"0","detallePreguntas":["0","0","0","0","0","0","0",],"nivelInteligencia":"1","preguntas":[{"pregunta":"¿Qué tanto me gusta reflexionar sobre mis sentimientos? ","respuesta":""},{"pregunta":"¿Qué tanto me gusta escribir un diario?","respuesta":""},{"pregunta":"¿Qué tanto me gusta jugar y hacer mis trabajos escolares solo?","respuesta":""},{"pregunta":"¿Te gustó la actividad?","respuesta":""}]},{"subactividad":"Corporal","duración":"5","fechaInicio":"2015/07/15 14:23:12","fechaFin":"2015/07/15 14:28:12","puntajeInterno":"6800","detalleAciertos":["3","4","2","-1","-1","-1","-1","-1",],"tiempoIntentos":["1","3","2","-1","-1","-1","-1","-1",],"detallePuntaje":["-1","-1","-1","-1","-1","-1","-1","-1",],"nivelInteligencia":"1","preguntas":[{"pregunta":"¿Qué tanto me gusta correr, brincar y saltar?","respuesta":""},{"pregunta":"¿Qué tanto disfrutas crear cosas con plastilina, barro, cera, etc.?","respuesta":""},{"pregunta":"¿Qué tanto me gusta bailar distintos ritmos?","respuesta":""},{"pregunta":"¿Te gustó la actividad?","respuesta":""}]},{"subactividad":"Espacial","duración":"5","fechaInicio":"2015/07/15 14:23:12","fechaFin":"2015/07/15 14:28:12","puntajeInterno":"0","detalleAciertos":["-1","-1","-1","-1","-1","-1","-1","-1",],"tiempoIntentos":["-1","-1","-1","-1","-1","-1","-1","-1",],"detallePuntaje":["-1","-1","-1","-1","-1","-1","-1","-1",],"nivelInteligencia":"0","preguntas":[{"pregunta":"¿Cuándo me dirijo a un lugar nuevo, me es fácil ubicarme?","respuesta":""},{"pregunta":"¿Qué tanto se me facilita encontrar las diferencias entre dos imágenes que parecen similares?","respuesta":""},{"pregunta":"¿Qué tanto disfrutas leer mapas?","respuesta":""},{"pregunta":"¿Te gustó la actividad?","respuesta":""}]},{"subactividad":"Matemática","duración":"5","fechaInicio":"2015/07/15 14:23:12","fechaFin":"2015/07/15 14:28:12","puntajeInterno":"0","detalleAciertos":["-1","-1","-1","-1","-1","-1","-1","-1",],"tiempoIntentos":["-1","-1","-1","-1","-1","-1","-1","-1",],"detallePuntaje":["-1","-1","-1","-1","-1","-1","-1","-1",],"nivelInteligencia":"0","preguntas":[{"pregunta":"¿Qué tanto se me facilita hacer rompecabezas y armar figuras?","respuesta":""},{"pregunta":"¿Qué tanto te entretienen los videojuegos?","respuesta":""},{"pregunta":" ¿Qué tanto se te facilitan los juegos de mesa (dominó, cartas, damas chinas, etc.)?","respuesta":""},{"pregunta":"¿Te gustó la actividad?","respuesta":""}]},{"subactividad":"Lingüística","duración":"5","fechaInicio":"2015/07/15 14:23:12","fechaFin":"2015/07/15 14:28:12","puntajeInterno":"15500","detalleAciertos":["7","5","8","3","2","1","2","3","1"],"detallePuntaje":["3550","2000","4000","500","600","800","0","6000","550"],"nivelInteligencia":"1","preguntas":[{"pregunta":"¿Qué tanto disfruto contar cuentos, chistes y chismes?","respuesta":"9"},{"pregunta":"¿Me gustan los juegos de palabras y los crucigramas? ","respuesta":"8"},{"pregunta":"¿Qué tanto participo o doy mi opinión en un debate o discusión?","respuesta":"7"},{"pregunta":"¿Te gustó la actividad?","respuesta":"No"}]}],"inteligenciaPredominante":[],"userId":"196","escudo":"","actividad":"Reto múltiple"}
                    {"pathImagen":"user_293.png","imagenRecortada":"user_293.png","userid":"103","resultado":[{"subactividad":"Musical","duración":"240","fechaInicio":"2015/07/15 14:23:12","fechaFin":"2015/07/15 14:28:12","puntajeInterno":"15000","detallePuntaje":["10000","5000","0","0","0","0","0","0","0"],"tiempoIntentos":["30","20","0","0","0","0","0","0","0"],"detalleAciertos":["4","2","0","0","0","0","0","0","0"],"nivelInteligencia":"2","preguntas":[{"pregunta":"¿Qué tanto se me facilita tocar un instrumento?","respuesta":""},{"pregunta":"¿Qué tanto me gusta usar audífonos todo el tiempo?","respuesta":""},{"pregunta":"¿Qué tanto me gusta aprenderme canciones e interpretarlas?","respuesta":""},{"pregunta":"¿Te gustó la actividad?","respuesta":""}]},{"subactividad":"Interpersonal","duración":"75","fechaInicio":"2015/07/15 14:23:12","fechaFin":"2015/07/15 14:28:12","puntajeInterno":"15500","detallePreguntas":["2","1","2","3","3","1","2","3"],"nivelInteligencia":"2","preguntas":[{"pregunta":"¿Qué tanto me gusta ser el centro de atención de la fiesta?","respuesta":""},{"pregunta":"¿Qué tanto me gusta resolver los conflictos de mis amigos?","respuesta":""},{"pregunta":"¿Qué tanto me gusta relacionarme con todo tipo de personas?","respuesta":""},{"pregunta":"¿Te gustó la actividad?","respuesta":""}]},{"subactividad":"Naturalista","duración":"5","fechaInicio":"2015/07/15 14:23:12","fechaFin":"2015/07/15 14:28:12","puntajeInterno":"90000","detalleAciertos":["5000","10000","5000","3000","7000","40000","10000","10000","0"],"detallePuntaje":["2","3","13","23","1","6","5","8","0"],"nivelInteligencia":"3","preguntas":[{"pregunta":"¿Qué tanto me gusta observar el cielo, la luna y las estrellas?","respuesta":"8"},{"pregunta":"¿Qué tanto disfruto los documentales sobre el reino animal y su hábitat?","respuesta":"8"},{"pregunta":"¿Qué tanto me gusta reciclar y cuidar el medio ambiente?","respuesta":"10"},{"pregunta":"¿Te gustó la actividad?","respuesta":"Si"}]},{"subactividad":"Intrapersonal","duración":"5","fechaInicio":"2015/07/15 14:23:12","fechaFin":"2015/07/15 14:28:12","puntajeInterno":"25600","detallePreguntas":["2","3","4","5","6","7","8","9"],"nivelInteligencia":"1","preguntas":[{"pregunta":"¿Qué tanto me gusta reflexionar sobre mis sentimientos? ","respuesta":"2"},{"pregunta":"¿Qué tanto me gusta escribir un diario?","respuesta":"3"},{"pregunta":"¿Qué tanto me gusta jugar y hacer mis trabajos escolares solo?","respuesta":"2"},{"pregunta":"¿Te gustó la actividad?","respuesta":"No"}]},{"subactividad":"Corporal","duración":"5","fechaInicio":"2015/07/15 14:23:12","fechaFin":"2015/07/15 14:28:12","puntajeInterno":"6800","detalleAciertos":["3","4","2","1","1","5","0","0","0"],"tiempoIntentos":["1","3","2","3","6","3","0","0","0"],"detallePuntaje":["1800","2000","500","500","1550","450","0","0","0"],"nivelInteligencia":"1","preguntas":[{"pregunta":"¿Qué tanto me gusta correr, brincar y saltar?","respuesta":"6"},{"pregunta":"¿Qué tanto disfrutas crear cosas con plastilina, barro, cera, etc.?","respuesta":"5"},{"pregunta":"¿Qué tanto me gusta bailar distintos ritmos?","respuesta":"4"},{"pregunta":"¿Te gustó la actividad?","respuesta":"No"}]},{"subactividad":"Espacial","duración":"5","fechaInicio":"2015/07/15 14:23:12","fechaFin":"2015/07/15 14:28:12","puntajeInterno":"100","detalleAciertos":["1","2","4","0","0","0","0","0","0"],"tiempoIntentos":["2","3","1","0","0","0","0","0","0"],"detallePuntaje":["20","30","50","0","0","0","0","0","0"],"nivelInteligencia":"1","preguntas":[{"pregunta":"¿Cuándo me dirijo a un lugar nuevo, me es fácil ubicarme?","respuesta":"2"},{"pregunta":"¿Qué tanto se me facilita encontrar las diferencias entre dos imágenes que parecen similares?","respuesta":"1"},{"pregunta":"¿Qué tanto disfrutas leer mapas?","respuesta":"2"},{"pregunta":"¿Te gustó la actividad?","respuesta":"No"}]},{"subactividad":"Matemática","duración":"5","fechaInicio":"2015/07/15 14:23:12","fechaFin":"2015/07/15 14:28:12","puntajeInterno":"85000","detalleAciertos":["10","9","8","0","0","0","5","2","2"],"tiempoIntentos":["1","2","3","1","1","1","2","2","4"],"detallePuntaje":["15000","15000","15000","0","0","0","15000","15000","10000"],"nivelInteligencia":"3","preguntas":[{"pregunta":"¿Qué tanto se me facilita hacer rompecabezas y armar figuras?","respuesta":"10"},{"pregunta":"¿Qué tanto te entretienen los videojuegos?","respuesta":"10"},{"pregunta":" ¿Qué tanto se te facilitan los juegos de mesa (dominó, cartas, damas chinas, etc.)?","respuesta":"10"},{"pregunta":"¿Te gustó la actividad?","respuesta":"Si"}]},{"subactividad":"Lingüística","duración":"5","fechaInicio":"2015/07/15 14:23:12","fechaFin":"2015/07/15 14:28:12","puntajeInterno":"15500","detalleAciertos":["7","5","8","3","2","1","0","3","1"],"detallePuntaje":["3550","2000","4000","500","600","800","0","6000","550"],"nivelInteligencia":"2","preguntas":[{"pregunta":"¿Qué tanto disfruto contar cuentos, chistes y chismes?","respuesta":""},{"pregunta":"¿Me gustan los juegos de palabras y los crucigramas? ","respuesta":""},{"pregunta":"¿Qué tanto participo o doy mi opinión en un debate o discusión?","respuesta":""},{"pregunta":"¿Te gustó la actividad?","respuesta":""}]}],"inteligenciaPredominante":[{"inteligencia":"Intrapersonal","puntuación":"25600"},{"inteligencia":"Matemático","puntuación":"85000"},{"inteligencia":"Naturalista","puntuación":"90000"}],"userId":"196","escudo":"Matemático","actividad":"Reto múltiple"}
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
                    {"pathImagen":"user_293.png","imagenRecortada":"user_293.png","userid":"103","resultado":[{"subactividad":"Musical","duración":"240","fechaInicio":"2015/07/15 14:23:12","fechaFin":"2015/07/15 14:28:12","puntajeInterno":"0","detallePuntaje":["10000","5000","0","0","0","0","0","0","0"],"tiempoIntentos":["30","20","0","0","0","0","0","0","0"],"detalleAciertos":["4","2","0","0","0","0","0","0","0"],"nivelInteligencia":"1","preguntas":[{"pregunta":"¿Qué tanto se me facilita tocar un instrumento?","respuesta":"2"},{"pregunta":"¿Qué tanto me gusta usar audífonos todo el tiempo?","respuesta":"1"},{"pregunta":"¿Qué tanto me gusta aprenderme canciones e interpretarlas?","respuesta":"3"},{"pregunta":"¿Te gustó la actividad?","respuesta":"Si"}]},{"subactividad":"Interpersonal","duración":"75","fechaInicio":"2015/07/15 14:23:12","fechaFin":"2015/07/15 14:28:12","puntajeInterno":"15500","detallePreguntas":["2","1","2","3","3","1","2","3"],"nivelInteligencia":"1","preguntas":[{"pregunta":"¿Qué tanto me gusta ser el centro de atención de la fiesta?","respuesta":"2"},{"pregunta":"¿Qué tanto me gusta resolver los conflictos de mis amigos?","respuesta":"1"},{"pregunta":"¿Qué tanto me gusta relacionarme con todo tipo de personas?","respuesta":"4"},{"pregunta":"¿Te gustó la actividad?","respuesta":"Si"}]},{"subactividad":"Naturalista","duración":"5","fechaInicio":"2015/07/15 14:23:12","fechaFin":"2015/07/15 14:28:12","puntajeInterno":"0","detalleAciertos":["-1","-1","-1","-1","-1","-1","-1","-1",],"detallePuntaje":["-1","-1","-1","-1","-1","-1","-1","-1",],"nivelInteligencia":"1","preguntas":[{"pregunta":"¿Qué tanto me gusta observar el cielo, la luna y las estrellas?","respuesta":""},{"pregunta":"¿Qué tanto disfruto los documentales sobre el reino animal y su hábitat?","respuesta":""},{"pregunta":"¿Qué tanto me gusta reciclar y cuidar el medio ambiente?","respuesta":""},{"pregunta":"¿Te gustó la actividad?","respuesta":""}]},{"subactividad":"Intrapersonal","duración":"5","fechaInicio":"2015/07/15 14:23:12","fechaFin":"2015/07/15 14:28:12","puntajeInterno":"0","detallePreguntas":["0","0","0","0","0","0","0",],"nivelInteligencia":"1","preguntas":[{"pregunta":"¿Qué tanto me gusta reflexionar sobre mis sentimientos? ","respuesta":""},{"pregunta":"¿Qué tanto me gusta escribir un diario?","respuesta":""},{"pregunta":"¿Qué tanto me gusta jugar y hacer mis trabajos escolares solo?","respuesta":""},{"pregunta":"¿Te gustó la actividad?","respuesta":""}]},{"subactividad":"Corporal","duración":"5","fechaInicio":"2015/07/15 14:23:12","fechaFin":"2015/07/15 14:28:12","puntajeInterno":"6800","detalleAciertos":["3","4","2","-1","-1","-1","-1","-1",],"tiempoIntentos":["1","3","2","-1","-1","-1","-1","-1",],"detallePuntaje":["-1","-1","-1","-1","-1","-1","-1","-1",],"nivelInteligencia":"1","preguntas":[{"pregunta":"¿Qué tanto me gusta correr, brincar y saltar?","respuesta":""},{"pregunta":"¿Qué tanto disfrutas crear cosas con plastilina, barro, cera, etc.?","respuesta":""},{"pregunta":"¿Qué tanto me gusta bailar distintos ritmos?","respuesta":""},{"pregunta":"¿Te gustó la actividad?","respuesta":""}]},{"subactividad":"Espacial","duración":"5","fechaInicio":"2015/07/15 14:23:12","fechaFin":"2015/07/15 14:28:12","puntajeInterno":"0","detalleAciertos":["-1","-1","-1","-1","-1","-1","-1","-1",],"tiempoIntentos":["-1","-1","-1","-1","-1","-1","-1","-1",],"detallePuntaje":["-1","-1","-1","-1","-1","-1","-1","-1",],"nivelInteligencia":"0","preguntas":[{"pregunta":"¿Cuándo me dirijo a un lugar nuevo, me es fácil ubicarme?","respuesta":""},{"pregunta":"¿Qué tanto se me facilita encontrar las diferencias entre dos imágenes que parecen similares?","respuesta":""},{"pregunta":"¿Qué tanto disfrutas leer mapas?","respuesta":""},{"pregunta":"¿Te gustó la actividad?","respuesta":""}]},{"subactividad":"Matemática","duración":"5","fechaInicio":"2015/07/15 14:23:12","fechaFin":"2015/07/15 14:28:12","puntajeInterno":"0","detalleAciertos":["-1","-1","-1","-1","-1","-1","-1","-1",],"tiempoIntentos":["-1","-1","-1","-1","-1","-1","-1","-1",],"detallePuntaje":["-1","-1","-1","-1","-1","-1","-1","-1",],"nivelInteligencia":"0","preguntas":[{"pregunta":"¿Qué tanto se me facilita hacer rompecabezas y armar figuras?","respuesta":""},{"pregunta":"¿Qué tanto te entretienen los videojuegos?","respuesta":""},{"pregunta":" ¿Qué tanto se te facilitan los juegos de mesa (dominó, cartas, damas chinas, etc.)?","respuesta":""},{"pregunta":"¿Te gustó la actividad?","respuesta":""}]},{"subactividad":"Lingüística","duración":"5","fechaInicio":"2015/07/15 14:23:12","fechaFin":"2015/07/15 14:28:12","puntajeInterno":"15500","detalleAciertos":["7","5","8","3","2","1","2","3","1"],"detallePuntaje":["3550","2000","4000","500","600","800","0","6000","550"],"nivelInteligencia":"1","preguntas":[{"pregunta":"¿Qué tanto disfruto contar cuentos, chistes y chismes?","respuesta":"9"},{"pregunta":"¿Me gustan los juegos de palabras y los crucigramas? ","respuesta":"8"},{"pregunta":"¿Qué tanto participo o doy mi opinión en un debate o discusión?","respuesta":"7"},{"pregunta":"¿Te gustó la actividad?","respuesta":"No"}]}],"inteligenciaPredominante":[],"userId":"196","escudo":"","actividad":"Reto múltiple"}
                  );
               }
              }
            }

            $scope.downloadGame = function () {
              $scope.$emit('ShowPreloader');
              loadData();
            }
            
            var successGame = function (data){
                var shield = "";
                var subactivitiesCompleted = [];
                var predominantes = [];
                $scope.activitiesLength = 0;
                var completedActivities = {"completed": 0};
                var challengesStructure = [{"name":"Naturalista", "type":"1"},{"name":"Lingüística", "type":"1"},{"name":"Corporal", "type":"2"},{"name":"Espacial", "type":"2"},{"name":"Musical", "type":"2"},{"name":"Matemática", "type":"2"},{"name":"Intrapersonal", "type":"3"},{"name":"Interpersonal", "type":"3"}];
                var request = {
                  "userid": $scope.user.id,
                  "moduleid": "",
                  "type":"assign",
                  "activities": [],
                  "results": {}
                };
                var scoreRequest = {
                  "type":"quiz",
                  "intelligences":[],
                  "like_status":1,
                  "moduleid":"",
                  "datestart": moment(Date.now()).unix(),
                  "dateend": moment(Date.now()).unix()
                };

                if (data.escudo != "") {
                  shield = data.escudo;
                  shield = ( shield.toLowerCase().indexOf('matem') > -1 ? 'Matematica' : ( shield.toLowerCase().indexOf('ling') > -1 ? 'Linguistica' : shield ));
                }
                if (data.inteligenciaPredominante) {
                  for (var i = 0; i < data.inteligenciaPredominante.length; i++) {
                    if (data.inteligenciaPredominante[i]) {
                      var inteligencia = data.inteligenciaPredominante[i].inteligencia;
                      if (inteligencia != "") {
                        predominantes.push((inteligencia.toLowerCase().indexOf('matem') > -1 ? 'Matemática' : ( inteligencia.toLowerCase().indexOf('ling') > -1 ? 'Lingüística' : inteligencia )));
                      }else if ($scope.user.strengths && $scope.user.strengths.length > 0){
                        predominantes.push($scope.user.strengths[i]);
                      }
                    }
                  }
                }
                if (data.resultado) {
                  var scoreQuiz = moodleFactory.Services.GetCacheJson("retoMultipleScores/" + $scope.user.id);
                  scoreQuiz = (!scoreQuiz || !scoreQuiz.questions ? _find($scope.retoMultipleActivities, function(a){ a.name.toLowerCase().indexOf("resultados") >= 0 }) : scoreQuiz );
                  request.moduleid = $scope.retosMultipleChallenge.coursemoduleid;
                  _.each($scope.retoMultipleActivities, function(r){
                    var inteligencia = _.find(data.resultado, function(a){ return r.name.toLowerCase().indexOf(a.subactividad.toLowerCase()) > -1; });
                    if(inteligencia){
                      var intelligence = {
                        "moduleid": r.coursemoduleid,
                        "answers":[]
                      }
                      var activityRequest = {
                          "answers": [],
                          "like_status": (inteligencia.preguntas[3].respuesta == "No" ? 0 : 1),
                          "moduleid": r.coursemoduleid,
                          "datestart": (inteligencia.fechaInicio != "" ? moment(new Date(inteligencia.fechaInicio)).unix() : ""),
                          "dateend": (inteligencia.fechaFin != "" ? moment(new Date(inteligencia.fechaFin)).unix() : ""),
                          "type":"quiz",
                          "quiz_answered": true
                      }
                      for (var i = 0; i < inteligencia.preguntas.length - 1; i++) {
                          r.questions[i]["userAnswer"] = (r.questions[i]["userAnswer"] == "" ? inteligencia.preguntas[i].respuesta : r.questions[i]["userAnswer"] );
                          activityRequest.answers.push(r.questions[i]["userAnswer"]);
                          activityRequest.quiz_answered = (r.questions[i]["userAnswer"] != "" && activityRequest.quiz_answered);
                      }
                      r.questions[3]["userAnswer"] = !inteligencia.nivelInteligencia || inteligencia.nivelInteligencia == "" ? "0" : inteligencia.nivelInteligencia;
                      activityRequest.answers.push(r.questions[3]["userAnswer"]);
                      var isAlto = _.find(predominantes, function(p) { return p == inteligencia.subactividad; });
                      r.score = (isAlto) ? 3 : 1;
                      r.total_score = inteligencia.puntajeInterno;
                      if (activityRequest.quiz_answered) {
                        subactivitiesCompleted.push(activityRequest.moduleid);
                        delete activityRequest.quiz_answered;
                        request.activities.push(activityRequest);
                      }
                      var challenge = _.find(challengesStructure, function(c){ return c.name.toLowerCase().indexOf(inteligencia.subactividad.toLowerCase()) >= 0; });
                      if (challenge) {
                        var detail = (challenge.type == "3" ? "detallePreguntas" : "detallePuntaje");
                        var isAnswered = _.countBy(inteligencia[detail], function(p){ return p == (challenge.type == "3" ? 0 : -1 ) ? 'unanswered' : 'answered' });
                        inteligencia.puntajeInterno = (!inteligencia.puntajeInterno || inteligencia.puntajeInterno == "" ? "0" : inteligencia.puntajeInterno);
                        intelligence.answers.push(inteligencia.puntajeInterno);
                        intelligence.answers.push(getAnswer(inteligencia[detail], false));
                        if (challenge.type == "1" || challenge.type == "2") {
                          intelligence.answers.push(getAnswer(inteligencia.detalleAciertos, false));
                          if (challenge.type == "2") {
                            intelligence.answers.push(getAnswer(inteligencia.tiempoIntentos, false));
                          }
                        }

                        var currentQuestions = _.filter(scoreQuiz.questions, function(q) { return q.title.toLowerCase().indexOf(inteligencia.subactividad.toLowerCase()) >= 0 });
                        _.each(currentQuestions, function(question){
                          var questionTitle = question.title.toLowerCase();
                          var answer;
                          if (questionTitle.indexOf("puntaje") >= 0) {
                            if (questionTitle.indexOf("detalle") >= 0) {
                              answer = getAnswer(getHighestDetail(inteligencia.detallePuntaje, question.userAnswer, -1), true);
                            }else{
                              answer = (question.userAnswer > 0 ? question.userAnswer : inteligencia.puntajeInterno);
                            }
                          }else if (questionTitle.indexOf("nivel") >= 0){
                            answer = (question.userAnswer > 0 ? question.userAnswer : inteligencia.nivelInteligencia);
                          }else if(questionTitle.indexOf("aciertos") >= 0){
                            answer = getAnswer(getHighestDetail(inteligencia.detalleAciertos, question.userAnswer, -1), true);
                          }else if (questionTitle.indexOf("preguntas") >= 0) {
                            answer = getAnswer(getHighestDetail(inteligencia.detallePreguntas, question.userAnswer, 0), true);
                          }else if (questionTitle.indexOf("tiempo") >= 0){
                            answer = getAnswer(getHighestDetail(inteligencia.tiempoIntentos, question.userAnswer, -1), true);
                          }
                          question.userAnswer = answer;
                        });
                        completedActivities.completed += (challenge.type == "3" ? (isAnswered.answered > 0 ? 1 : 0) : (isAnswered.unanswered > 0 ? 0 : 1));
                        $scope.activitiesLength++;
                        scoreRequest.intelligences.push(intelligence);
                      }
                    }else if (r.name.toLowerCase().indexOf("resultados") >= 0){
                      scoreRequest.moduleid = r.coursemoduleid;
                    }
                  });
                }
                request.results = scoreRequest;
                _setLocalStorageJsonItem("retoMultipleScores/" + $scope.user.id, scoreQuiz);

                $scope.IsComplete = $scope.retoMultipleActivities && 
                                    completedActivities.completed && 
                                    $scope.retoMultipleActivities && 
                                    completedActivities.completed >= $scope.activitiesLength  &&
                                    completedActivities.completed > 1;

                var userCourseUpdated = JSON.parse(localStorage.getItem("usercourse"));
                var parentActivityIdentifier = $routeParams.moodleid;
                var parentActivity = getActivityByActivity_identifier(parentActivityIdentifier, userCourseUpdated);

                if (parentActivity.status == 0 && $scope.IsComplete) {
                  if (shield != "" && $scope.profile) {
                    $scope.profile["shield"] = shield;
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
                    $scope.profile["recomendedBachelorDegrees"] = careers[shield];
                    $scope.profile["strengths"] = [];
                    $scope.profile["windowOfOpportunity"] = [];
                    _.each($scope.retoMultipleActivities, function(a){
                      if (a.score == 3) {
                        $scope.profile["strengths"].push(a.name);
                      }else if(a.score != -1){
                        $scope.profile["windowOfOpportunity"].push(a.name)
                      }
                    });

                    _setLocalStorageJsonItem("Perfil/" + $scope.user.id, $scope.profile);
                    _setLocalStorageJsonItem("CurrentUser", currentUser)

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
                      moodleFactory.Services.PostAsyncAvatar(avatarInfo[0], function(){console.log("success")}, function(){console.log("failure")});
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
                  _endActivity(parentActivity, function(){});
                  parentActivity.status = 1;
                  if (parentActivity.activities) {
                    updateMultipleSubactivityStars(parentActivity, subactivitiesCompleted);
                  }
                }
                if (completedActivities.completed && completedActivities.completed > 0) {
                  userCourseUpdated = updateMultipleSubActivityStatuses(parentActivity, subactivitiesCompleted, true, $scope.IsComplete);
                  userCourseUpdated.isMultipleChallengeActivityFinished = $scope.IsComplete;
                  $scope.$emit('ShowPreloader');
                  if (completedActivities.completed && completedActivities.completed > 1) {
                    $scope.saveQuiz(request, userCourseUpdated);
                  }
                  saveLocalStorageActivities($scope.retoMultipleActivities);
                  _setLocalStorageJsonItem("retoMultipleActivities", $scope.retoMultipleActivities);
                  _setLocalStorageJsonItem("usercourse", userCourseUpdated);
              }else{
                $timeout(function(){
                  $scope.$apply(function() {
                      $location.path('/ZonaDeVuelo/Dashboard/1/2');
                  });
                }, 1000);
              }
            }

            $scope.saveQuiz = function(quiz, userCourseUpdated) {
              moodleFactory.Services.PostMultipleActivities("usercourse", quiz, userCourseUpdated, 'multipleactivities', function(){
                if ($routeParams.retry) {
                  _forceUpdateConnectionStatus(function() {
                      if (_isDeviceOnline) {
                          moodleFactory.Services.ExecuteQueue();
                      }
                  }, function() {} );
                }
                $timeout(function(){
                  $scope.$emit('HidePreloader');
                  var url = "";
                  if ($scope.IsComplete) {
                    url = '/ZonaDeVuelo/Conocete/RetoMultipleFichaDeResultados';  
                  }else{
                    url = '/ZonaDeVuelo/Dashboard/1/2';
                  }
                  $scope.$apply(function() {
                      $location.path(url);
                  });
                }, 1000);
              }, function(){
                $timeout(function(){
                  $scope.$apply(function() {
                      $location.path('/ZonaDeVuelo/Dashboard/1/2');
                  });
                }, 1000);
              });
            }

            $scope.saveUser = function () {
                moodleFactory.Services.PutAsyncProfile($scope.user.id, $scope.profile);
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

            var getAnswer = function(answer, forLocalStorage){
                var answerConcat = "";
                if (typeof answer != 'string') {
                    _.each(answer, function(r){
                        answerConcat = answerConcat + (answerConcat != "" ? (forLocalStorage ? ";" : "\n" ) : "") + cleanText(r).trim();
                    });
                    return answerConcat;
                }
                return cleanText(answer);
            }

            var cleanText = function (userAnswer) {
                var result = userAnswer.replace("/\r/", "");
                result = userAnswer.replace("/<br>/", "");
                result = userAnswer.replace("/<p>/", "");
                result = userAnswer.replace("/</p>/", "");
                result = userAnswer.replace("/;/", "");
                result = userAnswer.replace("/\n/", "");
                return result;
            }

            function getdatenow() {
                var date = new Date(),
                    year = date.getFullYear(),
                    month = formatValue(date.getMonth() + 1),
                    day = formatValue(date.getDate()),
                    hour = formatValue(date.getHours()),
                    minute = formatValue(date.getMinutes()),
                    second = formatValue(date.getSeconds());

                function formatValue(value) {
                    return value >= 10 ? value : '0' + value;
                }

                return month + "/" + day + "/" + year + " " + hour + ":" + minute + ":" + second;
            }

            var saveLocalStorageActivities = function(retosMultiples){
              for (var i = 0; i < retosMultiples.length; i++) {
                _setLocalStorageJsonItem("activity/" + retosMultiples[i].coursemoduleid, retosMultiples[i]);
              };
            }

            var getHighestDetail = function(newAnswer, currentAnswer, unansweredParameter){
              if (currentAnswer == "") {
                return newAnswer;
              }else{
                var newArray = (typeof newAnswer == 'string' ? newAnswer.split(";") : newAnswer);
                var currentArray = (typeof currentAnswer == 'string' ? currentAnswer.split(";") : currentAnswer);
                var isNewAnswered = _.countBy(newArray, function(e){ return e == unansweredParameter ? 'unanswered' : 'answered' });
                var isCurrentAnswered = _.countBy(currentArray, function(e){ return e == unansweredParameter ? 'unanswered' : 'answered' });
                if (isNewAnswered.unanswered) {
                  if (isNewAnswered.unanswered == newArray.length) {
                    if (isCurrentAnswered.unanswered) {
                      if (isCurrentAnswered.unanswered == currentArray.length) {
                        return newArray;
                      }else{
                        return (isNewAnswered.unanswered >= isCurrentAnswered.unanswered ? currentArray : newArray);
                      }
                    }else{
                      return currentArray;
                    }
                  }
                  else{
                    if (isCurrentAnswered.unanswered) {
                      return (isNewAnswered.unanswered >= isCurrentAnswered.unanswered ? currentArray : newArray);
                    }else{
                      return newArray;
                    }
                  }
                }else{
                  return newArray;
                }
              }
            }

        }])
        .controller('stageGameRetoMultipleModalController', function ($scope, $modalInstance, content) {
          $scope.message = content.mensaje;
          $scope.title = content.titulo;
          $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
          };
        });