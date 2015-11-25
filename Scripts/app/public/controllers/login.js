// http://weblogs.asp.net/dwahlin/archive/2013/09/18/building-an-angularjs-modal-service.aspx
angular
    .module('incluso.public.login', [])
    .controller('publicLoginController', [
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
            $scope.scrollToTop();
            $rootScope.showToolbar = false;
            $rootScope.showFooter = false;
            $rootScope.showFooterRocks = false;
            $rootScope.showStage1Footer = false;
            $rootScope.showStage2Footer = false;
            $rootScope.showStage3Footer = false;

            /* ViewModel */
            $scope.userCredentialsModel = {
                username: "",
                password: "",
                rememberCredentials: false,
                modelState: {
                    isValid: null,
                    errorMessages: []
                }
            };

            $scope.currentUserModel = {
                token: "",
                userId: ""
            };

            /* Watchers */
            $scope.$watch("userCredentialsModel.modelState.errorMessages", function (newValue, oldValue) {
                $scope.userCredentialsModel.modelState.isValid = (newValue.length === 0);
            });

            $scope.loadCredentials = function () {

                var txtCredentials = localStorage.getItem("Credentials");
                var txtCurrentUser = localStorage.getItem("CurrentUser");
                var userCredentials = null;
                var currentUser = null;

                console.log('loading..');
                

                if (txtCredentials) {
                    userCredentials = JSON.parse(txtCredentials);

                    $scope.userCredentialsModel.username = userCredentials.username;
                    $scope.userCredentialsModel.password = userCredentials.password;
                    $scope.userCredentialsModel.rememberCredentials = userCredentials.rememberCredentials;
                }

                if (txtCurrentUser) {
                    currentUser = JSON.parse(txtCurrentUser);

                    $scope.currentUserModel.token = currentUser.token;
                    $scope.currentUserModel.userId = currentUser.userId;
                }

                //autologin
                if (currentUser && currentUser.token && currentUser.token != "") {
                    $timeout(function(){ $scope.$emit('ShowPreloader'); }, 1500);
                    $timeout(function(){ $scope.validateConnection(function() { _loadDrupalResources(); }, function(){}); }, 2000);
                    moodleFactory.Services.GetAsyncUserCourse(_getItem("userId"), function() {
                            $scope.$emit('HidePreloader');
                            $location.path('/ProgramaDashboard');    
                        }, function() {
                            $scope.$emit('HidePreloader');
                            $location.path('/ProgramaDashboard');
                        }, true);
                }else {
                    $scope.$emit('HidePreloader');
                    console.log('preloader hidden');
                }
            };

            $scope.login = function (username, password) {
                $scope.validateConnection(loginConnectedCallback, offlineCallback);
            }
            
            function loginConnectedCallback() {
                // reflect loading state at UI
                $scope.$emit('ShowPreloader'); //show preloader
                console.log('preloading...'); //- debug
                
                _loadDrupalResources();

                $http(
                    {
                        method: 'POST',
                        url: API_RESOURCE.format("authentication"),
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                        data: $.param({ username: $scope.userCredentialsModel.username.toString().toLowerCase(), password: $scope.userCredentialsModel.password })
                    }
                    ).success(function (data, status, headers, config) {

                        console.log('successfully logged in');

                        //save token for further requests and autologin
                        $scope.currentUserModel = data;
                        $scope.currentUserModel.userId = data.id;

                        _setLocalStorageJsonItem("CurrentUser", $scope.currentUserModel);

                        _setToken(data.token);
                        _setId(data.id);

                        console.log('preparing for syncAll');
                        
                        //succesful credentials
                        _syncAll(function () {
                            console.log('came back from redirecting...');
                            
                            var course = moodleFactory.Services.GetCacheJson("course");
                            moodleFactory.Services.GetAsyncUserPostCounter(data.token, course.courseid, function(){ }, function() {}, true);
                            
                            $timeout(
                                function () {
                                    console.log('redirecting..');
                                    $scope.$emit('HidePreloader'); //hide preloader
                                    $location.path('/ProgramaDashboard');
                                }, 1000);
                        });

                        if ($scope.userCredentialsModel.rememberCredentials) {
                            _setLocalStorageJsonItem("Credentials", $scope.userCredentialsModel);
                        } else {
                            localStorage.removeItem("Credentials");
                        }

                    }).error(function (data, status, headers, config) { 
                        $scope.$emit('HidePreloader'); //hide preloader

                        var errorMessage = window.atob(data.messageerror);                            
                        $scope.userCredentialsModel.modelState.errorMessages = [errorMessage];
                        console.log(status + ": " + errorMessage);
                        //$scope.scrollToTop();
                        $scope.$emit('scrollTop'); //- scroll
                        $scope.isLogginIn = false;
                    });
            }

            $scope.loginWithFacebook = function () {
                
                $scope.validateConnection(loginWithFacebookConnectedCallback, offlineCallback);
            }
            
            function loginWithFacebookConnectedCallback() {
                $scope.$emit('ShowPreloader'); //show preloader
                //$location.path('/ProgramaDashboard');                
                var name = API_RESOURCE.format("");
                name = name.substring(0, name.length - 1);
                cordova.exec(FacebookLoginSuccess, FacebookLoginFailure, "SayHelloPlugin", "connectWithFacebook", [name]);
            }

            function FacebookLoginSuccess(data) {                
                console.log('successfully logged in ' + data);                
                var userFacebook = JSON.parse(data);
                
                _loadDrupalResources();

                //save token for further requests and autologin
                $scope.currentUserModel = userFacebook;
                $scope.currentUserModel.token = userFacebook.token;
                $scope.currentUserModel.userId = userFacebook.id;

                _setLocalStorageJsonItem("CurrentUser", $scope.currentUserModel);

                _setToken(userFacebook.token);
                _setId(userFacebook.id);

                console.log('preparing for syncAll');

                //succesful credentials
                _syncAll(function () {
                    console.log('came back from redirecting...');
                    
                    var course = moodleFactory.Services.GetCacheJson("course");
                    moodleFactory.Services.GetAsyncUserPostCounter(data.token, course.courseid, function(){}, function() {}, false);
                    
                    $timeout(
                        function () {
                            console.log('redirecting..');
                            $location.path('/ProgramaDashboard');
                            //$scope.$emit('HidePreloader');
                        }, 1000);
                });

                if ($scope.userCredentialsModel.rememberCredentials) {
                    _setLocalStorageJsonItem("Credentials", $scope.userCredentialsModel);
                } else {
                    localStorage.removeItem("Credentials");
                }
            }

            function FacebookLoginFailure(data) {
                $scope.$emit('HidePreloader');
                var errorMessage = window.atob(data.messageerror);
                $timeout(function () {                                                            
                    $scope.userCredentialsModel.modelState.errorMessages = [errorMessage];
                }, 1000);                
                console.log(status + ": " + errorMessage);
                //$scope.scrollToTop();
                $scope.$emit('scrollTop'); //- scroll
            }
            
            function offlineCallback() {
                $scope.userCredentialsModel.modelState.errorMessages = ["Se necesita estar conectado a internet para continuar"];
                $scope.$emit('scrollTop'); //- scroll
            }
            

            $scope.loadCredentials();

        }]);
