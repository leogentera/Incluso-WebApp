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
            
            $scope.validateConnection(initController, offlineCallback);
            
            function offlineCallback() {
                $timeout(function() { $location.path("/Offline"); }, 1000);
            }
            
            function initController() {

            _timeout = $timeout;
            _httpFactory = $http;
            var _usercourse = JSON.parse(localStorage.getItem('usercourse'));
            _setLocalStorageItem('chatRead', "true");
            var userId = localStorage.getItem('userId');
            var currentUser = JSON.parse(localStorage.getItem('CurrentUser'));
            var _startedActivityCabinaDeSoporte = JSON.parse(localStorage.getItem("startedActivityCabinaDeSoporte/" + userId));
            var userCurrentStage = localStorage.getItem("currentStage");            
            var messagesToRead = userCurrentStage * 2;
            $scope.senderId = userId;
            $scope.messages = JSON.parse(localStorage.getItem('userChat'));
            $scope.currentMessage = "";
            $scope.setToolbar($location.$$path,"Cabina de Soporte");
            $rootScope.showFooter = false; 
            $rootScope.showFooterRocks = false;
            $rootScope.showStage1Footer = false;
            $rootScope.showStage2Footer = false;
            $rootScope.showStage3Footer = false; 
            var interval = -1;
            moodleFactory.Services.GetUserChat(userId, currentUser.token, getUserRefreshChatCallback, errorCallback, true);                
            if ($location.hash() == 'top') {                
            $scope.scrollToTop('anchor-bottom'); // VERY Important: setting anchor hash value for first time to allow scroll to bottom
                $anchorScroll();
            } 
            else 
            {                  
                interval = setInterval(getMessages,60000);                                    
            }


            $(".typing-section textarea").keypress(function() {
                $(".typing-section textarea").focus();
            });


            function getUserRefreshChatCallback() {
                
            $scope.$emit('HidePreloader'); //hide preloader
                $scope.messages = JSON.parse(localStorage.getItem('userChat'));
                validateCabinaDeSoporte();

                setTimeout(function() {
                    $anchorScroll();
                }, 1000);                
            }


            function validateCabinaDeSoporte(){                
                 
                var finishCabinaSoporte = localStorage.getItem("finishCabinaSoporte/" + userId);
                var zone = '/ZonaDeVuelo';                                                            

                if(userCurrentStage == 2){
                    zone = '/ZonaDeNavegacion';                                    
                } 
                else if (userCurrentStage == 3){
                    zone = '/ZonaDeAterrizaje';                                    
                }
                if(!finishCabinaSoporte){
                    if(_startedActivityCabinaDeSoporte) {
                    var currentActivity = _getActivityByCourseModuleId(_startedActivityCabinaDeSoporte.coursemoduleid, _usercourse);    

                        if (!currentActivity.status) {
                            var dateStarted = new Date(_startedActivityCabinaDeSoporte.datestarted * 1000);
                            
                            var latestMessages =  _.filter($scope.messages, function(msg) {
                                return (new Date(msg.messagedate)) > dateStarted;
                            });
                            
                            var latestCoachAndSenderMessages = 0;
                            for(var m = 0; m < latestMessages.length; m++) {
                                var message = latestMessages[m];
                                
                                if(message.messagesenderid == $scope.senderId) {
                                    var nextMessage = (m + 1) < latestMessages.length ? latestMessages[m + 1] : null;
                                    
                                    if(nextMessage && nextMessage.messagesenderid != $scope.senderId) {
                                        latestCoachAndSenderMessages++;
                                    }
                                }
                            }

                            if (latestCoachAndSenderMessages >= 2) {                                
                                localStorage.removeItem("startedActivityCabinaDeSoporte/" + userId);   
                                _setLocalStorageItem("finishCabinaSoporte/" + userId, _startedActivityCabinaDeSoporte.activity_identifier);
                                $location.path(zone +'/CabinaDeSoporte/' + _startedActivityCabinaDeSoporte.activity_identifier);
                            }
                        }   
                    }                
                }
                else{                    
                    $location.path(zone +'/CabinaDeSoporte/' + finishCabinaSoporte);
                }
            }            

            function getMessages() {                
                    
                $scope.validateConnection(function() {
                    
                    var existingInterval = localStorage.getItem('Interval');
                    if($location.$$path != "/Chat"){
                        //Necesitamos volver a poner en marcha el refresh de notificaciones del chat
                        if(!existingInterval){       
                            clearInterval(interval);
                            interval = setInterval(getUserChat,180000);          
                            _setLocalStorageItem('Interval', interval);
                        }                    
                    } else {
                        //Si ya existe un intervalo hay que borrarlo                    
                       if(existingInterval) {
                           clearInterval(parseInt(existingInterval));
                           ClearLocalStorage("Interval");
                       }                

                        moodleFactory.Services.GetUserChat(userId, currentUser.token, getUserRefreshChatCallback, errorCallback, true);                                                                                            
                    }
                    
                }, function() {});
                    
            }   
            
            $scope.back = function () {
                var userCurrentStage = localStorage.getItem("currentStage");              
                $location.path('/ZonaDeVuelo/Dashboard/' + userCurrentStage + '/4');
            };

            $scope.sendMessage = function() {
                    
                $scope.validateConnection(function() {
                    
                    if($scope.currentMessage.trim() != "") {                    
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
                    
                    
                }, offlineCallback);        
            };
            
            function getUserChat() {     
                       
                $scope.validateConnection(function() {
                    
                    moodleFactory.Services.GetUserChat(_getItem("userId"), currentUser.token, function() {
                        
                        var chat = JSON.parse(localStorage.getItem('userChat'));
                        var userId = localStorage.getItem("userId");
                        var messagesFlow = [];
                        var messagesInterchange = 0;
                        var messagesToRead = _getItem("currentStage") * 2;
                        
                        var chatAmount = _.countBy(chat,function(messages){
                                messagesFlow.push(messages.messagesenderid != userId);
                                return messages.messagesenderid != userId;
                            });
                                                        
                        if (chatAmount.true != localStorage.getItem('chatAmountRead')) {
                            _setLocalStorageItem('chatRead',"false");
                        }
    
                        _setLocalStorageItem('chatAmountRead',chatAmount.true);
                        
                    }, errorCallback, true);                
                    
                    
                }, function() {});
                           
                                   
            }
            
            function getUserChatCallback() {                
            }
            
            function errorCallback() {   
            }

            function triggerAndroidKeyboardHide() {
                angular.element('#chatMessages').trigger('tap');
                $anchorScroll();
            }
                
        }
        }
    ]);
