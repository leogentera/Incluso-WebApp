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
        function ($q, $scope, $location, $routeParams, $timeout, $rootScope, $http, $anchorScroll) {

            $anchorScroll();

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
                $anchorScroll();
            };

            $scope.getPasswordRecoveryCode = function() {
                var errors = [];

                console.log('getting password recovery code');

                if(!$scope.recoverPasswordForm.email.$valid){ errors.push("formato de correo incorrecto."); }
                if($scope.recoverPasswordModel.secretQuestion.length === 0){ errors.push("Pregunta secreta inválida."); }
                if(!$scope.recoverPasswordForm.secretAnswer.$valid){ errors.push("respuesta secreta inválida."); }

                $scope.recoverPasswordModel.modelState.errorMessages = errors;

                if(errors.length === 0){

                    $http({
                        method: 'POST',
                        url: API_RESOURCE.format("authentication"), 
                        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                        data: $.param({
                            email: $scope.recoverPasswordModel.email,
                            secretanswer: $scope.recoverPasswordModel.secretAnswer,
                            secretquestion: $scope.recoverPasswordModel.secretQuestion,
                            action: "forgot"
                        })
                    }).success(function(data, status, headers, config) {

                        console.log('successfully code recovery');

                        $scope.currentPage = 2;
                        $scope.scrollToTop();
                        $scope.successMessage = "¡Tu correo se ha enviado correctamente!";

                    }).error(function(data, status, headers, config) {
                        var errorMessage;

                        if((data != null && data.messageerror != null)){
                            errorMessage = window.atob(data.messageerror);
                        }else{
                            errorMessage = "Se ha producido un error, contactate al administrador."
                        }

                        $scope.recoverPasswordModel.modelState.errorMessages = [errorMessage];
                        console.log('data' + errorMessage);
                        $scope.scrollToTop();
                    });
                }else{
                    $scope.scrollToTop();
                }
            }

            $scope.recover = function() {
                var errors = [];

                console.log('recovering password');

                if(!isConfirmedPasswordValid) { errors.push("la confirmación de contraseña no coincide con la contraseña."); }

                if(!$scope.recoverPasswordForm.password.$valid){ errors.push("formato de contraseña incorrecto."); }
                if(!$scope.recoverPasswordForm.confirmPassword.$valid){ errors.push("formato de confirmación de contraseña incorrecto."); }
                if(!$scope.recoverPasswordForm.code.$valid){ errors.push("código requerido."); }

                $scope.recoverPasswordModel.modelState.errorMessages = errors;

                if(errors.length === 0){
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

                        console.log('successfully reset password');

                        $scope.recoveredPassword = true;
                        $scope.successMessage = "Se ha restablecido su contraseña, ahora puedes iniciar sesión.";
                        $anchorScroll();

                        $scope.recoverPasswordModel.password = "";
                        $scope.recoverPasswordModel.confirmPassword = "";
                        $scope.recoverPasswordModel.code = "";

                    }).error(function(data, status, headers, config) {
                        var errorMessage;

                        if((data != null && data.messageerror != null)){
                            errorMessage = window.atob(data.messageerror);
                        }else{
                            errorMessage = "Se ha producido un error, contactate al administrador."
                        }

                        $scope.recoverPasswordModel.modelState.errorMessages = [errorMessage];
                        console.log('data' + errorMessage);
                        $scope.scrollToTop();
                    });
                }else{
                    $scope.scrollToTop();
                }
            };
        }]);


