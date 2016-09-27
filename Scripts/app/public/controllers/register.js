// http://weblogs.asp.net/dwahlin/archive/2013/09/18/building-an-angularjs-modal-service.aspx
angular
    .module('incluso.public.register', [])
    .controller('publicRegisterController', [
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
        function ($q, $scope, $location, $routeParams, $timeout, $rootScope, $http, $anchorScroll, $modal, IntervalFactory) {

            _timeout = $timeout;
            _httpFactory = $http;
            var dpValue;
            $scope.$emit('scrollTop');

            //var isConfirmedPasswordValid = false;
            $scope.currentPage = 1;
            $scope.isRegistered = false;
            $rootScope.showToolbar = false;
            $rootScope.showFooter = false;
            $rootScope.showFooterRocks = false;
            $rootScope.showStage1Footer = false;
            $rootScope.showStage2Footer = false;
            $rootScope.showStage3Footer = false;
            $scope.mobilecheck = _comboboxCompat;
            $scope.isNewFacebookUser = $routeParams.facebookUser == "true" ? true : false;
            $scope.isUpdate = $routeParams.isUpdate == "true" ? true: false;

            
            $scope.registerModel = {
                username: undefined,
                firstname: "",
                lastname: "",
                birthday: "",
                gender: "",
                country: "",                
                email: "",
                password: undefined,
                confirmPassword: undefined,
                secretQuestion: "",
                secretAnswer: "",
                metThisAppBy: "",
                termsAndConditions: false,
                modelState: {
                    isValid: null,
                    errorMessages: []
                }
            };
            
            function initController() {
                
                if ($scope.isNewFacebookUser) {
                    var facebookUser = JSON.parse(localStorage.getItem("CurrentUser"));
                    if (facebookUser) {
                        $scope.registerModel.firstname = facebookUser.first_name;
                        $scope.registerModel.lastname = facebookUser.last_name;
                        $scope.registerModel.gender = facebookUser.gender;
                        $scope.registerModel.email = facebookUser.email;
                    }
                }else if($scope.isUpdate) {
                    var userId = moodleFactory.Services.GetCacheObject("userId");
                    var profileModel = JSON.parse(localStorage.getItem("Perfil/" + userId));
                    $scope.registerModel.email = profileModel.email;
                    $scope.registerModel.firstname = profileModel.firstname;
                    $scope.registerModel.lastname = profileModel.lastname;
                    $scope.registerModel.country = profileModel.address.country;
                }
            }
            
            function offlineCallback() {
                $timeout(function () {
                    $scope.registerModel.modelState.errorMessages = ["Se necesita estar conectado a Internet para continuar"];
                    $scope.$emit('scrollTop');
                }, 1000);
            }

            $scope.genderItems = _getCatalogValuesBy("gender");
            $scope.countryItems = _getCatalogValuesBy("country");
            $scope.securityquestionItems = _getCatalogValuesBy("secretquestion");
            $scope.metThisAppByItems = _getCatalogValuesBy("metThisAppBy");
            $scope.showPlaceHolder = true;

            

            $scope.currentUserModel = {
                token: "",
                userId: ""
            };

            $scope.recoverPasswordModel = {
                modelState: {
                    isValid: null,
                    errorMessages: []
                }
            };

            /* open terms and conditions modal */
            $scope.openModal = function (size) {
                var modalInstance = $modal.open({
                    animation: $scope.animationsEnabled,
                    templateUrl: 'termsAndConditionsModal.html',
                    controller: 'termsAndConditionsController',
                    size: size,
                    windowClass: 'modal-theme-default terms-and-conditions',
                    backdrop: 'static'
                });
            };

            $scope.openModalUsername = function (size) {
                var modalInstance = $modal.open({
                    animation: $scope.animationsEnabled,
                    templateUrl: 'usernameInfoModal.html',
                    controller: 'termsAndConditionsController',
                    size: size,
                    windowClass: 'modal-theme-default terms-and-conditions',
                    backdrop: 'static'
                });
            };

            $scope.openModalPassword = function (size) {
                var modalInstance = $modal.open({
                    animation: $scope.animationsEnabled,
                    templateUrl: 'passwordInfoModal.html',
                    controller: 'termsAndConditionsController',
                    size: size,
                    windowClass: 'modal-theme-default terms-and-conditions',
                    backdrop: 'static'
                });
            };

            $scope.login = function () {
                $location.path('/');
            };


            $scope.showPlaceHolderBirthday = function () {
                var bd = $("input[name='birthday']").val();
                if (bd) {
                    $scope.showPlaceHolder = false;
                } else {
                    $scope.showPlaceHolder = true;
                }
            };

            $scope.validateConnection(function () {
            }, offlineCallback);

            $scope.$emit('HidePreloader');

            $scope.showPasswd = false;
            $scope.showPasswdCf = false;

            /* Watchers */
            $scope.$watch("registerModel.modelState.errorMessages", function (newValue, oldValue) {
                $scope.registerModel.modelState.isValid = (newValue.length === 0);
            });

            $scope.$watch("registerModel.password", function (newValue, oldValue) {
                var passWordPattern = /^(?=.*[a-zñ])(?=.*[A-ZÑ])(?=.*\d)(?=.*[_\W])[\S]{8,}$/;
                $scope.showPasswd = passWordPattern.test(newValue) && $scope.registerModel.password;
                $scope.showPasswdCf = $scope.registerModel.confirmPassword == newValue && $scope.registerModel.confirmPassword && $scope.showPasswd;
            });

            $scope.$watch("registerModel.confirmPassword", function (newValue, oldValue) {
                var passWordPattern = /^(?=.*[a-zñ])(?=.*[A-ZÑ])(?=.*\d)(?=.*[_\W])[\S]{8,}$/;
                $scope.showPasswd = passWordPattern.test($scope.registerModel.password) && $scope.registerModel.password;
                $scope.showPasswdCf = newValue == $scope.registerModel.password && $scope.registerModel.confirmPassword && $scope.showPasswd;
            });

            $scope.register = function () {
                $scope.validateConnection(registerConnectedCallback, offlineCallback);
            };

            function registerConnectedCallback() {
                //Register.
                localStorage.removeItem("Credentials");

                $rootScope.totalLoads = 11; //Number of Login requests.
                $rootScope.comeFromRegister = true;

                if (validateModel()) {
                    $rootScope.loaderForLogin = true;
                    progressBar.set(0);
                    //- $scope.loaderRandom();
                    $scope.$emit('ShowPreloader');
                    registerUser();
                } else {
                    $scope.$emit('scrollTop');
                }
            }

            function validateModel() {
                var errors = [];
                var datePickerValue = $("input[name=birthday]").val();
                dpValue = datePickerValue;
                var age = datePickerValue == "" ? age = 0 : calculate_age();

                
                if (!$scope.registerForm.userName.$valid) {
                    errors.push("Formato de nombre de usuario incorrecto.");
                }
                
                if (!$scope.registerForm.firstName.$valid) {
                    errors.push("Formato de nombre incorrecto.");
                }
                if (!$scope.registerForm.lastName.$valid) {
                    errors.push("Formato de apellido paterno incorrecto.");
                }                
                if (!$scope.registerModel.gender && !$scope.isNewFacebookUser && !$scope.isUpdate) {
                    errors.push("Género inválido.");
                }
                if (!$scope.registerModel.country) {
                    errors.push("País inválido.");
                }
                if (!$scope.registerForm.email.$valid) {
                    errors.push("Formato de correo incorrecto.");
                }
                if (!$scope.registerModel.secretQuestion && !$scope.isNewFacebookUser && !$scope.isUpdate) {
                    errors.push("Pregunta secreta inválida.");
                }
                if (!$scope.registerForm.secretAnswer.$valid && !$scope.isNewFacebookUser && !$scope.isUpdate) {
                    errors.push("Respuesta secreta inválida.");
                }
                if (!$scope.registerModel.metThisAppBy) {
                    errors.push("Debe indicar cómo conoció esta app.")
                }
                if (!$scope.registerModel.termsAndConditions) {
                    errors.push("Debe aceptar los términos y condiciones.");
                }
                if (isNaN(age) || age < 13) {
                    errors.push("Debes ser mayor de 13 años para poder registrarte.");
                }
                $timeout(function () {
                    $scope.registerModel.modelState.errorMessages = errors;

                }, 1);
                return (errors.length === 0);
            }

            $scope.clearErrorMessages = function(){
                $scope.registerModel.modelState.errorMessages = [];
            }
            
            var registerUser = function () {
            
                if ($scope.isUpdate && !$scope.isNewFacebookUser) {
                    var userId = localStorage.getItem("userId");
                    var profileModel = JSON.parse(localStorage.getItem("Perfil/" + userId));
                    profileModel.username = $scope.registerModel.username.toString().toLowerCase();
                    moodleFactory.Services.PutAsyncProfile(userId, profileModel,
                        function (data) {//Save profile successful...                            
                            $scope.incLoadedItem(); //1
                            $scope.isRegistered = true;
                            $scope.registerModel.modelState.isValid = true;
                            $scope.$emit('scrollTop');
                            
                            var userData = JSON.parse(localStorage.getItem("CurrentUser"));
                            $scope.autologin(userData);
                        },function (data) {
                            var errorMessage;    
                            if ((data != null && data.messageerror != null)) {
                                errorMessage = window.atob(data.messageerror);
                            } else {
                                errorMessage = "Se necesita estar conectado a Internet para continuar.";
                            }        
                            $scope.$emit('HidePreloader');
                            $scope.$emit('scrollTop');
                            
                            $scope.registerModel.modelState.errorMessages = [errorMessage];
                        });
                    
                }else{
            
                    var currentTime = new Date().getTime();
                                    
                    var registrationModel = {
                            username: $scope.registerModel.username.toString().toLowerCase(),
                            firstname: $scope.registerModel.firstname,
                            lastname: $scope.registerModel.lastname,
                            email: $scope.registerModel.email,
                            country: $scope.registerModel.country,
                            secretanswer: $scope.registerModel.secretAnswer.toString().toLowerCase(),
                            secretquestion: $scope.registerModel.secretQuestion,
                            password: $scope.registerModel.password,
                            metThisAppBy: $scope.registerModel.metThisAppBy,
                            birthday: dpValue,
                            gender: $scope.registerModel.gender,
                            autologin: true
                        };
                    
                    if ($scope.isNewFacebookUser) {
                        var facebookUser = JSON.parse(localStorage.getItem("CurrentUser"));
                        registrationModel.facebookid = facebookUser.facebookid;
                        registrationModel.alias = facebookUser.first_name;
                        registrationModel.gender = facebookUser.gender;
                    }
                    
                    
                    $http({
                        method: 'POST',
                        url: API_RESOURCE.format("user"),
                        timeout: $rootScope.globalTimeOut,
                        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                        data: $.param(registrationModel),                    
                    }).success(function (data, status, headers, config) {//Successfully register and logged in.
                        $scope.incLoadedItem(); //1
                        $scope.isRegistered = true;
                        $scope.registerModel.modelState.isValid = true;
                        $scope.$emit('scrollTop');
                        $scope.autologin(data);
                    }).error(function (data, status, headers, config) {
                        var errorMessage;
    
                        if ((data != null && data.messageerror != null)) {
                            errorMessage = window.atob(data.messageerror);
                        } else {
                            errorMessage = "Se necesita estar conectado a Internet para continuar.";
                        }
    
                        $scope.$emit('HidePreloader');
                        $scope.$emit('scrollTop');
                        
                        $scope.registerModel.modelState.errorMessages = [errorMessage];
                    });
                }
            };
            
            $scope.autologin = function (data) {
                //_loadDrupalResources();

                /* loads drupal resources (content) */
                _loadedDrupalResources = false;
                _loadedDrupalResourcesWithErrors = false;
                _loadedDrupalResources = false;
                _loadedDrupalResources = false;
                _loadedDrupalResourcesWithErrors = false;

                drupalFactory.Services.GetDrupalContent(function () {
                    _loadedDrupalResources = true;
                    $scope.incLoadedItem(); //2
                }, function (obj) {
                    _loadedDrupalResources = false;
                    _loadedDrupalResourcesWithErrors = true;
                    offlineCallback(obj);
                }, true, true);
                /*  */

                $rootScope.OAUTH_ENABLED = false;
                
                //save token for further requests and autologin
                $scope.currentUserModel = data;
                $scope.currentUserModel.token = data.token;
                $scope.currentUserModel.userId = data.id;

                _setLocalStorageJsonItem("CurrentUser", $scope.currentUserModel);                
                _setLocalStorageJsonItem("Credentials", {
                    username: $scope.registerModel.username,
                    password: $scope.registerModel.password,
                    rememberCredentials: true
                });

                _setId(data.id);
                
                moodleFactory.Services.PostGeolocation(-1);

                var userId = _getItem("userId");
                var currentUser = JSON.parse(localStorage.getItem("CurrentUser"));
                
                if (currentUser && currentUser.token) {
                    var objectToken = {
                        moodleAPI: API_RESOURCE.format(''),
                        moodleToken: currentUser.token
                    };
                    cordova.exec(function () {}, function () {},"CallToAndroid", "login", [objectToken]);
                }
                
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
                                console.log("GetAsyncForumDiscussions");
                                $scope.incLoadedItem(); //6
                                    
                                moodleFactory.Services.GetAsyncMultipleChallengeInfo(data.token, function(){
                                    console.log("GetAsyncMultipleChallengeInfo");
                                    $scope.incLoadedItem(); //7 y 8
                                    
                                    moodleFactory.Services.GetAsyncActivityQuizInfo(course.courseid, data.id, quizesArray, data.token, function() {
                                        console.log("LoadQuizesAssets");
                                        $scope.incLoadedItem(); //9
                                        
                                        moodleFactory.Services.GetUserNotification(userId, course.courseid, data.token, function() {
                                            $scope.incLoadedItem(); //10
                                            
                                            moodleFactory.Services.GetAsyncProfile(userId, data.token, function(){
                                                $scope.incLoadedItem(); //11
                                                
                                                moodleFactory.Services.GetAsyncStars(userId, data.token, function() {
                                                $scope.incLoadedItem(); //12
                                                
                                                    moodleFactory.Services.CountLikesByUser(course.courseid, data.token, function() {
                                                        $scope.incLoadedItem(); //12
                                                        
                                                        moodleFactory.Services.GetAsyncLeaderboard(course.courseid, data.token, function() {
                                                            $scope.incLoadedItem(); //13
                                                            
                                                            moodleFactory.Services.GetProfileCatalogs(data.token, function(){
                                                                $scope.incLoadedItem();//14
                                                                
                                                                moodleFactory.Services.GetProfilePoints(userId, course.courseid, data.token,function(){
                                                                    $scope.incLoadedItem();//15
                                                                    $timeout(function () {
                                                                        try {
                                                                            //- $scope.$emit('HidePreloader');
                                                                            $location.path('/Tutorial');
                                                                        } catch (e) {
                                                                            $location.path('/ProgramaDashboard');
                                                                        }
                                                                    }, 1000);
                                                                }, loginErrorCallback, true);
                                                            }, loginErrorCallback, true);
                                                        }, loginErrorCallback, true);
                                                    }, loginErrorCallback, true);
                                                }, loginErrorCallback, true);
                                            },loginErrorCallback, true);
                                        }, loginErrorCallback, true, true);
                                    }, loginErrorCallback, true, true);
                                }, loginErrorCallback, true, true);
                            }, loginErrorCallback, true, true);
                        }, loginErrorCallback, true, true);
                    }, loginErrorCallback, true, true);
                }, loginErrorCallback, true, true);                
            };

            $scope.datePickerClick = function () {
                if (window.mobilecheck()) {
                    cordova.exec(SuccessDatePicker, FailureDatePicker, "CallToAndroid", "datepicker", [$("input[name='birthday']").val()]);
                }
            };
            
             $scope.selectClick = function (items, field) {
                var selectItems = items.slice();
                selectItems.unshift(field);
                if (window.mobilecheck()) {
                    cordova.exec(function (data) {
                            $("select[name='"+field+"'] option").eq(data.which).prop('selected', true);
                            $timeout( function(){
                                $("select[name='"+field+"'] option").change();
                            }, 10);
                        }, function(){}, "CallToAndroid", "showCombobox", selectItems);
                }
                
                
            };

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
            
            function SuccessDatePicker(data) {
                $("input[name='birthday']").val(data);
            }

            function FailureDatePicker(data) {
            }

            function calculate_age() {
                var birth_day = dpValue.substring(0, 2);
                var birth_month = dpValue.substring(3, 5);
                var birth_year = dpValue.substring(6, 10);
                dpValue = birth_day + '/' + birth_month + '/' + birth_year;
                var today_date = new Date();
                var today_year = today_date.getFullYear();
                var today_month = today_date.getMonth();
                var today_day = today_date.getDate();

                var age = today_year - birth_year;

                if (today_month < (parseInt(birth_month, 10) - 1)) {
                    age--;
                }

                if (((parseInt(birth_month, 10) - 1) == today_month) && (today_day < parseInt(birth_day, 10))) {
                    age--;
                }

                return age;
            }

            $scope.togglePassword = function () {
                var inputPassword = $("#password");
                var inputConfirmPassword = $("#confirmPassword");

                if (inputPassword.attr("type") == "text") {
                    inputPassword.attr("type", "password");
                    inputConfirmPassword.attr("type", "password");
                } else {
                    inputPassword.attr("type", "text");
                    inputConfirmPassword.attr("type", "text");
                }
            };

            var waitForCatalogsLoaded = setInterval(waitForCatalogsLoadedTimer, 1500);

            function waitForCatalogsLoadedTimer() {

                if (_catalogsLoaded != null) {
                    $scope.$emit('HidePreloader');
                    clearInterval(waitForCatalogsLoaded);
                    $scope.genderItems = _getCatalogValuesBy("gender");
                    $scope.countryItems = _getCatalogValuesBy("country");
                    $scope.securityquestionItems = _getCatalogValuesBy("secretquestion");
                    $scope.metThisAppByItems = _getCatalogValuesBy("metThisAppBy");
                    $scope.$apply();
                }
            }

            initController();
            
        }])

    .controller('termsAndConditionsController', function ($scope, $modalInstance) {

        drupalFactory.Services.GetContent("TermsAndConditions", function (data, key) {
            $scope.contentTandC = data.node;
        }, function () {
        }, false);

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };


    });
