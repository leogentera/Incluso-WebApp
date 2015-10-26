//Controller for Quizzes
angular
    .module('incluso.stage.quizcontroller', [])
    .controller('stageQuizController', [
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
            _location = $location;
            _timeout = $timeout;
            $scope.setToolbar($location.$$path, "");
            $rootScope.showFooter = true;
            $rootScope.showFooterRocks = false;
            $rootScope.showStage1Footer = false;
            $rootScope.showStage2Footer = false;
            $rootScope.showStage3Footer = false;
            $scope.scrollToTop();
            $scope.currentPage = 1;
            $scope.setReadOnly = false;
            $scope.showWarning = false;
            $scope.coursemoduleid = 0;
            $scope.like_status = 1;
            $scope.tmpPath = "";
            var nonEditableQuizzes = [1001, 1009, 2001, 2023, 3101, 3601];
            var quizHasOther = [1001, 1005, 1006, 2001, 2023, 3101, 3601];

            // ********************************     Models for Quizzes - Stage #1
            $scope.AnswersResult = { //For storing responses in "Exploración Inicial - Etapa 1"
                "userid": 0,
                "answers": [null, [0, 0, 0, 0, 0], [], null, []],
                "activityidnumber": 0,
                "like_status": 0
            };

            $scope.exploracionInicialOtroAnswer = [{
                "questionid": 47,
                "answers": ['']
            }];

            $scope.misCualidadesAnswers = [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]];
            $scope.misCualidadesOtroAnswers = [{
                "questionid": 16,
                "answers": ['']
            }, {
                "questionid": 17,
                "answers": ['']
            }, {
                "questionid": 18,
                "answers": ['']
            }];

            $scope.misGustosAnswers = [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]];
            $scope.misGustosOtroAnswers = [{
                "questionid": 43,
                "answers": ['']
            }, {
                "questionid": 44,
                "answers": ['']
            }, {
                "questionid": 45,
                "answers": ['']
            }];

            $scope.misSuenosAnswers = [[], [], []];
            //$scope.exploracionFinal = ['', '', '', '', ''];
            $scope.exploracionFinal = [null, null, null, null, null];

            // ********************************  Models for Quizzes - Stage #2
            $scope.exploracionInicialStage2 = [null, null, null, [0, 0, 0, 0, 0]];
            $scope.exploracionInicialStage2OtroAnswers = [
                {
                    "questionid": 97,
                    "answers": ['']
                }
            ];

            $scope.misIdeas = [[], []];
            $scope.miFuturo = [[], [], []];
            $scope.exploracionFinalStage2 = [null, null, null, null];

            // ********************************      Models for Quizzes - Stage #3
            $scope.exploracionInicialStage3 = [null, null, [0, 0, 0, 0, 0, 0], null];
            $scope.exploracionInicialStage3OtroAnswers = [
                {
                    "questionid": 120,
                    "answers": ['']
                }
            ];
            $scope.exploracionFinalStage3 = [null, null, [0, 0, 0, 0, 0], null, null];  //"answers": [null, [0, 0, 0, 0, 0], [], null, []],
            $scope.exploracionFinalStage3OtroAnswers = [
                {
                    "questionid": 124,
                    "answers": ['']
                }
            ];

            var destinationPath = "";

            $scope.isDisabled = false;

            $scope.openModal = function (size) {
                var modalInstance = $modal.open({
                    animation: false,
                    backdrop: false,
                    templateUrl: 'openingStageModal.html',
                    controller: 'OpeningStageController',
                    size: size,
                    windowClass: 'user-help-modal opening-stage-modal'
                }).result.finally(function () {
                        $scope.$emit('ShowPreloader');
                        $timeout(function () { $scope.$emit('HidePreloader'); }, 500);
                    });
            };           


            $scope.addCaptureField = function (value, check) {
                var index;
                if (check) {
                    addHeightForOther();

                    switch (value) {
                        case "cualidades1":
                            $('#textoarea1').attr('readonly', false);
                            break;
                        case "cualidades2":
                            $('#textoarea2').attr('readonly', false);
                            break;
                        case "cualidades3":
                            $('#textoarea2').attr('readonly', false);
                            break;
                        case "gustos1":
                            $('#textoarea1').attr('readonly', false);
                            break;
                        case "gustos2":
                            $('#textoarea2').attr('readonly', false);
                            break;
                        case "gustos3":
                            $('#textoarea3').attr('readonly', false);
                            break;
                        default:
                            console.log('----------');
                    }
                } else {
                    reduceHeightForOther();

                    switch (value) {
                        case "cualidades1":
                            index = $scope.userprofile.talents.indexOf($scope.misCualidadesOtroAnswers[0].answers[0]);
                            $scope.userprofile.talents.splice(index, 1);
                            $scope.misCualidadesOtroAnswers[0].answers[0] = '';
                            break;
                        case "cualidades2":
                            index = $scope.userprofile.values.indexOf($scope.misCualidadesOtroAnswers[1].answers[0]);
                            $scope.userprofile.values.splice(index, 1);
                            $scope.misCualidadesOtroAnswers[1].answers[0] = '';
                            break;
                        case "cualidades3":
                            index = $scope.userprofile.habilities.indexOf($scope.misCualidadesOtroAnswers[2].answers[0]);
                            $scope.userprofile.habilities.splice(index, 1);
                            $scope.misCualidadesOtroAnswers[2].answers[0] = '';
                            break;
                        case "gustos1":
                            index = $scope.userprofile.favoriteSports.indexOf($scope.misGustosOtroAnswers[0].answers[0]);
                            $scope.userprofile.favoriteSports.splice(index, 1);
                            $scope.misGustosOtroAnswers[0].answers[0] = '';
                            break;
                        case "gustos2":
                            index = $scope.userprofile.artisticActivities.indexOf($scope.misGustosOtroAnswers[1].answers[0]);
                            $scope.userprofile.artisticActivities.splice(index, 1);
                            $scope.misGustosOtroAnswers[1].answers[0] = '';
                            break;
                        case "gustos3":
                            index = $scope.userprofile.hobbies.indexOf($scope.misGustosOtroAnswers[2].answers[0]);
                            $scope.userprofile.hobbies.splice(index, 1);
                            $scope.misGustosOtroAnswers[2].answers[0] = '';
                            break;
                        default:
                            console.log('----------');
                    }
                }
            };

            //****************************************  STARTING POINT **************************************************            
            $scope.openModal();
            getDataAsync();
            

            //***********************************************************************************************************
            function getDataAsync() {
                $scope.startingTime = moment().format('YYYY:MM:DD HH:mm:ss');

                $scope.activity_identifier = $location.path().split("/")[$location.path().split("/").length - 1];
                //console.log("Activity identifier: " + $scope.activity_identifier);
                var parentActivity = getActivityByActivity_identifier($scope.activity_identifier);  //activity_identifier taken from URL route
                //console.log("parentActivity = " + parentActivity);
                var childActivity = null;

                if (parentActivity.activities) {
                    childActivity = parentActivity.activities[0];
                }

                
                $rootScope.message = ""; // Message for the robbot

                //Making up path to redirect user to the proper dashboard
                switch ($scope.activity_identifier) {
                    case "1001":  //Exploración Inicial - Etapa 1
                        $scope.currentChallenge = 0;
                        destinationPath = "/ZonaDeVuelo/Dashboard/1/0";
                        $rootScope.message = "Explora más sobre ti y tus sueños e identifica qué has estado haciendo para hacerlos realidad.";
                        break;
                    case "1005":  //Mis Cualidades - Etapa 1
                        $scope.currentChallenge = 3;
                        destinationPath = "/ZonaDeVuelo/Dashboard/1/3";
                        $rootScope.message = "Conocer qué talentos y habilidades tienes te permitirá aprovecharlas al máximo y hará más sencillo el camino para lograr lo que te propongas. Piensa: ¿Para qué tipo de actividades tienes facilidad?.";
                        break;
                    case "1006":  //Mis Gustos - Etapa 1
                        $scope.currentChallenge = 3;
                        destinationPath = "/ZonaDeVuelo/Dashboard/1/3";
                        $rootScope.message = "Reconocer tus gustos y preferencias te ayudará a definir tus sueños. Responder ¿qué disfrutas hacer? puede llevarte a imaginar qué te gustaría hacer en un futuro.";
                        break;
                    case "1007":  //Sueña - Etapa 1
                        $scope.currentChallenge = 3;
                        destinationPath = "/ZonaDeVuelo/Dashboard/1/3";
                        $rootScope.message = " Realmente ¿conoces cuáles son tus sueños? Visualizarlos te permite trazar la mejor ruta para llegar a ellos y disfrutar lo que haces cada día. Existen diferentes tipos de sueños, cónocelos y dale rumbo a tu vida.";
                        break;
                    case "1009": //Exploración Final - Etapa 1
                        $scope.currentChallenge = 5;
                        destinationPath = "/ZonaDeVuelo/Dashboard/1/5";
                        $rootScope.message = "Explora qué tanto descubriste en la zona de vuelo.";
                        break;
                    case "2001": //Exploración Inicial - Etapa 2
                        $scope.currentChallenge = 0;
                        destinationPath = "/ZonaDeNavegacion/Dashboard/2/0";
                        $rootScope.message = "Explora más sobre ti y sobre lo que te gustaría hacer en el futuro.";
                        break;
                    case "2007": //Tus Ideas - Etapa 2
                        $scope.currentChallenge = 2;
                        destinationPath = "/ZonaDeNavegacion/Dashboard/2/2";
                        $rootScope.message = "Identifica tus límites y cambia el chip de tus ideas.";
                        break;
                    case "2016": //Mi Futuro 1, 3 y 5 - Etapa 2
                        $scope.currentChallenge = 4;
                        destinationPath = "/ZonaDeNavegacion/Dashboard/2/4";
                        $rootScope.message = "Recurre a tu imaginación y visualiza en donde te gustaría estar en los siguientes años.";
                        break;
                    case "2023": //Exploración Final - Etapa 2
                        $scope.currentChallenge = 6;
                        destinationPath = "/ZonaDeNavegacion/Dashboard/2/6";
                        $rootScope.message = "Explora qué tanto descubriste en la zona de navegación.";
                        break;
                    case "3101": //Exploración Inicial - Etapa 3
                        $scope.currentChallenge = 0;
                        destinationPath = "/ZonaDeAterrizaje/Dashboard/3/0";
                        $rootScope.message = "Explora más de ti y de tu visión emprendedora.";
                        break;
                    case "3601": //Exploración Final - Etapa 3
                        $scope.currentChallenge = 5;
                        destinationPath = "/ZonaDeAterrizaje/Dashboard/3/5";
                        $rootScope.message = "Explora qué tanto descubriste en la zona de aterrizaje.";
                        break;
                    default:
                        $scope.currentChallenge = 0;
                        destinationPath = "/ZonaDeVuelo/Dashboard/1/0";
                        $rootScope.message = "";
                        break;
                }

                if (parentActivity != null || childActivity != null) {

                    if (childActivity) {//The activity HAS a "child" activity
                        $scope.coursemoduleid = childActivity.coursemoduleid;
                        $scope.activityPoints = childActivity.points;
                        //console.log("Child points: " + childActivity.points);
                        $scope.activityname = childActivity.activityname;
                        $scope.activity_status = childActivity.status;

                    } else {//The activity has no "child" activity
                        $scope.coursemoduleid = parentActivity.coursemoduleid;
                        $scope.activityPoints = parentActivity.points;
                        //console.log("Parent points: " + parentActivity.points);
                        $scope.activityname = parentActivity.activityname;
                        $scope.activity_status = parentActivity.status;
                    }

                    $scope.userprofile = JSON.parse(localStorage.getItem("profile/" + localStorage.getItem("userId")));
                    $scope.currentUser = JSON.parse(localStorage.getItem("CurrentUser"));
                    //console.log("User profile = " + $scope.userprofile);
                    var activityFinished = false;

                    console.log("Activity status = " + $scope.activity_status);

                    $scope.activity = parentActivity;
                    $scope.parentActivity = parentActivity;
                    $scope.childActivity = childActivity;

                    console.log("Starting... " + parentActivity.sectionname);

                    if ($scope.activity_status != 0) {//If the activity is currently finished...
                        activityFinished = true;

                        if (nonEditableQuizzes.indexOf($scope.activity_identifier) > -1) {// If the Quiz is non editable, then...
                            $scope.setReadOnly = true; //The Quiz can not be edited
                        }
                        
                        console.log("Coursemoduleid de la actividad = " + $scope.coursemoduleid);
                        var localAnswers;

                        if (childActivity) {
                            localAnswers = JSON.parse(_getItem("activityAnswers/" + childActivity.coursemoduleid));
                        } else {
                            localAnswers = JSON.parse(_getItem("activityAnswers/" + parentActivity.coursemoduleid));
                        }

                        // If the Quiz has an "Other" checkbox, then get it from Local Storage.
                        if (quizHasOther.indexOf($scope.activity_identifier) > -1) {
                            
                            var localOtrosAnswers;
                            if (childActivity) {
                                localOtrosAnswers = JSON.parse(_getItem("activityOtrosAnswers/" + childActivity.coursemoduleid));
                            } else {
                                localOtrosAnswers = JSON.parse(_getItem("activityOtrosAnswers/" + parentActivity.coursemoduleid));
                            }
                        }

                        $scope.activityFinished = activityFinished;

                        if (localAnswers == null) {// If activity not exists in Local Storage...get it from Server                            
                            moodleFactory.Services.GetAsyncActivityQuizInfo($scope.coursemoduleid, $scope.userprofile.id, successfullCallBack, errorCallback, true);
                        }
                        else {//Angular-bind the answers in the respective HTML template

                            switch ($scope.activity_identifier) {
                                case "1001": //Exploración Inicial - Etapa 1
                                    $scope.AnswersResult.answers = localAnswers;
                                    $scope.exploracionInicialOtroAnswer = localOtrosAnswers;
                                    break;
                                case "1005": //Mis Cualidades - Etapa 1
                                    $scope.misCualidadesAnswers = localAnswers;
                                    $scope.misCualidadesOtroAnswers = localOtrosAnswers;
                                    break;
                                case "1006": //Mis Gustos - Etapa 1
                                    $scope.misGustosAnswers = localAnswers;
                                    $scope.misGustosOtroAnswers = localOtrosAnswers;
                                    break;
                                case "1007": //Sueña - Etapa 1
                                    $scope.misSuenosAnswers = localAnswers; //Sueña
                                    break;
                                case "1009": //Exploración Final - Etapa 1
                                    $scope.exploracionFinal = localAnswers;
                                    break;
                                case "2001": //Exploración Inicial - Etapa 2
                                    $scope.exploracionInicialStage2 = localAnswers;
                                    $scope.exploracionInicialStage2OtroAnswers = localOtrosAnswers;
                                    break;
                                case "2007": //Tus ideas - Etapa 2
                                    $scope.misIdeas = localAnswers;
                                    break;
                                case "2016": //Mi futuro - Etapa 2
                                    $scope.miFuturo = localAnswers;
                                    break;
                                case "2023": //Exploración Final - Etapa 2
                                    $scope.exploracionFinalStage2 = localAnswers;
                                    break;
                                case "3101": //Exploración Inicial - Etapa 3
                                    $scope.exploracionInicialStage3 = localAnswers;
                                    $scope.exploracionInicialStage3OtroAnswers = localOtrosAnswers;
                                    break;
                                case "3601": //Exploración Final - Etapa 3
                                    $scope.exploracionFinalStage3 = localAnswers;
                                    $scope.exploracionFinalStage3OtroAnswers = localOtrosAnswers;
                                    break;
                                default:
                                    $scope.currentChallenge = 0; //Default
                                    break;
                            }
                        }
                    }


                }
                else {
                    console.log("Activity is NOT defined");
                }
                $scope.$emit('HidePreloader');
            }

            //This callback is invoked for finished activities only
            function successfullCallBack(activityAnswers) {
                
                if (activityAnswers != null) {
                    
                    for (var index = 0; index < activityAnswers.questions.length; index++) {

                        var question = activityAnswers.questions[index];

                        var theCourseModuleId;
                        if ($scope.childActivity) {
                            theCourseModuleId = $scope.childActivity.coursemoduleid;
                        } else {
                            theCourseModuleId = $scope.parentActivity.coursemoduleid;
                        }

                        switch ($scope.activity_identifier) {
                            case "1001": //Exploración Inicial - Etapa 1
                                updateSelectedAnswers(index, question);
                                _setLocalStorageJsonItem("activityAnswers/" + theCourseModuleId, $scope.AnswersResult.answers);
                                break;
                            case "1005": //Mis Cualidades - Etapa 1
                                updateMisCualidadesSelectedAnswers(index, question);
                                _setLocalStorageJsonItem("activityAnswers/" + theCourseModuleId, $scope.misCualidadesAnswers);
                                break;
                            case "1006": //Mis Gustos - Etapa 1
                                updateMisGustosSelectedAnswers(index, question);
                                _setLocalStorageJsonItem("activityAnswers/" + theCourseModuleId, $scope.misGustosAnswers);
                                break;
                            case "1007": //Sueña - Etapa 1
                                updateMisSueñosSelectedAnswers(index, question);
                                _setLocalStorageJsonItem("activityAnswers/" + theCourseModuleId, $scope.misSuenosAnswers);
                                break;
                            case "1009": //Exploración Final - Etapa 1
                                updateExploracionFinalSelectedAnswersFinal(index, question);
                                _setLocalStorageJsonItem("activityAnswers/" + theCourseModuleId, $scope.exploracionFinal);
                                break;
                            case "2001": //Exploración Inicial - Etapa 2
                                updateExploracionInicialStage2Answers(index, question);
                                _setLocalStorageJsonItem("activityAnswers/" + theCourseModuleId, $scope.exploracionInicialStage2);
                                break;
                            case "2007": //Tus ideas - Etapa 2
                                updateTusIdeasStage2Answers(index, question);
                                _setLocalStorageJsonItem("activityAnswers/" + theCourseModuleId, $scope.misIdeas);
                                break;
                            case "2016": //Tu Futuro - Etapa 2
                                updateTuFuturoStage2Answers(index, question);
                                _setLocalStorageJsonItem("activityAnswers/" + theCourseModuleId, $scope.miFuturo);
                                break;
                            case "2023": //Exploración Final - Etapa 2
                                updateExploracionFinalStage2Answers(index, question);
                                _setLocalStorageJsonItem("activityAnswers/" + theCourseModuleId, $scope.exploracionFinalStage2);
                                break;
                            case "3101": //Exploración Inicial - Etapa 3
                                updateExploracionInicialStage3Answers(index, question);
                                _setLocalStorageJsonItem("activityAnswers/" + theCourseModuleId, $scope.exploracionInicialStage3);
                                break;
                            case "3601": //Exploración Final - Etapa 3
                                updateExploracionFinalStage3Answers(index, question);
                                _setLocalStorageJsonItem("activityAnswers/" + theCourseModuleId, $scope.exploracionFinalStage3);
                                break;
                            default:
                                $scope.currentChallenge = 0; //Default
                                break;
                        }
                    }
                }

                else {
                    $scope.warningMessage = "Las respuestas del quiz no se pueden mostrar en este momento";
                    $scope.showWarning = true;
                }
            }


            function errorCallback() {
                $scope.$emit('HidePreloader');
            }


            //******************************************** CODE CALLED WHEN USER FINISHES ACTIVITY ************************
            $scope.finishActivity = function () {//Activity completed                

                $scope.$emit("ShowPreloader");

                //This is to avoid killing the preloader up starting
                $timeout(function () {

                    if ($scope.childActivity) {
                        $scope.parentActivity.status = 1;
                        $scope.childActivity.status = 1;
                    } else {
                        $scope.parentActivity.status = 1;
                    }

                    $scope.isDisabled = true;
                    //    updateUserStars($scope.parentActivity.activity_identifier);
                    //    //updateUserStars($scope.parentActivity.activity_identifier, $scope.activityPoints);

                    if ($scope.childActivity) {
                        $scope.AnswersResult.activityidnumber = $scope.childActivity.coursemoduleid;
                    } else {
                        $scope.AnswersResult.activityidnumber = $scope.parentActivity.coursemoduleid;
                    }

                    $scope.AnswersResult.userid = $scope.userprofile.id;
                    $scope.AnswersResult.like_status = $scope.like_status;
                    $scope.AnswersResult.updatetype = 1;
                    $scope.showWarning = false;

                    var updatedActivityOnUsercourse;
                    if ($scope.childActivity) {  //Update status of Quiz ("child") activity
                        updatedActivityOnUsercourse = updateSubActivityStatus($scope.childActivity.coursemoduleid);  //actualizar arbol
                        _setLocalStorageJsonItem("usercourse", updatedActivityOnUsercourse);
                    }

                    updatedActivityOnUsercourse = updateActivityStatus($scope.activity_identifier);

                    //Update local storage and activities status array
                    _setLocalStorageJsonItem("usercourse", updatedActivityOnUsercourse);

                    switch ($scope.activity_identifier) {
                        case "1001": //Exploración Inicial - Etapa 1
                            $scope.OtroAnswer = $scope.exploracionInicialOtroAnswer;
                            break;
                        case "1005": //Mis Cualidades - Etapa 1
                            $scope.AnswersResult.answers = $scope.misCualidadesAnswers;
                            $scope.OtroAnswer = $scope.misCualidadesOtroAnswers;
                            break;
                        case "1006": //Mis Gustos - Etapa 1
                            $scope.AnswersResult.answers = $scope.misGustosAnswers;
                            $scope.OtroAnswer = $scope.misGustosOtroAnswers;
                            break;
                        case "1007": //Sueña - Etapa 1
                            $scope.AnswersResult.answers = $scope.misSuenosAnswers;
                            break;
                        case "1009": //Exploración Final - Etapa 1
                            $scope.AnswersResult.answers = $scope.exploracionFinal;
                            break;
                        case "2001": //Exploración Inicial - Etapa 2
                            $scope.AnswersResult.answers = $scope.exploracionInicialStage2;
                            $scope.OtroAnswer = $scope.exploracionInicialStage2OtroAnswers;
                            break;
                        case "2007": //Tus Ideas - Etapa 2
                            $scope.AnswersResult.answers = $scope.misIdeas;
                            break;
                        case "2016": //Mi Futuro 1, 3 y 5 - Etapa 2
                            $scope.AnswersResult.answers = $scope.miFuturo;
                            break;
                        case "2023": //Exploración Final - Etapa 2
                            $scope.AnswersResult.answers = $scope.exploracionFinalStage2;
                            break;
                        case "3101": //Exploración Inicial - Etapa 3
                            $scope.AnswersResult.answers = $scope.exploracionInicialStage3;
                            $scope.OtroAnswer = $scope.exploracionInicialStage3OtroAnswers;
                            break;
                        case "3601": //Exploración Final - Etapa 3
                            $scope.AnswersResult.answers = $scope.exploracionFinalStage3;
                            $scope.OtroAnswer = $scope.exploracionFinalStage3OtroAnswers;
                            break;
                        default:
                            break;
                    }

                    console.log("Ending activity...");

                    if ($scope.childActivity) {
                        updateActivityStatusDictionary($scope.childActivity.activity_identifier);
                        updateActivityStatusDictionary($scope.parentActivity.activity_identifier);
                    } else {
                        updateActivityStatusDictionary($scope.parentActivity.activity_identifier);
                    }


                    var activityModel = {
                        "usercourse": updatedActivityOnUsercourse,
                        "answersResult": $scope.AnswersResult,
                        "userId": $scope.userprofile.id,
                        "startingTime": $scope.startingTime,
                        "endingTime": $scope.startingTime = moment().format('YYYY-MM-DD HH:mm:ss'),
                        "token": $scope.currentUser.token,
                        "others": $scope.OtroAnswer
                    };

                    activityModel.answersResult.dateStart = activityModel.startingTime;
                    activityModel.answersResult.dateEnd = activityModel.endingTime;

                    // If the Quiz has an "Other" checkbox, then ...
                    if (quizHasOther.indexOf($scope.activity_identifier) > -1) {
                        activityModel.answersResult.others = activityModel.others;
                    }
                    /*
                    switch ($scope.activity_identifier) {
                        case "1001": //Exploración Inicial - Etapa 1
                            activityModel.answersResult.others = activityModel.others;
                            break;
                        case "1005": //Mis Cualidades - Etapa 1
                            activityModel.answersResult.others = activityModel.others;
                            break;
                        case "1006": //Mis Gustos - Etapa 1
                            activityModel.answersResult.others = activityModel.others;
                            break;
                        case "2001": //Exploración Inicial - Etapa 2
                            activityModel.answersResult.others = activityModel.others;
                            break;
                        case "3101": //Exploración Inicial - Etapa 3
                            activityModel.answersResult.others = activityModel.others;
                            break;
                        case "3601": //Exploración Final - Etapa 3
                            activityModel.answersResult.others = activityModel.others;
                            break;
                        default:
                            break;
                    }
                    */

                    
                    if ($scope.childActivity) {
                        //Close the Quiz activity.
                        activityModel.activityType = "Quiz";
                        activityModel.coursemoduleid = $scope.childActivity.coursemoduleid;                        

                        _endActivity(activityModel, function () {
                            updateProfile();
                            $scope.tmpPath = "";
                        }, destinationPath);



                        //Close the Assign activity.
                        activityModel.activityType = "Assign";
                        activityModel.coursemoduleid = $scope.parentActivity.coursemoduleid; 

                        _endActivity(activityModel, function () {
                            updateProfile();
                            $scope.tmpPath = destinationPath;
                        }, destinationPath);

                    } else {
                        activityModel.coursemoduleid = $scope.parentActivity.coursemoduleid;
                        activityModel.activityType = "Quiz";

                        _endActivity(activityModel, function () {
                            updateProfile();
                        }, destinationPath);
                    }


                    if ($scope.childActivity) {
                        _setLocalStorageJsonItem("activityAnswers/" + $scope.childActivity.coursemoduleid, $scope.AnswersResult.answers);
                        _setLocalStorageJsonItem("UserTalents/" + $scope.childActivity.coursemoduleid, $scope.AnswersResult.answers);
                    } else {
                        _setLocalStorageJsonItem("activityAnswers/" + $scope.parentActivity.coursemoduleid, $scope.AnswersResult.answers);
                        _setLocalStorageJsonItem("UserTalents/" + $scope.parentActivity.coursemoduleid, $scope.AnswersResult.answers);
                    }


                    //If the Quiz has an "Other" checkbox, then save it to Local Storage.
                    if (quizHasOther.indexOf($scope.activity_identifier) > -1) {
                        if ($scope.childActivity) {
                            _setLocalStorageJsonItem("activityOtrosAnswers/" + $scope.childActivity.coursemoduleid, $scope.OtroAnswer);
                        } else {
                            _setLocalStorageJsonItem("activityOtrosAnswers/" + $scope.parentActivity.coursemoduleid, $scope.OtroAnswer);
                        }
                    }

                }, 0);

            };


            function updateProfile() {

                if ($scope.activity_identifier == "1005" || $scope.activity_identifier == "1006") {

                    if ($scope.misCualidadesOtroAnswers[0].answers[0] != '') {
                        $scope.userprofile.talents.push($scope.misCualidadesOtroAnswers[0].answers[0]);
                    }

                    if ($scope.misCualidadesOtroAnswers[1].answers[0] != '') {
                        $scope.userprofile.values.push($scope.misCualidadesOtroAnswers[1].answers[0]);
                    }

                    if ($scope.misCualidadesOtroAnswers[2].answers[0] != '') {
                        $scope.userprofile.habilities.push($scope.misCualidadesOtroAnswers[2].answers[0]);
                    }

                    if ($scope.misGustosOtroAnswers[0].answers[0] != '') {
                        $scope.userprofile.favoriteSports.push($scope.misGustosOtroAnswers[0].answers[0]);
                    }

                    if ($scope.misGustosOtroAnswers[1].answers[0] != '') {
                        $scope.userprofile.artisticActivities.push($scope.misGustosOtroAnswers[1].answers[0]);
                    }

                    if ($scope.misGustosOtroAnswers[2].answers[0] != '') {
                        $scope.userprofile.hobbies.push($scope.misGustosOtroAnswers[2].answers[0]);
                    }

                    $scope.userId = moodleFactory.Services.GetCacheObject("userId");
                    moodleFactory.Services.PutAsyncProfile($scope.userId, $scope.userprofile,

                        function (responseData) {
                            console.log('Update profile successful...');
                            console.log('This activity has ' + $scope.activityPoints);

                            //Update Activity Log Service
                            if ($scope.activity_status == 0) {
                                $scope.activity_status = 1;
                                console.log("Update Activity Log : " + $scope.activity_identifier);
                                updateUserStars($scope.parentActivity.activity_identifier);                                
                            }

                            console.log("Redirecting to dashboard; destinationPath = " + destinationPath);
                            $location.path(destinationPath);
                        },
                        function (responseData) {
                            console.log('Update profile fail...');
                            $scope.$emit('HidePreloader');
                        });


                } else {
                    console.log("No user Profile Data; destinationPath = " + destinationPath);  

                    //Update Activity Log Service
                    if ($scope.activity_status == 0) {//Update stars only for non-finished activities
                        $scope.activity_status = 1;
                        updateUserStars($scope.parentActivity.activity_identifier);

                        /*
                        if ($scope.childActivity) {
                            console.log("Updating user stars for Quiz with child...");                            
                            updateUserStars($scope.parentActivity.activity_identifier, 0, $scope.activityPoints);  //For 2016 only.
                        } else {
                            console.log("Updating user stars for Quiz WITHOUT child...");
                            updateUserStars($scope.parentActivity.activity_identifier);
                        } 
                        */                      
                    }

                    $location.path(destinationPath); 
                }

            }


            $scope.toggleSelection = function toggleSelection(stringValue, isChecked, questionArray) {
                var index = -1;
                if (isChecked) {
                    switch (questionArray) {
                        case "talents":
                            index = $scope.userprofile.talents.indexOf(stringValue);
                            if (index == -1) {
                                $scope.userprofile.talents.push(stringValue);
                            }
                            break;
                        case "values":
                            index = $scope.userprofile.values.indexOf(stringValue);
                            if (index == -1) {
                                $scope.userprofile.values.push(stringValue);
                            }
                            break;
                        case "habilities":
                            index = $scope.userprofile.habilities.indexOf(stringValue);
                            if (index == -1) {
                                $scope.userprofile.habilities.push(stringValue);
                            }
                            break;
                        case "favoriteSports":
                            index = $scope.userprofile.favoriteSports.indexOf(stringValue);
                            if (index == -1) {
                                $scope.userprofile.favoriteSports.push(stringValue);
                            }
                            break;
                        case "artisticActivities":
                            index = $scope.userprofile.artisticActivities.indexOf(stringValue);
                            if (index == -1) {
                                $scope.userprofile.artisticActivities.push(stringValue);
                            }
                            break;
                        case "hobbies":
                            index = $scope.userprofile.hobbies.indexOf(stringValue);
                            if (index == -1) {
                                $scope.userprofile.hobbies.push(stringValue);
                            }
                            break;
                        default:
                            console.log('Unknow profile poperty');
                    }
                }
                else {
                    switch (questionArray) {
                        case "talents":
                            index = $scope.userprofile.talents.indexOf(stringValue);
                            $scope.userprofile.talents.splice(index, 1);
                            break;
                        case "values":
                            index = $scope.userprofile.values.indexOf(stringValue);
                            $scope.userprofile.values.splice(index, 1);
                            break;
                        case "habilities":
                            index = $scope.userprofile.habilities.indexOf(stringValue);
                            $scope.userprofile.habilities.splice(index, 1);
                            break;
                        case "favoriteSports":
                            index = $scope.userprofile.favoriteSports.indexOf(stringValue);
                            $scope.userprofile.favoriteSports.splice(index, 1);
                            break;
                        case "artisticActivities":
                            index = $scope.userprofile.artisticActivities.indexOf(stringValue);
                            $scope.userprofile.artisticActivities.splice(index, 1);
                            break;
                        case "hobbies":
                            index = $scope.userprofile.hobbies.indexOf(stringValue);
                            $scope.userprofile.hobbies.splice(index, 1);
                            break;
                        default:
                            console.log('Unknow profile poperty');
                    }
                }
            };

            // ##################################### VALIDATING USER ANSWERS ##################################################

            //****************************************VALIDATIONS FOR STAGE 1 *************************************************

            $scope.validateAnsweredQuestions = function () {

                $scope.warningMessage = "Asegurate de contestar todas las preguntas antes de guardar";

                if ($scope.AnswersResult.answers[0] != null) {
                    if (($scope.AnswersResult.answers[1][0] == true ||
                        $scope.AnswersResult.answers[1][1] == true ||
                        $scope.AnswersResult.answers[1][2] == true ||
                        $scope.AnswersResult.answers[1][3] == true) ||
                        ($scope.AnswersResult.answers[1][4] == true && $scope.exploracionInicialOtroAnswer[0].answers[0] != '')) {
                        if ($scope.AnswersResult.answers.length[2] != 0) {
                            //Solving for the '\n' character
                            for (var a = 0; a < $scope.AnswersResult.answers[2].length; a++) {
                                var questionIsValid = true;
                                var text = $scope.AnswersResult.answers[2][a].replace(/\r?\n|\r/g, " ").trim();
                                $scope.AnswersResult.answers[2][a] = text;
                                if (text == '') {
                                    questionIsValid = false;
                                    break;
                                }
                            }
                            if (questionIsValid) {

                                if ($scope.AnswersResult.answers[3] != null) {
                                    if ($scope.AnswersResult.answers[4].length != 0) {
                                        var lastQuestionValidation = true;
                                        for (var a = 0; a < $scope.AnswersResult.answers[4].length; a++) {
                                            //Solving for the '\n' character
                                            var text = $scope.AnswersResult.answers[4][a].replace(/\r?\n|\r/g, " ").trim();
                                            $scope.AnswersResult.answers[4][a] = text;

                                            if (text == '') {
                                                lastQuestionValidation = false;
                                                break;
                                            }
                                        }

                                        if (lastQuestionValidation) {
                                            $scope.showWarning = false;
                                            $scope.navigateToPage(2);
                                            $scope.scrollToTop();
                                        } else {
                                            showWarningAndGoToTop();
                                        }

                                    }
                                    else {
                                        showWarningAndGoToTop();
                                    }
                                }
                                else {
                                    showWarningAndGoToTop();
                                }
                            }
                            else {
                                showWarningAndGoToTop();
                            }
                        }
                        else {
                            showWarningAndGoToTop();
                        }
                    }
                    else {
                        showWarningAndGoToTop();
                    }
                } else {
                    showWarningAndGoToTop();
                }
            };

            $scope.validateAnsweredQuestionsFinal = function () {
                $scope.warningMessage = "Asegurate de contestar todas las preguntas antes de guardar";
                if ($scope.AnswersResult.answers[0] != null) {
                    if ($scope.AnswersResult.answers[1] != null) {
                        if ($scope.AnswersResult.answers[2] != null) {
                            if ($scope.AnswersResult.answers[3] != null) {
                                if ($scope.AnswersResult.answers[4] != null) {
                                    $scope.showWarning = false;
                                    $scope.navigateToPage(2);
                                    $scope.scrollToTop();
                                }
                                else {
                                    showWarningAndGoToTop();
                                }
                            }
                            else {
                                showWarningAndGoToTop();
                            }
                        }
                        else {
                            showWarningAndGoToTop();
                        }
                    }
                    else {
                        showWarningAndGoToTop();
                    }
                }
                else {
                    showWarningAndGoToTop();
                }
            };


            $scope.validateMisSuenosAnsweredQuestions = function () {

                var quizIsValid = true;
                var numQuestions = $scope.misSuenosAnswers.length;
                var i, b;

                //Remove repeated entries and blanks in each of the 3 questions
                for (i = 0; i < numQuestions; i++) {
                    $scope.misSuenosAnswers[i] = $scope.misSuenosAnswers[i].filter(function (item, pos) {
                        return item.trim().length > 0 && $scope.misSuenosAnswers[i].indexOf(item) == pos;
                    });
                }

                //Correction for the '\n' reserved character
                for (i = 0; i < numQuestions; i++) {
                    for (b = 0; b < $scope.misSuenosAnswers[i].length; b++) {
                        $scope.misSuenosAnswers[i][b] = $scope.misSuenosAnswers[i][b].replace(/\r?\n|\r/g, " ").trim();
                    }
                }

                //Check is some of the questions has an invalid answer
                for (i = 0; i < numQuestions; i++) {
                    if ($scope.misSuenosAnswers[i].length == 0) {
                        quizIsValid = false;
                    }
                }

                if (quizIsValid) {
                    $scope.showWarning = false;
                    $scope.navigateToPage(2);
                    $scope.scrollToTop();
                } else {
                    $scope.warningMessage = "Asegurate de contestar todas las preguntas antes de guardar";
                    $scope.showWarning = true;
                    showWarningAndGoToTop();
                }
            };


            $scope.validateMisCualidadesAnsweredQuestions = function () {

                var validatedAnswers = [0, 0, 0];
                var validateOther = [0, 0, 0];

                for (var a = 0; a < $scope.misCualidadesAnswers.length; a++) {
                    var cont = $scope.misCualidadesAnswers[a].length;  //It should be equal to 13

                    for (var b = 0; b < cont; b++) { //Only the first 12 checkboxes
                        var checked = $scope.misCualidadesAnswers[a][b];
                        if (checked) {  //An option was checked by the user
                            validatedAnswers[a]++;
                        } else {
                            $scope.misCualidadesAnswers[a][b] = 0;
                        }
                    }

                    //...and lastly, for the input value...
                    if ($scope.misCualidadesAnswers[a][11] == true) {
                        //Get rid from carriage return

                        if ($scope.misCualidadesOtroAnswers[a].answers[0] != '') {
                            $scope.misCualidadesOtroAnswers[a].answers[0] = $scope.misCualidadesOtroAnswers[a].answers[0].replace(/\r?\n|\r/g, " ").trim();
                            validateOther[a] = 1;
                        } else {
                            validateOther[a] = -1;
                        }
                    }
                }

                if (validatedAnswers[0] > 0 &&
                    validatedAnswers[1] > 0 &&
                    validatedAnswers[2] > 0 &&
                    validateOther[0] != -1 &&
                    validateOther[1] != -1 &&
                    validateOther[2] != -1) {
                    $scope.OtroAnswer = $scope.misCualidadesOtroAnswers;
                    $scope.showWarning = false;
                    $scope.navigateToPage(2);
                    $scope.scrollToTop();
                } else {
                    $scope.warningMessage = "Asegurate de contestar todas las preguntas antes de guardar";
                    $scope.showWarning = true;
                    showWarningAndGoToTop();
                }
            };

            $scope.validateMisGustosAnsweredQuestions = function () {

                var validatedAnswers = [0, 0, 0];
                var validateOther = [0, 0, 0];

                for (var a = 0; a < $scope.misGustosAnswers.length; a++) {
                    var cont = $scope.misGustosAnswers[a].length;  //It should be equal to 12

                    for (var b = 0; b < cont; b++) { //Only the first 11 checkboxes
                        var checked = $scope.misGustosAnswers[a][b];
                        if (checked) {  //An option was checked by the user
                            validatedAnswers[a]++;
                        } else {
                            $scope.misGustosAnswers[a][b] = 0;
                        }
                    }

                    //...and lastly, for the input value...
                    if ($scope.misGustosAnswers[a][10] == true) {
                        //Get rid from carriage return

                        if ($scope.misGustosOtroAnswers[a].answers[0] != '') {
                            $scope.misGustosOtroAnswers[a].answers[0] = $scope.misGustosOtroAnswers[a].answers[0].replace(/\r?\n|\r/g, " ").trim();
                            validateOther[a] = 1;
                        } else {
                            validateOther[a] = -1;
                        }
                    }
                }

                if (validatedAnswers[0] > 0 &&
                    validatedAnswers[1] > 0 &&
                    validatedAnswers[2] > 0 &&
                    validateOther[0] != -1 &&
                    validateOther[1] != -1 &&
                    validateOther[2] != -1) {
                    $scope.OtroAnswer = $scope.misGustosOtroAnswers;
                    $scope.showWarning = false;
                    $scope.navigateToPage(2);
                    $scope.scrollToTop();
                } else {
                    $scope.warningMessage = "Asegurate de contestar todas las preguntas antes de guardar";
                    $scope.showWarning = true;
                    showWarningAndGoToTop();
                }

            };

            $scope.validateExploracionFinalAnsweredQuestions = function () {
                var quizIsValid = true;

                //Check if all questions were answered
                if ($scope.exploracionFinal.indexOf(null) > -1) {
                    quizIsValid = false;
                }

                if (quizIsValid) {
                    //moodleFactory.Services.GetAsyncActivityQuizInfo($scope.coursemoduleid, $scope.userprofile.id, partialSuccessfullCallBack, partialErrorCallback, true);
                    moodleFactory.Services.GetAsyncActivityQuizInfo($scope.coursemoduleid, -1, partialSuccessfullCallBack, partialErrorCallback, true);

                    $scope.showWarning = false;
                    $scope.navigateToPage(2);
                    $scope.scrollToTop();
                } else {
                    $scope.warningMessage = "Asegurate de contestar todas las preguntas antes de guardar";
                    $scope.showWarning = true;
                    showWarningAndGoToTop();
                }
            };


            function partialSuccessfullCallBack(partialActivityAnswers) {
                if (partialActivityAnswers != null) {

                    $scope.exploracionFinalresult =
                        [
                            {
                                "badAnswer": false,
                                "trueOptionWrong": false,
                                "falseOptionWrong": false,
                                "showTrueAnswer": true,
                                "showFalseAnswer": true
                            },
                            {
                                "badAnswer": false,
                                "trueOptionWrong": false,
                                "falseOptionWrong": false,
                                "showTrueAnswer": true,
                                "showFalseAnswer": true
                            },
                            {
                                "badAnswer": false,
                                "trueOptionWrong": false,
                                "falseOptionWrong": false,
                                "showTrueAnswer": true,
                                "showFalseAnswer": true
                            },
                            {
                                "badAnswer": false,
                                "firstOptionWrong": false,
                                "secondOptionWrong": false,
                                "thirdOptionWrong": false,
                                "showFirstAnswer": true,
                                "showSecondAnswer": true,
                                "showThirdAnswer": true
                            },
                            {
                                "badAnswer": false,
                                "firstOptionWrong": false,
                                "secondOptionWrong": false,
                                "thirdOptionWrong": false,
                                "showFirstAnswer": true,
                                "showSecondAnswer": true,
                                "showThirdAnswer": true
                            }
                        ];
                    var _mathFloor = 0;
                    var goodAnswersQty = 0;
                    for (var index = 0; index < partialActivityAnswers.questions.length; index++) {
                        var question = partialActivityAnswers.questions[index];
                        for (var answerIndex = 0; answerIndex < question.answers.length; answerIndex++) {
                            var questionAnswer = question.answers[answerIndex];
                            if (index == 0 || index == 1 || index == 2) {
                                var questionAnswerAnswer = questionAnswer.answer.toLowerCase().trim() == "true" ? 1 : 0;
                                var selectedAnswer = Number($scope.exploracionFinal[index]);
                                if (questionAnswerAnswer == selectedAnswer) {
                                    _mathFloor = Math.floor(questionAnswer.fraction);
                                    if (_mathFloor != 1) {
                                        $scope.exploracionFinalresult[index].badAnswer = true;
                                        if (questionAnswerAnswer == 0) {
                                            $scope.exploracionFinalresult[index].falseOptionWrong = true;
                                        }
                                        else {
                                            $scope.exploracionFinalresult[index].trueOptionWrong = true;
                                        }
                                    }
                                    else {
                                        if (answerIndex == 0) {
                                            $scope.exploracionFinalresult[index].showTrueAnswer = true;
                                            $scope.exploracionFinalresult[index].showFalseAnswer = false;
                                        }
                                        else {
                                            $scope.exploracionFinalresult[index].showTrueAnswer = false;
                                            $scope.exploracionFinalresult[index].showFalseAnswer = true;

                                        }
                                        break;
                                    }
                                }
                            }
                            else if (index == 3 || index == 4) {
                                if (answerIndex == $scope.exploracionFinal[index]) {
                                    if (Math.floor(questionAnswer.fraction) == 1) {
                                        if (answerIndex == 0) {
                                            $scope.exploracionFinalresult[index].showFirstAnswer = true;
                                            $scope.exploracionFinalresult[index].showSecondAnswer = false;
                                            $scope.exploracionFinalresult[index].showThirdAnswer = false;
                                        }
                                        else if (answerIndex == 1) {
                                            $scope.exploracionFinalresult[index].showFirstAnswer = false;
                                            $scope.exploracionFinalresult[index].showSecondAnswer = true;
                                            $scope.exploracionFinalresult[index].showThirdAnswer = false;
                                        }
                                        else {
                                            $scope.exploracionFinalresult[index].showFirstAnswer = false;
                                            $scope.exploracionFinalresult[index].showSecondAnswer = false;
                                            $scope.exploracionFinalresult[index].showThirdAnswer = true;
                                        }
                                        break;
                                    }
                                    else {
                                        $scope.exploracionFinalresult[index].badAnswer = true;
                                        if (answerIndex == 0) {
                                            $scope.exploracionFinalresult[index].firstOptionWrong = true;
                                        }
                                        else if (answerIndex == 1) {
                                            $scope.exploracionFinalresult[index].secondOptionWrong = true;
                                        }
                                        else {
                                            $scope.exploracionFinalresult[index].thirdOptionWrong = true;
                                        }
                                        break;
                                    }
                                }
                            }
                        }

                        if (!$scope.exploracionFinalresult[index].badAnswer) {
                            goodAnswersQty++;
                        }
                    }
                }
                else {
                    $scope.showWarning = true;
                    $scope.warningMessage = "Las respuestas del quiz no se pueden mostrar en este momento";
                }

                $scope.Score = goodAnswersQty * 100 / $scope.exploracionFinalresult.length;
            }

            
            function partialErrorCallback(partialActivityAnswers) {

            }


            //*********************************** VALIDATION OF USER ANSWERS FOR QUIZZES STAGE 2 *****************************

            $scope.validateExploracionInicialStage2 = function () {
                $scope.warningMessage = "Asegurate de contestar todas las preguntas antes de guardar";

                var quizIsValid = false;

                //Validation: there must not be a 'null' value AND the multichoice must have some 'true' value
                if (($scope.exploracionInicialStage2.indexOf(null) === -1) && ($scope.exploracionInicialStage2[3].indexOf(1) > -1)) {

                    //Other is 'true' and has a non empty string in the input
                    var userInput = $scope.exploracionInicialStage2OtroAnswers[0].answers[0].replace(/\r?\n|\r/g, " ").trim();
                    if (($scope.exploracionInicialStage2[3][4] && userInput != '') || !$scope.exploracionInicialStage2[3][4]) {
                        quizIsValid = true;
                    }
                }

                if (quizIsValid) {
                    $scope.showWarning = false;
                    $scope.navigateToPage(2);
                    $scope.scrollToTop();

                } else {
                    $scope.showWarning = true;
                    $scope.warningMessage = "Asegurate de contestar todas las preguntas antes de guardar";
                    $scope.$emit('scrollTop');
                }
            };


            $scope.validateTusIdeas = function () {

                var quizIsValid = true;
                var numQuestions = $scope.misIdeas.length;
                var i, b;

                //Remove repeated entries and blanks in each of the two questions
                for (i = 0; i < numQuestions; i++) {
                    $scope.misIdeas[i] = $scope.misIdeas[i].filter(function (item, pos) {
                        return item.trim().length > 0 && $scope.misIdeas[i].indexOf(item) == pos;
                    });
                }

                //Correction for the '\n' reserved character
                for (i = 0; i < numQuestions; i++) {
                    for (b = 0; b < $scope.misIdeas[i].length; b++) {
                        $scope.misIdeas[i][b] = $scope.misIdeas[i][b].replace(/\r?\n|\r/g, " ").trim();
                    }
                }

                //Check is some of the questions had no valid answer
                for (i = 0; i < numQuestions; i++) {
                    if ($scope.misIdeas[i].length == 0) {
                        quizIsValid = false;
                    }
                }

                if (quizIsValid) {
                    $scope.showWarning = false;
                    $scope.navigateToPage(2);
                    $scope.scrollToTop();
                } else {
                    $scope.showWarning = true;
                    $scope.warningMessage = "Asegurate de contestar todas las preguntas antes de guardar";
                    showWarningAndGoToTop();
                }
            };


            $scope.validateTuFuturo = function () {

                var quizIsValid = true;
                var numQuestions = $scope.miFuturo.length;
                var numOfEntries = [];
                var i, b;
                //console.log("numQuestions = " + numQuestions);
                //Count how many items per question
                //Remove repeated entries and blanks in each of the two questions
                for (i = 0; i < numQuestions; i++) {
                    numOfEntries[i] = $scope.miFuturo[i].length;
                    //console.log(numOfEntries[i]);
                }

                //Remove repeated entries and blanks in each of the two questions
                for (i = 0; i < numQuestions; i++) {
                    console.log("$scope.miFuturo[" + i + "].length = " + $scope.miFuturo[i].length);
                    for (b = 0; b < $scope.miFuturo[i].length; b++) {
                        var item = $scope.miFuturo[i][b].replace(/\r?\n|\r/g, " ").trim();                        
                    }

                    $scope.miFuturo[i] = $scope.miFuturo[i].filter(function (item, pos) {
                        return item.trim().length > 0 && $scope.miFuturo[i].indexOf(item) == pos;
                    });
                }

                //Correction for the '\n' reserved character
                for (i = 0; i < numQuestions; i++) {
                    for (b = 0; b < $scope.miFuturo[i].length; b++) {
                        $scope.miFuturo[i][b] = $scope.miFuturo[i][b].replace(/\r?\n|\r/g, " ").trim();
                    }
                }

                //Check is some of the questions had no valid answer
                for (i = 0; i < numQuestions; i++) {
                    if ($scope.miFuturo[i].length == 0) {
                        quizIsValid = false;
                    }
                }

                if (quizIsValid) {
                    $scope.showWarning = false;
                    $scope.navigateToPage(2);
                    $scope.scrollToTop();
                } else {
                    $scope.showWarning = true;
                    $scope.warningMessage = "Asegurate de contestar todas las preguntas antes de guardar";
                    showWarningAndGoToTop();
                }
            };


            $scope.validateExploracionFinalStage2 = function () {

                var cont = $scope.exploracionFinalStage2.length;
                var quizIsValid = true;

                //Check if all questions were answered
                if ($scope.exploracionFinalStage2.indexOf(null) > -1) {
                    quizIsValid = false;
                }

                if (quizIsValid) {
                    $scope.showWarning = false;
                    $scope.navigateToPage(2);
                    $scope.scrollToTop();
                    //GET request to get activity; like for example: http://incluso.definityfirst.com/RestfulAPI/public/activity/159?userid=542
                    console.log("The coursemoduleid = " + $scope.coursemoduleid);
                    moodleFactory.Services.GetAsyncActivityQuizInfo($scope.coursemoduleid, -1, partialSuccessfullCallBackStage2, partialErrorCallbackStage2, true);
                } else {
                    $scope.showWarning = true;
                    $scope.warningMessage = "Asegurate de contestar todas las preguntas antes de guardar";
                    showWarningAndGoToTop();
                }

            };

            function partialSuccessfullCallBackStage2(partialActivityAnswers) {
                if (partialActivityAnswers != null) {

                    $scope.exploracionFinalresult2 =
                        [
                            {"badAnswer": false, "trueOptionWrong": false, "falseOptionWrong": false},
                            {
                                "badAnswer": false,
                                "firstOptionWrong": false,
                                "secondOptionWrong": false,
                                "thirdOptionWrong": false
                            },
                            {
                                "badAnswer": false,
                                "firstOptionWrong": false,
                                "secondOptionWrong": false,
                                "thirdOptionWrong": false
                            },
                            {
                                "badAnswer": false,
                                "firstOptionWrong": false,
                                "secondOptionWrong": false,
                                "thirdOptionWrong": false
                            }
                        ];

                    var _mathFloor = 0;
                    var goodAnswersQty = 0;

                    for (var index = 0; index < partialActivityAnswers.questions.length; index++) {
                        var question = partialActivityAnswers.questions[index];
                        for (var answerIndex = 0; answerIndex < question.answers.length; answerIndex++) {


                            var questionAnswer = question.answers[answerIndex];
                            console.log(index + " -- " + JSON.stringify(questionAnswer));
                            if (index == 0) {
                                var questionAnswerAnswer;
                                if (questionAnswer.answer == "Sí") {
                                    questionAnswerAnswer = 0;
                                } else {
                                    questionAnswerAnswer = 1;
                                }

                                if (questionAnswerAnswer == $scope.exploracionFinalStage2[index]) {
                                    _mathFloor = Math.floor(questionAnswer.fraction);
                                    if (_mathFloor < 1) {//Fraction = 0
                                        $scope.exploracionFinalresult2[index].badAnswer = true;
                                        if (questionAnswerAnswer == 0) {//The bad answer is "Sí"
                                            //$scope.exploracionFinalresult2[index].falseOptionWrong = true;
                                            $scope.exploracionFinalresult2[index].trueOptionWrong = true;
                                        } else if (questionAnswerAnswer == 1) {//The bad answer is "No"
                                            $scope.exploracionFinalresult2[index].falseOptionWrong = true;
                                        }
                                    }
                                }
                            }
                            else if (index > 0) {
                                if (answerIndex == $scope.exploracionFinalStage2[index]) {
                                    if (Math.floor(questionAnswer.fraction) == 1) {

                                    } else {
                                        $scope.exploracionFinalresult2[index].badAnswer = true;
                                        if (answerIndex == 0) {
                                            $scope.exploracionFinalresult2[index].firstOptionWrong = true;
                                        }
                                        else if (answerIndex == 1) {
                                            $scope.exploracionFinalresult2[index].secondOptionWrong = true;
                                        }
                                        else {
                                            $scope.exploracionFinalresult2[index].thirdOptionWrong = true;
                                        }
                                        //break;
                                    }
                                }
                            }
                        }

                        if (!$scope.exploracionFinalresult2[index].badAnswer) {
                            goodAnswersQty++;
                        }
                    }
                }
                else {
                    $scope.showWarning = true;
                    $scope.warningMessage = "Las respuestas del quiz no se pueden mostrar en este momento";
                }

                $scope.Score = goodAnswersQty * 100 / $scope.exploracionFinalresult2.length;
            }

            
            function partialErrorCallbackStage2(partialActivityAnswers) {

            }

            //*********************************** VALIDATION OF USER ANSWERS FOR STAGE 3 **********************************

            $scope.validateExploracionInicialStage3 = function () {
                var quizIsValid = true;
                var userInput;

                //Check if first (yes/no) question was answered
                if ($scope.exploracionInicialStage3[0] !== null) {//

                    //Check if second (simple choice) question was answered
                    if ($scope.exploracionInicialStage3[1] !== null) {//

                        //Check third (multiple choice) question was answered
                        if ($scope.exploracionInicialStage3[2].indexOf(1) > -1) {//

                            //Check if Other was selected and it has a non null string, OR if it was not selected
                            userInput = $scope.exploracionInicialStage3OtroAnswers[0].answers[0].replace(/\r?\n|\r/g, " ").trim();
                            if (($scope.exploracionInicialStage3[2][5] && userInput != '') || !$scope.exploracionInicialStage3[2][5]) {

                                //Check if fourth (simple choice) question was answered
                                if ($scope.exploracionInicialStage3[3] == null) {
                                    quizIsValid = false;
                                }

                            } else {//
                                quizIsValid = false;
                            }
                        } else {//
                            quizIsValid = false;
                        }
                    } else {//
                        quizIsValid = false;
                    }
                } else {//
                    quizIsValid = false;
                }

                if (quizIsValid) {
                    $scope.showWarning = false;
                    $scope.navigateToPage(2);
                    $scope.scrollToTop();
                } else {
                    $scope.warningMessage = "Asegurate de contestar todas las preguntas antes de guardar";
                    $scope.showWarning = true;
                    showWarningAndGoToTop();
                }
            };


            $scope.validateExploracionFinalStage3 = function () {

                var cont = $scope.exploracionFinalStage3.length;
                var quizIsValid = true;
                var userInput;

                //Check if first (simple choice) question was answered
                if ($scope.exploracionFinalStage3[0] !== null) {//

                    //Check if second (simple choice) question was answered
                    if ($scope.exploracionFinalStage3[1] !== null) {//

                        //Check third (multiple choice) question was answered
                        if ($scope.exploracionFinalStage3[2].indexOf(1) > -1) {//

                            //Check if Other was selected and it has a non null string, OR if it was not selected
                            userInput = $scope.exploracionFinalStage3OtroAnswers[0].answers[0].replace(/\r?\n|\r/g, " ").trim();
                            if (($scope.exploracionFinalStage3[2][4] && userInput != '') || !$scope.exploracionFinalStage3[2][4]) {//

                                //Check if fourth (simple choice) question was answered
                                if ($scope.exploracionFinalStage3[3] !== null) {//

                                    //Check if fifth (simple choice) question was answered
                                    if ($scope.exploracionFinalStage3[4] == null) {
                                        quizIsValid = false;
                                    }

                                } else {//
                                    quizIsValid = false;
                                }
                            } else {//
                                quizIsValid = false;
                            }
                        } else {//
                            quizIsValid = false;
                        }
                    } else {//
                        quizIsValid = false;
                    }
                } else {//
                    quizIsValid = false;
                }

                if (quizIsValid) {
                    $scope.showWarning = false;
                    $scope.navigateToPage(2);
                    $scope.scrollToTop();
                    //GET request to get activity; like for example: http://incluso.definityfirst.com/RestfulAPI/public/activity/159?userid=542
                    console.log("The coursemoduleid = " + $scope.coursemoduleid);
                    moodleFactory.Services.GetAsyncActivityQuizInfo($scope.coursemoduleid, -1, partialSuccessfullCallBackStage3, partialErrorCallbackStage3, true);
                } else {
                    $scope.showWarning = true;
                    $scope.warningMessage = "Asegurate de contestar todas las preguntas antes de guardar";
                    showWarningAndGoToTop();
                }
            };


            function partialSuccessfullCallBackStage3(partialActivityAnswers) {
                if (partialActivityAnswers != null) {

                    //console.log(partialActivityAnswers.toString());

                    $scope.exploracionFinalresult3 = [
                        {
                            "badAnswer": false,
                            "firstOptionWrong": false,
                            "secondOptionWrong": false,
                            "thirdOptionWrong": false
                        },
                        {
                            "badAnswer": false,
                            "firstOptionWrong": false,
                            "secondOptionWrong": false,
                            "thirdOptionWrong": false
                        },
                        {
                            "badAnswer": false,
                            "firstOptionWrong": false,
                            "secondOptionWrong": false,
                            "thirdOptionWrong": false,
                            "fourthOptionWrong": false,
                            "fifthOptionWrong": false
                        },
                        {"badAnswer": false, "trueOptionWrong": false, "falseOptionWrong": false},
                        {
                            "badAnswer": false,
                            "firstOptionWrong": false,
                            "secondOptionWrong": false,
                            "thirdOptionWrong": false
                        }
                    ];

                    var _mathFloor = 0;
                    var goodAnswersQty = 0;
                    var checkPoints = 0;
                    var addToScore = 0;
                    for (var index = 0; index < partialActivityAnswers.questions.length; index++) {
                        var question = partialActivityAnswers.questions[index];
                        for (var answerIndex = 0; answerIndex < question.answers.length; answerIndex++) {


                            var questionAnswer = question.answers[answerIndex];
                            //console.log(index + " -- " + JSON.stringify(questionAnswer));
                            if (index == 3) {// Yes/No question
                                var questionAnswerAnswer;
                                //console.log("Pregunta Sí/No respuesta: " + questionAnswer.answer);
                                if (questionAnswer.answer == "Sí") {
                                    questionAnswerAnswer = 0;
                                } else {
                                    questionAnswerAnswer = 1;
                                }

                                if (questionAnswerAnswer == $scope.exploracionFinalStage3[index]) {

                                    _mathFloor = Math.floor(questionAnswer.fraction);
                                    if (_mathFloor < 1) {//Fraction = 0
                                        $scope.exploracionFinalresult3[index].badAnswer = true;
                                        if (questionAnswerAnswer == 0) {//The bad answer is "Sí"
                                            $scope.exploracionFinalresult3[index].trueOptionWrong = true;
                                        } else if (questionAnswerAnswer == 1) {//The bad answer is "No"
                                            $scope.exploracionFinalresult3[index].falseOptionWrong = true;
                                        }
                                    }
                                }
                            } else if (index == 0 || index == 1 || index == 4) {//Simple choice questions
                                if (answerIndex == $scope.exploracionFinalStage3[index]) {
                                    if (Math.floor(questionAnswer.fraction) == 1) {

                                    } else {
                                        $scope.exploracionFinalresult3[index].badAnswer = true;
                                        if (answerIndex == 0) {
                                            $scope.exploracionFinalresult3[index].firstOptionWrong = true;
                                        }
                                        else if (answerIndex == 1) {
                                            $scope.exploracionFinalresult3[index].secondOptionWrong = true;
                                        }
                                        else {
                                            $scope.exploracionFinalresult3[index].thirdOptionWrong = true;
                                        }
                                        //break;
                                    }
                                }
                            } else if (index == 2) {

                                //console.log(answerIndex + " == " + $scope.exploracionFinalStage3[index][answerIndex]);
                                if ($scope.exploracionFinalStage3[index][answerIndex] == 1) {
                                    //Give 25% of total value to answer
                                    checkPoints += 1; //Min value = 0, Max value = 5
                                }

                                $scope.exploracionFinalresult3[index].badAnswer = true;
                            }


                        }

                        if (!$scope.exploracionFinalresult3[index].badAnswer) {
                            goodAnswersQty++;
                        }
                    }
                }
                else {
                    $scope.warningMessage = "Las respuestas del quiz no se pueden mostrar en este momento";
                    $scope.showWarning = true;
                }

                addToScore = checkPoints / 4;

                if (addToScore > 1) {
                    addToScore = 1;
                }

                //console.log("Final: " + goodAnswersQty + " == " + checkPoints);
                $scope.Score = (goodAnswersQty + addToScore) * 100 / $scope.exploracionFinalresult3.length;
            }

            function partialErrorCallbackStage3(partialActivityAnswers) {

            }


            //#######################################  SECTION FOR DATA-BINDING FUNCTIONS ##################################

            //********************************** DATA-BINDING FOR QUIZZES - STAGE 1 *****************************************

            function updateSelectedAnswers(questionIndex, question) {//For "Exploración Inicial" only
                var userAnswers = '';
                switch (questionIndex) {
                    case 0:
                        if (question.userAnswer == "Si") {

                            $scope.AnswersResult.answers[0] = "0";
                        }
                        else if (question.userAnswer == "No") {
                            $scope.AnswersResult.answers[0] = "1";
                        }
                        break;

                    case 1:
                        if (question.userAnswer.length > 0) {
                            userAnswers = question.userAnswer.split(";");
                            for (var indexUserAnswers = 0; indexUserAnswers < userAnswers.length; indexUserAnswers++) {
                                var userAnswer = cleanText(userAnswers[indexUserAnswers]).trim();
                                for (var index = 0; index < question.answers.length; index++) {
                                    var questionOption = cleanText(question.answers[index].answer).trim();
                                    
                                    if (questionOption == userAnswer) {
                                        $scope.AnswersResult.answers[1][index] = 1;
                                        if (userAnswer == "Otro") {

                                            $scope.exploracionInicialOtroAnswer[0].answers[0] = question.other;
                                            $scope.OtroAnswer = $scope.exploracionInicialOtroAnswer;
                                            _setLocalStorageJsonItem("activityOtrosAnswers/" + $scope.activity.coursemoduleid, $scope.OtroAnswer);

                                        }
                                    }
                                }
                            }
                        }

                        break;
                    case 2:

                        if (question.userAnswer != null) {
                            userAnswers = question.userAnswer.split('\n');

                            for (var index = 0; index < userAnswers.length; index++) {
                                var myAnswer = userAnswers[index];
                                $scope.AnswersResult.answers[2].push(myAnswer);
                            }
                        }
                        //$scope.AnswersResult.answers[2] = question.userAnswer.trim();
                        break;
                    case 3:

                        userAnswer = question.userAnswer.replace("\n", "");

                        if (userAnswer == "Si") {
                            $scope.AnswersResult.answers[3] = 0;
                        }

                        if (userAnswer == "No") {
                            $scope.AnswersResult.answers[3] = 1;
                        }

                        if (userAnswer == "Mas o menos") {
                            $scope.AnswersResult.answers[3] = 2;
                        }

                        break;

                    case 4:

                        if (question.userAnswer != null) {
                            userAnswers = question.userAnswer.split(';');
                            for (var index = 0; index < userAnswers.length; index++) {
                                var myAnswer = userAnswers[index];
                                $scope.AnswersResult.answers[4].push(myAnswer);
                            }
                        }
                        /*
                         if (question.userAnswer != null) {
                         var userAnswers = cleanText(question.userAnswer);
                         var userAnswerArray = userAnswers.split(";");
                         for (var i = 0; i < userAnswerArray.length; i++) {
                         $scope.AnswersResult.answers[4].push(userAnswerArray[i]);
                         }
                         }
                         */

                        break;

                    default:
                        break;
                }
            }

            function updateSelectedAnswersFinal(questionIndex, question) {

                switch (questionIndex) {
                    case 0:
                        if (question.userAnswer == "True") {
                            $scope.AnswersResult.answers[0] = 2;
                        }
                        else if (question.userAnswer == "False") {
                            $scope.AnswersResult.answers[0] = 1;
                        }
                        break;

                    case 1:
                        if (question.userAnswer == "True") {
                            $scope.AnswersResult.answers[1] = 2;
                        }
                        else if (question.userAnswer == "False") {
                            $scope.AnswersResult.answers[1] = 1;
                        }
                        break;

                    case 2:
                        if (question.userAnswer == "True") {
                            $scope.AnswersResult.answers[2] = 1;
                        }
                        else if (question.userAnswer == "False") {
                            $scope.AnswersResult.answers[2] = 0;
                        }
                        break;

                    case 3:
                        if (question.userAnswer == "Es tu ejemplo a seguir y debes ser igual a él\n") {
                            $scope.AnswersResult.answers[3] = 0;
                        }
                        else if (question.userAnswer == "Puedes aprender de su experiencia para alcanzar tus sueños\n") {
                            $scope.AnswersResult.answers[3] = 1;
                        }
                        else if (question.userAnswer == "Puede enseñarte cómo ganar dinero más fácil\n") {
                            $scope.AnswersResult.answers[3] = 2;
                        }
                        break;

                    case 4:
                        if (question.userAnswer == "Porque aprovechas mejor tus talentos y difrutas lo que haces\n") {
                            $scope.AnswersResult.answers[4] = 0;
                        }
                        else if (question.userAnswer == "Porque puedes ser más famoso y exitoso\n") {
                            $scope.AnswersResult.answers[4] = 1;
                        }
                        else if (question.userAnswer == "Porque debes hacer lo que quieras sin importar nada ni nadie\n") {
                            $scope.AnswersResult.answers[4] = 2;
                        }
                        break;

                    default:
                        break;
                }
            }


            function updateMisCualidadesSelectedAnswers(currentQuestionIndex, question) {
                if (question.userAnswer != null) {
                    var userAnswers = cleanText(question.userAnswer);
                    var userAnswersList = userAnswers.split(";");

                    //userAnswersList = ["Cantar", "Hacer manualidades"]
                    for (var answerOptionsIndex = 0; answerOptionsIndex < question.answers.length; answerOptionsIndex++) {
                        var answerOption = question.answers[answerOptionsIndex]; //JS array of literal objects

                        for (var userAnswersListIndex = 0; userAnswersListIndex < userAnswersList.length; userAnswersListIndex++) {
                            var userAnswer = cleanText(userAnswersList[userAnswersListIndex]).trim();
                            if (answerOption.answer == userAnswer) {
                                $scope.misCualidadesAnswers[currentQuestionIndex][answerOptionsIndex] = 1;
                                if (userAnswer == "Otro") {
                                    $scope.misCualidadesOtroAnswers[currentQuestionIndex].answers[0] = question.other;
                                }
                            }
                        }
                    }
                    $scope.OtroAnswer = $scope.misCualidadesOtroAnswers;
                    _setLocalStorageJsonItem("activityOtrosAnswers/" + $scope.activity.coursemoduleid, $scope.OtroAnswer);
                }
            }


            function updateMisGustosSelectedAnswers(currentQuestionIndex, question) {
                if (question.userAnswer != null) {
                    var userAnswers = cleanText(question.userAnswer);
                    var userAnswersList = userAnswers.split(";");
                    for (var answerOptionsIndex = 0; answerOptionsIndex < question.answers.length; answerOptionsIndex++) {
                        var answerOption = question.answers[answerOptionsIndex];
                        for (var userAnswersListIndex = 0; userAnswersListIndex < userAnswersList.length; userAnswersListIndex++) {
                            var userAnswer = cleanText(userAnswersList[userAnswersListIndex]).trim();
                            if (answerOption.answer.trim() == userAnswer) {
                                $scope.misGustosAnswers[currentQuestionIndex][answerOptionsIndex] = 1;
                                if (userAnswer == "Otro") {
                                    $scope.misGustosOtroAnswers[currentQuestionIndex].answers[0] = question.other;
                                }
                            }
                        }
                    }
                    $scope.OtroAnswer = $scope.misGustosOtroAnswers;
                    _setLocalStorageJsonItem("activityOtrosAnswers/" + $scope.activity.coursemoduleid, $scope.OtroAnswer);
                }
            }

            function updateMisSueñosSelectedAnswers(index, question) {
                var userAnswersList = question.userAnswer.split(";");
                userAnswersList.forEach(function (answer) {
                    //var cleanAnswer = cleanText2(answer);
                    $scope.misSuenosAnswers[index].push(answer);
                });

                if (index == 0) {
                    var qty = userAnswersList.length;
                    addHeightConsulta("#listaDinamica1", qty);
                }
            }

            function updateExploracionFinalSelectedAnswersFinal(index, question) {
                var userAnswer = cleanText(question.userAnswer).trim();

                for (var answerIndex = 0; answerIndex < question.answers.length; answerIndex++) {
                    var answerOption = question.answers[answerIndex];
                    var cleanAnswer = cleanText(answerOption.answer).trim();
                    if (cleanAnswer == userAnswer) {

                        if (index == 0 || index == 1 || index == 2) {
                            answerIndex = answerIndex == 0 ? 1 : 0;
                            $scope.exploracionFinal[index] = answerIndex;
                            break;
                        }
                        if (index == 3 || index == 4) {
                            $scope.exploracionFinal[index] = answerIndex;
                            break;
                        }
                    }
                }
            }

            //******************************************** DATA-BINDING FOR QUIZZES - STAGE 2 *******************************

            function updateExploracionInicialStage2Answers(questionIndex, question) {

                var userAnswers = '';
                switch (questionIndex) {
                    case 0:
                        if (question.userAnswer == "Sí") {
                            $scope.exploracionInicialStage2[0] = "0";
                        }
                        else if (question.userAnswer == "No") {
                            $scope.exploracionInicialStage2[0] = "1";
                        }
                        break;

                    case 1:
                        if (question.userAnswer == "Sí") {
                            $scope.exploracionInicialStage2[1] = "0";
                        }
                        else if (question.userAnswer == "No") {
                            $scope.exploracionInicialStage2[1] = "1";
                        }
                        break;

                    case 2:

                        if (question.userAnswer == "Sí") {
                            $scope.exploracionInicialStage2[2] = "0";
                        }
                        else if (question.userAnswer == "No") {
                            $scope.exploracionInicialStage2[2] = "1";
                        }
                        break;

                    case 3:
                        if (question.userAnswer.length > 0) {
                            userAnswers = question.userAnswer.split(";");
                            console.log(userAnswers);
                            userAnswers.forEach(function (item) {
                                var cleanedItem = item.trim();
                                switch (cleanedItem) {
                                    case "Salud Física":
                                        $scope.exploracionInicialStage2[3][0] = 1;
                                        break;
                                    case "Escuela":
                                        $scope.exploracionInicialStage2[3][1] = 1;
                                        break;
                                    case "Familia y amigos":
                                        $scope.exploracionInicialStage2[3][2] = 1;
                                        break;
                                    case "Hobbies":
                                        $scope.exploracionInicialStage2[3][3] = 1;
                                        break;
                                    default:
                                        break;
                                }

                                if (cleanedItem == "Otro") {
                                    $scope.exploracionInicialStage2[3][4] = 1;
                                    $scope.exploracionInicialStage2OtroAnswers[0].answers[0] = question.other;
                                    $scope.OtroAnswer = $scope.exploracionInicialStage2OtroAnswers;
                                    _setLocalStorageJsonItem("activityOtrosAnswers/" + $scope.activity.coursemoduleid, $scope.OtroAnswer);
                                }

                            });
                        }
                }
            }

            function updateTusIdeasStage2Answers(index, question) {
                console.log(question + "\n");
                var userAnswersList = question.userAnswer.split(";");
                userAnswersList.forEach(function (answer) {
                    $scope.misIdeas[index].push(answer);
                });

                if (index == 0) {
                    var qty = userAnswersList.length;
                    addHeightConsulta("#listaDinamica1", qty);
                }
            }

            function updateTuFuturoStage2Answers(index, question) {
                console.log(question + "\n");
                var userAnswersList = question.userAnswer.split(";");
                userAnswersList.forEach(function (answer) {
                    $scope.miFuturo[index].push(answer);
                });

                if (index == 0) {
                    var qty = userAnswersList.length;
                    addHeightConsulta("#listaDinamica1", qty);
                }
            }

            function updateExploracionFinalStage2Answers(index, question) {
                var userAnswers = '';
                console.log(question.userAnswer);
                switch (index) {
                    case 0:
                        if (question.userAnswer == "Sí") {
                            $scope.exploracionFinalStage2[0] = "0";
                        }
                        else if (question.userAnswer == "No") {
                            $scope.exploracionFinalStage2[0] = "1";
                        }
                        break;

                    case 1:
                        if (question.userAnswer == "Planear lo que puedes hacer hoy para lograrlo") {
                            $scope.exploracionFinalStage2[1] = "0";
                        }
                        if (question.userAnswer == "Tener algo en que soñar") {
                            $scope.exploracionFinalStage2[1] = "1";
                        }
                        if (question.userAnswer == "Imaginar muchas cosas que te encantan") {
                            $scope.exploracionFinalStage2[1] = "2";
                        }
                        break;

                    case 2:
                        if (question.userAnswer == "Eres capaz de hacer muchas cosas al mismo tiempo") {
                            $scope.exploracionFinalStage2[2] = "0";
                        }
                        if (question.userAnswer == "Las demás personas creen que es importante") {
                            $scope.exploracionFinalStage2[2] = "1";
                        }
                        if (question.userAnswer == "Te ayuda a crecer de igual forma en todos las áreas de tu vida.") {
                            $scope.exploracionFinalStage2[2] = "2";
                        }
                        break;

                    case 3:
                        if (question.userAnswer == "Para poner una referencia y saber que lo has logrado") {
                            $scope.exploracionFinalStage2[3] = "0";
                        }
                        if (question.userAnswer == "Para calificarme si lo hice bien o mal") {
                            $scope.exploracionFinalStage2[3] = "1";
                        }
                        if (question.userAnswer == "Para darme cuenta del trabajo que cuesta") {
                            $scope.exploracionFinalStage2[3] = "2";
                        }
                        break;
                }
            }

            //****************************************** DATA-BINDING FOR QUIZZES - STAGE 3 *******************************

            function updateExploracionInicialStage3Answers(index, question) {
                console.log(question.userAnswer);
                var userAnswers = '';
                switch (index) {
                    case 0:
                        if (question.userAnswer == "Sí") {
                            $scope.exploracionInicialStage3[0] = "0";
                        }
                        else if (question.userAnswer == "No") {
                            $scope.exploracionInicialStage3[0] = "1";
                        }
                        break;

                    case 1:
                        if (question.userAnswer == "Si, porque es la ruta para hacer realidad una idea") {
                            $scope.exploracionInicialStage3[1] = "0";
                        }
                        if (question.userAnswer == "No, porque si la idea es buena no necesita un plan") {
                            $scope.exploracionInicialStage3[1] = "1";
                        }

                        break;

                    case 2:

                        if (question.userAnswer.length > 0) {
                            userAnswers = question.userAnswer.split(";");

                            userAnswers.forEach(function (item) {
                                var cleanedItem = item.trim();
                                switch (cleanedItem) {
                                    case "La necesidad que satisface":
                                        $scope.exploracionInicialStage3[2][0] = 1;
                                        break;
                                    case "El p\u00fablico objetivo":
                                        $scope.exploracionInicialStage3[2][1] = 1;
                                        break;
                                    case "El producto o servicio":
                                        $scope.exploracionInicialStage3[2][2] = 1;
                                        break;
                                    case "La forma en que se entrega al cliente":
                                        $scope.exploracionInicialStage3[2][3] = 1;
                                        break;
                                    case "Los recursos que se necesitan":
                                        $scope.exploracionInicialStage3[2][4] = 1;
                                        break;
                                    default:
                                        break;
                                }

                                if (cleanedItem == "Otro") {
                                    $scope.exploracionInicialStage3[2][5] = 1;
                                    $scope.exploracionInicialStage3OtroAnswers[0].answers[0] = question.other;
                                    $scope.OtroAnswer = $scope.exploracionInicialStage3OtroAnswers;
                                    _setLocalStorageJsonItem("activityOtrosAnswers/" + $scope.activity.coursemoduleid, $scope.OtroAnswer);
                                }

                            });
                        }

                        break;

                    case 3:
                        if (question.userAnswer == "Guardar el dinero que te sobra") {
                            $scope.exploracionInicialStage3[3] = "0";
                        }
                        if (question.userAnswer == "No gastar en cosas que no necesitas") {
                            $scope.exploracionInicialStage3[3] = "1";
                        }
                        if (question.userAnswer == "Separar una parte de tu dinero antes de gastarlo") {
                            $scope.exploracionInicialStage3[3] = "2";
                        }

                        break;
                }
            }


            function updateExploracionFinalStage3Answers(index, question) {
                console.log(question.userAnswer);
                var userAnswers = '';
                console.log(question.userAnswer);
                switch (index) {
                    case 0:
                        if (question.userAnswer == "Las necesidades que tiene una comunidad") {
                            $scope.exploracionFinalStage3[0] = "0";
                        }
                        if (question.userAnswer == "El dinero que tienes para realizarlo") {
                            $scope.exploracionFinalStage3[0] = "1";
                        }
                        if (question.userAnswer == "Que este compobrado el \u00e9xito que tiene esa idea") {
                            $scope.exploracionFinalStage3[0] = "2";
                        }
                        break;

                    case 1:
                        if (question.userAnswer == "La idea que te deja m\u00e1s ganancias") {
                            $scope.exploracionFinalStage3[1] = "0";
                        }
                        if (question.userAnswer == "Lo que te hace diferente y mejor que tu competencia") {
                            $scope.exploracionFinalStage3[1] = "1";
                        }
                        if (question.userAnswer == "La mejor idea que has tenido") {
                            $scope.exploracionFinalStage3[1] = "2";
                        }
                        break;

                    case 2:
                        if (question.userAnswer.length > 0) {
                            userAnswers = question.userAnswer.split(";");

                            userAnswers.forEach(function (item) {
                                var cleanedItem = item.trim();
                                switch (cleanedItem) {
                                    case "La necesidad que cubres":
                                        $scope.exploracionFinalStage3[2][0] = 1;
                                        break;
                                    case "Tu p\u00fablico objetivo":
                                        $scope.exploracionFinalStage3[2][1] = 1;
                                        break;
                                    case "El canal de entrega":
                                        $scope.exploracionFinalStage3[2][2] = 1;
                                        break;
                                    case "Los recursos que necesitas":
                                        $scope.exploracionFinalStage3[2][3] = 1;
                                        break;
                                    default:
                                        break;
                                }

                                if (cleanedItem == "Otro") {
                                    $scope.exploracionFinalStage3[2][4] = 1;
                                    $scope.exploracionFinalStage3OtroAnswers[0].answers[0] = question.other;
                                    $scope.OtroAnswer = $scope.exploracionFinalStage3OtroAnswers;
                                    _setLocalStorageJsonItem("activityOtrosAnswers/" + $scope.activity.coursemoduleid, $scope.OtroAnswer);
                                }

                            });
                        }

                        break;

                    case 3:
                        if (question.userAnswer == "Sí") {
                            $scope.exploracionFinalStage3[3] = "0";
                        }
                        else if (question.userAnswer == "No") {
                            $scope.exploracionFinalStage3[3] = "1";
                        }

                        break;

                    case 4:
                        if (question.userAnswer == "Guardando lo que le sobra") {
                            $scope.exploracionFinalStage3[4] = "0";
                        }
                        if (question.userAnswer == "Separando lo que va a ahorrar antes") {
                            $scope.exploracionFinalStage3[4] = "1";
                        }
                        if (question.userAnswer == "No gastando") {
                            $scope.exploracionFinalStage3[4] = "2";
                        }

                        break;
                }
            }

            //################################################## UTILITY FUNCTIONS #########################################

            function cleanText(userAnswer) {

                var result = userAnswer.replace("\r", "");
                result = userAnswer.replace("<br>", "");
                result = userAnswer.replace("<p>", "");
                result = userAnswer.replace("</p>", "");
                result = userAnswer.replace("\n", "");
                result = userAnswer.replace("\r", "");

                return result;
            }

            function showWarningAndGoToTop() {
                $scope.showWarning = true;
                $scope.$emit('scrollTop');
            }


            $scope.answerIndex = 1;

            $scope.addToAnswerIndex = function (delta, maxPages) {
                $scope.answerIndex = parseInt($('span#index').text());

                if ($scope.answerIndex > maxPages) {
                    $scope.answerIndex = 1;
                }

                if ($scope.answerIndex < 1) {
                    $scope.answerIndex = maxPages;
                }
            };

            function addHeightConsulta(lista, elementQty) {
                $scope.finalHeight = angular.element(lista).height() + (250 * (elementQty));
                angular.element("div.owl-wrapper-outer").css('height', $scope.finalHeight);
            }

            function addHeight(lista) {
                var listaHeight = angular.element(lista).height();
                angular.element("div.owl-wrapper-outer").css('height', listaHeight + 177);
            }

            function addHeightForOther() {
                var containerHeight = angular.element('div.owl-wrapper-outer').height();
                angular.element("div.owl-wrapper-outer").css('height', containerHeight + 100);
            }

            function reduceHeightForOther() {
                $scope.finalHeight = angular.element('.owl-wrapper-outer').height() - 100;
                angular.element("div.owl-wrapper-outer").css('height', $scope.finalHeight);
            }

            function removeHeight(lista) {
                var listaHeight = angular.element(lista).height();
                angular.element("div.owl-wrapper-outer").css('height', listaHeight - 127);
            }

            $scope.addAbility = function () {
                addHeight("#listaDinamica");
                $scope.AnswersResult.answers[4].push('');
            };

            $scope.deleteAbility = function (index) {
                removeHeight("#listaDinamica");
                $scope.AnswersResult.answers[4].splice(index, 1);
            };

            $scope.addSueno = function (pos) {
                var listaId = pos + 1;
                addHeight("#listaDinamica" + listaId);
                $scope.misSuenosAnswers[pos].push("");
            };

            $scope.deleteSueno = function (index, pos) {
                var listaId = pos + 1;
                removeHeight("#listaDinamica" + listaId);
                $scope.misSuenosAnswers[pos].splice(index, 1);
            };

            $scope.addIdea = function (pos) {
                var listaId = pos + 1;
                addHeight("#listaDinamica" + listaId);
                $scope.misIdeas[pos].push("");
            };

            $scope.deleteIdea = function (index, pos) {
                var listaId = pos + 1;
                removeHeight("#listaDinamica" + listaId);
                $scope.misIdeas[pos].splice(index, 1);
            };

            $scope.addPerson = function () {
                addHeight("#listaDinamica4");
                $scope.AnswersResult.answers[2].push("");
            };

            $scope.deletePerson = function (index) {
                removeHeight("#listaDinamica4");
                $scope.AnswersResult.answers[2].splice(index, 1);
            };

            $scope.addFuturo = function (pos) {
                var listaId = pos + 1;
                addHeight("#listaDinamica" + listaId);
                $scope.miFuturo[pos].push("");
            };

            $scope.deleteFuturo = function (index, pos) {
                var listaId = pos + 1;
                removeHeight("#listaDinamica" + listaId);
                $scope.miFuturo[pos].splice(index, 1);
            };

            $scope.hideWarning = function () {
                $scope.showWarning = false;
            };

            $scope.navigateToPage = function (pageNumber) {
                $scope.currentPage = pageNumber;
            };

            $scope.cancel = function () {
                var userCurrentStage = localStorage.getItem("userCurrentStage");
                //$location.path('/ZonaDeVuelo/Dashboard/' + userCurrentStage + '/' + $scope.currentChallenge);
                console.log(destinationPath);
                $location.path(destinationPath);
            };


        }

    ]).controller('OpeningStageController', function ($scope, $modalInstance) {

        $scope.cancel = function () {
            $scope.$emit('ShowPreloader');
            $modalInstance.dismiss('cancel');
        };

    }).controller('videoCollapsiblePanelController', function ($scope) {
        $scope.isCollapsed = false;
    });

