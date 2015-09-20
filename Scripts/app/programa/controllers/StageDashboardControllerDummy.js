angular
    .module('incluso.stage.dashboardcontrollerDummy', [])
    .controller('stageDashboardControllerDummy', [
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
            $scope.$emit('HidePreloader'); //show preloader
            $scope.model = JSON.parse(localStorage.getItem("usercourse"));
            $scope.setToolbar($location.$$path,"");
            
            $rootScope.showFooter = true;
            $rootScope.showFooterRocks = false;
            $rootScope.linksFooter = true;
            $scope.scrollToTop();

            $scope.activitiesCompletedInCurrentStage = [];
            $scope.isCollapsed = false;
        $scope.idEtapa = 0; //hard coded
            $scope.idReto = $routeParams['challengue'];
            $scope.thisStage = $scope.model.stages[$scope.idEtapa];
            $scope.nombreEtapaActual = $scope.thisStage.sectionname;
        _setLocalStorageItem("userCurrentStage", 0);   // hard coded

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

               $(".back").click(function (ev) {                                                            
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
                 $(".next").click(function (ev) {                                        
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
                 
                 
                 
            $scope.openModal_CloseChallenge = function (size) {                
                var modalInstance = $modal.open({
                    animation: $scope.animationsEnabled,
                    templateUrl: 'ClosingChallengeModal.html',
                    controller: 'closingChallengeController',
                    size: size,
                    windowClass: 'closing-stage-modal user-help-modal'                    
                });
            };

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
            
            var stageCompleted = _isStageCompleted();
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
                                                                    
            $scope.robotMessages = [                      
                    {
                        title : "CUARTO DE RECURSOS",
                        message : "¡Has recuperado un elemento más para atravesar los asteroides! Estas listo para tomar tus decisiones   y tener  nuevas ideas que te impulsen a lograr lo que te propongas.",
                        read : "false",
                        challengeId : 155},
                    {
                        title : "TRANSFÓRMATE",
                        message : "¡Has recuperado un elemento más para atravesar los asteroides! Rompe con las ideas que te limitan y escucha a las que te impulsan para lograr tus sueños.",
                        read : "false",
                        challengeId : 157},
                    {
                        title : "TÚ ELIGES",
                        message : "¡Has recuperado un elemento más para atravesar los asteroides! Ahora ya conoces más sobre como tomar mejores decisiones.",
                        read : "false",
                        challengeId : 160},
                    {
                        title: "PROYECTA TU VIDA",
                        message : "¡Has recuperado un elemento más para atravesar los asteroides! La ruta para llegar a tus sueños esta trazada, ahora sólo depende de ti.",
                        read : "false",
                        challengeId : 81},
                    {
                        title: "CABINA DE SOPORTE",
                        message: "¡Has recuperado un elemento más para atravesar los asteroides! Ya tienes lo necesario para seguir la ruta que has trazado, piensa en positivo y toma mejores decisiones.",
                        read: "false",
                        challengeId : 167}
                        ];
             
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
