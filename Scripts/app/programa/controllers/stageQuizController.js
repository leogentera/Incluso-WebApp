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
            //Turn on Preloader
            $scope.$emit('ShowPreloader'); //show preloader
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
            $scope.currentUser = JSON.parse(localStorage.getItem("CurrentUser"));
            $scope.questionTypeCode = [];
            $scope.questionText = [];
            $scope.answers = [];
            $scope.OtroAnswers = [];
            $scope.numOfMultichoiceQuestions = 0;
            $scope.position = {};
            $scope.tmpPath = "";
            var nonEditableQuizzes = ["1001", "1009", "2001", "2023", "3101", "3601"];
            var quizHasOther = ["1001", "1005", "1006", "2001", "2023", "3101", "3601"];
            var startingTime;
            var endingTime;
            $scope.questionNumOfChoices = [];
            $scope.placeholder = [];
            $scope.maxPages = 0;
            $scope.modelIsLoaded = false;

            $scope.userprofile = {};
            $scope.userprofile.talents = [];
            $scope.userprofile.values = [];
            $scope.userprofile.habilities = [];
            $scope.userprofile.favoriteSports = [];
            $scope.userprofile.artisticActivities = [];
            $scope.userprofile.hobbies = [];
            var userTalents = [];
            var userValues = [];
            var userHabilities = [];
            var userFavoriteSports = [];
            var userArtisticActivities = [];
            var userHobbies = [];
            var talents = [];
            var values = [];
            var habilities = [];
            var favoriteSports = [];
            var artisticActivities = [];
            var hobbies = [];

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
            }, 
            {
                "questionid": 17,
                "answers": ['']
            }, 
            {
                "questionid": 18,
                "answers": ['']
            }];

            $scope.misGustosAnswers = [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]];
            $scope.misGustosOtroAnswers = [{
                "questionid": 43,
                "answers": ['']
            }, 
            {
                "questionid": 44,
                "answers": ['']
            }, 
            {
                "questionid": 45,
                "answers": ['']
            }];

            $scope.misSuenosAnswers = [[], [], []];
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
            $scope.activity_identifier = parseInt($routeParams.activityIdentifier);  //Gets the coursemoduleid from 'activity' object

            if (nonEditableQuizzes.indexOf($scope.activity_identifier) == -1) {//This Quiz is editable
                $scope.quizIsEditable = true;
            } else {
                $scope.quizIsEditable = false;
            }

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
                startingTime = moment().format('YYYY:MM:DD HH:mm:ss');

                $scope.activity_identifier = $location.path().split("/")[$location.path().split("/").length - 1];
                console.log("Activity identifier: " + $scope.activity_identifier);
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
                    console.log("activityname = " + $scope.activityname);
                    console.log("Activity status = " + $scope.activity_status);

                    $scope.userprofile = JSON.parse(localStorage.getItem("profile/" + localStorage.getItem("userId")));
                    $scope.currentUser = JSON.parse(localStorage.getItem("CurrentUser"));
                    //console.log("User profile = " + $scope.userprofile);
                    var activityFinished = false;

                    console.log("Activity status = " + $scope.activity_status);

                    $scope.activity = parentActivity;
                    $scope.parentActivity = parentActivity;
                    $scope.childActivity = childActivity;

                    console.log("Starting... " + parentActivity.activityname);

                    if ($scope.activity_status != 0) {//If the activity is currently finished...
                        activityFinished = true;
                        console.log("The activity status is FINISHED");

                        if (nonEditableQuizzes.indexOf($scope.activity_identifier) > -1) {// If the Quiz is non editable, then...
                            $scope.setReadOnly = true; //The Quiz can not be edited
                        }
                        
                        console.log("Coursemoduleid de la actividad = " + $scope.coursemoduleid);
                        var localAnswers;
                        var activityObject;

                        if (childActivity) {
                            localAnswers = JSON.parse(_getItem("answersQuiz/" + childActivity.coursemoduleid));
                            activityObject = JSON.parse(_getItem("activityObject/" + childActivity.coursemoduleid));
                        } else {
                            localAnswers = JSON.parse(_getItem("answersQuiz/" + parentActivity.coursemoduleid));
                            activityObject = JSON.parse(_getItem("activityObject/" + parentActivity.coursemoduleid));
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

                        } else {//Angular-bind the answers in the respective HTML template

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


            //
            function loadModelVariables(activityObject) {

                $scope.modelIsLoaded = true;

                //The activityObject is an object the same type we get eith the following GET request:
                //http://incluso.definityfirst.com/RestfulAPI/public/activity/150?userid=656
                var theCourseModuleId;
                if ($scope.childActivity) {
                    theCourseModuleId = $scope.childActivity.coursemoduleid;
                } else {
                    theCourseModuleId = $scope.parentActivity.coursemoduleid;
                }

                $scope.activityObject = activityObject;
                _setLocalStorageJsonItem("activityObject/" + theCourseModuleId, activityObject);

                if (activityObject != null) {

                    var question;
                    var i, index;
                    //var numQuestions = 0;
                    $scope.numOfOthers = 0;
                    var localOtrosAnswers = null;
                    $scope.placeholder = [];
                    $scope.maxPages = activityObject.questions.length;

                    //Count the number of "Other" options in current Quiz.
                    for (index = 0; index < activityObject.questions.length; index++) {

                        question = activityObject.questions[index];
                        var questionNumOfChoices = question.answers.length;
                        var hasOther = false;

                        if (questionNumOfChoices > 0) {
                            hasOther = question.answers[questionNumOfChoices - 1].answer == "Otro";
                        }

                        $scope.placeholder[index] = question.tag;  //Set the values for the placeholder strings within UI textareas.
                        var questionType = question.questionType || question.questiontype;   //Contains the type of question.

                        if (questionType == "multichoice" && questionNumOfChoices > 2 && hasOther) {
                            $scope.numOfOthers++;
                        }
                    }

                    //Load the arrays for 'Mis Cualidades' and 'Mis Gustos'.
                    if ($scope.activity_identifier == "1005") {

                        //Load array for Talents
                        question = activityObject.questions[0];  //First question
                        var questionNumOfChoices = question.answers.length;  //Number of choices
                        for (i = 0; i < questionNumOfChoices; i++) {
                            answerLabel = question.answers[i].answer;
                            talents.push(answerLabel);
                        }

                        //Load array  for Values
                        question = activityObject.questions[1];  //First question
                        var questionNumOfChoices = question.answers.length;  //Number of choices
                        for (i = 0; i < questionNumOfChoices; i++) {
                            answerLabel = question.answers[i].answer;
                            values.push(answerLabel);
                        }

                        //Load array for Habilities
                        question = activityObject.questions[2];  //First question
                        var questionNumOfChoices = question.answers.length;  //Number of choices
                        for (i = 0; i < questionNumOfChoices; i++) {
                            answerLabel = question.answers[i].answer;
                            habilities.push(answerLabel);
                        }

                        console.log("Talents to Choose: " + talents);
                        console.log("Values to Choose: " + values);
                        console.log("Habilities to Choose: " + habilities);
                    }

                    if ($scope.activity_identifier == "1006") {

                        //Load array for favoriteSports
                        question = activityObject.questions[0];  //First question
                        var questionNumOfChoices = question.answers.length;  //Number of choices
                        for (i = 0; i < questionNumOfChoices; i++) {
                            answerLabel = question.answers[i].answer;
                            favoriteSports.push(answerLabel);
                        }

                        //Load array  for artisticActivities
                        question = activityObject.questions[1];  //First question
                        var questionNumOfChoices = question.answers.length;  //Number of choices
                        for (i = 0; i < questionNumOfChoices; i++) {
                            answerLabel = question.answers[i].answer;
                            artisticActivities.push(answerLabel);
                        }

                        //Load array for Hobbies
                        question = activityObject.questions[2];  //First question
                        var questionNumOfChoices = question.answers.length;  //Number of choices
                        for (i = 0; i < questionNumOfChoices; i++) {
                            answerLabel = question.answers[i].answer;
                            hobbies.push(answerLabel);
                        }

                        console.log(favoriteSports);
                        console.log(artisticActivities);
                        console.log(hobbies);
                    }


                    if ($scope.numOfOthers > 0) {//If the current Quiz has questions including the 'Other' option, then get them from LS
                        if ($scope.childActivity) {
                            localOtrosAnswers = JSON.parse(_getItem("otherAnswQuiz/" + $scope.childActivity.coursemoduleid));
                        } else {
                            localOtrosAnswers = JSON.parse(_getItem("otherAnswQuiz/" + $scope.parentActivity.coursemoduleid));
                        }
                    }                    

                    $scope.OtroAnswers = localOtrosAnswers;

                    if ($scope.OtroAnswers == null) {
                        $scope.OtroAnswers = [];
                    }

                    //console.log("Número de preguntas con 'Otro' = " + $scope.numOfOthers);
                    //console.log("OtroAnswers = " + JSON.stringify($scope.OtroAnswers));

                    for (var index = 0; index < activityObject.questions.length; index++) {


            function updateProfile() {

                } else {
                    $scope.warningMessage = "Las respuestas del quiz no se pueden mostrar en este momento";
                    $scope.showWarning = true;
                }
            }


            function errorCallback() {
                $scope.$emit('HidePreloader');
            }


            //#######################################  SECTION FOR DATA-BINDING FUNCTIONS ##################################
            $scope.updateOtherField = function (index, otherIndex, checkLabel) {

                var indexChoice;
                var capacity;
                var multichoiceIndex = $scope.position[index];
                console.log("answers: # " + $scope.answers[index]);

                // The checkbox for 'Other' is clicked.
                if ($scope.answers[index][otherIndex] && $scope.questionNumOfChoices[index] - 1 == otherIndex) {
                    console.log("The 'Other' checkbox is ON");
                    //Add room for the TextArea
                    addHeight($("multichoice" + index)); //should be addHeight($("multichoice" + multichoiceIndex));
                }

                if ($scope.answers[index][otherIndex] == 0 && $scope.questionNumOfChoices[index] - 1 == otherIndex) {
                    console.log("The 'Other' checkbox is OFF");
                    $scope.OtroAnswers[multichoiceIndex].answers[0] = "";
                    removeHeight($("multichoice" + index));
                }

            };


            function renderQuestionsAndAnswers(questionIndex, question) {
                var userAnswers = '';
                var otherObjectItem = {};

                var questionNumOfChoices = question.answers.length;
                $scope.questionNumOfChoices[questionIndex] = questionNumOfChoices;

                var hasOther = false;

                if (questionNumOfChoices > 0) {
                    hasOther = question.answers[questionNumOfChoices - 1].answer == "Otro";
                }

                var questionCode = "";

                var questionText = question.question; //Contains the text for question.
                var questionType = question.questionType || question.questiontype;   //Contains the type of question.

                if (questionType == "shortanswer") {
                    questionCode = "shortanswer";
                }

                if (questionType == "essay") {
                    questionCode = "essay";
                }

                if (questionType == "multichoice" && questionNumOfChoices == 2 || questionType == "truefalse") {
                    questionCode = "binary";
                }

                if (questionType == "multichoice" && questionNumOfChoices > 2 && hasOther) {
                    questionCode = "multichoice";
                    $scope.numOfMultichoiceQuestions++;
                    $scope.position[questionIndex] = $scope.numOfMultichoiceQuestions - 1;

                    if ($scope.OtroAnswers.length < $scope.numOfOthers) {//continue adding items to the array

                        //Add {questionid: ##, answers: [""]} object for the multichoice question
                        otherObjectItem.questionid = question.id;
                        otherObjectItem.answers = [""];
                        $scope.OtroAnswers.push(otherObjectItem);
                    }
                }

                if (questionType == "multichoice" && questionNumOfChoices > 2 && !hasOther) {
                    questionCode = "simplechoice";
                }

                //console.log("questionTypeCode = " + questionCode);
                $scope.questionTypeCode.push(questionCode);
                $scope.questionText.push(questionText);

                switch (questionCode) {

                    case "binary":

                        if (question.answers[0].answer == question.userAnswer) {
                            //The user answered the first option
                            $scope.answers[questionIndex] = "0";
                        }

                        if (question.answers[1].answer == question.userAnswer) {
                            //The user answered the second option
                            $scope.answers[questionIndex] = "1";
                        }

                        break;

                    case "multichoice":

                        $scope.answers[questionIndex] = [];
                        var index;
                        if (question.userAnswer !== null && question.userAnswer.length > 0) {
                            userAnswers = question.userAnswer.split(";");
                            for (var indexUserAnswers = 0; indexUserAnswers < userAnswers.length; indexUserAnswers++) {
                                var userAnswer = cleanText(userAnswers[indexUserAnswers]).trim();
                                for (index = 0; index < question.answers.length; index++) {
                                    var questionOption = cleanText(question.answers[index].answer).trim();

                                    if (questionOption == userAnswer) {//For checked options...
                                        //console.log("***  The user selected this: " + userAnswer);
                                        $scope.answers[questionIndex][index] = 1;

                                        if (userAnswer == "Otro") {//The user checked the "Otros" option, among others...

                                            //console.log("The string in the 'Otro' field: " + question.other);
                                            $scope.OtroAnswers[$scope.position[questionIndex]].answers[0] = question.other;
                                            _setLocalStorageJsonItem("otherAnswQuiz/" + $scope.activity.coursemoduleid, $scope.OtroAnswers);
                                        }
                                    }
                                }
                            }

                            for (index = 0; index < question.answers.length; index++) {
                                if ($scope.answers[questionIndex][index] !== 1) {
                                    $scope.answers[questionIndex][index] = 0;
                                }
                            }

                            //console.log("$scope.OtroAnswers = " + JSON.stringify($scope.OtroAnswers));
                            //console.log("Position = " + JSON.stringify($scope.position));
                            //console.log("Index, Position = " + questionIndex + " / " + $scope.position[questionIndex]);

                        }

                        break;

                    case "shortanswer":
                        $scope.answers[questionIndex] = [];
                        if (question.userAnswer != null) {
                            userAnswers = question.userAnswer.split('\n');

                            for (var index = 0; index < userAnswers.length; index++) {
                                var myAnswer = userAnswers[index];
                                $scope.answers[questionIndex].push(myAnswer);
                            }
                        }

                        break;

                    case "simplechoice":
                        userAnswer = question.userAnswer.replace("\n", "");

                        for (var i = 0; i < questionNumOfChoices; i++) {
                            if (question.answers[i].answer == question.userAnswer) {
                                $scope.answers[questionIndex] = i;
                            }
                        }

                        break;

                    case "essay":
                        $scope.answers[questionIndex] = [];
                        if (question.userAnswer != null) {
                            userAnswers = question.userAnswer.split(';');
                            for (var index = 0; index < userAnswers.length; index++) {
                                var myAnswer = userAnswers[index];
                                $scope.answers[questionIndex].push(myAnswer);
                            }
                        }

                        break;
                    default:
                        break;
                }

            }


            //****************************** CODE CALLED WHEN USER FINISHES ACTIVITY ************************************
            $scope.finishActivity = function () {
                //Tasks to do when the user presses the "Terminar" button.
                console.log("$scope.OtroAnswers = " + JSON.stringify($scope.OtroAnswers));
                $scope.$emit("ShowPreloader");

                //This is to avoid killing the preloader up starting.
                $timeout(function () {

                    if ($scope.childActivity) {
                        $scope.parentActivity.status = 1;
                        $scope.childActivity.status = 1;
                    } else {
                        $scope.parentActivity.status = 1;
                    }

                    $scope.isDisabled = true;

                    //Update Activity Log Service
                    if ($scope.activity_status == 0) {
                        $scope.activity_status = 1;

                        updateUserStars($scope.parentActivity.activity_identifier);

                        /*    
                        if ($scope.childActivity) {
                            console.log("Child Activity; Points = " + $scope.activityPoints);
                            updateUserStars($scope.parentActivity.activity_identifier, null, $scope.activityPoints);
                        } else {
                            updateUserStars($scope.parentActivity.activity_identifier);
                        }
                        */
                    }

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
                    console.log("Your answers: " + $scope.answers);
                    console.log("Your other :" + JSON.stringify($scope.OtroAnswers));

                    $scope.AnswersResult.answers = $scope.answers;

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
                        "others": $scope.OtroAnswers
                    };

                    activityModel.answersResult.dateStart = activityModel.startingTime;
                    activityModel.answersResult.dateEnd = activityModel.endingTime;
                    activityModel.answersResult.others = $scope.OtroAnswers;

                    if ($scope.childActivity) {
                        _setLocalStorageJsonItem("answersQuiz/" + $scope.childActivity.coursemoduleid, $scope.AnswersResult.answers);
                        _setLocalStorageJsonItem("UserTalents/" + $scope.childActivity.coursemoduleid, $scope.AnswersResult.answers);
                    } else {
                        _setLocalStorageJsonItem("answersQuiz/" + $scope.parentActivity.coursemoduleid, $scope.AnswersResult.answers);
                        _setLocalStorageJsonItem("UserTalents/" + $scope.parentActivity.coursemoduleid, $scope.AnswersResult.answers);
                    }

                    //If...the activity quiz has a checkbox for the "Other" answer, then save it to Local Storage
                    if ($scope.numOfOthers > 0) {
                        console.log(JSON.stringify($scope.OtroAnswers));

                        if ($scope.childActivity) {
                            _setLocalStorageJsonItem("otherAnswQuiz/" + $scope.childActivity.coursemoduleid, $scope.OtroAnswers);
                        } else {
                            _setLocalStorageJsonItem("otherAnswQuiz/" + $scope.parentActivity.coursemoduleid, $scope.OtroAnswers);
                        }
                    }


                    console.log("activityModel.answersResult = " + JSON.stringify(activityModel.answersResult));
                    console.log("activityModel.others = " + JSON.stringify(activityModel.others));

                    if ($scope.childActivity) {
                        //Close Quiz activity.
                        activityModel.activityType = "Quiz";
                        activityModel.coursemoduleid = $scope.childActivity.coursemoduleid;   
                        
                        _endActivity(activityModel, function () {
                            updateProfile();
                        }, destinationPath);

                        //Close Assign activity.
                        activityModel.activityType = "Assign";
                        activityModel.coursemoduleid = $scope.parentActivity.coursemoduleid;

                        _endActivity(activityModel, function () {
                            updateProfile();
                        }, destinationPath);

                    } else {
                        activityModel.coursemoduleid = $scope.parentActivity.coursemoduleid;
                        activityModel.activityType = "Quiz";

                        _endActivity(activityModel, function () {
                            updateProfile();
                        }, destinationPath);
                    }


                }, 1);

            };


            function updateProfile() {

                var i;
                $scope.userprofile.talents = [];
                $scope.userprofile.values = [];
                $scope.userprofile.habilities = [];
                $scope.userprofile.favoriteSports = [];
                $scope.userprofile.artisticActivities = [];
                $scope.userprofile.hobbies = [];

                if ($scope.activity_identifier == "1005") {//Mis Cualidades - Etapa 1
                    //Update Talents
                    for (i = 0; i < $scope.answers[0].length - 1; i++) {
                        if ($scope.answers[0][i]) {// The label is checked
                            $scope.userprofile.talents.push(talents[i]);
                        }
                    }

                    //Update Values
                    for (i = 0; i < $scope.answers[1].length - 1; i++) {
                        if ($scope.answers[1][i]) {// The label is checked
                            $scope.userprofile.values.push(values[i]);
                        }
                    }

                    //Update Habilities
                    for (i = 0; i < $scope.answers[2].length - 1; i++) {
                        if ($scope.answers[2][i]) {// The label is checked
                            $scope.userprofile.habilities.push(habilities[i]);
                        }
                    }

                    if ($scope.OtroAnswers[0].answers[0] != '') {
                        $scope.userprofile.talents.push($scope.OtroAnswers[0].answers[0]);
                    }

                    if ($scope.OtroAnswers[1].answers[0] != '') {
                        $scope.userprofile.values.push($scope.OtroAnswers[1].answers[0]);
                    }

                    if ($scope.OtroAnswers[2].answers[0] != '') {
                        $scope.userprofile.habilities.push($scope.OtroAnswers[2].answers[0]);
                    }
                }

                if ($scope.activity_identifier == "1006") {//Mis Gustos - Etapa 1
                    //Update favoriteSports
                    for (i = 0; i < $scope.answers[0].length - 1; i++) {
                        if ($scope.answers[0][i]) {// The label is checked
                            $scope.userprofile.favoriteSports.push(favoriteSports[i]);
                        }
                    }

                    //Update artisticActivities
                    for (i = 0; i < $scope.answers[1].length - 1; i++) {
                        if ($scope.answers[1][i]) {// The label is checked
                            $scope.userprofile.artisticActivities.push(artisticActivities[i]);
                        }
                    }

                    //Update Hobbies
                    for (i = 0; i < $scope.answers[2].length - 1; i++) {
                        if ($scope.answers[2][i]) {// The label is checked
                            $scope.userprofile.hobbies.push(hobbies[i]);
                        }
                    }

                    if ($scope.OtroAnswers[0].answers[0] != '') {
                        $scope.userprofile.favoriteSports.push($scope.OtroAnswers[0].answers[0]);
                    }

                    if ($scope.OtroAnswers[1].answers[0] != '') {
                        $scope.userprofile.artisticActivities.push($scope.OtroAnswers[1].answers[0]);
                    }

                    if ($scope.OtroAnswers[2].answers[0] != '') {
                        $scope.userprofile.hobbies.push($scope.OtroAnswers[2].answers[0]);
                    }
                }

                if ($scope.activity_identifier == "1005") {
                    console.log("Talents to Save: " + $scope.userprofile.talents);
                    console.log("Values to Save: " + $scope.userprofile.values);
                    console.log("Habilities to Save: " + $scope.userprofile.habilities);
                }

                if ($scope.activity_identifier == "1006") {
                    console.log("favoriteSports to Save: " + $scope.userprofile.favoriteSports);
                    console.log("artisticActivities to Save: " + $scope.userprofile.artisticActivities);
                    console.log("Hobbies to Save: " + $scope.userprofile.hobbies);
                }

                if ($scope.activity_identifier == "1005" || $scope.activity_identifier == "1006") {
                    $scope.userId = moodleFactory.Services.GetCacheObject("userId");

                    moodleFactory.Services.PutAsyncProfile($scope.userId, $scope.userprofile,

                        function (responseData) {
                            console.log('Update profile successful...');
                            $scope.numOfMultichoiceQuestions = 0;
                            $scope.numOfOthers = 0;

                            console.log("Redirecting to dashboard; destinationPath = " + destinationPath);
                            $location.path(destinationPath);
                        },
                        function (responseData) {
                            console.log('Update profile fail...');
                        }
                    );

                } else {
                    console.log('This activity has no profile...');
                    $scope.numOfMultichoiceQuestions = 0;
                    $scope.numOfOthers = 0;

                    console.log("Redirecting to dashboard; destinationPath = " + destinationPath);
                    $location.path(destinationPath);
                }


            }


            // ##################################### VALIDATING USER ANSWERS ##################################################
            $scope.validateQuiz = function () {

                var question = "";
                var index;
                var numAnswered = 0;
                var numQuestions = $scope.activityObject.questions.length;

                for (index = 0; index < numQuestions; index++) {

                    switch ($scope.questionTypeCode[index]) {

                        case "binary":
                            if ($scope.answers[index] != null) {
                                //The user filled in the question.
                                numAnswered++;
                            }

                            break;

                        case "multichoice":
                            //Validation: the multichoice must have some 'true' value...
                            if (($scope.answers[index].indexOf(1) > -1)) {
                                //...and Other is 'true' and has a non empty string in the input
                                var userInput = $scope.OtroAnswers[$scope.position[index]].answers[0].replace(/\r?\n|\r/g, " ").trim();
                                if (($scope.answers[index][$scope.questionNumOfChoices[index] - 1] && userInput != '') || !$scope.answers[index][$scope.questionNumOfChoices[index] - 1]) {
                                    numAnswered++;
                                }
                            }

                            break;

                        case "shortanswer":
                            var b;

                            //Remove repeated entries and blanks in the question.
                            $scope.answers[index] = $scope.answers[index].filter(function (item, pos) {
                                return item.trim().length > 0 && $scope.answers[index].indexOf(item) == pos;
                            });

                            //Correction for the '\n' reserved character.
                            for (b = 0; b < $scope.answers[index].length; b++) {
                                $scope.answers[index][b] = $scope.answers[index][b].replace(/\r?\n|\r/g, " ").trim();
                            }

                            //Check is some of the questions has an invalid answer
                            if ($scope.answers[index].length > 0) {
                                numAnswered++;
                            }

                            break;

                        case "simplechoice":
                            if ($scope.answers[index] != null) {
                                //The user filled in the question.
                                numAnswered++;
                            }

                            break;

                        case "essay":
                            var b;

                            //Remove repeated entries and blanks in the question.
                            $scope.answers[index] = $scope.answers[index].filter(function (item, pos) {
                                return item.trim().length > 0 && $scope.answers[index].indexOf(item) == pos;
                            });

                            //Correction for the '\n' reserved character.
                            for (b = 0; b < $scope.answers[index].length; b++) {
                                $scope.answers[index][b] = $scope.answers[index][b].replace(/\r?\n|\r/g, " ").trim();
                            }

                            //Check is some of the questions has an invalid answer
                            if ($scope.answers[index].length > 0) {
                                numAnswered++;
                            }

                            break;

                        default:
                            break;
                    }
                }

                if (numAnswered == numQuestions) {
                    $scope.showWarning = false;

                    if ($scope.activityname == "Exploración final") {
                        setFinalEvaluation();
                    }

                    $scope.navigateToPage(2);
                    $scope.scrollToTop();

                } else {
                    $scope.warningMessage = "Asegurate de contestar todas las preguntas antes de guardar";
                    $scope.showWarning = true;
                    showWarningAndGoToTop();
                }

            };


            function setFinalEvaluation() {

                var i, j;
                $scope.questionIsCorrect = [];
                $scope.answerIsCorrect = [];
                $scope.chosenByUserAndWrong = [];
                $scope.correctIndex = [];
                var totalScore = 0;
                var attainedScore = 0;
                var questionObj;
                var answerObj;

                if ($scope.activityObject != null) {

                    for (i = 0; i < $scope.activityObject.questions.length; i++) {

                        questionObj = $scope.activityObject.questions[i]; //The n-th question
                        $scope.chosenByUserAndWrong[i] = [];
                        $scope.answerIsCorrect[i] = [];

                        for (j = 0; j < questionObj.answers.length; j++) {

                            if ($scope.questionTypeCode[i] == 'binary') {
                                //Add item for binary object to finalResult array
                                totalScore = totalScore + parseInt(questionObj.answers[j].fraction);

                                if (j === parseInt($scope.answers[i])) {// User choice; $scope.answers[i] =  0 or 1
                                    attainedScore = attainedScore + parseInt(questionObj.answers[j].fraction);

                                    if (parseInt(questionObj.answers[j].fraction) === 1) {//The user selected the right option.
                                        $scope.questionIsCorrect[i] = true;
                                        $scope.chosenByUserAndWrong[i][j] = false;

                                    } else {//The user selected the wrong option.
                                        $scope.questionIsCorrect[i] = false;
                                        $scope.chosenByUserAndWrong[i][j] = true;
                                    }
                                } else {
                                    $scope.chosenByUserAndWrong[i][j] = false;
                                }

                            }

                            if ($scope.questionTypeCode[i] == 'simplechoice') {
                                //Add item for simplechoice object to finalResult array
                                totalScore = totalScore + parseInt(questionObj.answers[j].fraction);

                                if (parseInt(questionObj.answers[j].fraction) > 0) {
                                    $scope.correctIndex[i] = j;
                                }

                                if (j === parseInt($scope.answers[i])) {//$scope.answers[i] = 0, 1, 2, ..., n
                                    attainedScore = attainedScore + parseInt(questionObj.answers[j].fraction);

                                    if (parseInt(questionObj.answers[j].fraction) === 1) {
                                        $scope.questionIsCorrect[i] = true;
                                        $scope.chosenByUserAndWrong[i][j] = false;

                                    } else {
                                        $scope.questionIsCorrect[i] = false;
                                        $scope.chosenByUserAndWrong[i][j] = true;
                                    }
                                } else {
                                    $scope.chosenByUserAndWrong[i][j] = false;
                                }
                            }

                            if ($scope.questionTypeCode[i] == 'multichoice') {
                                //Add item for multichoice object to finalResult array
                                totalScore = totalScore + parseInt(questionObj.answers[j].fraction);
                                $scope.questionIsCorrect[i] = true;
                                $scope.chosenByUserAndWrong[i][j] = false;

                                if (1 === parseInt($scope.answers[i][j])) {//The j-th checkbox was selected.
                                    attainedScore = attainedScore + parseInt(questionObj.answers[j].fraction);
                                }
                            }

                            if ($scope.questionTypeCode[i] == 'shortanswer') {
                                //Add item for multichoice object to finalResult array
                                $scope.questionIsCorrect[i] = true;
                                $scope.chosenByUserAndWrong[i][j] = false;
                                totalScore = totalScore + parseInt(questionObj.answers[j].fraction);
                                attainedScore = attainedScore + parseInt(questionObj.answers[j].fraction);
                            }

                        }
                    }

                    //console.log("$scope.questionIsCorrect = " + $scope.questionIsCorrect);
                    //console.log("$scope.chosenByUserAndWrong = " + $scope.chosenByUserAndWrong);
                    //console.log("$scope.answerIsCorrect = " + $scope.correctIndex);
                    $scope.score = attainedScore * 100 / totalScore;
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

            function addHeightConsulta(lista, elementQty) {//NO USADO
                $scope.finalHeight = angular.element(lista).height() + (250 * (elementQty));
                angular.element(".owl-wrapper-outer").css('height', $scope.finalHeight);
            }

            function addHeight(elem) {
                var elemHeight = angular.element(elem).height();
                var containerHeight = angular.element("div.owl-wrapper-outer").height();
                console.log(containerHeight);
                if (containerHeight < 627) {
                    angular.element(".owl-wrapper-outer").css('height', containerHeight + 100);
                    angular.element(elem).css('height', elemHeight + 100);
                }
            }

            function addHeightEssay(elem) {
                var elemHeight = angular.element(elem).height();
                var containerHeight = angular.element("div.owl-wrapper-outer").height();
                console.log(containerHeight);
                angular.element(".owl-wrapper-outer").css('height', containerHeight + 147);
                angular.element(elem).css('height', elemHeight + 147);
            }

            function addHeightForOther() {
                console.log("We are inside addHeightForOther");
                var containerHeight = angular.element('div.owl-wrapper-outer').height();
                angular.element("div.owl-wrapper-outer").css('height', containerHeight + 100);
            }

            function reduceHeightForOther() {
                $scope.finalHeight = angular.element('.owl-wrapper-outer').height() - 100;
                angular.element(".owl-wrapper-outer").css('height', $scope.finalHeight);
            }

            function removeHeight(elem) {
                var listaHeight = angular.element(elem).height();
                var containerHeight = angular.element('div.owl-wrapper-outer').height();
                //angular.element("div.owl-wrapper-outer").css('height', listaHeight - 127);
                angular.element("div.owl-wrapper-outer").css('height', containerHeight - 100);
            }

            function removeHeightEssay(elem) {
                var listaHeight = angular.element(elem).height();
                var containerHeight = angular.element('div.owl-wrapper-outer').height();
                //angular.element("div.owl-wrapper-outer").css('height', listaHeight - 127);
                angular.element("div.owl-wrapper-outer").css('height', containerHeight - 127);
            }


            //This function is activated from Template, with ESSAY type questions
            $scope.addAbility = function (elem, index) {
                addHeightEssay(elem);
                $scope.answers[index].push("");
            };

            //This function is activated from Template, with ESSAY type questions
            $scope.deleteAbility = function (elem, index, innerIndex) {
                removeHeightEssay(elem);
                $scope.answers[index].splice(innerIndex, 1);
            };

            $scope.addPerson = function (elem, index) {
                addHeight(elem);
                $scope.answers[index].push("");
            };

            $scope.deletePerson = function (elem, index, innerIndex) {
                removeHeight(elem);
                $scope.answers[index].splice(innerIndex, 1);
            };

            $scope.hideWarning = function () {
                $scope.showWarning = false;
            };

            $scope.navigateToPage = function (pageNumber) {
                $scope.currentPage = pageNumber;
            };

            $scope.cancel = function () {

                $scope.numOfMultichoiceQuestions = 0;
                $scope.numOfOthers = 0;

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
    }).
    directive("owlCarousel", function () {
        return {
            restrict: 'E',
            transclude: false,
            link: function ($scope) {
                $scope.initCarousel = function (element) {
                    // provide any default options you want
                    var currPage;
                    var prevPage;
                    var defaultOptions = {
                        navigation: false,
                        pagination: false,
                        goToFirstSpeed: 2000,
                        singleItem: true,
                        autoHeight: true,
                        mouseDrag: false,
                        touchDrag: false,
                        dots: false,
                        navRewind: true,
                        transitionStyle: "fade",
                        afterAction: function (el) {

                            //add class active
                            $scope.answerIndex = this.currentItem + 1;
                            prevPage = $("#index").html();
                            $("#index").html($scope.answerIndex);


                        }
                    };

                    var customOptions = $scope.$eval({});

                    // combine the two options objects
                    for (var key in customOptions) {
                        defaultOptions[key] = customOptions[key];
                    }

                    // init carousel
                    $(element).owlCarousel(defaultOptions);
                };
            }
        };
    })
    .directive('owlCarouselItem', [function () {
        return {
            restrict: 'A',
            transclude: false,
            link: function (scope, element) {
                // wait for the last item in the ng-repeat then call init
                if (scope.$last) {
                    scope.initCarousel(element.parent());
                }
            }
        };
    }]);


