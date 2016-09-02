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
        'IntervalFactory',
        '$sce',
        function ($q, $scope, $location, $routeParams, $timeout, $rootScope, $http, $anchorScroll, $modal, IntervalFactory, $sce) {
            _timeout = $timeout;
            _httpFactory = $http;
            $scope.scrollToTop();
            $rootScope.showToolbar = false;
            $rootScope.showFooter = false;
            $rootScope.showFooterRocks = false;
            $rootScope.showStage1Footer = false;
            $rootScope.showStage2Footer = false;
            $rootScope.showStage3Footer = false;
            $rootScope._pixel = false;          
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

            $scope.currentVersion = getcurrentVersion();

            $scope.currentUserModel = {
                token: "",
                userId: ""
            };

            // PIXEL API call
            var requestAndroidId = function(){
                if (_getAPKVersion()>=228) {
                    cordova.exec(requestAndroidIDSucces, function(){ window.alert("Failed to get android ID.");}, "CallToAndroid", "requestAndroidId", []);
                }
                
            };
            var requestAndroidIDSucces = function(data){

                $http.post(API_RESOURCE.format("androidkey"), {key : data.key})
                    .then(function (response) {
                        if(response.data.result == true){
                            var androidID = data.key;
                            $rootScope.pixelURL = $sce.trustAsResourceUrl( "https://tbl.tradedoubler.com/report?organization=2027824&event=340891&leadNumber="+ androidID +"&tduid=de2a85e1a1793c382d77ac4ddede81cb&affId=2040798");
                            $rootScope._pixel = true;
                        }
                    }, function () {
                        console.log("Service Failed");
                    });

            };

            document.addEventListener('deviceready', function() {
                _updateDeviceVersionCache(function(){requestAndroidId();})
                
            });


            /* Watchers */
            $scope.$watch("userCredentialsModel.modelState.errorMessages", function (newValue, oldValue) {
                $scope.userCredentialsModel.modelState.isValid = (newValue.length === 0);
            });

            IntervalFactory.CancelUserNotificationWeeklyInterval();

            function validateModel() {
                var errors = [];

                var passwordPolicy = "Contraseña inválida";
                var usernamePolicy = "Nombre de usuario inválido";

                if (!$scope.loginForm.password.$valid) {
                    errors.push(passwordPolicy);
                }
                if (!$scope.loginForm.userName.$valid) {
                    errors.push(usernamePolicy);
                }
                $scope.userCredentialsModel.modelState.errorMessages = errors;
                return (errors.length === 0);
            }

            function loadQuizesAssets(userId, userToken, successCallback) {
                $scope.$emit('ShowPreloader');
                moodleFactory.Services.GetAsyncActivityQuizInfo($scope.coursemoduleid, userId, quizesArray, userToken,
                    successCallback,
                    loginErrorCallback,
                    true, false);
            }

            $scope.loadCredentials = function () {

                var txtCredentials = localStorage.getItem("Credentials");
                var txtCurrentUser = localStorage.getItem("CurrentUser");
                var userCredentials = null;
                var currentUser = null;

                //loading...
                if (txtCredentials) {
                    userCredentials = JSON.parse(txtCredentials);
                    if (userCredentials.rememberCredentials) {
                        //Preload username and password input fields...
                        $scope.userCredentialsModel.username = userCredentials.username;
                        $scope.userCredentialsModel.password = userCredentials.password;
                        $scope.userCredentialsModel.rememberCredentials = userCredentials.rememberCredentials;
                    }
                }

                if (txtCurrentUser) {
                    currentUser = JSON.parse(txtCurrentUser);
                    $scope.currentUserModel.token = currentUser.token;
                    $scope.currentUserModel.userId = currentUser.userId;
                }

                //autologin
                if (currentUser && currentUser.token && currentUser.token != "") {

                    $timeout(function () {
                        $scope.$emit('ShowPreloader');
                        $scope.validateConnection(function () {
                            $scope.$emit('HidePreloader');
                            if (txtCredentials) {
                                $scope.login();
                            }

                        }, function () {

                            $rootScope.OAUTH_ENABLED = false;
                            /* para auto iniciar sesión en offline es necesario que se haya cargado por lo menos una vez toda la información */
                            if (localStorage.getItem("leaderboard") && localStorage.getItem("Perfil/" + $scope.currentUserModel.userId)) {
                                $timeout(function () {
                                    _loadedDrupalResources = true;
                                    $location.path('/ProgramaDashboard');
                                }, 1);
                            }else{
                                loginErrorCallback();
                            }
                        });
                    }, 500);

                } else {
                    $scope.$emit('HidePreloader');
                }
            };

            $scope.login = function () {
                $rootScope.loaderForLogin = true; //For Login Preloader
                $rootScope.totalLoads = 16; //Number of Requests
                progressBar.set(0); //For Login Preloader
                $scope.loaderRandom(); //For Login Preloader
                $scope.$emit('ShowPreloader');
                $scope.userCredentialsModel.modelState.isValid = true;
                $scope.userCredentialsModel.modelState.errorMessages = [];
                $scope.validateConnection(loginConnectedCallback, loginErrorCallback);
            };

            $scope.navigateToRegister = function (username, password) {
                $scope.validateConnection(function () {
                    $timeout(function () {
                        $location.path('/Register');
                    }, 500);
                }, loginErrorCallback);
            };

            $scope.navigateToRecoverPassword = function (username, password) {
                $scope.validateConnection(function () {
                    $timeout(function () {
                        $location.path('/RecoverPassword');
                    }, 500);
                }, loginErrorCallback);
            };

            //Time Out Message modal
            $scope.openModal = function (size) {
                var modalInstance2 = $modal.open({
                    animation: $scope.animationsEnabled,
                    templateUrl: 'timeOutModal.html',
                    controller: 'timeOutLogin',
                    size: size,
                    windowClass: 'user-help-modal dashboard-programa'
                });
            };

            function loginConnectedCallback() {
                // reflect loading state at UI
                if (validateModel()) {
                    
                    var currentTime = new Date().getTime();
                    $http(
                        {
                            method: 'POST',
                            url: API_RESOURCE.format("authentication"),
                            timeout: 30000,
                            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                            data: $.param({
                                username: $scope.userCredentialsModel.username.toString().toLowerCase(),
                                password: $scope.userCredentialsModel.password
                            })
                        }
                    ).success(function (data, status, headers, config) {
                        $scope.incLoadedItem(); //1

                        localStorage.removeItem("offlineConnection");
                        //save token for further requests and autologin
                        $scope.currentUserModel = data;
                        $scope.currentUserModel.userId = data.id;

                        _setLocalStorageJsonItem("CurrentUser", $scope.currentUserModel);
                        _setLocalStorageJsonItem("Credentials", $scope.userCredentialsModel);
                        _setId(data.id);

                        /* loads drupal resources (content) */
                        _loadedDrupalResources = false;
                        _loadedDrupalResourcesWithErrors = false;
                        _loadedDrupalResources = false;
                        _loadedDrupalResources = false;
                        _loadedDrupalResourcesWithErrors = false;

                        drupalFactory.Services.GetDrupalContent(function () {
                            _loadedDrupalResources = true;
                            $scope.incLoadedItem(); //2

                            $timeout(
                                function () {
                                loginCordova();
                            },1000);
                            
                            $rootScope.OAUTH_ENABLED = false;
                            
                             //Run queue
                            moodleFactory.Services.ExecuteQueue(function () {
                                //Preparing for syncAll. Succesful credentials
                                var userId = _getItem("userId");
                                console.log("Before userCourse");
                                moodleFactory.Services.GetAsyncUserCourse(userId, function () {
                                    console.log("GetAsyncUserCourse");
                                    $scope.incLoadedItem(); //3
                                    
                                    var course = moodleFactory.Services.GetCacheJson("course");
                                    moodleFactory.Services.GetAsyncUserPostCounter(data.token, course.courseid, function () {
                                        console.log("GetAsyncUserPostCounter");
                                        $scope.incLoadedItem(); //4
    
                                        IntervalFactory.StartUserNotificationWeeklyInterval();
    
                                        moodleFactory.Services.GetAsyncForumDiscussions(85, data.token, function () {
                                            console.log("GetAsyncForumDiscussions");
                                            $scope.incLoadedItem(); //5
                                            
                                            moodleFactory.Services.GetAsyncForumDiscussions(91, data.token, function () {
                                                $scope.incLoadedItem(); //6
                                            
                                                //Load Quizzes assets
                                                loadQuizesAssets(data.id, data.token, function() {
                                                    console.log("LoadQuizesAssets");
                                                    $scope.incLoadedItem(); //7
                                                    
                                                    moodleFactory.Services.GetAsyncMultipleChallengeInfo(data.token, function(){
                                                        console.log("GetAsyncMultipleChallengeInfo");
                                                        $scope.incLoadedItem(); //8 y 9
                                                        
                                                        moodleFactory.Services.GetUserNotification(userId, course.courseid, data.token, function() {
                                                            console.log("GetUserNotification");
                                                            $scope.incLoadedItem(); //10
                                                            
                                                            moodleFactory.Services.GetAsyncProfile(userId, data.token, function(){
                                                                $scope.incLoadedItem(); //11
                                                                
                                                                moodleFactory.Services.GetAsyncStars(userId, data.token, function() {
                                                                    $scope.incLoadedItem(); //12
                                                                    
                                                                    moodleFactory.Services.CountLikesByUser(course.courseid, data.token, function() {
                                                                        $scope.incLoadedItem(); //13
                                                                    
                                                                        moodleFactory.Services.GetAsyncLeaderboard(course.courseid, data.token, function () {
                                                                            $scope.incLoadedItem(); //14
                                                                            
                                                                            moodleFactory.Services.GetProfileCatalogs(data.token, function(){
                                                                                $scope.incLoadedItem();//15
                                                                                
                                                                                moodleFactory.Services.GetProfilePoints(userId, course.courseid, data.token,function(){
                                                                                    $scope.incLoadedItem();//16
                                                                                    
                                                                                    $timeout(function () {
                                                                                        //$scope.$emit('HidePreloader');
                                                                                        if ($rootScope.loaderForLogin) {//To avoid redirect when there is a connection error.
                                                                                            $location.path('/ProgramaDashboard');
                                                                                        }
                                                                                    }, 1);
                                                                                }, loginErrorCallback, true);
                                                                            }, loginErrorCallback, true);
                                                                        }, loginErrorCallback, true);
                                                                    }, loginErrorCallback, true);
                                                                }, loginErrorCallback, true);
                                                            }, loginErrorCallback,true);
                                                        },loginErrorCallback, true);
                                                    }, loginErrorCallback, true, true);
                                                });
                                            }, loginErrorCallback, true);
                                        }, loginErrorCallback, true, true);
                                    }, loginErrorCallback, true, false);
                                }, loginErrorCallback,true,true);
                            });                            
                        }, loginErrorCallback, true, true);

                    }).error(function (data, status, headers, config) {
                        $scope.userCredentialsModel.modelState.isValid = false;
                        var errorMessage = "";
                        if (data && data.messageerror) {
                            errorMessage = window.atob(data.messageerror);
                        } else {
                            errorMessage = "Se necesita estar conectado a Internet para continuar";
                        }

                        $scope.$emit('HidePreloader');
                        progressBar.set(0); //For Login Preloader
                        $scope.$emit('scrollTop');
                        clearLocalStorage();

                        $scope.userCredentialsModel.modelState.errorMessages = [errorMessage];
                    });

                } else {
                    $timeout(function () {
                        $scope.$emit('HidePreloader');
                        $scope.$emit('scrollTop');
                    }, 1);
                }
            }
        
            function loginCordova() {
                var currentUser = JSON.parse(localStorage.getItem("CurrentUser"));
                if (currentUser && currentUser.token) {
                    var objectToken = {
                        moodleAPI: API_RESOURCE.format(''),
                        moodleToken: currentUser.token
                    };
                    cordova.exec(function () {}, function () {}, "CallToAndroid", "login", [objectToken]);
                }
            }
        
            $scope.loginWithFacebook = function () {
                $rootScope.loaderForLogin = true; //For Login Preloader
                $rootScope.totalLoads = 12; //Number of Requests
                progressBar.set(0); //For Login Preloader
                $scope.loaderRandom(); //For Login Preloader
                $scope.$emit('ShowPreloader');

                $timeout(function(){
                    $scope.validateConnection(loginWithFacebookConnectedCallback, loginErrorCallback);
                }, 500);
            };

            function loginWithFacebookConnectedCallback() {
                var name = API_RESOURCE.format("");
                name = name.substring(0, name.length - 1);
                $scope.userCredentialsModel.modelState.isValid = true;
                $scope.userCredentialsModel.modelState.errorMessages = [];

                if (window.mobilecheck()) {
                    cordova.exec(FacebookLoginSuccess, FacebookLoginFailure, "SayHelloPlugin", "connectWithFacebook", [name]);
                }
            }

            function FacebookLoginSuccess(data) {
                console.log("Facebook conected callback");
                var userFacebook = JSON.parse(data);

                /* loads drupal resources (content) */
                _loadedDrupalResources = false;
                _loadedDrupalResourcesWithErrors = false;
                _loadedDrupalResources = false;
                _loadedDrupalResources = false;
                _loadedDrupalResourcesWithErrors = false;

                drupalFactory.Services.GetDrupalContent(function () {
                    _loadedDrupalResources = true;
                    $scope.incLoadedItem(); //1
                }, function (obj) {
                        _loadedDrupalResources = false;
                        _loadedDrupalResourcesWithErrors = true;
                        loginErrorCallback();
                    }, true);
                /*******************  ******/

                $rootScope.OAUTH_ENABLED = true;

                //save token for further requests and autologin
                $scope.currentUserModel = userFacebook;
                $scope.currentUserModel.token = userFacebook.token;
                $scope.currentUserModel.userId = userFacebook.id;

                _setLocalStorageJsonItem("CurrentUser", $scope.currentUserModel);

                _setId(userFacebook.id);

                //Run queue
                moodleFactory.Services.ExecuteQueue(function () {
                    //Preparing for syncAll...                    
                    var userId = _getItem("userId");
                    //succesful credentials
                    moodleFactory.Services.GetAsyncUserCourse(userId, function () {
                        console.log("GetAsyncUserCourse");
                        $scope.incLoadedItem(); //NOT FORCE REFRESH

                        var course = moodleFactory.Services.GetCacheJson("course");
                        console.log("Before userCourse");
                        moodleFactory.Services.GetAsyncUserPostCounter(userFacebook.token, course.courseid, function () {
                            console.log("GetAsyncUserPostCounter");
                            $scope.incLoadedItem(); ////NOT FORCE REFRESH
                            
                            IntervalFactory.StartUserNotificationWeeklyInterval();

                            moodleFactory.Services.GetAsyncForumDiscussions(85, userFacebook.token, function () {
                                console.log("GetAsyncForumDiscussions");
                                $scope.incLoadedItem(); //2
                                
                                 moodleFactory.Services.GetAsyncForumDiscussions(91, userFacebook.token, function () {
                                    $scope.incLoadedItem(); //3
                                    
                                    moodleFactory.Services.GetAsyncMultipleChallengeInfo(userFacebook.token, function(){
                                        console.log("GetAsyncMultipleChallengeInfo");
                                        $scope.incLoadedItem(); //4 y 5
                                        
                                        //Load Quizzes assets
                                        loadQuizesAssets(userFacebook.id, userFacebook.token, function() {
                                            console.log("LoadQuizesAssets");
                                            $scope.incLoadedItem(); //6
                                            
                                            moodleFactory.Services.GetUserNotification(userId, course.courseid, userFacebook.token, function () {
                                                $scope.incLoadedItem(); //10
                                                
                                                moodleFactory.Services.GetAsyncProfile(userId, userFacebook.token, function(){
                                                    $scope.incLoadedItem(); //11

                                                    moodleFactory.Services.GetAsyncStars(userId, userFacebook.token, function() {
                                                        $scope.incLoadedItem(); //12
                                                        
                                                        moodleFactory.Services.CountLikesByUser(course.courseid, userFacebook.token, function() {
                                                            $scope.incLoadedItem(); //13
                                                            
                                                            moodleFactory.Services.GetAsyncLeaderboard(course.courseid, userFacebook.token, function () {
                                                                $scope.incLoadedItem();//14
                                                                
                                                                moodleFactory.Services.GetProfileCatalogs(userFacebook.token, function(){
                                                                    $scope.incLoadedItem();//15
                                                                    
                                                                    moodleFactory.Services.GetProfilePoints(userId, course.courseid, userFacebook.token,function(){
                                                                        $scope.incLoadedItem();//16
                                                                        
                                                                        
                                                                        $timeout(function () {
                                                                            if (userFacebook.is_new == true) {
                                                                                $location.path('/Tutorial');
                                                                            } else {
                                                                                $location.path('/ProgramaDashboard');
                                                                            }
                                                                        }, 1000);
                                                                    }, loginErrorCallback, true);
                                                                }, loginErrorCallback, true);
                                                            }, loginErrorCallback, true);
                                                        }, loginErrorCallback, true);
                                                    },loginErrorCallback, true);
                                                },loginErrorCallback, true);
                                            },loginErrorCallback, true);
                                        });
                                    }, loginErrorCallback, true);
                                }, loginErrorCallback, true);
                            }, loginErrorCallback, true);
                        }, loginErrorCallback, false);
                    }, loginErrorCallback,true,true);
                });
                localStorage.removeItem("Credentials");                
            }

            function FacebookLoginFailure(data) {
                $scope.userCredentialsModel.modelState.isValid = false;
                var errorMessage = "";
                if (data && data.messageerror) {
                    errorMessage = window.atob(data.messageerror);
                } else {
                    errorMessage = "Se necesita estar conectado a Internet para continuar";
                }

                $rootScope.loaderForLogin = false; //For Login Preloader
                progressBar.set(0); //For Login Preloader
                                
                clearLocalStorage();
                $scope.$emit('HidePreloader');
                
                $timeout(function () {                                            
                    $scope.userCredentialsModel.modelState.errorMessages = [errorMessage];
                    $scope.$emit('scrollTop');
                }, 1);
            }

            function loginErrorCallback(obj) {
                console.log("login error callback");
                $scope.userCredentialsModel.modelState.isValid = false;
                $rootScope.loaderForLogin = false; //For Login Preloader
                progressBar.set(0); //For Login Preloader
                $scope.loaderRandom(); //For Login Preloader
                localStorage.removeItem("CurrentUser");
                $scope.$emit('HidePreloader');
                $timeout(function () {                                            
                    $scope.userCredentialsModel.modelState.errorMessages = ["Se necesita estar conectado a Internet para continuar"];
                    $scope.$emit('scrollTop');
                }, 1);
            }

            if(!localStorage.getItem("offlineConnection")){
                $scope.loadCredentials();                
            }else {
                var Credentials = JSON.parse(localStorage.getItem("Credentials"));

                $timeout(function () {
                    $scope.userCredentialsModel.modelState.isValid = false;

                    if (Credentials) {//Show user credentials, to avoid writing again
                        $scope.userCredentialsModel.username = Credentials.username;
                        $scope.userCredentialsModel.password = Credentials.password;
                    }

                    $scope.userCredentialsModel.modelState.errorMessages = ["Se necesita estar conectado a Internet para continuar"];
                    $scope.$emit('HidePreloader');
                    $scope.$emit('scrollTop');
                    localStorage.removeItem("offlineConnection");
                }, 1000);
            }

        }]).controller('timeOutLogin', function ($scope, $modalInstance, $route) {//TimeOut Robot

    $scope.ToDashboard = function () {
        $scope.$emit('ShowPreloader');
        $modalInstance.dismiss('cancel');
        //$route.reload();
    };
});
