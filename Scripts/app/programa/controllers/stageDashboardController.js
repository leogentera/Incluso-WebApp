angular
    .module('incluso.stage.dashboardcontroller', [])
    .controller('stageDashboardController', [
       '$q',
        '$scope',
        '$location',
        '$routeParams',
        '$timeout',
        '$rootScope',
        '$http',
        '$modal',
        function ($q, $scope, $location, $routeParams, $timeout, $rootScope, $http, $modal) {            
            /* $routeParams.stageId */
            _timeout = $timeout;
            _httpFactory = $http;
            $scope.Math = window.Math;
            $scope.$emit('ShowPreloader'); //show preloader
            $scope.model = JSON.parse(localStorage.getItem("usercourse"));
            $scope.setToolbar($location.$$path,"");
            
            $rootScope.showFooter = true;
            $rootScope.showFooterRocks = false;
            $scope.scrollToTop();

            $scope.activitiesCompletedInCurrentStage = [];
            $scope.isCollapsed = false;
            $scope.idEtapa = $routeParams['stageId'] - 1; //We are in stage stageId, taken from URL
            $scope.idReto = $routeParams['challengue'];
            $scope.thisStage = $scope.model.stages[$scope.idEtapa];
            $scope.nombreEtapaActual = $scope.thisStage.sectionname;
            _setLocalStorageItem("userCurrentStage", $routeParams['stageId']);   
            
            setTimeout(function () {            
            var hits = 1;

                //Carrusel de retos
                var owl2 = $("#owl-demo2");

                owl2.owlCarousel({
                    navigation: false,
                    pagination: false,
                    //paginationSpeed: 1000,
                    goToFirstSpeed: 2000,
                    singleItem: true,
                    autoHeight: true,
                    touchDrag:false,
                    mouseDrag:false,
                    transitionStyle:"fade",
                    afterMove: callback1
                });

                //Carrusel de Actividades
                var owl = $("#owl-demo");

                owl.owlCarousel({
                    navigation: false,
                    pagination: false,
                    //paginationSpeed: 1000,
                    goToFirstSpeed: 2000,
                    singleItem: true,
                    autoHeight: true,
                    touchDrag:false,
                    mouseDrag:false,
                    transitionStyle:"fade",
                    afterMove: callback2
                });    

                this.currentItem = $scope.idReto;
                var currentItem;
                owl.trigger("owl.goTo", $scope.idReto);
                    $("span#index").text(($scope.idReto+1));  

                owl2.trigger("owl.goTo", $scope.idReto);
                    $("span#index").text(($scope.idReto+1));            

                function callback1(event) {
                    var item = this.currentItem;                    
                    currentItem = parseInt(this.owl.currentItem);
                    owl2.trigger("owl.goTo", item);
                    $("span#index").text((item+1));
                }

                function callback2(event) {
                    item = this.currentItem;                    
                    owl.trigger("owl.goTo", item);
                    $("span#index").text((item+1));
                }

               $("#prev").click(function (ev) {                                                            
                    if(currentItem){
                        owl.trigger('owl.goTo', currentItem - 1);
                        owl2.trigger('owl.goTo', currentItem - 1);
                    }
                    else{
                        owl.trigger('owl.prev');
                        owl2.trigger('owl.prev');
                    }
                    ev.preventDefault();
                });
                 $("#next").click(function (ev) {                                        
                    if(currentItem){
                        owl.trigger('owl.goTo', currentItem + 1);
                        owl2.trigger('owl.goTo', currentItem + 1);
                    }
                    else{
                        owl.trigger('owl.next');
                        owl2.trigger('owl.next');
                    }
                    ev.preventDefault();
                });

            }, 1000);         

            //Opens stage welcome message if first time visit
            $scope.openModal_StageFirstTime = function (size) {
                var modalInstance = $modal.open({
                    animation: false,//$scope.animationsEnabled,
                    templateUrl: 'OpeningStageModal.html',
                    controller: 'OpeningStageController',
                    size: size,
                    windowClass: 'user-help-modal dashboard-stage-intro'
                });
            };

            //$scope.openModal_StageFirstTime();
            
            
            $scope.openModal_CloseChallenge = function (size) {                
                var modalInstance = $modal.open({
                    animation: $scope.animationsEnabled,
                    templateUrl: 'ClosingChallengeModal.html',
                    controller: 'closingChallengeController',
                    size: size,
                    windowClass: 'closing-stage-modal user-help-modal'                    
                });
            };
            
            $scope.openModal_CloseStage = function (size) {                
                var modalInstance = $modal.open({
                    animation: $scope.animationsEnabled,
                    templateUrl: 'ClosingStageModal.html',
                    controller: 'closingStageController',
                    size: size,
                    windowClass: 'closing-stage-modal user-help-modal'                    
                });
            };
            

            //Updated stage first time flag in scope, local storage and server
            $scope.updateStageFirstTime = function(){
                //Update model
                $scope.thisStage.firsttime = 0;
                $scope.model.stages[$scope.idEtapa].firsttime = 0;
                //Update local storage
                var userCourse = moodleFactory.Services.GetCacheJson("usercourse");
                if(userCourse!={}) {
                    userCourse.stages[$scope.idEtapa].firsttime = 0;
                    _setLocalStorageJsonItem("usercourse",userCourse);
                }
                //Update back-end
                var dataModel = {
                    stages: [
                        {
                            firstTime:0,
                            section:$scope.thisStage.section
                        }
                    ]
                };

                moodleFactory.Services.PutAsyncFirstTimeInfo(_getItem("userId"), dataModel,function(){},function(){});

            };

            if($scope.thisStage.firsttime){
                $scope.openModal_StageFirstTime();
                $scope.updateStageFirstTime();
            }


           //calculate user's stage progress
            var stageProgressBuffer = 0;
            var stageTotalActivities = 0; //Attainment of user in the current Stage
            var stageChallengesCount = $scope.thisStage.challenges.length;

            var i, j,k;
            for (i = 0; i < stageChallengesCount; i++) {
                var challenge = $scope.thisStage.challenges[i];
                var challengeActivitiesCount = challenge.activities.length;
                for (j = 0; j < challengeActivitiesCount; j++) {
                    var activity = challenge.activities[j];
                    stageProgressBuffer += activity.status;
                    stageTotalActivities++;
                    /*if(activity.activities) {
                        var subActivitiesCount = activity.activities.length;
                        for (k = 0; k < subActivitiesCount; k++) {
                            var subActivity = activity.activities[k];
                            stageProgressBuffer += subActivity.status;
                            stageTotalActivities++;
                        }
                    }*/
                }
            }
            
            $scope.stageProgress = Math.ceil((stageProgressBuffer  / stageTotalActivities)*100);            
            var challengeCompletedId = _isChallengeCompleted();            
            _coachNotification();
                                    
            //Exclude challenges initial and final from showing modal robot
            var challengeExploracionInicial = 140;
            var challengeExploracionFinal = 152;
            if(challengeCompletedId && (challengeCompletedId != challengeExploracionInicial) && (challengeCompletedId != challengeExploracionFinal)){            
                _setLocalStorageItem("challengeMessageId",challengeCompletedId);
                $scope.openModal_CloseChallenge();
            }else{
                _setLocalStorageItem("challengeMessageId",0);
            }
                        
                        
            var robotEndStageShown = localStorage.getItem('robotEndStorageShown');            
            var stageCompleted = _isStageCompleted();
            
            if (stageCompleted && !robotEndStageShown) {
                $scope.openModal_CloseStage();
            }
            
            //_setLocalStorageItem("challengeMessageId",113);
            //$scope.openModal_CloseChallenge();
            
            //Load challenges images
            $scope.retosIconos = {
                "Exploración inicial": "assets/images/challenges/stage-1/img-evaluacion-inicial.svg",
                "Cuarto de recursos": "assets/images/challenges/stage-1/img-cuarto-recursos.svg",
                "Conócete": "assets/images/challenges/stage-1/img-conocete.svg",
                "Mis sueños": "assets/images/challenges/stage-1/img-mis-suenos.svg",
                "Cabina de soporte": "assets/images/challenges/stage-1/img-cabina-soporte.svg",
                "Exploración final": "assets/images/challenges/stage-1/img-evaluacion-final.svg"
            };

            $scope.challengeDescription= {
                "Exploración inicial": "Explora más sobre ti y tus sueños e identifica qué has estado haciendo para hacerlos realidad",
                "Cuarto de recursos": "Descubre más y métele velocidad a tus sueños",
                "Conócete": "Juega y descubre tus inteligencias",
                "Mis sueños": "Cada sueño en su lugar",
                "Cabina de soporte": "Contacta a tu coach",
                "Exploración final": "Explora qué tanto descubriste en la Zona de Vuelo"
            };

            // this is the propper way, but since owl isn't part of angular framework, it is rendered afterwards angular finishes
            $scope.$on('$viewContentLoaded', function() {
                //$scope.$emit('HidePreloader'); //hide preloader
            });
            // this is the dirty way to hide owl's carousel rendering process while user waits
            $timeout(function() {
                $scope.$emit('HidePreloader'); //hide preloader
            }, 2000);

            $scope.playVideo = function (videoAddress, videoName) {
                playVideo(videoAddress, videoName);
            };

            $scope.startActivity = function (activity, index, parentIndex) {                
                if(!$scope.canStartActivity(activity.coursemoduleid)) return false;
                var url = _.filter(_activityRoutes, function(x) { return x.id == activity.coursemoduleid })[0].url;

                if (url) {
                    $location.path(url);
                }
            };

            $scope.getCurrentStatusOfActivity = function (coursemoduleid) {
                var activity = _getActivityByCourseModuleId(coursemoduleid);
                return activity.status;
            };
            
        }]).controller('closingChallengeController', function ($scope, $modalInstance) {
            $scope.cancel = function () {
                $modalInstance.dismiss('cancel');
            };
                        
            var challengeMessageId = JSON.parse(localStorage.getItem("challengeMessageId"));
            
            $scope.robotMessages = [{
                        title : "CUARTO DE RECURSOS",
                        message : "¡Has recuperado con éxito una de las piezas para reparar la nave! Ahora sabes que los sueños son el motor que te impulsa a avanzar y llegar cada vez más lejos.",
                        read : "false",
                        challengeId: 113},
                    {
                        title : "CONÓCETE",
                        message : "¡Has recuperado con éxito una de las piezas para reparar la nave! Haz de tus habilidades una fortaleza y pónlas en acción cada día.",
                        read : "false",
                        challengeId: 114},
                    {
                        title : "MIS SUEÑOS",
                        message : "¡Has recuperado con éxito una de las piezas para reparar la nave! Lograste descubrir cuáles son tus más grandes sueños, ahora sabes hacia dónde te diriges.",
                        read : "false",
                        challengeId: 115},
                    {
                        title : "CABINA DE SOPORTE",
                        message : "¡Has recuperado con éxito una de las piezas para reparar la nave!  Lograste unir los puntos clave para definir un sueño: pasión, habilidades y talentos. ¡Sólo falta ponerlos en acción para lograr lo que te propongas!",
                        read : "false",
                        challengeId: 116}];
             
             $scope.actualMessage = _.findWhere($scope.robotMessages,{read: "false", challengeId: challengeMessageId});             
             
            }).controller('closingStageController', function ($scope, $modalInstance,$location) {
                    $scope.cancel = function () {
                        $modalInstance.dismiss('cancel');
                    };
                    
                    $scope.robotMessages = {
                        title: "Cierre Zona de Vuelo",
                        message: "¡Muy bien! Recuperaste todas las piezas para reparar la nave y continuar el viaje. Recuerda, los sueños son el motor principal de tu nave ¡Ahora tu aventura ya tiene un rumbo!"
                    };
                    
                    $scope.navigateToDashboard = function () {                        
                        $modalInstance.dismiss('cancel');
                        $location.path('/ProgramaDashboard');
                    };
                    _setLocalStorageItem('robotEndStorageShown',true);
                });
