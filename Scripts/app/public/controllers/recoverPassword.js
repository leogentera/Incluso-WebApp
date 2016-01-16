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

            $scope.$emit('scrollTop');
            $rootScope.showToolbar = false;
            $rootScope.showFooter = false;
            $rootScope.showFooterRocks = false;
            $rootScope.showStage1Footer = false;
            $rootScope.showStage2Footer = false;
            $rootScope.showStage3Footer = false;

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

            $scope.$emit('HidePreloader');
            $scope.validateConnection(function () {
            }, offlineCallback);

            /* Helpers */
            $scope.currentPage = 1;
            $scope.successMessage = "";
            $scope.recoveredPassword = false;
            $scope.readOnly = false;
            $rootScope.showToolbar = false;
            $rootScope.showFooter = false;
            $rootScope.showFooterRocks = false;
            $rootScope.showStage1Footer = false;
            $rootScope.showStage2Footer = false;
            $rootScope.showStage3Footer = false;

            $scope.securityquestionItems = _getCatalogValuesBy("secretquestion");

            $scope.$watch("recoverPasswordModel.modelState.errorMessages", function (newValue, oldValue) {
                $scope.recoverPasswordModel.modelState.isValid = (newValue.length === 0);
            });

            function offlineCallback() {
                $timeout(function () {
                    $scope.recoverPasswordModel.modelState.errorMessages = ["Se necesita estar conectado a Internet para continuar."];
                    $scope.$emit('scrollTop');
                }, 1000);
            }

            function checkEqualityOfPasswords(password, confirmPassword) {
                if (password === confirmPassword) {
                    return true;
                } else {
                    return false;
                }
            }

            $scope.login = function () {
                $location.path('/');
            };

            $scope.navigateToPage = function (pageNumber) {
                $scope.currentPage = pageNumber;
                $scope.$emit('scrollTop');
            };

            $scope.getPasswordRecoveryCode = function () {
                $scope.validateConnection(getPasswordRecoveryCodeConnectedCallback, offlineCallback);
            };

            function getPasswordRecoveryCodeConnectedCallback() {
                //Start Code Recovery
                //fetching errors list
                var errors = [];
                if (!$scope.recoverPasswordForm.email.$valid) {
                    errors.push("Formato de correo incorrecto.");
                }
                if (!$scope.recoverPasswordModel.secretQuestion) {
                    errors.push("Pregunta secreta inválida.");
                }
                if (!$scope.recoverPasswordForm.secretAnswer.$valid) {
                    errors.push("Respuesta secreta inválida.");
                }
                
                $timeout(function() {
                    $scope.recoverPasswordModel.modelState.errorMessages = errors;
                }, 1);

                //validating
                if (errors.length === 0) {
                    $scope.$emit('ShowPreloader');

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
                    }).success(function (data, status, headers, config) {

                        $scope.$emit('HidePreloader');
                        $scope.currentPage = 2;
                        $scope.successMessage = "Te hemos enviado un correo con un código para recuperar tu contraseña.";
                        $scope.$emit('scrollTop');

                    }).error(function (data, status, headers, config) {
                        $scope.$emit('HidePreloader');
                        var errorMessage;
                        if ((data != null && data.messageerror != null)) {
                            errorMessage = window.atob(data.messageerror);
                        } else {
                            errorMessage = "Problema con la red, asegúrate de tener Internet e intenta de nuevo.";
                        }

                        $scope.recoverPasswordModel.modelState.errorMessages = [errorMessage];
                        $scope.$emit('scrollTop');
                    });
                } else {
                    $scope.$emit('scrollTop');
                }
            }

            // For page 2/2
            $scope.recover = function () {
                $scope.validateConnection(recoverConnectedCallback, offlineCallback);
            };

            function recoverConnectedCallback() {
                var errors = [];
                var passwordPolicy = "Debe contener al menos 8 caracteres, incluir un caracter especial, una letra mayúscula, una minúscula y un número.";
                var passwordsHaveValidFormat = false;
                var passwordsCoincide = false;

                if ($scope.recoverPasswordModel.password && $scope.recoverPasswordModel.confirmPassword) {
                    passwordsHaveValidFormat = true;
                }

                if (passwordsHaveValidFormat) {
                    passwordsCoincide = checkEqualityOfPasswords($scope.recoverPasswordModel.password, $scope.recoverPasswordModel.confirmPassword);
                }

                if (!passwordsHaveValidFormat) {
                    errors.push(passwordPolicy);
                }

                if (!passwordsCoincide) {
                    errors.push("Las contraseñas capturadas no coinciden.");
                }

                if (!$scope.recoverPasswordForm.code.$valid) {
                    errors.push("Código requerido.");
                }

                $scope.recoverPasswordModel.modelState.errorMessages = errors;

                if (errors.length === 0) {
                    $scope.$emit('ShowPreloader');

                    $http({
                        method: 'PUT',
                        url: API_RESOURCE.format("authentication"),
                        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                        data: $.param({
                            email: $scope.recoverPasswordModel.email,
                            password: $scope.recoverPasswordModel.password,
                            recoverycode: $scope.recoverPasswordModel.code
                        })
                    }).success(function (data, status, headers, config) {

                        $scope.$emit('HidePreloader');
                        $scope.recoveredPassword = true;
                        $scope.successMessage = "Se ha restablecido tu contraseña, ahora puedes iniciar sesión.";
                        $scope.$emit('scrollTop');

                        $scope.readOnly = true;

                    }).error(function (data, status, headers, config) {

                        $scope.$emit('HidePreloader');
                        var errorMessage;
                        if ((data != null && data.messageerror != null)) {
                            errorMessage = window.atob(data.messageerror);
                        } else {
                            errorMessage = "Problema con la red; asegúrate de tener Internet e intenta de nuevo.";
                        }

                        $scope.recoverPasswordModel.modelState.errorMessages = [errorMessage];
                        $scope.$emit('scrollTop');
                    });
                } else {
                    $scope.$emit('scrollTop');
                }
            }
        }]);
