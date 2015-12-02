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

            function loadQuizesAssets(userId, userToken) {
                $scope.$emit('ShowPreloader'); //show preloader

                var quizIdentifiers = [1001, 1005, 1006, 1007, 1009, 2001, 2007, 2016, 2023, 3101, 3601];
                var i;
                var parentActivity;
                var childActivity = null;

                for (i = 0; i < quizIdentifiers.length; i++) {

                    parentActivity = getActivityByActivity_identifier(quizIdentifiers[i]);

                    if (parentActivity != null) {

                        if (parentActivity.activities) {//The activity HAS a "child" activity

                            childActivity = parentActivity.activities[0];
                            $scope.coursemoduleid = childActivity.coursemoduleid;
                            $scope.activityname = childActivity.activityname;
                            $scope.activity_status = childActivity.status;

                        } else {//The activity has no "child" activity
                            $scope.coursemoduleid = parentActivity.coursemoduleid;
                            $scope.activityname = parentActivity.activityname;
                            $scope.activity_status = parentActivity.status;
                        }

                        //console.log("activityname = " + $scope.activityname + "; Activity status = " + $scope.activity_status + "; Coursemoduleid = " + $scope.coursemoduleid);

                        if ($scope.activity_status === 1) {//If the activity is currently finished
                            //console.log("The activity status is FINISHED");

                            // GET request; example: http://incluso.definityfirst.com/RestfulAPI/public/activity/150?userid=656
                            moodleFactory.Services.GetAsyncActivityQuizInfo($scope.coursemoduleid, userId, userToken, storeQuiz, errorCallQuiz, true);

                        } else {
                            //console.log("The activity HAS NOT BEEN FINISHED");
                            moodleFactory.Services.GetAsyncActivityQuizInfo($scope.coursemoduleid, -1, userToken, storeQuiz, errorCallQuiz, true);
                        }

                    } else {
                        // When parentActivity == null.
                        console.log("Activity is NOT defined");
                        $location.path('/');
                    }
                }
            }

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
                    $timeout(function(){ $scope.validateConnection(function() {
                        _loadDrupalResources();

                        //Run queue
                        moodleFactory.Services.ExecuteQueue(function(){
                        });

                        //Load Quizzes assets --------------------------------------------------------------------------
                        $scope.currentUser = JSON.parse(localStorage.getItem("CurrentUser"));
                        $scope.userprofile = JSON.parse(localStorage.getItem("profile/" + localStorage.getItem("userId")));
                        loadQuizesAssets($scope.userprofile.id, $scope.currentUser.token);
                        GetExternalAppData();
                        //----------------------------------------------------------------------------------------------

                    }, function(){}); }, 2000);
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
                $scope.$emit('ShowPreloader');
                $scope.validateConnection(function(){
                    loginConnectedCallback();
                }, offlineCallback);
            };
            
            $scope.navigateToRegister = function (username, password) {                
                $scope.validateConnection(function() {                    
                    $location.path('/Register');
                }, offlineCallback);
            };
            
            $scope.navigateToRecoverPassword = function (username, password) {                
                $scope.validateConnection(function() {                    
                    $location.path('/RecoverPassword');
                }, offlineCallback);
            };


            function storeQuiz(quizObject) {
            }

            function errorCallQuiz() {
            }

            function loginConnectedCallback() {
                // reflect loading state at UI
                //$scope.$emit('ShowPreloader'); //show preloader
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

                            console.log('successfully logged in *******************');

                            //save token for further requests and autologin
                            $scope.currentUserModel = data;
                            $scope.currentUserModel.userId = data.id;

                            _setLocalStorageJsonItem("CurrentUser", $scope.currentUserModel);
                            _setToken(data.token);
                            _setId(data.id);

                        //Run queue
                        moodleFactory.Services.ExecuteQueue(function (){
                           console.log('preparing for syncAll');

                            //succesful credentials
                            _syncAll(function () {
                                console.log('came back from redirecting...');

                                var course = moodleFactory.Services.GetCacheJson("course");
                                moodleFactory.Services.GetAsyncUserPostCounter(data.token, course.courseid, function(){

                                    //Load Quizzes assets --------------------------------------------------------------
                                    loadQuizesAssets(data.id, data.token);
                                    GetExternalAppData();
                                    //----------------------------------------------------------------------------------

                                }, function() {}, true);

                                $timeout(
                                    function () {
                                        console.log('redirecting..');
                                        $scope.$emit('HidePreloader'); //hide preloader
                                        $location.path('/ProgramaDashboard');
                                    }, 1000);
                            }); 
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
            };

            function loginWithFacebookConnectedCallback() {
                $scope.$emit('ShowPreloader'); //show preloader
                //$location.path('/ProgramaDashboard');                
                var name = API_RESOURCE.format("");
                name = name.substring(0, name.length - 1);
                if (window.mobilecheck()) {
                    cordova.exec(FacebookLoginSuccess, FacebookLoginFailure, "SayHelloPlugin", "connectWithFacebook", [name]);
                }
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

                //Run queue
                moodleFactory.Services.ExecuteQueue(function(){
                    console.log('preparing for syncAll');

                    //succesful credentials
                    _syncAll(function () {
                        console.log('came back from redirecting...');
                        
                        var course = moodleFactory.Services.GetCacheJson("course");
                        moodleFactory.Services.GetAsyncUserPostCounter(data.token, course.courseid, function(){}, function() {}, false);

                            //Load Quizzes assets ----------------------------------------------------------------------
                            loadQuizesAssets(userFacebook.id, userFacebook.token);
                            GetExternalAppData();
                            //------------------------------------------------------------------------------------------
                        
                        $timeout(
                            function () {
                                console.log('redirecting..');
                                if(userFacebook.is_new == true){
                                    $location.path('/Tutorial');
                                }else{
                                    $location.path('/ProgramaDashboard');
                                }
                                //$scope.$emit('HidePreloader');
                            }, 1000);
                    });
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
            
            $scope.$emit('scrollTop');
            function offlineCallback() {
                $scope.userCredentialsModel.modelState.errorMessages = ["Se necesita estar conectado a internet para continuar"];
                $scope.$emit('scrollTop'); //- scroll
                $scope.$emit('HidePreloader');
            }

            var GetExternalAppData = function(){
                var courseModuleIds = [{"id":1039, "userInfo":true}, {"id":2012, "userInfo":false},{"id":2017, "userInfo":true}, {"id":3302, "userInfo":false}, {"id":3402, "userInfo":true}];
                for (var i = 0; i < courseModuleIds.length; i++) {
                    var courseModule = courseModuleIds[i];
                    var parentActivity = getActivityByActivity_identifier(courseModule.id);
                    if (parentActivity && parentActivity.activities && parentActivity.activities.length > 0) {
                        for (var j = 0; j < parentActivity.activities.length; j++) {
                            var activity = parentActivity.activities[j];
                            var user = $scope.currentUserModel.userId;
                            var token = $scope.currentUserModel.token;
                            moodleFactory.Services.GetAsyncActivity(activity.coursemoduleid, token, storeQuiz, errorCallQuiz, true);
                            if (courseModule.userInfo) {
                                if (courseModule.id != 1039 || (courseModule.id == 1039 && activity.activityname.toLowerCase().indexOf("resultados") >= 0)) {
                                    moodleFactory.Services.GetAsyncActivity(activity.coursemoduleid + "?userid=" + user, token, storeQuiz,errorCallQuiz, true);
                                }
                            }
                        }
                    }
                };
            }

            $scope.loadCredentials();

        }]);
