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

            _httpFactory = $http;
            var _usercourse = JSON.parse(localStorage.getItem('usercourse'));
            var _startedActivityCabinaDeSoporte = JSON.parse(localStorage.getItem("startedActivityCabinaDeSoporte"));
            localStorage.setItem('chatRead', "true");
            $scope.senderId = localStorage.getItem('userId');
            $scope.messages = JSON.parse(localStorage.getItem('userChat'));
            $scope.currentMessage = "";
            
            $rootScope.pageName = "Chat";
            $rootScope.navbarBlue = false;
            $rootScope.showToolbar = true;
            $rootScope.showFooter = false; 
            $rootScope.showFooterRocks = false; 

            if(_startedActivityCabinaDeSoporte) {
                var activity = _startedActivityCabinaDeSoporte;

                if (!_usercourse.stages[activity.$stage].challenges[activity.$parentIndex].activities[activity.$index].status) {
                    //var rawDate = "2015:08:28 07:34:12".split(/:|\s|:/);
                    var rawDate = activity.$data.datestarted.split(/:|\s|:/);
                    var dateStarted = new Date(rawDate[0], rawDate[1] - 1, rawDate[2], rawDate[3], rawDate[4], rawDate[5]);
                    var latestMessages =  _.filter($scope.messages, function(msg) { 
                        return msg.messagedate > dateStarted && msg.messagesenderid != $scope.senderId;
                    });

                    if (latestMessages.length >= 2) {
                        var currentUser = JSON.parse(localStorage.getItem("CurrentUser"));
                        var data = {
                            userid: currentUser.userId,
                        };

                        _usercourse.stages[activity.$stage].challenges[activity.$parentIndex].activities[activity.$index].status = 1;
                        var courseModuleId = _usercourse.stages[activity.$stage].challenges[activity.$parentIndex].activities[activity.$index].coursemoduleid;

                        moodleFactory.Services.PutStartActivity(courseModuleId, data, _usercourse, currentUser.token, function () {
                        });
                    }
                }
            }

            $scope.scrollToTop();
            $scope.$emit('HidePreloader'); //hide preloader    
            
            $scope.back = function () {
                $location.path('/ProgramaDashboard');
            };
            
            $scope.sendMessage = function() {
                var newMessage = {
                    messagetext: $scope.currentMessage,
                    messagesenderid: $scope.senderId,                    
                    messagedate: new Date()
                };
                    
                $scope.messages.push(newMessage);
                $scope.currentMessage = "";
                                               
                moodleFactory.Services.PutUserChat($scope.senderId, newMessage, getUserChatCallback, errorCallback); 
            }
            
            function getUserChatCallback() {

            }
            
            function errorCallback() {                        
                        
            }
            
        }]);