// http://weblogs.asp.net/dwahlin/archive/2013/09/18/building-an-angularjs-modal-service.aspx
angular
    .module('incluso.public.recoverPassword', [])
    .controller('publicRecoverPasswordController', [
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

            $scope.$emit('scrollTop'); //- scroll
            $rootScope.showToolbar = false;
            $rootScope.showFooter = false;

            /* ViewModel */
            $scope.recoverPasswordModel = {
                email: "",
                secretQuestion: "",
                secretAnswer: "",
                password: "",
                confirmPassword: "",
                code: "",
                modelState: {
                    isValid: null,
                    errorMessages: []
                }
            };

            /* Helpers */
            var isConfirmedPasswordValid = false;
            $scope.currentPage = 1;
            $scope.successMessage = "";
            $scope.recoveredPassword = false;
            $scope.readOnly = false;
            $rootScope.showToolbar = false;
            $rootScope.showFooter = false;
            
            $scope.securityquestionItems = ['¿Dónde crecí?','Nombre de mi mejor amigo','Nombre de mi mascota','Personaje favorito','Banda musical favorita'];

            /* Watchers */
            $scope.$watch("recoverPasswordModel.confirmPassword", function(newValue, oldValue){
                isConfirmedPasswordValid = (newValue === $scope.recoverPasswordModel.password);
            });
            $scope.$watch("recoverPasswordModel.password", function(newValue, oldValue){
                isConfirmedPasswordValid = (newValue === $scope.recoverPasswordModel.confirmPassword);
            });
            $scope.$watch("recoverPasswordModel.modelState.errorMessages", function(newValue, oldValue){
                $scope.recoverPasswordModel.modelState.isValid = (newValue.length === 0);
            });


            $scope.login = function() {
                $location.path('/');
            };

            $scope.navigateToPage = function(pageNumber){
                $scope.currentPage = pageNumber;
                $scope.$emit('scrollTop'); //- scroll
            };

            $scope.getPasswordRecoveryCode = function() {
                console.log('Start Code Recovery'); //- debug
                console.log('fetching errors list'); //- debug
                var errors = [];
                if(!$scope.recoverPasswordForm.email.$valid){ errors.push("Formato de correo incorrecto."); }
                if(!$scope.recoverPasswordModel.secretQuestion){ errors.push("Pregunta secreta inválida."); }
                if(!$scope.recoverPasswordForm.secretAnswer.$valid){ errors.push("Respuesta secreta inválida."); }
                $scope.recoverPasswordModel.modelState.errorMessages = errors;

                console.log('validating'); //- debug
                if(errors.length === 0){
                    console.log('errors: ' + errors.length); //- debug
                    $scope.$emit('ShowPreloader'); //show preloader

                    $http({
                        method: 'POST',
                        url: API_RESOURCE.format("authentication"), 
                        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                        data: $.param({
                            email: $scope.recoverPasswordModel.email,
                            secretanswer: $scope.recoverPasswordModel.secretAnswer.toString().toLowerCase(),
                            secretquestion: $scope.recoverPasswordModel.secretQuestion,
                            action: "forgot"
                        })
                    }).success(function(data, status, headers, config) {

                        console.log('SUCCESS. code recovered'); //- debug
                        $scope.$emit('HidePreloader'); //hide preloader
                        $scope.currentPage = 2;
                        $scope.successMessage = "Te hemos enviado un correo con un código para recuperar tu contraseña.";
                        $scope.$emit('scrollTop'); //- scroll

                    }).error(function(data, status, headers, config) {                                            
                        console.log('ERROR. code not recovered'); //- debug
                        $scope.$emit('HidePreloader'); //hide preloader
                        var errorMessage;
                        if((data != null && data.messageerror != null)){
                            errorMessage = window.atob(data.messageerror);
                        }else{
                            errorMessage = "Se ha producido un error, contactate al administrador."
                        }

                        $scope.recoverPasswordModel.modelState.errorMessages = [errorMessage];
                        console.log('message: ' + errorMessage); //- debug
                        $scope.$emit('scrollTop'); //- scroll
                    });
                }else{
                    console.log('errors: ' + errors.length); //- debug
                    console.log('End'); //- debug
                    $scope.$emit('scrollTop'); //- scroll
                }
            }

            $scope.recover = function() {
                console.log('Start Password Reset'); //- debug
                console.log('fetching errors list'); //- debug
                var errors = [];
                var passwordPolicy = "debe ser almenos de 8 caracterres, incluir un caracter especial, una letra mayúscula, una minúscula y un número.";
                if(!isConfirmedPasswordValid) { errors.push("Las contraseñas capturadas no coinciden."); }
                if(!$scope.recoverPasswordForm.code.$valid){ errors.push("código requerido."); }
                $scope.recoverPasswordModel.modelState.errorMessages = errors;

                console.log('validating'); //- debug
                if(errors.length === 0){
                    console.log('errors: ' + errors.length); //- debug
                    $scope.$emit('ShowPreloader'); //show preloader

                    $http({
                        method: 'PUT',
                        url: API_RESOURCE.format("authentication"), 
                        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                        data: $.param({
                            email: $scope.recoverPasswordModel.email,
                            password: $scope.recoverPasswordModel.password,
                            recoverycode: $scope.recoverPasswordModel.code
                        })
                    }).success(function(data, status, headers, config) {

                        console.log('SUCCESS. password reset'); //- debug
                        $scope.$emit('HidePreloader'); //hide preloader
                        $scope.recoveredPassword = true;
                        $scope.successMessage = "Se ha restablecido su contraseña, ahora puedes iniciar sesión.";
                        $scope.$emit('scrollTop'); //- scroll

                        //$scope.recoverPasswordModel.password = "";
                        //$scope.recoverPasswordModel.confirmPassword = "";
                        //$scope.recoverPasswordModel.code = "";
                        $scope.readOnly = true;

                    }).error(function(data, status, headers, config) {
                        
                        console.log('ERROR. password not reset'); //- debug
                        $scope.$emit('HidePreloader'); //hide preloader
                        var errorMessage;
                        if((data != null && data.messageerror != null)){
                            errorMessage = window.atob(data.messageerror);
                        }else{
                            errorMessage = "Se ha producido un error, contactate al administrador."
                        }

                        $scope.recoverPasswordModel.modelState.errorMessages = [errorMessage];
                        console.log('message: ' + errorMessage); //- debug
                        $scope.$emit('scrollTop'); //- scroll
                    });
                }else{
                    console.log('errors: ' + errors.length); //- debug
                    console.log('End'); //- debug
                    $scope.$emit('scrollTop'); //- scroll
                }
            };      
        }]);
