angular
    .module('contactmaster', [
        'ngRoute',
        'ngSanitize',
        'ngResource',
        'ui.bootstrap',
        'ui.bootstrap.tpls',
        'inlcuso.shared.mainNavigation',
        'incluso.shared.offlineController',
        'incluso.shared.timeOut',
        'incluso.shared.pendingQueueController',
        'incluso.shared.errorController',
        'incluso.home',
        // One module per controller. If we wanted to use one module for several controllers we would need to load dependencies of
        // one controller for all controllers in the module, and we would also need a variable to keep track of the modules:
        // http://zinkpulse.com/organizing-modules-in-angularjs/ and http://cliffmeyers.com/blog/2013/4/21/code-organization-angularjs-javascript
		'incluso.public.login',
        'incluso.public.recoverPassword',
        //'incluso.public.recoverPasswordEmail',
        'incluso.public.register',
        'incluso.programa.tutorial',
        'incluso.programa.acercaPrograma',
        'incluso.programa.postPhotoGalleryDetailController',
        'incluso.juegos.avatar',
        'incluso.programa.dashboard',
        // 'incluso.programa.dashboard.etapa',
        'incluso.programa.profile',
        'incluso.program.systemRequirements',
        'incluso.programa.notificationcontroller',
        'incluso.programa.notificationlikescontroller',
        'incluso.programa.chatcontroller',
        'incluso.programa.leaderboard',
        'incluso.programa.comunidad',
        'incluso.programa.reconocimiento',
        'incluso.programa.album',        
        'incluso.programa.sharingExperience',
        'incluso.stage.dashboardcontroller',
        'incluso.programa.feedbackcontroller',
        
        // TODO: Should be just one controller for all stage dashboards, will merge soon
        'incluso.stage.dashboardcontroller2',
        'incluso.stage.dashboardcontroller3',
        'incluso.stage.forumclosecontroller',
        'incluso.stage.forumcontroller',
        'incluso.stage.forumcommentscontroller',
        'incluso.stage.contentscontroller',
        'incluso.stage.messagecontroller',
        'incluso.stage.gameretomultiplecontroller',
        'incluso.stage.gameretomultipleexternalappcontroller',
        'incluso.stage.gameretomultipleresultscontroller',
        'incluso.stage.tueligesController',
        'incluso.stage.quizcontroller',
        'incluso.stage.mapadevidaController',
        'incluso.stage.multiplicatudineroController',
        'incluso.stage.mapadelemprendedorController',
        'incluso.program.alerts',        
        'incluso.program.myInterests',
        'incluso.program.myStrengths',
        'incluso.program.myStars',
        'incluso.program.rewardDetail',
        'incluso.program.hallOfFame',
        'incluso.program.privacyNotice',
        'incluso.program.termsOfUse',
        'incluso.program.helpAndSupport',        
        'incluso.programa.evaluacionFormulario',
        'incluso.program.FAQs'
    ])
    .run(['$templateCache', '$http', '$rootScope',function ($templateCache, $http, $rootScope) {
        
        $http.get('Templates/Public/Login.html', { cache: true });
        $http.get('Templates/Public/RecoverPassword.html', { cache: true });
        $http.get('Templates/Public/RecoverPasswordEmail.html', { cache: true });
        $http.get('Templates/Public/Register.html', { cache: true });
        $http.get('Templates/Programa/Dashboard.html', { cache: true });        
        $http.get('Templates/Programa/profile.html', { cache: true });
        $http.get('Templates/Programa/editProfile.html', { cache: true });        
        $http.get('Templates/Programa/Tutorial.html', { cache: true });
        $http.get('Templates/Programa/system-requirements.html', { cache: true });
        $http.get('Templates/Programa/acercaPrograma.html', { cache: true });  
        $http.get('Templates/Juegos/Avatar.html', { cache: true });
        $http.get('Templates/Programa/Alerts.html', { cache: true });
        $http.get('Templates/Programa/AlertsDetail.html', { cache: true });
        $http.get('Templates/Programa/NotificationLikesByPost.html', { cache: true });
        $http.get('Templates/Programa/MyInterests.html', { cache: true });
        $http.get('Templates/Programa/MyStrengths.html', { cache: true });
        $http.get('Templates/Programa/HallOfFame.html', { cache: true });
        $http.get('Templates/Programa/MyStars.html', { cache: true });
        $http.get('Templates/Programa/RewardDetail.html',{ cache: true });
        $http.get('Templates/Programa/PrivacyNotice.html', { cache: true });
        $http.get('Templates/Programa/TermsOfUse.html', { cache: true });
        $http.get('Templates/Programa/HelpAndSupport.html', { cache: true });
        $http.get('Templates/Programa/evaluacion.html', { cache: true });
        $http.get('Templates/Programa/formulario.html', { cache: true });
        $http.get('Templates/Programa/community.html', { cache: true });
        $http.get('Templates/Programa/sharingexperience.html', { cache: true });  
        $http.get('Templates/Programa/AlbumIncluso.html', { cache: true });  
        $http.get('Templates/Programa/reconocimiento.html', { cache: true });
        $http.get('Templates/Programa/RewardDetail.html', { cache: true });

        $http.get('Templates/Juegos/Game.html', { cache: true });        
        $http.get('Templates/NotificationDetails.html', { cache: true });  
        $http.get('Templates/Programa/Dashboard.html', { cache: true });
        $http.get('Templates/Chat/index.html', { cache: true });
        $http.get('Templates/Leaderboard/index.html', { cache: true });          
        $http.get('Templates/ZonaDeVuelo/dashboard.html', { cache: true });
        $http.get('Templates/ZonaDeVuelo/ExploracionInicialCierre.html', { cache: true });  
        $http.get('Templates/ZonaDeVuelo/CuartoDeRecursos/FuenteDeEnergia.html', { cache: true });          
        $http.get('Templates/ZonaDeVuelo/Conocete/FuenteDeEnergia.html', { cache: true });  
        $http.get('Templates/ZonaDeVuelo/Conocete/RetoMultiple.html', { cache: true });
        $http.get('Templates/ZonaDeVuelo/Conocete/RetoMultipleFichaDeResultados.html', { cache: true });  
        $http.get('Templates/ZonaDeVuelo/Conocete/PuntoDeEncuentro/Topicos.html', { cache: true });  
        $http.get('Templates/ZonaDeVuelo/Conocete/PuntoDeEncuentro/Comentarios.html', { cache: true });
        $http.get('Templates/ZonaDeVuelo/Conocete/ZonaDeContacto/dashboard.html', { cache: true });
        $http.get('Templates/ZonaDeVuelo/Conocete/ZonaDeContacto/Logicos/Topicos.html', { cache: true });  
        $http.get('Templates/ZonaDeVuelo/Conocete/ZonaDeContacto/Logicos/Comentarios.html', { cache: true });  
        $http.get('Templates/ZonaDeVuelo/Conocete/ZonaDeContacto/Artisticos/Topicos.html', { cache: true });  
        $http.get('Templates/ZonaDeVuelo/Conocete/ZonaDeContacto/Artisticos/Comentarios.html', { cache: true });          
        $http.get('Templates/ZonaDeVuelo/MisSuenos/FuenteDeEnergia.html', { cache: true });
        $http.get('Templates/ZonaDeVuelo/MisSuenos/MisCualidadesCierre.html', { cache: true });
        $http.get('Templates/ZonaDeVuelo/MisSuenos/MisGustosCierre.html', { cache: true });
        $http.get('Templates/ZonaDeVuelo/MisSuenos/SuenaCierre.html', { cache: true });  
        $http.get('Templates/ZonaDeVuelo/MisSuenos/PuntosDeEncuentro/Topicos.html', { cache: true });  
        $http.get('Templates/ZonaDeVuelo/MisSuenos/PuntosDeEncuentro/Comentarios.html', { cache: true });
        $http.get('Templates/ZonaDeVuelo/ExploracionFinalCierre.html', { cache: true });  
        $http.get('Templates/ZonaDeVuelo/Cierre.html', { cache: true });
        $http.get('Templates/Programa/Retroalimentacion.html', { cache: true });

        ///////// Stage 2 //////////
        $http.get('Templates/ZonaDeNavegacion/dashboard.html',{cache:true});
        $http.get('Templates/ZonaDeNavegacion/TuElijes/TuEliges.html', { cache: true });
        $http.get('Templates/ZonaDeNavegacion/TuElijes/TuEligesResults.html', { cache: true });
        $http.get('Templates/ZonaDeNavegacion/ProyectaTuVida/MapaDeVida/MapaDeVida.html', { cache: true });
        //$http.get('Templates/ZonaDeNavegacion/Retroalimentacion.html', { cache: true });

        ///////// Stage 3 //////////
        $http.get('Templates/ZonaDeAterrizaje/dashboard.html', { cache: true });
        $http.get('Templates/ZonaDeAterrizaje/EducacionFinanciera/MultiplicaTuDinero.html', { cache: true });
        $http.get('Templates/ZonaDeAterrizaje/EducacionFinanciera/MultiplicaTuDineroResults.html', { cache: true });
        $http.get('Templates/ZonaDeAterrizaje/MapaDelEmprendedor/MapaDelEmprendedor.html', {cache: true });
        //$http.get('Templates/ZonaDeAterrizaje/Retroalimentacion.html', {cache: true });

         document.addEventListener("keyup", function(e) {
            if (e.keyCode === 27)
                $rootScope.$broadcast("escapePressed", e.target);
        });

        document.addEventListener("click", function(e) {
            $rootScope.$broadcast("documentClicked", e.target);

        });
    }])
    .config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {

        $routeProvider.when('/Perfil/Editar/:id', {
            templateUrl: 'Templates/Programa/editProfile.html',
            controller: 'programaProfileController'
        });

        $routeProvider.when('/Perfil/ConfigurarPrivacidad/:id', {
            templateUrl: 'Templates/Programa/PrivacySettings.html',
            controller: 'programaProfileController',
            reloadOnSearch: false
        });
        
        $routeProvider.when('/Perfil/:id/:retry?', {
            templateUrl: 'Templates/Programa/profile.html',
            controller: 'programaProfileController'
        });
        $routeProvider.when('/PerfilAjeno/:id/:useralias', {
            templateUrl: 'Templates/Programa/profile.html',
            controller: 'programaProfileController'
        });

        $routeProvider.when('/evaluacion', {
            templateUrl: 'Templates/Programa/evaluacion.html',
            controller: 'evaluacionFormulario'
        });

        $routeProvider.when('/formulario', {
            templateUrl: 'Templates/Programa/formulario.html',
            controller: 'evaluacionFormulario'
        });
        
        $routeProvider.when('/reconocimiento', {
            templateUrl: 'Templates/Programa/reconocimiento.html',
            controller: 'reconocimientoController'
        });

        $routeProvider.when('/ProgramaDashboard', {
        	templateUrl: 'Templates/Programa/Dashboard.html',
        	controller: 'programaDashboardController'
        });
    
        $routeProvider.when('/', {
            templateUrl: 'Templates/Public/Login.html',
            controller: 'publicLoginController',
            reloadOnSearch: false
        });

        $routeProvider.when('/RecoverPassword', {
            templateUrl: 'Templates/Public/RecoverPassword.html',
            controller: 'publicRecoverPasswordController',
            reloadOnSearch: false
        });

        $routeProvider.when('/RecoverPasswordEmail', {
            templateUrl: 'Templates/Public/RecoverPasswordEmail.html',
            controller: 'publicRecoverPasswordController',
            reloadOnSearch: false
        });

        $routeProvider.when('/Register', {
            templateUrl: 'Templates/Public/Register.html',
            controller: 'publicRegisterController',
            reloadOnSearch: false
        });
        
        $routeProvider.when('/Register/:facebookUser/:isUpdate', {
            templateUrl: 'Templates/Public/Register.html',
            controller: 'publicRegisterController',
            reloadOnSearch: false
        });
        
        $routeProvider.when('/Tutorial', {
            templateUrl: 'Templates/Programa/Tutorial.html',
            controller: 'programaTutorialController'
        });

        $routeProvider.when('/Tutorial/:retry', {
            templateUrl: 'Templates/Programa/Tutorial.html',
            controller: 'programaTutorialController'
        });

        $routeProvider.when('/Requerimientos', {
            templateUrl: 'Templates/Programa/system-requirements.html',
            controller: 'programaSystemRequirementsController'
        });

        $routeProvider.when('/Juegos/Avatar', {
            templateUrl: 'Templates/Juegos/Avatar.html',
            controller: 'juegosAvatarController'
        });

        $routeProvider.when('/AcercaPrograma', {
            templateUrl: 'Templates/Programa/acercaPrograma.html',
            controller: 'programaAcercaProgramaController'
        });

        $routeProvider.when('/MyInterests', {
            templateUrl: 'Templates/Programa/MyInterests.html',
            controller: 'MyInterestsController'
        }); 

        $routeProvider.when('/MyStrengths', {
            templateUrl: 'Templates/Programa/MyStrengths.html',
            controller: 'MyStrengthsController'
        });

        $routeProvider.when('/MyStars', {
            templateUrl: 'Templates/Programa/MyStars.html',
            controller: 'MyStarsController'
        });

        $routeProvider.when('/RewardDetail/:id', {
            templateUrl: function(params){ return 'Templates/Programa/RewardDetail.html?id=' + params.id; } ,
            controller: 'rewardDetailController'
        });

        $routeProvider.when('/HallOfFame', {
            templateUrl: 'Templates/Programa/HallOfFame.html',
            controller: 'HallOfFameController'
        });

        $routeProvider.when('/PrivacyNotice', {
            templateUrl: 'Templates/Programa/PrivacyNotice.html',
            controller: 'PrivacyNoticeController'
        });

        $routeProvider.when('/TermsOfUse', {
            templateUrl: 'Templates/Programa/TermsOfUse.html',
            controller: 'TermsOfUseController'
        });

        $routeProvider.when('/HelpAndSupport', {
            templateUrl: 'Templates/Programa/HelpAndSupport.html',
            controller: 'HelpAndSupportController'
        });

        $routeProvider.when('/Juegos/Game', {
            templateUrl: 'Templates/Juegos/Game.html',
            controller: 'GameController'
        });

        $routeProvider.when('/Community/:activityId', { 
            templateUrl: 'Templates/Programa/community.html',
            controller: 'programaComunidadController'
        });
       
        $routeProvider.when('/Alerts', { 
            templateUrl: 'Templates/Programa/Alerts.html',
            controller: 'AlertsController'
        });
       
        $routeProvider.when('/AlertsDetail/:notificationId/:usernotificationId', { 
            templateUrl: function(params){ return 'Templates/Programa/AlertsDetail.html?notificationid=' + params.notificationId + '&usernotificationId=' + params.usernotificationId;},
            controller: 'programaNotificationController'
        });
            
        $routeProvider.when('/NotificationLikesByPost/:id', {
            templateUrl: function(params){ return 'Templates/Programa/NotificationLikesByPost.html?id=' + params.id; },
            controller: 'programaNotificationLikesController'
        });
        
        $routeProvider.when('/SharingExperience', { 
            templateUrl: 'Templates/Programa/sharingexperience.html',
            controller: 'sharingExperienceController'
        });  

        $routeProvider.when('/AlbumIncluso', {
            templateUrl: 'Templates/Programa/AlbumIncluso.html',
            controller: 'AlbumInclusoController'
       });

        $routeProvider.when('/Chat', {
            templateUrl: 'Templates/Chat/index.html',
            controller: 'programaChatController'
        });
            
        $routeProvider.when('/Leaderboard', { 
            templateUrl: 'Templates/Leaderboard/index.html',
            controller: 'programaLeaderBoard'
        });        
     
        $routeProvider.when('/ZonaDeVuelo/Dashboard/:stageId/:challenge', {
            templateUrl: 'Templates/ZonaDeVuelo/dashboard.html',
            controller: 'stageDashboardController'
        });

        $routeProvider.when('/ZonaDeVuelo/ExploracionInicial/:activityIdentifier', {
            templateUrl: 'Templates/quiz.html', 
            controller: 'stageQuizController',
            reloadOnSearch: false
        });
    
        $routeProvider.when('/ZonaDeVuelo/ExploracionInicialCierre', { 
            templateUrl: 'Templates/ZonaDeVuelo/ExploracionInicialCierre.html',
            controller: 'stageQuizController'
        });
    
        $routeProvider.when('/ZonaDeVuelo/CuartoDeRecursos/FuenteDeEnergia/:moodleid', { 
            templateUrl: 'Templates/ZonaDeVuelo/CuartoDeRecursos/FuenteDeEnergia.html',
            controller: 'stageContentsController'
        });
    
        $routeProvider.when('/ZonaDeVuelo/Conocete/FuenteDeEnergia/:moodleid', { 
            templateUrl: 'Templates/ZonaDeVuelo/Conocete/FuenteDeEnergia.html',
            controller: 'stageContentsController'
        });
    
        $routeProvider.when('/ZonaDeVuelo/Conocete/RetoMultiple/:moodleid/:retry', { 
            templateUrl: 'Templates/ZonaDeVuelo/Conocete/RetoMultiple.html',
            controller: 'stageGameRetoMultipleController'
        });

        $routeProvider.when('/ZonaDeVuelo/Conocete/RetoMultiple/:moodleid', { 
            templateUrl: 'Templates/ZonaDeVuelo/Conocete/RetoMultiple.html',
            controller: 'stageGameRetoMultipleController'
        });

        $routeProvider.when('/ZonaDeVuelo/Conocete/RetoMultipleFichaDeResultados', { 
            templateUrl: 'Templates/ZonaDeVuelo/Conocete/RetoMultipleFichaDeResultados.html',
            controller: 'stageGameRetoMultipleResultsController'
        });
    
        $routeProvider.when('/ZonaDeVuelo/ForoCierre/:activityId/:discussionId/:moodleId', {
            templateUrl: 'Templates/ZonaDeVuelo/ForoCierre.html',
            controller: 'stageForumCloseController'
        });

        $routeProvider.when('/ZonaDeVuelo/Conocete/PuntoDeEncuentro/Topicos/:activityId', {
            templateUrl: 'Templates/ZonaDeVuelo/Conocete/PuntoDeEncuentro/Topicos.html',
            controller: 'stageForumController'
        });

        $routeProvider.when('/ZonaDeVuelo/Conocete/PuntoDeEncuentro/Comentarios/:activityId/:discussionId', {
            templateUrl: 'Templates/ZonaDeVuelo/Conocete/PuntoDeEncuentro/Comentarios.html',
            controller: 'stageForumCommentsController'
        });

        $routeProvider.when('/ZonaDeVuelo/Conocete/ZonaDeContacto/:activityId', {
            templateUrl: 'Templates/ZonaDeVuelo/Conocete/ZonaDeContacto/dashboard.html',
            controller: 'stageForumController'
        });
    
        $routeProvider.when('/ZonaDeVuelo/Conocete/ZonaDeContacto/Logicos/Topicos/:activityId/:moodleId', {
            templateUrl: 'Templates/ZonaDeVuelo/Conocete/ZonaDeContacto/Logicos/Topicos.html',
            controller: 'stageForumController'
        });
    
        $routeProvider.when('/ZonaDeVuelo/Conocete/ZonaDeContacto/Logicos/Comentarios/:activityId/:discussionId/:moodleId', {
            templateUrl: 'Templates/ZonaDeVuelo/Conocete/ZonaDeContacto/Logicos/Comentarios.html',
            controller: 'stageForumCommentsController'
        });
    
        $routeProvider.when('/ZonaDeVuelo/Conocete/ZonaDeContacto/Artisticos/Topicos/:activityId/:moodleId', {
            templateUrl: 'Templates/ZonaDeVuelo/Conocete/ZonaDeContacto/Artisticos/Topicos.html',
            controller: 'stageForumController'
        });
    
        $routeProvider.when('/ZonaDeVuelo/Conocete/ZonaDeContacto/Artisticos/Comentarios/:activityId/:discussionId/:moodleId', {
            templateUrl: 'Templates/ZonaDeVuelo/Conocete/ZonaDeContacto/Artisticos/Comentarios.html',
            controller: 'stageForumCommentsController'
        });
    
        $routeProvider.when('/ZonaDeVuelo/MisSuenos/FuenteDeEnergia/:moodleid', { 
            templateUrl: 'Templates/ZonaDeVuelo/MisSuenos/FuenteDeEnergia.html',
            controller: 'stageContentsController'
        });
    
        $routeProvider.when('/ZonaDeVuelo/MisSuenos/MisCualidades/:activityIdentifier', {
            templateUrl: 'Templates/quiz.html', 
            controller: 'stageQuizController',
            reloadOnSearch: false
        });

        $routeProvider.when('/ZonaDeVuelo/MisSuenos/MisCualidades/Cierre', {
            templateUrl: 'Templates/ZonaDeVuelo/MisSuenos/MisCualidadesCierre.html',
            controller: 'stageMessageController'
        });
    
        $routeProvider.when('/ZonaDeVuelo/MisSuenos/MisGustos/:activityIdentifier', {
            templateUrl: 'Templates/quiz.html', 
            controller: 'stageQuizController',
            reloadOnSearch: false
        });

        $routeProvider.when('/ZonaDeVuelo/MisSuenos/MisGustos/Cierre', {
            templateUrl: 'Templates/ZonaDeVuelo/MisSuenos/MisGustosCierre.html',
            controller: 'stageMessageController'
        });
    
        $routeProvider.when('/ZonaDeVuelo/MisSuenos/Suena/:activityIdentifier', {
            templateUrl: 'Templates/quiz.html', 
            controller: 'stageQuizController',
            reloadOnSearch: false
        });

        $routeProvider.when('/ZonaDeVuelo/MisSuenos/Suena/Cierre', {
            templateUrl: 'Templates/ZonaDeVuelo/MisSuenos/SuenaCierre.html',
            controller: 'stageMessageController'
        });
    
        $routeProvider.when('/ZonaDeVuelo/MisSuenos/PuntosDeEncuentro/Topicos/:activityId', {
            templateUrl: 'Templates/ZonaDeVuelo/MisSuenos/PuntosDeEncuentro/Topicos.html',
            controller: 'stageForumController'
        });
    
        $routeProvider.when('/ZonaDeVuelo/MisSuenos/PuntosDeEncuentro/Comentarios/:activityId/:discussionId', {
            templateUrl: 'Templates/ZonaDeVuelo/MisSuenos/PuntosDeEncuentro/Comentarios.html',
            controller: 'stageForumCommentsController'
        });

        $routeProvider.when('/ZonaDeVuelo/MisSuenos/MensajeDeCierre', {
            templateUrl: 'Templates/ZonaDeVuelo/MisSuenos/MensajeDeCierre.html',
            controller: 'stageMessageController'
        });

        $routeProvider.when('/ZonaDeVuelo/Retroalimentacion/:activityId', {
            templateUrl: 'Templates/Programa/Retroalimentacion.html',
            controller: 'programafeedbackcontroller'
        });
    
        $routeProvider.when('/ZonaDeVuelo/ExploracionFinal/:activityIdentifier', {
            templateUrl: 'Templates/quiz.html',
            controller: 'stageQuizController',
            reloadOnSearch: false
        });

        $routeProvider.when('/ZonaDeVuelo/ExploracionFinalCierre', {
            templateUrl: 'Templates/ZonaDeVuelo/ExploracionFinalCierre.html',
            controller: 'stageMessageController'
        });

        $routeProvider.when('/ZonaDeVuelo/Cierre/:moodleid', {
            templateUrl: 'Templates/ZonaDeVuelo/Cierre.html',
            controller: 'programaEndController'
        });

        
        //Stage 2 - Zona de navegacion
        //TODO Change zona de vuelo route to dashboard, there's a typo and refactor dashboard controller, the typo is there too
        $routeProvider.when('/ZonaDeNavegacion/Dashboard/:stageId/:challenge', {
            templateUrl: 'Templates/ZonaDeNavegacion/dashboard.html',
            controller: 'stage2DashboardController'
        });

        $routeProvider.when('/ZonaDeNavegacion/ExploracionInicial/:activityIdentifier', {
            templateUrl: 'Templates/quiz.html',
            controller: 'stageQuizController',
            reloadOnSearch: false
        });

        $routeProvider.when('/ZonaDeNavegacion/ExploracionInicialCierre', {
            templateUrl: 'Templates/ZonaDeNavegacion/ExploracionInicialCierre.html',
            controller: 'stageQuizController'
        });

        $routeProvider.when('/ZonaDeNavegacion/CuartoDeRecursos/FuenteDeEnergia/:moodleid', {
            templateUrl: 'Templates/ZonaDeNavegacion/CuartoDeRecursos/FuenteDeEnergia.html',
        controller: 'stageContentsController'
        });

        $routeProvider.when('/ZonaDeNavegacion/Transformate/TusIdeas/:activityIdentifier', {
            templateUrl: 'Templates/quiz.html', 
            controller: 'stageQuizController',
            reloadOnSearch: false
        });

        $routeProvider.when('/ZonaDeNavegacion/Transformate/FuenteDeEnergia/:moodleid', {
            templateUrl: 'Templates/ZonaDeNavegacion/Transformate/FuenteDeEnergia.html',
            controller: 'stageContentsController'
        });

        $routeProvider.when('/ZonaDeNavegacion/ForoCierre/:activityId/:discussionId/:moodleId', {
            templateUrl: 'Templates/ZonaDeNavegacion/ForoCierre.html',
            controller: 'stageForumCloseController'
        });

        $routeProvider.when('/ZonaDeNavegacion/Transformate/PuntoDeEncuentro/Topicos/:activityId', {
            templateUrl: 'Templates/ZonaDeNavegacion/Transformate/PuntoDeEncuentro/Topicos.html',
            controller: 'stageForumController'
        });

        $routeProvider.when('/ZonaDeNavegacion/Transformate/PuntoDeEncuentro/Comentarios/:activityId/:discussionId', {
            templateUrl: 'Templates/ZonaDeNavegacion/Transformate/PuntoDeEncuentro/Comentarios.html',
            controller: 'stageForumCommentsController'
        });

        $routeProvider.when('/ZonaDeNavegacion/TuEliges/FuenteDeEnergia/:moodleid', {
            templateUrl: 'Templates/ZonaDeNavegacion/TuElijes/FuenteDeEnergia.html',
            controller: 'stageContentsController'
        });

        $routeProvider.when('/ZonaDeNavegacion/TuEliges/TuEliges/:moodleid', {
            templateUrl: 'Templates/ZonaDeNavegacion/TuElijes/TuEliges.html',
            controller: 'stageTuEligesController'
        });

        $routeProvider.when('/ZonaDeNavegacion/TuEliges/TuEliges/:moodleid/:retry', {
            templateUrl: 'Templates/ZonaDeNavegacion/TuElijes/TuEliges.html',
            controller: 'stageTuEligesController'
        });

        $routeProvider.when('/ZonaDeNavegacion/TuEliges/ResultadosTuEliges', {
            templateUrl: 'Templates/ZonaDeNavegacion/TuElijes/TuEligesResults.html',
            controller: 'stageTuEligesController'
        });

        $routeProvider.when('/ZonaDeNavegacion/ProyectaTuVida/FuenteDeEnergia/:moodleid', {
            templateUrl: 'Templates/ZonaDeNavegacion/ProyectaTuVida/FuenteDeEnergia.html',
            controller: 'stageContentsController'
        });

        $routeProvider.when('/ZonaDeNavegacion/ProyectaTuVida/13y5/:activityIdentifier', {
            templateUrl: 'Templates/quiz.html',
            controller: 'stageQuizController',
            reloadOnSearch: false
        });

        $routeProvider.when('/ZonaDeNavegacion/ProyectaTuVida/MapaDeVida/:moodleid', {
            templateUrl: 'Templates/ZonaDeNavegacion/ProyectaTuVida/MapaDeVida/MapaDeVida.html',
            controller: 'stageMapaDeVidaController'
        });

        $routeProvider.when('/ZonaDeNavegacion/ProyectaTuVida/MapaDeVida/:moodleid/:retry', {
            templateUrl: 'Templates/ZonaDeNavegacion/ProyectaTuVida/MapaDeVida/MapaDeVida.html',
            controller: 'stageMapaDeVidaController'
        });

        $routeProvider.when('/ZonaDeNavegacion/ProyectaTuVida/PuntoDeEncuentro/Topicos/:activityId', {
            templateUrl: 'Templates/ZonaDeNavegacion/ProyectaTuVida/PuntoDeEncuentro/Topicos.html',
            controller: 'stageForumController'
        });

        $routeProvider.when('/ZonaDeNavegacion/ProyectaTuVida/PuntoDeEncuentro/Comentarios/:activityId/:discussionId', {
            templateUrl: 'Templates/ZonaDeNavegacion/ProyectaTuVida/PuntoDeEncuentro/Comentarios.html',
            controller: 'stageForumCommentsController'
        });
        
        $routeProvider.when('/ZonaDeNavegacion/Retroalimentacion/:activityId', {
            templateUrl: 'Templates/Programa/Retroalimentacion.html',
            controller: 'programafeedbackcontroller'
        });

        $routeProvider.when('/ZonaDeNavegacion/ExploracionFinal/:activityIdentifier', {
            templateUrl: 'Templates/quiz.html', 
            controller: 'stageQuizController',
            reloadOnSearch: false
        });

        $routeProvider.when('/ZonaDeNavegacion/ExploracionFinalCierre', {
            templateUrl: 'Templates/ZonaDeNavegacion/ExploracionFinalCierre.html',
            controller: 'stageMessageController'
        });

        $routeProvider.when('/ZonaDeNavegacion/Cierre/:moodleid', {
            templateUrl: 'Templates/ZonaDeNavegacion/Cierre.html',
            controller: 'programaEndController'
        });

        //Stage 3 - Zona de Aterrizaje
        $routeProvider.when('/ZonaDeAterrizaje/Dashboard/:stageId/:challenge', {
            templateUrl: 'Templates/ZonaDeAterrizaje/dashboard.html',
            controller: 'stage3DashboardController'
        });

        $routeProvider.when('/ZonaDeAterrizaje/CuartoDeRecursos/FuenteDeEnergia/:moodleid', {
            templateUrl: 'Templates/ZonaDeAterrizaje/CuartoDeRecursos/FuenteDeEnergia.html',
            controller: 'stageContentsController'
        });

        $routeProvider.when('/ZonaDeAterrizaje/ExploracionInicial/:activityIdentifier', {
            templateUrl: 'Templates/quiz.html', 
            controller: 'stageQuizController',
            reloadOnSearch: false
        });

        $routeProvider.when('/ZonaDeAterrizaje/ExploracionFinal/:activityIdentifier', {
            templateUrl: 'Templates/quiz.html', 
            controller: 'stageQuizController',
            reloadOnSearch: false
        });

        $routeProvider.when('/ZonaDeAterrizaje/ForoCierre/:activityId/:discussionId/:moodleId', {
            templateUrl: 'Templates/ZonaDeAterrizaje/ForoCierre.html',
            controller: 'stageForumCloseController'
        });

        $routeProvider.when('/ZonaDeAterrizaje/EducacionFinanciera/PuntoDeEncuentro/Topicos/:activityId', {
            templateUrl: 'Templates/ZonaDeAterrizaje/EducacionFinanciera/PuntoDeEncuentro/Topicos.html',
            controller: 'stageForumController'
        });

        $routeProvider.when('/ZonaDeAterrizaje/EducacionFinanciera/FuenteDeEnergia/:moodleid', {
            templateUrl: 'Templates/ZonaDeAterrizaje/EducacionFinanciera/FuenteDeEnergia.html',
            controller: 'stageContentsController'
        });

        $routeProvider.when('/ZonaDeAterrizaje/EducacionFinanciera/PuntoDeEncuentro/Comentarios/:activityId/:discussionId', {
            templateUrl: 'Templates/ZonaDeAterrizaje/EducacionFinanciera/PuntoDeEncuentro/Comentarios.html',
            controller: 'stageForumCommentsController'
        });

        $routeProvider.when('/ZonaDeAterrizaje/EducacionFinanciera/MultiplicaTuDinero/:moodleid', {
            templateUrl: 'Templates/ZonaDeAterrizaje/EducacionFinanciera/MultiplicaTuDinero.html',
            controller: 'stageMultiplicaTuDineroController'
        });

        $routeProvider.when('/ZonaDeAterrizaje/EducacionFinanciera/MultiplicaTuDinero/:moodleid/:retry', {
            templateUrl: 'Templates/ZonaDeAterrizaje/EducacionFinanciera/MultiplicaTuDinero.html',
            controller: 'stageMultiplicaTuDineroController'
        });

        $routeProvider.when('/ZonaDeAterrizaje/EducacionFinanciera/ResultadosMultiplicaTuDinero', {
            templateUrl: 'Templates/ZonaDeAterrizaje/EducacionFinanciera/MultiplicaTuDineroResults.html',
            controller: 'stageMultiplicaTuDineroController'
        });

        $routeProvider.when('/ZonaDeAterrizaje/MapaDelEmprendedor/FuenteDeEnergia/:moodleid', {
            templateUrl: 'Templates/ZonaDeAterrizaje/MapaDelEmprendedor/FuenteDeEnergia.html',
            controller: 'stageContentsController'
        });

        $routeProvider.when('/ZonaDeAterrizaje/MapaDelEmprendedor/MapaDelEmprendedor/:moodleid', {              
            templateUrl: 'Templates/ZonaDeAterrizaje/MapaDelEmprendedor/MapaDelEmprendedor.html',               
            controller: 'stageMapaDelEmprendedorController'             
        });

        $routeProvider.when('/ZonaDeAterrizaje/MapaDelEmprendedor/MapaDelEmprendedor/:moodleid/:retry', {              
            templateUrl: 'Templates/ZonaDeAterrizaje/MapaDelEmprendedor/MapaDelEmprendedor.html',               
            controller: 'stageMapaDelEmprendedorController'             
        });

        $routeProvider.when('/ZonaDeAterrizaje/MapaDelEmprendedor/PuntoDeEncuentro/Topicos/:activityId', {
            templateUrl: 'Templates/ZonaDeAterrizaje/MapaDelEmprendedor/PuntoDeEncuentro/Topicos.html',
            controller: 'stageForumController'
        });

        $routeProvider.when('/ZonaDeAterrizaje/MapaDelEmprendedor/PuntoDeEncuentro/Comentarios/:activityId/:discussionId', {
            templateUrl: 'Templates/ZonaDeAterrizaje/MapaDelEmprendedor/PuntoDeEncuentro/Comentarios.html',
            controller: 'stageForumCommentsController'
        });
        
        $routeProvider.when('/ZonaDeAterrizaje/Retroalimentacion/:activityId', {
            templateUrl: 'Templates/Programa/Retroalimentacion.html',
            controller: 'programafeedbackcontroller'
        });

        $routeProvider.when('/FAQs', {
            templateUrl: 'Templates/Programa/faqs.html',
            controller: 'FAQsController'
        });

        $routeProvider.when('/ChangeOfTerms', {
            templateUrl: 'Templates/Programa/ChangeOfTerms.html'
        });

        $routeProvider.when('/GalleryDetail', {
            templateUrl: 'Templates/Programa/gallery-detail.html',
            controller: 'postPhotoGalleryDetailController'
        });
        
        $routeProvider.when('/Offline', {
            templateUrl: 'Templates/Shared/offline.html',
            controller: 'offlineController'
        });

        $routeProvider.when('/connectionError', {
            templateUrl: 'Templates/Shared/errorTemplate.html',
            controller: 'errorController'
        });


        $routeProvider.when('/TimeOut', {
            templateUrl: 'Templates/Shared/timeout.html',
            controller: 'timeOutController'
        });

        $routeProvider.when('/pendingQueue',{
            templateUrl: 'Templates/Shared/PendingQueue.html',
            controller: 'pendingQueueController'
        });

        $routeProvider.otherwise({
            redirectTo: '/'
        });

        $locationProvider.html5Mode(false);

        $("#menu #submenu").mouseleave(function() {
            $(this).removeClass("unhovered");
        });
    }])
    .controller('RootController', ['$scope', '$route', '$routeParams', '$location', function ($scope, $route, $routeParams, $location) {
        $scope.$on('$routeChangeSuccess', function (e, current, previous) {
            console.log($location.path());  
            $scope.activeViewPath = $location.path();
            
            $("#menuton span").text($(".main-title").text()); 

        });        
    }])
    // Not sure why there's 2 required names
    .directive('requiredname', function () {
        return {
            require: '?ngModel',
            link: function (scope, elm, attr, ctrl) {
                if (!ctrl) return;
                attr.required = true; // force truthy in case we are on non input element

                var validator = function(value) {
                    if (attr.required && (typeof value == 'undefined' || value === '' || value === null || value !== value || value === false)) {
                        ctrl.$setValidity('requiredname', false);
                        return;
                    } else {
                        ctrl.$setValidity('requiredname', true);
                        return value;
                    }
                };

                ctrl.$formatters.push(validator);
                ctrl.$parsers.unshift(validator);

                attr.$observe('requiredname', function () {
                    validator(ctrl.$viewValue);
                });
            }
        };
    })
    .directive('requiredname', function () {
        return {
            require: '?ngModel',
            link: function (scope, elm, attr, ctrl) {
                if (!ctrl) return;
                attr.required = true; // force truthy in case we are on non input element

                var validator = function (value) {
                    if (attr.required && (typeof value == 'undefined' || value === '' || value === null || value !== value || value === false)) {
                        ctrl.$setValidity('requiredname', false);
                        return;
                    } else {
                        ctrl.$setValidity('requiredname', true);
                        return value;
                    }
                };

                ctrl.$formatters.push(validator);
                ctrl.$parsers.unshift(validator);

                attr.$observe('requiredname', function () {
                    validator(ctrl.$viewValue);
                });

                scope.$watch('validationSwitch', function () {
                    validator($("[name='" + ctrl.$name + "']").val());
                });
            }
        };
    })
    .directive('minimumlength', function () {
        return {
            require: '?ngModel',
            link: function (scope, elm, attr, ctrl) {
                if (!ctrl) return;
                attr.required = true; // force truthy in case we are on non input element

                var minlength = parseInt(attr.minimumlength, 10);
                var validator = function (value) {
                    if (typeof value != 'undefined' && value !== '' && value !== null && value.length < minlength) {
                        ctrl.$setValidity('minimumlength', false);
                        return value;
                    }
                    else {
                        ctrl.$setValidity('minimumlength', true);
                        return value;
                    }
                };

                ctrl.$formatters.push(validator);
                ctrl.$parsers.unshift(validator);

                attr.$observe('minimumlength', function () {
                    validator($("[name='" + ctrl.$name + "']").val());
                });
            }
        };
    })
    .directive('maximumlength', function () {
        return {
            require: '?ngModel',
            link: function (scope, elm, attr, ctrl) {
                if (!ctrl) return;
                attr.required = true; // force truthy in case we are on non input element

                var maxlength = parseInt(attr.maximumlength, 10);
                var validator = function (value) {
                    if (typeof value != 'undefined' && value !== '' && value !== null && value.length > maxlength) {
                        ctrl.$setValidity('maximumlength', false);
                        return value;
                    } else {
                        ctrl.$setValidity('maximumlength', true);
                        return value;
                    }
                };

                ctrl.$formatters.push(validator);
                ctrl.$parsers.unshift(validator);

                attr.$observe('maximumlength', function () {
                    validator($("[name='" + ctrl.$name + "']").val());
                });
            }
        };
    })
    .directive('checkurl', function () {
        return {
            require: '?ngModel',
            link: function (scope, elm, attr, ctrl) {
                if (!ctrl) return;
                attr.required = true; // force truthy in case we are on non input element

                var validator = function (value) {
                	var regexp =  /^(((ht|f)tp(s?))\:\/\/)?(www.|[a-zA-Z].)[a-zA-Z0-9\-\.]+\.(com|edu|gov|mil|net|org|biz|info|name|museum|us|ca|uk|gob|mx)(\:[0-9]+)*(\/($|[a-zA-Z0-9\.\,\;\?\'\\\+&amp;%\$#\=~_\-]+))*$/;
                    if (typeof value != 'undefined' && value !== '' && value !== null) {
                        if (regexp.test(value)) {
                            ctrl.$setValidity('checkurl', true);
                        }
                        else {
                            ctrl.$setValidity('checkurl', false);
                        }
                        return value;
                    } else {
                        ctrl.$setValidity('checkurl', true);
                        return value;
                    }
                };

                ctrl.$formatters.push(validator);
                ctrl.$parsers.unshift(validator);

                attr.$observe('checkurl', function () {
                    validator(ctrl.$viewValue);
                });
            }
        };
    })
    .directive('checkemail', function () {
        return {
            require: '?ngModel',
            link: function (scope, elm, attr, ctrl) {
                if (!ctrl) return;
                attr.required = true; // force truthy in case we are on non input element

                var validator = function (value) {
                    var regexp = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
                    if (typeof value != 'undefined' && value !== '' && value !== null) {
                        if (regexp.test(value)) {
                            ctrl.$setValidity('checkemail', true);
                        }
                        else {
                            ctrl.$setValidity('checkemail', false);
                        }
                        return value;
                    } else {
                        ctrl.$setValidity('checkemail', true);
                        return value;
                    }
                };

                ctrl.$formatters.push(validator);
                ctrl.$parsers.unshift(validator);

                attr.$observe('checkemail', function () {
                    validator(ctrl.$viewValue);
                });
            }
        };
    })
	.directive('checkdate', function () {
		return {
			require: '?ngModel',
			link: function (scope, elm, attr, ctrl) {
				if (!ctrl) return;
				attr.required = true; // force truthy in case we are on non input element

				var validator = function (value) {
					if (typeof value == 'string' && value !== '') {
						var date = parseDate(value);
						
						if (toString.apply(date) == '[object Date]') {
							setValidity(true);
						}
						else {
							setValidity(false);
						}

						return date;
					} else {
						setValidity(true);
						return value;
					}

					function parseDate(input) {
						var parts = input.match(/(\d+)/g);

						if (parts && parts.length >= 3) {
							var beginWithYear = parts[0].length == 4,
								year = beginWithYear ? parts[0] : parts[2],
								month = (parts[1] - 1),
								day = beginWithYear ? parts[2] : parts[0];
							
							return new Date(year, month, day, 12, 0, 0);
						} else {
							return null;
						}
					}

					function setValidity(isValid) {
						ctrl.$valid = isValid;
						ctrl.$invalid = !isValid;
					}
				};

				ctrl.$formatters.push(validator);
				ctrl.$parsers.unshift(validator);

				attr.$observe('checkdate', function () {
					validator(ctrl.$viewValue);
				});
			}
		};
	})
    .directive('ngFocus', function($timeout) {
        return function(scope, elem, attrs) {
            scope.$watch(attrs.ngFocus, function(newval) {
                if (newval) {
                    $timeout(function() {
                        elem[0].focus();
                    }, 0, false);
                }
            });
        };
    })
    .directive('ngBlur', function () {
        return function (scope, elem, attrs) {
            elem.bind('blur', function () {
                scope.$apply(attrs.ngBlur);
            });
        };
    })
    .directive('shareAlbum', function(){
        return {
          restrict: 'E',
          scope: false,
          templateUrl: 'Templates/Partials/shareAlbum.html'
        };
    })
    .directive('shareReconocimiento', function(){
        return {
          restrict: 'E',
          scope: false,
          templateUrl: 'Templates/Partials/shareReconocimiento.html'
        };
    })
    .directive('preloaderComponent', function(){
        return {
          restrict: 'E',
          scope: false,
          templateUrl: 'Templates/Programa/preloader.html'
        };
    })
    .directive('menuComponent', function(){
        return {
          restrict: 'E',
          scope: false,
          templateUrl: 'Templates/Programa/menu.html'
        };
    })
    .directive('toolbarComponent', function(){
        return {
          restrict: 'E',
          scope: false,
          templateUrl: 'Templates/Programa/toolbar.html'
        };
    })
    .directive('footerComponent', function(){
        return {
          restrict: 'E',
          scope: false,
          templateUrl: 'Templates/Programa/footer.html'
        };
    })
    /*.directive('preloaderComponent', function(){
        return {
          restrict: 'E',
          scope: false,
          templateUrl: 'Templates/Shared/_preloader.html'
        };
    })*/
    .directive('uiSwitch', ['$injector', function($injector) {
        var $drag = $injector.has('$drag') && $injector.get('$drag');

        return {
          restrict: 'EA',
          scope: {
            model: '=ngModel',
            changeExpr: '@ngChange'
          },
          link: function(scope, elem, attrs) {
            elem.addClass('switch');
            
            var disabled = attrs.disabled || elem.attr('disabled');

            var unwatchDisabled = scope.$watch(
              function() { 
                return attrs.disabled || elem.attr('disabled'); 
              },
              function(value) {
                if (!value || value === 'false' || value === '0') {
                  disabled = false;
                } else {
                  disabled = true;
                }
              }
            );

            var handle = angular.element('<div class="switch-handle"></div>');
            elem.append(handle);

            if (scope.model) {
              elem.addClass('active');
            }
            elem.addClass('switch-transition-enabled');

            var unwatch = scope.$watch('model', function(value) {
              if (value) {
                elem.addClass('active');
              } else {
                elem.removeClass('active');
              }
            });
            
            var isEnabled = function() {
              return !disabled;
            };

            var setModel = function(value) {
              if (isEnabled() && value !== scope.model) {
                scope.model = value;
                scope.$apply();
                if (scope.changeExpr !== null && scope.changeExpr !== undefined) {
                  scope.$parent.$eval(scope.changeExpr);
                }
              }
            };

            var clickCb = function() {
              setModel(!scope.model);
            };

            elem.on('click tap', clickCb);

            var unbind = angular.noop;

            if ($drag) {
              unbind = $drag.bind(handle, {
                transform: $drag.TRANSLATE_INSIDE(elem),
                start: function() {
                  elem.off('click tap', clickCb);
                },
                cancel: function() {
                  handle.removeAttr('style');
                  elem.off('click tap', clickCb);
                  elem.on('click tap', clickCb);
                },
                end: function() {
                  var rh = handle[0].getBoundingClientRect();
                  var re = elem[0].getBoundingClientRect();
                  if (rh.left - re.left < rh.width / 3) {
                    setModel(false);
                    handle.removeAttr('style');
                  } else if (re.right - rh.right < rh.width / 3) {
                    setModel(true);
                    handle.removeAttr('style');
                  } else {
                    handle.removeAttr('style');
                  }
                  elem.on('click tap', clickCb);
                }
              });  
            }

            elem.on('$destroy', function() {
              unbind();
              unwatchDisabled();
              unwatch();
              isEnabled = setModel = unbind = unwatch = unwatchDisabled = clickCb = null;
            });
          }
        };
    }])
    .factory("IntervalFactory", ['$interval', '$timeout', function($interval, $timeout) {
        
        var _userNotificationWeeklyIntervalPromise;
        var lastNotificationWeeklyReminderDateKey;
        
        var _startUserNotificationWeeklyInterval = function() {
            if(!_userNotificationWeeklyIntervalPromise) {
                
                var intervalTime = 86400000; /* 1 week */
                var intervalTimeSeconds = 86400;
                
                /* sets cache */
                lastNotificationWeeklyReminderDateKey = "lastNotificationWeeklyReminderDate/" + _getItem("userId");
                var lastNotificationWeeklyRemider = localStorage.getItem(lastNotificationWeeklyReminderDateKey);
                if(lastNotificationWeeklyRemider) {
                    /* update interval time */
                    var now = moment(Date.now()).unix();
                    var diffTime = now - Number(lastNotificationWeeklyRemider);
                    
                    var finalTimeLowerThanZero =  (intervalTimeSeconds - diffTime) <= 0;
                    intervalTime = ((intervalTimeSeconds - diffTime) <= 0) ? (intervalTimeSeconds * 1000) : ((intervalTimeSeconds - diffTime) * 1000);
                    if(finalTimeLowerThanZero) {
                        $timeout(function(){ intervalFunction(); }, 5000);   
                    }
                }else {
                    /* first time */
                    localStorage.setItem(lastNotificationWeeklyReminderDateKey, moment(Date.now()).unix());
                }
                
                _userNotificationWeeklyIntervalPromise = $interval(function() {
                    intervalFunction();
                }, intervalTime);
            }
        };
        
        var _cancelUserNotificationWeeklyInterval = function() {
            if(_userNotificationWeeklyIntervalPromise) {
                $interval.cancel(_userNotificationWeeklyIntervalPromise);
                _userNotificationWeeklyIntervalPromise = null;
            }
        };
        
        var getUserNotifications = function(callback) {
            var course = localStorage.getItem("course");
            var currentUser = localStorage.getItem("CurrentUser");
            var userId = _getItem("userId");

            if(course != null && userId != null && currentUser != null) {
                moodleFactory.Services.GetUserNotification(userId, JSON.parse(course).courseid, JSON.parse(currentUser).token, function () {
                    callback();
                }, function(obj){
                    $scope.$emit('HidePreloader');
                    if (obj && obj.statusCode && obj.statusCode == 408) {//Request Timeout
                      $timeout(function () {
                        $location.path('/Offline'); //This behavior could change
                      }, 1);
                    } else {//Another kind of Error happened
                      $timeout(function () {
                          $scope.$emit('HidePreloader');
                          $location.path('/connectionError');
                      }, 1);
                    }        
                }, true);
            }
        };
        
        function intervalFunction() {
            _forceUpdateConnectionStatus(function() {
                if (_isDeviceOnline) {
                    getUserNotifications(function() {
                        localStorage.setItem(lastNotificationWeeklyReminderDateKey, moment(Date.now()).unix());
                        angular.element('[ng-controller=homeCtrl]').scope().showNotification();

                        $interval.cancel(_userNotificationWeeklyIntervalPromise);
                        _userNotificationWeeklyIntervalPromise = null;
                        _startUserNotificationWeeklyInterval();
                    });
                }
            }, function() {});
        };
        
        return {
            StartUserNotificationWeeklyInterval: _startUserNotificationWeeklyInterval,
            CancelUserNotificationWeeklyInterval: _cancelUserNotificationWeeklyInterval
        };
        
    }]);
     
