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
            $scope.$emit('ShowPreloader'); 
            _timeout = $timeout;
            _httpFactory = $http;
            var _usercourse = JSON.parse(localStorage.getItem('usercourse'));
            var _startedActivityCabinaDeSoporte = JSON.parse(localStorage.getItem("startedActivityCabinaDeSoporte"));
            _setLocalStorageItem('chatRead', "true");
            var userId = localStorage.getItem('userId');            
            $scope.senderId = userId;
            $scope.messages = JSON.parse(localStorage.getItem('userChat'));
            var interval = setInterval(getMessages,60000);                    
            $scope.currentMessage = "";
            $scope.setToolbar($location.$$path,"Cabina de Soporte");
            $rootScope.showFooter = false; 
            $rootScope.showFooterRocks = false; 
            $scope.scrollToTop('anchor-bottom'); // VERY Important: setting anchor hash value for first time to allow scroll to bottom

            moodleFactory.Services.GetUserChat(userId,getUserRefreshChatCallback, errorCallback, true);             
            $scope.$emit('HidePreloader'); //hide preloader


            function validateCabinaDeSoporte(){
                $scope.scrollToTop('anchor-bottom');                       
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
                                localStorage.removeItem("startedActivityCabinaDeSoporte");   
                                _setLocalStorageItem('finishCabinaSoporte', 'true');
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
                $anchorScroll();
                validateCabinaDeSoporte();

                setTimeout(function() {
                    $anchorScroll();
                }, 1000);                
            }   
            
            $scope.back = function () {
                var userCurrentStage = localStorage.getItem("currentStage");              
                $location.path('/ZonaDeVuelo/Dashboard/' + userCurrentStage + '/4');
            };

            $scope.sendMessage = function() {
                if($scope.currentMessage.trim() != ""){                    
                    triggerAndroidKeyboardHide();
 
                    var newMessage = {
                    messagetext: $scope.currentMessage,
                    messagesenderid: $scope.senderId,                    
                    messagedate: new Date()
                    };
                
                    /* time out to avoid android lag on fully hiding keyboard */
                    $timeout(function() {
                        $scope.messages.push(newMessage);
                        $scope.currentMessage = "";
                        var newMessages = JSON.stringify($scope.messages);                
                        _setLocalStorageItem('userChat',newMessages);
                        $anchorScroll();
                                                       
                        moodleFactory.Services.PutUserChat($scope.senderId, newMessage, getUserChatCallback, errorCallback);
                    }, 1000);
                }                
            };
            
            function getUserChatCallback() {
                $anchorScroll();
            }
            
            function errorCallback() { 
                $anchorScroll();
            }

            function triggerAndroidKeyboardHide() {
                angular.element('#chatMessages').trigger('tap');
                $anchorScroll();
            }
        }
    ]);