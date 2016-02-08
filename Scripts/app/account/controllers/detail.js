angular
    .module('incluso.account.detail', [])
    .controller('accountDetailController', [
        '$scope',
        '$location',
		'$http',
		'accountservice',
        '$routeParams',
		'modalService',
        function ($scope, $location, $http, accountservice, $routeParams, modalService) {
        	var _spinner = angular.element(document.getElementById('spinner')).scope(),
				_orderBy = 'Date',
        		_descending = true;
        	_spinner.loading = true;

        	$scope.isEditable = true;

        	$scope.account = {
        		AccountId: -1,
        		UserName: '',
        		IsActive: true,
        		NotifyDeviceUpdates: false,
        		Organizations: [],
        		RoleId: 0,
        		RoleName: '',
        		First: '',
        		Last: ''
        	};

        	$scope.totalServerItems = 0;

        	$scope.pagingOptions = {
        		pageSizes: [20, 50, 100],
        		pageSize: 20,
        		currentPage: 1
        	};

        	$scope.sortOptions = {
        		fields: ["Date"],
        		directions: ["desc"]
        	};

        	$scope.edit = function () {
        		$location.path("/Account/Edit/" + $routeParams.id);
        	};

        	$scope.returnToList = function () {
        		$location.path("/Account/Index");
        	};

        	$scope.setPagingData = function (data, page, pageSize) {
        		if (data) {
        			$scope.totalServerItems = data.Total;
        			$scope.data = data.Rows;
        			if (!$scope.$$phase) {
        				$scope.$apply();
        			}
        		}
        	};

        	$scope.getPagedDataAsync = function (pageSize, page, searchText) {
        		setTimeout(function () {
        			_spinner.loading = true;
        			var p = {
        				accountId: $scope.account.AccountId,
        				pageNumber: $scope.pagingOptions.currentPage,
        				pageSize: $scope.pagingOptions.pageSize,
        				orderBy: _orderBy,
        				descending: _descending
        			};

        			$http({
        				url: "/api/account/gethistory",
        				method: "GET",
        				params: p,
        				headers: { 'RequestVerificationToken': $("#token").text() }
        			}).success(function (largeLoad) {
        				$scope.setPagingData(largeLoad, page, pageSize);
        				_spinner.loading = false;
        			})
					.error(function (data, status, headers, config) {
						_spinner.loading = false;
						showModal('Error', data, 'Cerrar');
					});
        		}, 100);
        	};

        	accountservice
				.readAccount($routeParams.id || $scope.account.AccountId, true)
				.success(function (data, status, headers, config) {
					if (data.Account) {
						$scope.account = data.Account;
						$scope.isEditable = data.IsEditable;
						$scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage);
					} else {
						_spinner.loading = false;
						showModal('Error', 'El usuario no es válido.', 'Cerrar');
					}
				})
				.error(function (data, status, headers, config) {
					_spinner.loading = false;
					showModal('Error', data, 'Cerrar');
				});

			$scope.$watch('pagingOptions', function (newVal, oldVal) {
				if (newVal !== oldVal) {
					$scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage);
				}
			}, true);

			$scope.$watch('sortOptions', function (newVal, oldVal) {
				if (newVal.fields[0] != oldVal.fields[0] || newVal.directions[0] != oldVal.directions[0]) {
					_orderBy = newVal.fields[0];
					_descending = newVal.directions[0] !== "asc";
					$scope.pagingOptions.currentPage = 1;
					$scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage);
				}
			}, true);

			$scope.gridOptions = {
			    data: 'data',
			    rowHeight: 50,
			    headerRowHeight: 50,
				enablePaging: true,
				showFooter: true,
				multiSelect: false,
				totalServerItems: 'totalServerItems',
				pagingOptions: $scope.pagingOptions,
				sortInfo: $scope.sortOptions,
				useExternalSorting: true,
				columnDefs: [{ field: 'Activity', displayName: 'Actividad', groupable: false },
							{ field: 'Date', displayName: 'Fecha', groupable: false }]
			};

			function showModal(headerText, message, actionText) {
				var modalOptions = {
					showCloseButton: false,
					actionButtonText: actionText,
					headerText: headerText,
					bodyText: message
				};

				modalService.showModal({}, modalOptions);
			};
        }]);