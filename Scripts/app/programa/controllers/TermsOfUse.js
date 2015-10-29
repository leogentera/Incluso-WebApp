angular
    .module('incluso.program.termsOfUse', [])
    .controller('TermsOfUseController', [
        '$q',
        '$scope',
        '$location',
        '$routeParams',
        '$timeout',
        '$rootScope',
        '$http',
        '$modal',
        function ($q, $scope, $location, $routeParams, $timeout, $rootScope, $http, $modal) {
            $scope.$emit('ShowPreloader'); //show preloader
            $scope.setToolbar($location.$$path,"Incluso");
            $rootScope.showFooter = true;
            $rootScope.showFooterRocks = false;
            $rootScope.showStage1Footer = false;
            $rootScope.showStage2Footer = false;
            $rootScope.showStage3Footer = false;
            $scope.back = function () {
                $location.path('/ProgramaDashboard');
            }



            getContentResources("TermsAndConditions");

            $scope.profile = JSON.parse(localStorage.getItem("profile/"+localStorage.getItem("userId")));
            $scope.profile.termsAndConditions=true;
            $scope.accepted = $scope.profile.termsAndConditions;

            $scope.showCheckbox = !$scope.accepted;
            $scope.acceptsNewTerms = $scope.accepted;
            $scope.termsButtonText = $scope.accepted? "Regresar" : "Salir";
            $scope.profile = null; //profile is not used in this page terms acceptance


            $scope.processNewTerms = function()
            {
                if(!$scope.acceptsNewTerms)
                    logout($scope, $location);
                else
                {
                    //send new data to server
                    $scope.navigateTo('ProgramaDashboard');
                }

            }

            $scope.changeButton = function()
            {
                if($scope.acceptsNewTerms)
                    $scope.termsButtonText =  "Continuar";
                else
                    $scope.termsButtonText = "Salir";
            }

            function getContentResources(activityIdentifierId) {
                drupalFactory.Services.GetContent(activityIdentifierId, function (data, key) {
                    $scope.contentResources = data.node;
                    $scope.$emit('HidePreloader'); //hide preloader
                }, function () {}, false);
            }


}]);
