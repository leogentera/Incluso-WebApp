angular
    .module('incluso.programa.chatcontroller', ['ngSanitize'])
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

            //################################# ENTRY POINT ################################
            $scope.validateConnection(initController, offlineCallback);

            function initController() {

                _timeout = $timeout;
                _httpFactory = $http;
                $scope.setToolbar($location.$$path, "Cabina de Soporte");
                $rootScope.showFooter = false;
                $rootScope.showFooterRocks = false;
                $rootScope.showStage1Footer = false;
                $rootScope.showStage2Footer = false;
                $rootScope.showStage3Footer = false;

                //var _usercourse = JSON.parse(localStorage.getItem('usercourse'));
                var userId = localStorage.getItem('userId');
                var currentUser = JSON.parse(localStorage.getItem('CurrentUser'));
                $scope.senderId = currentUser.userId;
                $scope.messages = JSON.parse(localStorage.getItem('userChat/' + currentUser.userId));
                $scope.currentMessage = "";
                $location.hash("anchor-bottom");

                var interval = setInterval(getMessages, 60000); //Poll Messages continuously.

                $scope.$on('$routeChangeStart', function (next, current) {//If the user Leaves, kill setInterval.
                    clearInterval(interval);
                });

                function getMessages() {
                    $scope.validateConnection(function () {
                        moodleFactory.Services.GetUserChat(currentUser.userId, currentUser.token, getUserRefreshChatCallback, errorCallback, true);
                    }, function () {
                    });
                }

                $(".typing-section textarea").keypress(function () {
                    $(".typing-section textarea").focus();
                });

                //**************   GET CHAT CONVERSATION   *******************
                moodleFactory.Services.GetUserChat(currentUser.userId, currentUser.token, getUserRefreshChatCallback, errorCallback, true);
                //************************************************************

                function getUserRefreshChatCallback() {
                    $scope.$emit('HidePreloader'); //hide preloader
                    localStorage.setItem("chatRead/" + currentUser.userId, "true");   //Turn-off Chat Bubble.
                    var messages = localStorage.getItem('userChat/' + currentUser.userId); //Get all messages posted.

                    if (messages) {
                        $scope.messages = JSON.parse(messages);
                    } else {//null
                        $scope.messages = [];
                    }

                    _setLocalStorageItem('numMessages/' + currentUser.userId, $scope.messages.length);
                }

                // ****************** METHOD THAT RUNS WHEN USER SENDS A NEW CHAT POST ********************
                $scope.sendMessage = function () {
                    var newMessage;

                    $scope.validateConnection(function () {

                        if ($scope.currentMessage.trim() != "") {//If there is currently some text...
                            triggerAndroidKeyboardHide();

                            //Save Model for User Post...
                            newMessage = {
                                messagetext: $scope.currentMessage,
                                messagesenderid: currentUser.userId,
                                messagedate: new Date()
                            };

                            /* time out to avoid android lag on fully hiding keyboard */
                            $timeout(function () {
                                // 1) Save User Post in LS...
                                $scope.messages.push(newMessage);
                                $scope.currentMessage = ""; //Clean Text Area
                                _setLocalStorageItem('userChat/' + currentUser.userId, JSON.stringify($scope.messages));
                                $anchorScroll();

                                // 2) Save User Post Remotely.
                                moodleFactory.Services.PutUserChat(currentUser.userId, newMessage, getUserChatCallback, errorCallback);

                                if ($scope.messages.length == 1) {//This is the First post by USer...
                                    var firstTimeMessage = JSON.parse(localStorage.getItem("drupal/content/chat_generic_message")).node.chat_instructions;

                                    newMessage = {
                                        messagetext: firstTimeMessage,
                                        messagesenderid: 478, //Dev  Prod:350
                                        messagedate: new Date()
                                    };

                                    /* time out to avoid android lag on fully hiding keyboard */
                                    $timeout(function () {
                                        // 1) Save Generic Message in LS...
                                        $scope.messages.push(newMessage);
                                        _setLocalStorageItem('userChat/' + currentUser.userId, JSON.stringify($scope.messages));
                                        $anchorScroll();

                                        // 2) Save Generic Message Remotely.
                                        moodleFactory.Services.PutUserChat(currentUser.userId, newMessage, getUserChatCallback, errorCallback);
                                    }, 1000);
                                }
                            }, 1000);
                        }

                    }, offlineCallback);
                };

                function getUserChatCallback() {
                    _setLocalStorageItem('numMessages/' + currentUser.userId, $scope.messages.length);
                }

                function errorCallback() {
                }

                function triggerAndroidKeyboardHide() {
                    angular.element('#chatMessages').trigger('tap');
                    $anchorScroll();
                }
            }

            function offlineCallback() {
                $timeout(function () {
                    $location.path("/Offline");
                }, 1000);
            }
        }
    ]);
