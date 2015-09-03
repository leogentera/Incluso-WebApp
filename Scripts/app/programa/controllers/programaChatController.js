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

            _timeout = $timeout;
            _httpFactory = $http;
            var _usercourse = JSON.parse(localStorage.getItem('usercourse'));
            var _startedActivityCabinaDeSoporte = JSON.parse(localStorage.getItem("startedActivityCabinaDeSoporte"));
            localStorage.setItem('chatRead', "true");
            var userId = localStorage.getItem('userId');            
            $scope.senderId = userId;
            $scope.messages = JSON.parse(localStorage.getItem('userChat'));
            var interval = setInterval(getMessages,60000);                    
            $scope.currentMessage = "";

            $scope.setToolbar($location.$$path,"Cabina de Soporte");
            $rootScope.showFooter = false; 
            $rootScope.showFooterRocks = false; 

            validateCabinaDeSoporte();

            function validateCabinaDeSoporte(){
                debugger;
                var finishCabinaSoporte = localStorage.getItem('finishCabinaSoporte');
                if(!finishCabinaSoporte){
                    if(_startedActivityCabinaDeSoporte) {
                    var isStarted = _startedActivityCabinaDeSoporte;
                    var currentActivity = _usercourse.stages[isStarted.$stage].challenges[isStarted.$parentIndex].activities[isStarted.$index];

                        if (!currentActivity.status) {
                            var rawDate = isStarted.$data.datestarted.split(/:|\s|:/);
                            var dateStarted = new Date(rawDate[0], rawDate[1] - 1, rawDate[2], rawDate[3], rawDate[4], rawDate[5]);
                            var latestMessages =  _.filter($scope.messages, function(msg) { 
                                return (new Date(msg.messagedate)) > dateStarted && msg.messagesenderid != $scope.senderId;
                            });

                            if (latestMessages.length >= 2) {    
                                localStorage.setItem('finishCabinaSoporte', 'true');
                            }
                        }   
                    }                
                }
            }            

            function getMessages(){           
                 if($location.$$path != "/Chat"){
                    clearInterval(interval);
                 }
                moodleFactory.Services.GetUserChat(userId,getUserRefreshChatCallback, errorCallback, true);                                                                
            }

            function getUserRefreshChatCallback() {                
                $scope.messages = JSON.parse(localStorage.getItem('userChat'));
                validateCabinaDeSoporte();
            }

            $scope.scrollToTop();
            $scope.$emit('HidePreloader'); //hide preloader    
            
            $scope.back = function () {
                $location.path('/ProgramaDashboard');
            };
            //var currentDate = new Date();
            //var currentMonth = (currentDate.getMonth() + 1) < 10 ? ("0" + (currentDate.getMonth() + 1)) : (currentDate.getMonth() + 1);
            //var currentDay = currentDate.getDate() < 10 ? ("0" + currentDate.getDate) : currentDate.getDate();
            //var formattedDate = currentMonth + "/" + currentDay+ "/" + currentDate.getFullYear();
            //
            $scope.sendMessage = function() {
                var newMessage = {
                    messagetext: $scope.currentMessage,
                    messagesenderid: $scope.senderId,                    
                    messagedate: new Date()
                };
                                            
                $scope.messages.push(newMessage);
                $scope.currentMessage = "";
                var newMessages = JSON.stringify($scope.messages);                
                localStorage.setItem('userChat',newMessages);
                                               
                moodleFactory.Services.PutUserChat($scope.senderId, newMessage, getUserChatCallback, errorCallback); 
            }
            
            function getUserChatCallback() {

            }
            
            function errorCallback() {                        
                        
            }
            
        }]);