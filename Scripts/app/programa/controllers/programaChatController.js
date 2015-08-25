angular
    .module('incluso.programa.chatcontroller', [])
    .controller('programaChatController', [
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

            var historyMessages = [{
                                    messageText: "Que tal Ulises, buen día, qué tal tu avance de esta semana con la etapa de zona de vuelo",
                                    messageSenderId: 1,
                                    messageSent: 0,
                                    messageDate: new Date('21/08/2015 08:05:59')},
                                {
                                    messageText: "Que tal Coach, tengo algunas dudas, no he podido completar la etapa conócete.",
                                    messageSenderId: 47,
                                    messageSent: 1,
                                    messageDate: new Date('21/08/2015 21:08:02')},
                                {
                                    messageText: "Bien Ulises, no te preocupes, estoy aquí para ayudarte, te parece si leemos de nuevo el tutorial para esta etapa?, te adjunto la liga...",
                                    messageSenderId: 1,
                                    messageSent: 0,
                                    messageDate: new Date('21/08/2015 21:15:46')},
                                {
                                    messageText: "Ah ahora entiendo, me hace falta completar una actividad que no había visto, gracias Coach, estamos en contacto.",
                                    messageSenderId: 47,
                                    messageSent: 1,
                                    messageDate: new Date('22/08/2015 08:25:11')},
                                {
                                    messageText: "Claro Ulises, no dudes en contactarme cuando tengas dudas.",
                                    messageSenderId: 1,
                                    messageSent: 0,
                                    messageDate: new Date('21/08/2015 08:26:01')}
                               ];
                        
            $scope.messages = historyMessages;                    
            
            $scope.currentMessage = "";
        
            $rootScope.pageName = "Estación: Conócete"
            $rootScope.navbarBlue = false;
            $rootScope.showToolbar = true;
            $rootScope.showFooter = false; 
            $rootScope.showFooterRocks = false; 

            $scope.scrollToTop();
            $scope.$emit('HidePreloader'); //hide preloader    
            
            $scope.back = function () {
                $location.path('/ProgramaDashboard');
            };
            
            $scope.sendMessage = function(){                
                var newMessage = {
                    messageText: $scope.currentMessage,
                    messageSenderId: 47,
                    messageSent: 1,
                    messageDate: new Date()
                    };
                    
                $scope.messages.push(newMessage);
                $scope.currentMessage = "";
            }
        }]);