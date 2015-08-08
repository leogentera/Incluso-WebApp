angular
    .module('contactmaster', [
        'ngRoute',
        'ngSanitize',
        'ngResource',
        'ui.bootstrap',
        'ui.bootstrap.tpls',
        'inlcuso.shared.mainNavigation',
        'incluso.home',
        // One module per controller. If we wanted to use one module for several controllers we would need to load dependencies of
        // one controller for all controllers in the module, and we would also need a variable to keep track of the modules:
        // http://zinkpulse.com/organizing-modules-in-angularjs/ and http://cliffmeyers.com/blog/2013/4/21/code-organization-angularjs-javascript
		'incluso.public.login',
        'incluso.public.recoverPassword',
        'incluso.public.register',
        'incluso.programa.dashboard',
        'incluso.programa.dashboard.etapa',
        'incluso.programa.profile'
    ])
    .run(function ($templateCache, $http) {
        $http.get('Templates/Public/Login.html', { cache: $templateCache });
        $http.get('Templates/Public/RecoverPassword.html', { cache: $templateCache });
        $http.get('Templates/Public/Register.html', { cache: $templateCache });
        $http.get('Templates/Programa/Dashboard.html', { cache: $templateCache });
        /*$http.get('Templates/Programa/Step.html', { cache: $templateCache });*/
        $http.get('Templates/Programa/profile.html', { cache: $templateCache });
        $http.get('Templates/Programa/editProfile.html', { cache: $templateCache });
        $http.get('Templates/Programa/etapa.html', { cache: $templateCache });

    })
    .config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {

        $routeProvider.when('/Perfil/Editar', {
            templateUrl: 'Templates/Programa/editProfile.html',
            controller: 'programaProfileController'
        });

        $routeProvider.when('/Perfil', {
            templateUrl: 'Templates/Programa/profile.html',
            controller: 'programaProfileController'
        });

        $routeProvider.when('/ProgramaDashboard', {
        	templateUrl: 'Templates/Programa/Dashboard.html',
        	controller: 'programaDashboardController'
        });

        $routeProvider.when('/ProgramaDashboardEtapa/:stageId', {
            templateUrl: 'Templates/Programa/etapa.html',
            controller: 'programaEtapaController'
        });

        $routeProvider.when('/', {
            templateUrl: 'Templates/Public/Login.html',
            controller: 'publicLoginController'
        });

        $routeProvider.when('/Login/:stageId', {
            templateUrl: function(params){ return 'Templates/Public/Login' + params.stageId + ".html"; },
            controller: 'publicLoginController'
        });

        $routeProvider.when('/RecoverPassword', {
            templateUrl: 'Templates/Public/RecoverPassword.html',
            controller: 'publicRecoverPasswordController'
        });

        $routeProvider.when('/Register', {
            templateUrl: 'Templates/Public/Register.html',
            controller: 'publicRegisterController'
        });

        $routeProvider.otherwise({
        	redirectTo: '/'
        });
        $locationProvider.html5Mode(false);

        $("#menu #submenu").mouseleave(function() {
            $(this).removeClass("unhovered");
        });
    }])
    .controller('RootController', ['$scope', '$route', '$routeParams', '$location', function ($scope, $route, $routeParams, $location) {
        $scope.$on('$routeChangeSuccess', function (e, current, previous) {
            $scope.activeViewPath = $location.path();
        });
    }])
    // Not sure why there's 2 required names
    .directive('requiredname', function () {
        return {
            require: '?ngModel',
            link: function (scope, elm, attr, ctrl) {
                if (!ctrl) return;
                attr.required = true; // force truthy in case we are on non input element

                var validator = function(value) {
                    if (attr.required && (typeof value == 'undefined' || value === '' || value === null || value !== value || value === false)) {
                        ctrl.$setValidity('requiredname', false);
                        return;
                    } else {
                        ctrl.$setValidity('requiredname', true);
                        return value;
                    }
                };

                ctrl.$formatters.push(validator);
                ctrl.$parsers.unshift(validator);

                attr.$observe('requiredname', function () {
                    validator(ctrl.$viewValue);
                });
            }
        };
    })
    .directive('requiredname', function () {
        return {
            require: '?ngModel',
            link: function (scope, elm, attr, ctrl) {
                if (!ctrl) return;
                attr.required = true; // force truthy in case we are on non input element

                var validator = function (value) {
                    if (attr.required && (typeof value == 'undefined' || value === '' || value === null || value !== value || value === false)) {
                        ctrl.$setValidity('requiredname', false);
                        return;
                    } else {
                        ctrl.$setValidity('requiredname', true);
                        return value;
                    }
                };

                ctrl.$formatters.push(validator);
                ctrl.$parsers.unshift(validator);

                attr.$observe('requiredname', function () {
                    validator(ctrl.$viewValue);
                });

                scope.$watch('validationSwitch', function () {
                    validator($("[name='" + ctrl.$name + "']").val());
                });
            }
        };
    })
    .directive('minimumlength', function () {
        return {
            require: '?ngModel',
            link: function (scope, elm, attr, ctrl) {
                if (!ctrl) return;
                attr.required = true; // force truthy in case we are on non input element

                var minlength = parseInt(attr.minimumlength, 10);
                var validator = function (value) {
                    if (typeof value != 'undefined' && value !== '' && value !== null && value.length < minlength) {
                        ctrl.$setValidity('minimumlength', false);
                        return value;
                    }
                    else {
                        ctrl.$setValidity('minimumlength', true);
                        return value;
                    }
                };

                ctrl.$formatters.push(validator);
                ctrl.$parsers.unshift(validator);

                attr.$observe('minimumlength', function () {
                    validator($("[name='" + ctrl.$name + "']").val());
                });
            }
        };
    })
    .directive('maximumlength', function () {
        return {
            require: '?ngModel',
            link: function (scope, elm, attr, ctrl) {
                if (!ctrl) return;
                attr.required = true; // force truthy in case we are on non input element

                var maxlength = parseInt(attr.maximumlength, 10);
                var validator = function (value) {
                    if (typeof value != 'undefined' && value !== '' && value !== null && value.length > maxlength) {
                        ctrl.$setValidity('maximumlength', false);
                        return value;
                    } else {
                        ctrl.$setValidity('maximumlength', true);
                        return value;
                    }
                };

                ctrl.$formatters.push(validator);
                ctrl.$parsers.unshift(validator);

                attr.$observe('maximumlength', function () {
                    validator($("[name='" + ctrl.$name + "']").val());
                });
            }
        };
    })
    .directive('checkurl', function () {
        return {
            require: '?ngModel',
            link: function (scope, elm, attr, ctrl) {
                if (!ctrl) return;
                attr.required = true; // force truthy in case we are on non input element

                var validator = function (value) {
                	var regexp =  /^(((ht|f)tp(s?))\:\/\/)?(www.|[a-zA-Z].)[a-zA-Z0-9\-\.]+\.(com|edu|gov|mil|net|org|biz|info|name|museum|us|ca|uk|gob|mx)(\:[0-9]+)*(\/($|[a-zA-Z0-9\.\,\;\?\'\\\+&amp;%\$#\=~_\-]+))*$/;
                    if (typeof value != 'undefined' && value !== '' && value !== null) {
                        if (regexp.test(value)) {
                            ctrl.$setValidity('checkurl', true);
                        }
                        else {
                            ctrl.$setValidity('checkurl', false);
                        }
                        return value;
                    } else {
                        ctrl.$setValidity('checkurl', true);
                        return value;
                    }
                };

                ctrl.$formatters.push(validator);
                ctrl.$parsers.unshift(validator);

                attr.$observe('checkurl', function () {
                    validator(ctrl.$viewValue);
                });
            }
        };
    })
    .directive('checkemail', function () {
        return {
            require: '?ngModel',
            link: function (scope, elm, attr, ctrl) {
                if (!ctrl) return;
                attr.required = true; // force truthy in case we are on non input element

                var validator = function (value) {
                    var regexp = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
                    if (typeof value != 'undefined' && value !== '' && value !== null) {
                        if (regexp.test(value)) {
                            ctrl.$setValidity('checkemail', true);
                        }
                        else {
                            ctrl.$setValidity('checkemail', false);
                        }
                        return value;
                    } else {
                        ctrl.$setValidity('checkemail', true);
                        return value;
                    }
                };

                ctrl.$formatters.push(validator);
                ctrl.$parsers.unshift(validator);

                attr.$observe('checkemail', function () {
                    validator(ctrl.$viewValue);
                });
            }
        };
    })
	.directive('checkdate', function () {
		return {
			require: '?ngModel',
			link: function (scope, elm, attr, ctrl) {
				if (!ctrl) return;
				attr.required = true; // force truthy in case we are on non input element

				var validator = function (value) {
					if (typeof value == 'string' && value !== '') {
						var date = parseDate(value);
						
						if (toString.apply(date) == '[object Date]') {
							setValidity(true);
						}
						else {
							setValidity(false);
						}

						return date;
					} else {
						setValidity(true);
						return value;
					}

					function parseDate(input) {
						var parts = input.match(/(\d+)/g);

						if (parts && parts.length >= 3) {
							var beginWithYear = parts[0].length == 4,
								year = beginWithYear ? parts[0] : parts[2],
								month = (parts[1] - 1),
								day = beginWithYear ? parts[2] : parts[0];
							
							return new Date(year, month, day, 12, 0, 0);
						} else {
							return null;
						}
					}

					function setValidity(isValid) {
						ctrl.$valid = isValid;
						ctrl.$invalid = !isValid;
					}
				};

				ctrl.$formatters.push(validator);
				ctrl.$parsers.unshift(validator);

				attr.$observe('checkdate', function () {
					validator(ctrl.$viewValue);
				});
			}
		};
	})
    .directive('ngFocus', function($timeout) {
        return function(scope, elem, attrs) {
            scope.$watch(attrs.ngFocus, function(newval) {
                if (newval) {
                    $timeout(function() {
                        elem[0].focus();
                    }, 0, false);
                }
            });
        };
    })
    .directive('ngBlur', function () {
        return function (scope, elem, attrs) {
            elem.bind('blur', function () {
                scope.$apply(attrs.ngBlur);
            });
        };
    });