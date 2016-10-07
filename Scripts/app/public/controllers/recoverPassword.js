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
                userOrEmail: undefined,
                secretQuestion: "",
                secretAnswer: "",
                password: undefined,
                confirmPassword: undefined,
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

            $scope.$watch("recoverPasswordModel.password", function (newValue, oldValue) {
                var passWordPattern = /^(?=.*[a-zñ])(?=.*[A-ZÑ])(?=.*\d)(?=.*[_\W])[\S]{8,}$/;
                $scope.passwordSignal = passWordPattern.test(newValue) && $scope.recoverPasswordModel.password;
                $scope.confirmPasswordSignal = $scope.recoverPasswordModel.confirmPassword == $scope.recoverPasswordModel.password && $scope.recoverPasswordModel.confirmPassword && $scope.passwordSignal;
            });

            $scope.$watch("recoverPasswordModel.confirmPassword", function (newValue, oldValue) {
                var passWordPattern = /^(?=.*[a-zñ])(?=.*[A-ZÑ])(?=.*\d)(?=.*[_\W])[\S]{8,}$/;
                $scope.passwordSignal = passWordPattern.test($scope.recoverPasswordModel.password) && $scope.recoverPasswordModel.password;
                $scope.confirmPasswordSignal = $scope.recoverPasswordModel.confirmPassword == $scope.recoverPasswordModel.password && $scope.recoverPasswordModel.confirmPassword && $scope.passwordSignal;
            });

            $scope.backToLogin = function () {
                $scope.$emit('ShowPreloader');
                $location.path('/');
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

            $scope.backToProfile = function () {
                $location.path('/Perfil/' + moodleFactory.Services.GetCacheObject("userId"));
            };

            $scope.navigateToPage = function (pageNumber) {
                $scope.currentPage = pageNumber;
                $scope.$emit('scrollTop'); //- scroll
            };

            // For page 1 / 3.
            $scope.validateUserOrEmail = function () {
                $scope.validateConnection(recoverSecretQuestion, offlineCallback);
            };

            function recoverSecretQuestion() {

                $scope.$emit('ShowPreloader');

                $http({
                    method: 'POST',
                    url: API_RESOURCE.format("authentication"),
                    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                    data: $.param({
                        email: $scope.recoverPasswordModel.userOrEmail,
                        action: "validate"
                    })
                }).success(function (data, status, headers, config) {
                    $scope.$emit('HidePreloader'); //hide preloader
                    $scope.currentPage = 2;
                    $scope.email = data.email;
                    $scope.secretQuestion = data.secretquestion;
                    $scope.recoverPasswordModel.secretQuestion = data.secretquestion;
                    $scope.$emit('scrollTop');

                }).error(function (data, status, headers, config) {
                    $scope.$emit('HidePreloader');
                    var errorMessage;

                    if ((data != null && data.messageerror != null)) {
                        errorMessage = window.atob(obj.messageerror);
                    } else {
                        errorMessage = "Problema con la red, asegúrate de tener Internet e intenta de nuevo.";
                    }

                    $scope.recoverPasswordModel.modelState.errorMessages = [errorMessage];
                    $scope.$emit('scrollTop');
                });
            }

            // For page 2 / 3.
            $scope.validateSecretAnswer = function () {
                $scope.validateConnection(validateSecretAnswerCallback, offlineCallback);
            };

            function validateSecretAnswerCallback() {
                var errors = [];

                if (errors.length === 0) {
                    $scope.$emit('ShowPreloader');

                    $http({
                        method: 'POST',
                        url: API_RESOURCE.format("authentication"),
                        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                        data: $.param({
                            email: $scope.email,
                            secretanswer: $scope.recoverPasswordModel.secretAnswer.toString().toLowerCase(),
                            secretquestion: $scope.recoverPasswordModel.secretQuestion,
                            action: "forgot"
                        })
                    }).success(function (data, status, headers, config) {
                        $scope.$emit('HidePreloader');
                        $scope.currentPage = 3;
                        $scope.recoverPasswordModel.modelState.isValid = true; //For activating green success message to user.
                        $scope.successMessage = "Te hemos enviado un correo con un código para recuperar tu contraseña.";
                        $scope.$emit('scrollTop');

                    }).error(function (data, status, headers, config) {
                        $scope.$emit('HidePreloader');
                        var errorMessage;
                        if ((data != null && data.messageerror != null)) {
                            errorMessage = window.atob(obj.messageerror);
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

            // For page 3/3
            $scope.recoverPassword = function () {
                $scope.validateConnection(recoverConnectedCallback, offlineCallback);
            };

            function recoverConnectedCallback() {

                $scope.$emit('ShowPreloader');

                $http({
                    method: 'PUT',
                    url: API_RESOURCE.format("authentication"),
                    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                    data: $.param({
                        email: $scope.email,
                        password: $scope.recoverPasswordModel.password,
                        recoverycode: $scope.recoverPasswordModel.code
                    })
                }).success(function (data, status, headers, config) {
                    //    Update the new username/password pair in Local Storage.
                    var Credentials = JSON.parse(localStorage.getItem("Credentials"));

                    if (Credentials) {
                        Credentials.password = $scope.recoverPasswordModel.password;
                        Credentials.username = $scope.recoverPasswordModel.userOrEmail;
                        localStorage.setItem("Credentials", JSON.stringify(Credentials));
                    }

                    $scope.recoveredPassword = true;
                    $scope.successMessage = "Se ha restablecido su contraseña, ahora puedes iniciar sesión.";
                    $scope.readOnly = true;
                    $scope.recoverPasswordModel.modelState.isValid = true;
                    //$scope.recoverPasswordModel.modelState.errorMessages = [];
                    $scope.$emit('HidePreloader');
                    $scope.$emit('scrollTop');

                }).error(function (data, status, headers, config) {

                    var errorMessage;
                    if ((data != null && data.messageerror != null)) {
                        errorMessage = window.atob(obj.messageerror);
                    } else {
                        errorMessage = "Problema con la red, asegúrate de tener Internet e intenta de nuevo.";
                    }
                    $scope.recoverPasswordModel.modelState.isValid = false;
                    $scope.recoverPasswordModel.modelState.errorMessages = [errorMessage];
                    $scope.$emit('HidePreloader');
                    $scope.$emit('scrollTop');
                });

            }

            function offlineCallback() {
                $timeout(function () {
                    $scope.recoverPasswordModel.modelState.errorMessages = ["Se necesita estar conectado a Internet para continuar."];
                    $scope.$emit('scrollTop');
                }, 1000);
            }




        }]).controller('termsAndConditionsController', ['$scope', '$modalInstance', function ($scope, $modalInstance) {

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
}]);;
