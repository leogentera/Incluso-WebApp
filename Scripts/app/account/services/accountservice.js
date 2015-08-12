angular
    .module('incluso.service.account', [])
    .factory('accountservice', [
        '$http',
        function ($http) {
            return {
                getAccounts: function () {
                    return $http({
                        method: 'GET',
                        url: '/api/account/getall',
                        headers: { 'RequestVerificationToken': $("#token").text() }
                    });
                },

                createAccount: function (account) {
                    return $http({
                        method: 'POST',
                        url: '/api/account/post',
                        data: account,
                        headers: { 'RequestVerificationToken': $("#token").text() }
                    });
                },

                readAccount: function (accountId, isDetail) {
                	return $http({
                		method: 'GET',
                		url: '/api/account/get/' + accountId + '/' + isDetail,
                		headers: { 'RequestVerificationToken': $("#token").text() }
                	});
                },

                updateAccount: function (account) {
                	return $http({
                		method: 'PUT',
                		url: '/api/account/put',
                		data: account,
                		headers: { 'RequestVerificationToken': $("#token").text() }
                	});
                },

                deleteAccount: function (accountId) {
                    return $http({
                        method: 'DELETE',
                        url: '/api/account/delete/' + accountId,
                        headers: { 'RequestVerificationToken': $("#token").text() }
                    });
                },

                notifyIfTryToReplaceOrganizationsAdmins: function (organizationAdmin) {
                	return $http({
                		method: 'POST',
                		url: '/api/account/notifyiftrytoreplaceorganizationsadmins',
                		data: organizationAdmin,
                		headers: { 'RequestVerificationToken': $("#token").text() }
                	});
                },

                getDomainUsers: function (name) {
                	return $http({
                		method: 'GET',
                		url: '/api/account/getdomainusers/' + name,
                		headers: { 'RequestVerificationToken': $("#token").text() }
                	});
                }
            };
        }]);