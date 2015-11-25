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
        function ($q, $scope, $location, $routeParams, $timeout, $rootScope, $http, $anchorScroll, $modal) {
            
            _timeout = $timeout;
            _httpFactory = $http;            
            var dpValue;
            $scope.$emit('scrollTop'); //- scroll

            /* ViewModel */
            $scope.registerModel = {
                username: "",
                firstname: "",
                lastname: "",
                mothername: "",
                birthday: "",
                gender: "",
                country: "",
                city: "",
                email: "",
                password: "",
                confirmPassword: "",
                secretQuestion: "",
                secretAnswer: "",
                termsAndConditions: false,
                modelState: {
                    isValid: null,
                    errorMessages: []
                }
            };

            $scope.currentUserModel = {
                token: "",
                userId: ""
            };                
            
            
            /* Helpers */
            var isConfirmedPasswordValid = false;
            $scope.currentPage = 1;
            $scope.isRegistered = false;
            $rootScope.showToolbar = false;
            $rootScope.showFooter = false;
            $rootScope.showFooterRocks = false;
            $rootScope.showStage1Footer = false;
            $rootScope.showStage2Footer = false;
            $rootScope.showStage3Footer = false;
            $scope.genderItems = _getCatalogValuesBy("gender");
            $scope.countryItems = _getCatalogValuesBy("country");
            $scope.cityItems = $scope.stateItems = _getCatalogValuesBy("citiesCatalog");
            $scope.securityquestionItems = _getCatalogValuesBy("secretquestion");
            $scope.showPlaceHolder = true;
            
            $scope.$emit('HidePreloader'); //- hide preloader

            /* Watchers */
            $scope.$watch("registerModel.confirmPassword", function(newValue, oldValue){
                isConfirmedPasswordValid = (newValue === $scope.registerModel.password);
            });
            $scope.$watch("registerModel.password", function(newValue, oldValue){
                isConfirmedPasswordValid = (newValue === $scope.registerModel.confirmPassword);
            });
            $scope.$watch("registerModel.modelState.errorMessages", function(newValue, oldValue){
                $scope.registerModel.modelState.isValid = (newValue.length === 0);
            });                                                                  

            $scope.register = function() {
                console.log('register');
                localStorage.removeItem("Credentials");
                
                if(validateModel()){
                    $scope.$emit('ShowPreloader'); //show preloader
                    registerUser();
                }else{
                    $scope.$emit('scrollTop'); //- scroll
                }
            }

            $scope.autologin = function(data) {

                //save token for further requests and autologin
                $scope.currentUserModel = data;
                $scope.currentUserModel.token = data.token;
                $scope.currentUserModel.userId = data.id;

                _setLocalStorageJsonItem("CurrentUser", $scope.currentUserModel);
                _setToken(data.token);
                _setId(data.id);

                console.log('preparing for syncAll');
                moodleFactory.Services.GetAsyncUserCourse(_getItem("userId"), function() {
                        var course = moodleFactory.Services.GetCacheJson("course");
                        moodleFactory.Services.GetAsyncUserPostCounter(data.token, course.courseid, function(){}, function() {}, true);
                        
                        try {
                            $scope.$emit('HidePreloader');
                            $location.path('/Tutorial');
                        }catch(e) {
                            $location.path('/ProgramaDashboard');
                        }
                    
                    }, function() {
                    
                        try {
                            $scope.$emit('HidePreloader');
                            $location.path('/Tutorial');
                        } catch(e) {
                            $location.path('/ProgramaDashboard');
                        }
                    }, true);
            }

            $scope.login = function() {
                $location.path('/');
            }

            $scope.navigateToPage = function(pageNumber){
                $scope.currentPage = pageNumber;
                $scope.$emit('scrollTop'); //- scroll
            };

            $scope.showPlaceHolderBirthday = function(){                
                var bd = $("input[name='birthday']").val();                
                if(bd){
                    $scope.showPlaceHolder = false;                    
                }else{
                    $scope.showPlaceHolder = true;                    
                }
            };

            function change(time) {
                var r = time.match(/^\s*([0-9]+)\s*-\s*([0-9]+)\s*-\s*([0-9]+)(.*)$/);
                return r[2]+"-"+r[3]+"-"+r[1]+r[4];
            }

            $scope.datePickerClick = function(){                            
                cordova.exec(SuccessDatePicker, FailureDatePicker, "CallToAndroid", "datepicker", [$("input[name='birthday']").val()]);                
            };

            function SuccessDatePicker(data){
                $("input[name='birthday']").val(data);                                                         
            }

            function FailureDatePicker(data) {
                
            }
                        
            var registerUser = function(){
                
                $http({
                        method: 'POST',
                        url: API_RESOURCE.format("user"), 
                        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                        data: $.param({
                            username: $scope.registerModel.username.toString().toLowerCase(),
                            firstname: $scope.registerModel.firstname,
                            lastname: $scope.registerModel.lastname,
                            mothername: $scope.registerModel.mothername,
                            password: $scope.registerModel.password,
                            email: $scope.registerModel.email,
                            city: $scope.registerModel.city,
                            country: $scope.registerModel.country,
                            secretanswer: $scope.registerModel.secretAnswer.toString().toLowerCase(),
                            secretquestion: $scope.registerModel.secretQuestion,
                            birthday: dpValue,
                            gender: $scope.registerModel.gender,
                            autologin: true
                        })
                    }).success(function(data, status, headers, config) {

                        $scope.isRegistered = true;

                        console.log('successfully register and logged in');
                        $scope.$emit('scrollTop'); //- scroll
                        
                        $scope.autologin(data);

                    }).error(function(data, status, headers, config) {
                        var errorMessage;

                        if((data != null && data.messageerror != null)){
                            errorMessage = window.atob(data.messageerror);
                        }else{
                            errorMessage = "Problema con la red, asegúrate de tener Internet e intenta de nuevo.";
                        }

                        $scope.registerModel.modelState.errorMessages = [errorMessage];                        
                        
                        $scope.$emit('HidePreloader'); //hide preloader
                        $scope.$emit('scrollTop'); //- scroll
                    });
            };

            function calculate_age()
            {                
                var birth_month = dpValue.substring(0,2);
                var birth_day = dpValue.substring(3,5);
                var birth_year = dpValue.substring(6,10);
                dpValue = birth_month + '/'+ birth_day + '/' + birth_year;                
                today_date = new Date();
                today_year = today_date.getFullYear();
                today_month = today_date.getMonth();
                today_day = today_date.getDate();
                age = today_year - birth_year;
            
                if ( today_month < (birth_month - 1))
                {
                    age--;
                }
                if (((birth_month - 1) == today_month) && (today_day < birth_day))
                {
                    age--;
                }
                return age;
            }
            

            function validateModel(){                
                var errors = [];
                var datePickerValue = $("input[name=birthday]").val();
                dpValue = datePickerValue;
                //dpValue = moment(datePickerValue).format("MM/DD/YYYY");
                var age = calculate_age();
                
                var passwordPolicy = "debe ser almenos de 8 caracterres, incluir un caracter especial, una letra mayúscula, una minúscula y un número.";
                var usernamePolicy = "El nombre de usuario puede contener los siguientes caracteres guión bajo (_), guión (-), punto(.) y arroba(@). El nombre de usuario no debe contener espacios."; 
                
                if(!$scope.registerForm.password.$valid){
                    errors.push("Formato de contraseña incorrecto. La contraseña " + passwordPolicy);
                }else{                    
                    if(!isConfirmedPasswordValid) { errors.push("Las contraseñas capturadas no coinciden."); }
                }                
                                
                if(!$scope.registerForm.userName.$valid){ errors.push("Formato de usuario incorrecto. " + usernamePolicy); }
                if(!$scope.registerForm.firstName.$valid){ errors.push("Formato de nombre incorrecto."); }
                if(!$scope.registerForm.lastName.$valid){ errors.push("Formato de apellido paterno incorrecto."); }
                if(!$scope.registerForm.motherName.$valid) {errors.push("Formato de apellido materno incorrecto."); }
                if(!$scope.registerModel.gender){ errors.push("Género inválido."); }
                if(!$scope.registerModel.country){ errors.push("País inválido."); }
                if(!$scope.registerModel.city){ errors.push("Estado inválido."); }
                if(!$scope.registerForm.email.$valid){ errors.push("Formato de correo incorrecto."); }                
                if(!$scope.registerModel.secretQuestion){ errors.push("Pregunta secreta inválida."); }
                if(!$scope.registerForm.secretAnswer.$valid){ errors.push("Respuesta secreta inválida."); }
                if(!$scope.registerModel.termsAndConditions){ errors.push("Debe aceptar los términos y condiciones."); }
                if(isNaN(age) || age < 13){ errors.push("Debes ser mayor de 13 años para poder registrarte."); }
                $scope.registerModel.modelState.errorMessages = errors;
                return (errors.length === 0);
            }

            function initModel(){

                $scope.registerModel = {
                    username: "",
                    birthday: "",
                    gender: "",
                    country: "",
                    city: "",
                    email: "",
                    password: "",
                    confirmPassword: "",
                    secretQuestion: "",
                    secretAnswer: "",
                    termsAndConditions: false,
                    modelState: {
                        isValid: null,
                        errorMessages: []
                    }
                };

            }


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
            
            
            var waitForCatalogsLoaded = setInterval(waitForCatalogsLoadedTimer, 1500);
            function waitForCatalogsLoadedTimer() {
                
                if (_catalogsLoaded != null) {
                    clearInterval(waitForCatalogsLoaded);
                    $scope.genderItems = _getCatalogValuesBy("gender");
                    $scope.countryItems = _getCatalogValuesBy("country");
                    $scope.cityItems = $scope.stateItems = _getCatalogValuesBy("citiesCatalog");
                    $scope.securityquestionItems = _getCatalogValuesBy("secretquestion");
                    $scope.$apply();
                }
            }
            
        }])

        .controller('termsAndConditionsController', function ($scope, $modalInstance) {
        
            drupalFactory.Services.GetContent("TermsAndConditions", function (data, key) { $scope.contentTandC = data.node; }, function () {}, false);

            $scope.cancel = function () {
                $modalInstance.dismiss('cancel');
            };


        });
