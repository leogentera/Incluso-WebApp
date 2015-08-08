angular
    .module('incluso.account.index', ['ngGrid', 'ui.select2'])
    .controller('accountListController', [
        '$scope',
        '$location',
		'$http',
        'modalService',
		'accountservice',
        function ($scope, $location, $http, modalService, accountservice) {
        	var _spinner = angular.element(document.getElementById('spinner')).scope(),
				_orderBy = "FullName",
        		_descending = false,
				_filterTimeout;
        	_spinner.loading = true;

            $scope.filterOptions = {
                filterText: "",
                useExternalFilter: false
            };

            $scope.totalServerItems = 0;

            $scope.pagingOptions = {
                pageSizes: [20, 50, 100],
                pageSize: 20,
                currentPage: 1
            };

            $scope.sortOptions = {
            	fields: ["FullName"],
            	directions: ["asc"]
            };

            $scope.createAccount = function () {
            	$location.path("/Account/Create/");
            };

            $scope.detail = function (row) {
            	$location.path("/Account/Detail/" + row.entity.AccountId);
            };

            $scope.remove = function (row) {
            	var modalOptions = {
            		closeButtonText: 'Cancelar',
            		actionButtonText: 'Eliminar',
            		headerText: 'Eliminar Usuario',
            		bodyText: '¿Desea eliminar al usuario?'
            	};

            	modalService.showModal({}, modalOptions).then(function () {
            		_spinner.loading = true;

            		accountservice
						.deleteAccount(row.entity.AccountId)
						.success(function (data, status, headers, config) {
							row.entity.IsActive = false;
							row.entity.RoleName = 'Inactivo';
							_spinner.loading = false;
						})
						.error(function (data, status, headers, config) {
							_spinner.loading = false;
						    showModal('Error', data, 'Cerrar');
						});
            	});
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
            
            $scope.getPagedDataAsync = function(pageSize, page, searchText) {
            	setTimeout(function () {
            		_spinner.loading = true;
            		var p = {
            			searchText: searchText,
            			pageNumber: $scope.pagingOptions.currentPage,
            			pageSize: $scope.pagingOptions.pageSize,
            			orderBy: _orderBy,
						descending: _descending
            		};

            		$http({
            			url: "/api/account/getall",
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

            $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage);

            $scope.$watch('pagingOptions', function(newVal, oldVal) {
                if (newVal !== oldVal || newVal.currentPage !== oldVal.currentPage) {
                    $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage, $scope.filterOptions.filterText);
                }
            }, true);
            
            $scope.$watch('filterOptions', function(newVal, oldVal) {
            	if (newVal !== oldVal) {
            		window.clearTimeout(_filterTimeout);
            		_filterTimeout = setTimeout(function () {
            			$scope.pagingOptions.currentPage = 1;
            			$scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage, $scope.filterOptions.filterText);
            		}, 500);
                }
            }, true);

            $scope.$watch('sortOptions', function (newVal, oldVal) {
            	if (newVal.fields[0] != oldVal.fields[0] || newVal.directions[0] != oldVal.directions[0]) {
            		_orderBy = newVal.fields[0];
            		_descending = newVal.directions[0] !== "asc";
            		$scope.pagingOptions.currentPage = 1;
            		$scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage, $scope.filterOptions.filterText);
            	}
            }, true);

            $scope.$watch('search', function (newVal, oldVal) {
            	if (newVal !== oldVal) {
            		if ($scope.filterOptions) {
            			$scope.filterOptions.filterText = newVal;
            		}
            	}
            });
           
            $scope.gridOptions = {
                data: 'data',
                rowHeight: 50,
                headerRowHeight: 50,
            	enablePaging: true,
            	showFooter: true,
            	multiSelect: false,
            	totalServerItems: 'totalServerItems',
            	pagingOptions: $scope.pagingOptions,
            	filterOptions: $scope.filterOptions,
            	sortInfo: $scope.sortOptions,
            	useExternalSorting: true,
            	columnDefs: [{ field: 'FullName', displayName: 'Nombre de Usuario', groupable: false, width: 550 },
							{ field: 'RoleName', displayName: 'Posición', cellTemplate: '<div class="ngCellText col9 colt9" ng-class="{red: !row.entity.IsActive}"><span ng-cell-text>{{row.getProperty(col.field)}}</span></div>', groupable: false, width: 300 },
                            {
                            	displayName: '',
                            	cellTemplate: '<button id="detailBtn" type="button" class="" ng-click="detail(row)" title="Detalle">C</button>' +
										'<button id="deleteBtn" type="button" class="" ng-click="remove(row)" ng-show="row.entity.IsActive" title="Eliminar">E</button>',
                            	groupable: false,
                            	width: 87,
                            	headerClass: 'hidden',
                            	sortable: false
                            }]
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
