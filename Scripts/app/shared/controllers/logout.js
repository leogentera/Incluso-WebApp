angular
    .module('incluso.shared.logout', [])
    .controller('logoutController', [
        '$scope',
        '$routeParams',
        function ($scope, $routeParams, $templateCache) {
            var req = $.ajax({
                url: '/Home/Logout/',
                type: 'POST',
                data: "{}"
            });
            req.done(function(result) {
                window.location = "/Authentication/Login?ReturnUrl=logout";
            });
        }]);