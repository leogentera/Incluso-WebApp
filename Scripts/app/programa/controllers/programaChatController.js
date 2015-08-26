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

            _httpFactory          
            
            $scope.senderId = localStorage.getItem('userId');
            
            $scope.messages = JSON.parse(localStorage.getItem('userChat'));
            
            $scope.currentMessage = "";
            
            $rootScope.pageName = "Chat";
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
                
                var userId = localStorage.getItem('userId');
                
                var newMessage = {
                    messagetext: $scope.currentMessage,
                    messagesenderid: userId,                    
                    messagedate: new Date()
                    };
                    
                $scope.messages.push(newMessage);
                $scope.currentMessage = "";
                                
               
                moodleFactory.Services.PutUserChat(userId, newMessage, getUserChatCallback, errorCallback);
                
                
            }
            
            var getUserChatCallback = function(){                 
            }
            
            var errorCallback = function(){                        
                        
            }
            
        }]);