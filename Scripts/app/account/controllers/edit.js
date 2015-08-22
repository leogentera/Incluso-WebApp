angular
    .module('incluso.account.edit', ['ui.select2', 'ui.multiselect', 'autocomplete'])
    .controller('accountEditController', [
        '$scope',
        '$location',
        'accountservice',
        '$routeParams',
		'modalService',
		'$rootScope',
        function ($scope, $location, accountservice, $routeParams, modalService, $rootScope) {
        	var _spinner = angular.element(document.getElementById('spinner')).scope(),
				_filterTimeout,
				_roleEnum = {
					None: 0,
					User: 1,
					OrganizationAdmin: 2,
					ContactAdmin: 3,
					CentralAdmin: 4
				};

        	_spinner.loading = true;
        	$scope.isNew = angular.isUndefined($routeParams.id);
        	$scope.isUserRole = false;
        	$scope.showOrganizations = null;
        	$scope.organization = [];
        	$scope.users = [];

            $rootScope.pageName = "Mi perfil"
            $rootScope.navbarBlue = false;
            $rootScope.showToolbar = true;
            $rootScope.showFooter = true;

        	$scope.account = {
        		AccountId: -1,
        		UserName: '',
        		IsActive: true,
        		NotifyDeviceUpdates: false,
        		Organizations: [],
        		RoleId: 0,
        		RoleName: ''
        	};

        	$scope.returnToList = function () {
        		$location.path("/Account/Index");
        	};

        	$scope.submitForm = function () {
        		$scope.accountForm.submitted = true;
        	};

        	$scope.getUsers = function (name) {
        		if (name && $scope.isNew) {
        			name = name.split('\\')[1] || name.split('\\')[0];
        			window.clearTimeout(_filterTimeout);
        			_filterTimeout = setTimeout(function () {
        				accountservice
							.getDomainUsers(name)
							.success(function (data, status, headers, config) {
								$scope.users = data;
							});
        			}, 500);
        		}
        	};

        	$scope.save = function () {
        		var formIsValid = $scope.accountForm.$valid && isValidRole();

        		if (formIsValid) {
        			$scope.account.UserName = $scope.accountForm.username.$viewValue;
        			$scope.account.Organizations = [];
        			var totalOrganizations = $scope.organization.length;

        			for (var i = totalOrganizations; i--;) {
        				$scope.account.Organizations[i] = { OrganizationId: $scope.organization[i] };
        			}

        			if ($scope.account.RoleId == _roleEnum.OrganizationAdmin) {
        				if ($scope.account.Organizations.length || !$scope.account.IsActive) {
        					_spinner.loading = true;

        					var organizationAdmin = {
        						accountId: $scope.account.AccountId,
        						organizations: $scope.account.Organizations
        					};

        					accountservice
								.notifyIfTryToReplaceOrganizationsAdmins(organizationAdmin)
								.success(function (data, status, headers, config) {
									if (data.Message) {
										var modalOptions = {
											closeButtonText: 'Cancelar',
											actionButtonText: 'Aceptar',
											headerText: 'Organizaciones',
											bodyText: data.Message
										};

										modalService.showModal({}, modalOptions).then(function () {
											confirmSave();
										});

										_spinner.loading = false;
									} else {
										confirmSave();
									}
								})
								.error(function (data, status, headers, config) {
									_spinner.loading = false;
									showModal('Error', data, 'Cerrar');
								});
        				} else {
        					showModal('Error', 'No ha seleccionado organizaciones.', 'Cerrar');
        				}
        			} else if ($scope.account.RoleId == _roleEnum.User) {
        				if ($scope.account.Organizations.length || !$scope.account.IsActive) {
        					confirmSave();
        				} else {
        					showModal('Error', 'No ha seleccionado organizaciones.', 'Cerrar');
        				}
        			} else {
        				confirmSave();
        			}
        		}
        	};

            accountservice
				.readAccount($routeParams.id || $scope.account.AccountId, false)
				.success(function (data, status, headers, config) {
					if (data.IsEditable) {
						if (data.Account) {
							$scope.account = data.Account;
							$rootScope.userNameReadOnly = true;
							$("[name='username']").val(data.Account.UserName);
							$scope.accountForm.username.$setViewValue(data.Account.UserName);
							var accountOrganizations = data.Account.Organizations.length;
							for (var i = accountOrganizations; i--;) {
								$scope.organization[i] = data.Account.Organizations[i].OrganizationId;
							}
						}
						$scope.roles = data.Roles;
						$scope.organizations = data.Organizations;
						$scope.showOrganizations = data.ShowOrganizations;
						_spinner.loading = false;
					} else {
						showModal('Error', 'El usuario no puede ser editado.', 'Cerrar');
						$location.path("/Account/Detail/" + $routeParams.id);
					}
				})
				.error(function (data, status, headers, config) {
					_spinner.loading = false;
				    showModal('Error', data, 'Cerrar');
				});

            $scope.$watch('account.RoleId', function (newVal, oldVal) {
            	if (newVal !== oldVal) {
            		$scope.isUserRole = newVal == _roleEnum.User;
            		$scope.showOrganizations = newVal == _roleEnum.OrganizationAdmin || $scope.isUserRole;
            	}
            }, true);

            function showModal(headerText, message, actionText) {
            	var modalOptions = {
            		showCloseButton: false,
            		actionButtonText: actionText,
            		headerText: headerText,
            		bodyText: message
            	};

            	modalService.showModal({}, modalOptions);
            };

            function confirmSave() {
            	_spinner.loading = true;

            	if ($scope.isNew) {
            		accountservice
						.createAccount($scope.account)
						.success(function (data, status, headers, config) {
							$location.path("/Account/Detail/" + headers('Location').substring(headers('Location').lastIndexOf('=') + 1));
						})
						.error(function (data, status, headers, config) {
							_spinner.loading = false;
							showModal('Error', data, 'Cerrar');
						});
            	} else {
            		accountservice
						.updateAccount($scope.account)
						.success(function (data, status, headers, config) {
							$location.path("/Account/Detail/" + headers('Location').substring(headers('Location').lastIndexOf('=') + 1));
						})
						.error(function (data, status, headers, config) {
							_spinner.loading = false;
							showModal('Error', data, 'Cerrar');
						});
            	}
            };

            function isValidRole() {
            	if ($scope.account.IsActive && $scope.account.RoleId == _roleEnum.None) {
            		return false;
            	} else {
            		return true;
            	}
            };
        }]);