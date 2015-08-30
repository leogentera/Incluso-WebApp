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
            //$scope.PreloaderModalInstance = null;
            //$scope.scrollToTop();
            $scope.$emit('scrollTop'); //- scroll
            $rootScope.showToolbar = false;
            $rootScope.showFooter = false;
            // $scope.preloader = angular.element(document.getElementById('spinner')).scope();
            // $scope.preloader.loading = true;

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
                    $location.path('/ProgramaDashboard');
                }

                //$scope.preloader.loading = false;  //- test
                $scope.$emit('HidePreloader');
                console.log('preloader hidden');

            }

            $scope.login = function (username, password) {  
                console.log('Login action started'); //- debug

                var isModelValid = validateModel();
                console.log('isValid: ' + isModelValid); //- debug

                if (isModelValid) {

                    // reflect loading state at UI
                    $scope.$emit('ShowPreloader'); //show preloader
                    console.log('preloading...'); //- debug

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
                            $scope.currentUserModel.token = data.token;
                            $scope.currentUserModel.userId = data.id;

                            localStorage.setItem("CurrentUser", JSON.stringify($scope.currentUserModel));

                            _setToken(data.token);
                            _setId(data.id);

                            console.log('preparing for syncAll');                            
                            
                            //succesful credentials
                            _syncAll(function () {
                                console.log('came back from redirecting...');
                                $timeout(
                                    function () {
                                        console.log('redirecting..');
                                        $scope.$emit('HidePreloader'); //hide preloader
                                        $location.path('/ProgramaDashboard');
                                    }, 1000);
                            });

                            if ($scope.userCredentialsModel.rememberCredentials) {
                                localStorage.setItem("Credentials", JSON.stringify($scope.userCredentialsModel));
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
                } else {
                    console.log('End'); //- debug
                    //$scope.scrollToTop();
                    $scope.$emit('scrollTop'); //- scroll
                }
            }

            $scope.loginWithFacebook = function () {
                $scope.$emit('ShowPreloader'); //show preloader
                //$location.path('/ProgramaDashboard');                
                var name = API_RESOURCE.format("");
                name = name.substring(0, name.length - 1);
                cordova.exec(FacebookLoginSuccess, FacebookLoginFailure, "SayHelloPlugin", "connectWithFacebook", [name]);
                
            }
            
            $scope.scrollToTop = function(){
                $anchorScroll(0);
            }

            function FacebookLoginSuccess(data) {                
                console.log('successfully logged in ' + data);                
                var userFacebook = JSON.parse(data);

                //save token for further requests and autologin
                $scope.currentUserModel.token = userFacebook.token;
                $scope.currentUserModel.userId = userFacebook.id;

                localStorage.setItem("CurrentUser", JSON.stringify($scope.currentUserModel));

                _setToken(userFacebook.token);
                _setId(userFacebook.id);

                console.log('preparing for syncAll');

                //succesful credentials
                _syncAll(function () {
                    console.log('came back from redirecting...');
                    $timeout(
                        function () {
                            console.log('redirecting..');
                            $location.path('/ProgramaDashboard');
                            //$scope.$emit('HidePreloader');
                        }, 1000);
                });

                if ($scope.userCredentialsModel.rememberCredentials) {
                    localStorage.setItem("Credentials", JSON.stringify($scope.userCredentialsModel));
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

            function validateModel() {
                var errors = [];

                 var passwordPolicy = "debe ser almenos de 8 caracterres, incluir un caracter especial, una letra mayúscula, una minúscula y un número.";
                
                if (!$scope.loginForm.userName.$valid) { errors.push("formato de usuario incorrecto."); }
                if (!$scope.loginForm.password.$valid) { errors.push("formato de contraseña incorrecto. La contraseña " + passwordPolicy); }

                $scope.userCredentialsModel.modelState.errorMessages = errors;

                return (errors.length === 0);
            }

            function keepUserInformation(userId) {
                $http(
                {
                    method: 'GET',
                    url: API_RESOURCE.format("userprofile/" + userId),
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                }
                ).success(function (data, status, headers, config) {
                    localStorage.setItem("profile", JSON.stringify(data));
                }).error(function (data, status, headers, config) {

                });
            }

            $scope.loadCredentials();
            // $location.path('/ProgramaDashboardEtapa/' + 1); 
        }]);
