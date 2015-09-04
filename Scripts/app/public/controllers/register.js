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
            $scope.genderItems = ['Masculino', 'Femenino'];
            $scope.countryItems = ['México', 'OTRO'];
            $scope.cityItems = ['México D.F', 'Estado de México', 'OTRO'];
            $scope.securityquestionItems = ['¿Dónde crecí?','Nombre de mi mejor amigo','Nombre de mi mascota','Personaje favorito','Banda musical favorita'];
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

            $scope.autologin = function(){
                console.log('login in');

                    $http(
                    {
                        method: 'POST',
                        url: API_RESOURCE.format("authentication"), 
                        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                        data: $.param({username: $scope.registerModel.username, password: $scope.registerModel.password})
                    }
                    ).success(function(data, status, headers, config) {

                        console.log('successfully logged in');

                        //save token for further requests and autologin
                        $scope.currentUserModel.token = data.token;
                        $scope.currentUserModel.userId = data.id;

                        localStorage.setItem("CurrentUser", JSON.stringify($scope.currentUserModel));

                        _setToken(data.token);
                        _setId(data.id);

                        $scope.$emit('HidePreloader'); //hide preloader
                        console.log('Preparing preloader');
                        $timeout(
                            function() {
                            $scope.$emit('ShowPreloader'); //Show preloader
                            console.log('Preloader working...');
                            }, 500);

                        console.log('preparing for syncAll');

                        //succesful credentials
                        _syncAll(function() {
                            $timeout(
                                function() {
                                    //console.log('redirecting..');
                                    //$location.path('/ProgramaDashboard');
                                    $location.path('/Tutorial');
                                    //HCG 01//sep/2015 hidepreloader added
                                    $scope.$emit('HidePreloader');
                                },1000);
                        });

                    }).error(function(data, status, headers, config) {
                        var errorMessage = window.atob(data.messageerror);

                        $scope.registerModel.modelState.errorMessages = [errorMessage];
                        console.log(status + ": " + errorMessage);
                        
                        $scope.$emit('HidePreloader'); //hide preloader
                        $scope.$emit('scrollTop'); //- scroll
                    });

            }

            $scope.login = function() {
                $location.path('/');
            }

            $scope.navigateToPage = function(pageNumber){
                $scope.currentPage = pageNumber;
                $scope.$emit('scrollTop'); //- scroll
            };
            //
            //ng-hide="registerModel.birthday.length != 0"
            $scope.showPlaceHolderBirthday = function(){                
                var bd = $("input[name='birthday']").val();                
                if(bd){
                    $scope.showPlaceHolder = false;                    
                }else{
                    $scope.showPlaceHolder = true;                    
                }
            };
            
            //$scope.showBirthdayLabel = function(){
            //    debugger;
            //    if(!$scope.registerModel.birthday){
            //        $('#labelBirthday').removeClass('custom-placeholder form-control-lg ng-hide').addClass('custom-placeholder form-control-lg');                    
            //    }else{
            //        $('#labelBirthday').removeClass('custom-placeholder form-control-lg').addClass('custom-placeholder form-control-lg ng-hide');
            //    }
            //};
            
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
                            gender: $scope.registerModel.gender
                        })
                    }).success(function(data, status, headers, config) {

                        $scope.isRegistered = true;
                        //initModel();

                        console.log('successfully register');
                        $scope.$emit('scrollTop'); //- scroll
                        
                        $scope.autologin();
                        

                    }).error(function(data, status, headers, config) {
                        var errorMessage;

                        if((data != null && data.messageerror != null)){
                            errorMessage = window.atob(data.messageerror);
                        }else{
                            errorMessage = "Se ha producido un error, contactate al administrador."
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
                var datePickerValue =  $("input[name=birthday]").val();
                dpValue = moment(datePickerValue).format("MM/DD/YYYY");
                var age = calculate_age();
                
                var passwordPolicy = "debe ser almenos de 8 caracterres, incluir un caracter especial, una letra mayúscula, una minúscula y un número.";
                
                if(!$scope.registerForm.password.$valid){
                    errors.push("Formato de contraseña incorrecto. La contraseña " + passwordPolicy);
                }else{                    
                    if(!isConfirmedPasswordValid) { errors.push("Las contraseñas capturadas no coinciden."); }
                }                
                                
                if(!$scope.registerForm.userName.$valid){ errors.push("Formato de usuario incorrecto."); }
                if(!$scope.registerForm.firstName.$valid){ errors.push("Formato de nombre incorrecto."); }
                if(!$scope.registerForm.lastName.$valid){ errors.push("Formato de apellido paterno incorrecto."); }
                if(!$scope.registerForm.motherName.$valid) {errors.push("Formato de apellido materno incorrecto."); }
                if(!$scope.registerModel.gender){ errors.push("Género inválido."); }
                if(!$scope.registerModel.country){ errors.push("País inválido."); }
                if(!$scope.registerModel.city){ errors.push("Ciudad inválida."); }
                if(!$scope.registerForm.email.$valid){ errors.push("Formato de correo incorrecto."); }                
                if(!$scope.registerModel.secretQuestion){ errors.push("Pregunta secreta inválida."); }
                if(!$scope.registerForm.secretAnswer.$valid){ errors.push("Respuesta secreta inválida."); }
                if(!$scope.registerModel.termsAndConditions){ errors.push("Debe aceptar los términos y condiciones."); }                
                $scope.registerModel.modelState.errorMessages = errors;
                if(age < 13){ errors.push("Debes ser mayor de 13 años para poder registrarte."); }
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
        }])
        .controller('termsAndConditionsController', function ($scope, $modalInstance) {
            $scope.cancel = function () {
                $modalInstance.dismiss('cancel');
            };
        });
