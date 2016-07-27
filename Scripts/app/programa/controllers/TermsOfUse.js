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
            var _loadedResources = false;
            var _pageLoaded = true;
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

            $scope.userId=localStorage.getItem("userId");
            $scope.profile = JSON.parse(localStorage.getItem("Perfil/"+ $scope.userId));
            $scope.accepted = $scope.profile.termsAndConditions;
            $rootScope.showToolbar = $scope.profile.termsAndConditions;
            $rootScope.showFooter = $scope.profile.termsAndConditions;
            $scope.showCheckbox = !$scope.accepted;
            $scope.acceptsNewTerms = $scope.accepted;
            $scope.termsButtonText = $scope.accepted? "REGRESAR" : "SALIR";

            $scope.processNewTerms = function()
            {
                if(!$scope.acceptsNewTerms)
                    logout($scope, $location);
                else
                {
                    $scope.$emit('ShowPreloader'); //show preloader
                    $scope.profile.termsAndConditions = true;
                    var dataToSend =
                    {
                        termsAndConditionsUpdated: true,
                        termsAndConditions: true
                    };
                    moodleFactory.Services.PutAcceptTermsAndConditions($scope.userId, dataToSend ,function()
                        {
                            var userId = moodleFactory.Services.GetCacheObject("userId");
                            var profile = moodleFactory.Services.GetCacheJson("Perfil/" + userId);
                            profile.termsAndConditions = true;
                            _setLocalStorageJsonItem("Perfil/" + userId, profile);
                            $scope.$emit('HidePreloader'); //show preloader
                            $scope.navigateTo('ProgramaDashboard');
                        }, function (obj) {
                            $scope.$emit('HidePreloader');
                            if (obj && obj.statusCode && obj.statusCode == 408) {//Request Timeout
                              $timeout(function () {
                                $location.path('/Offline'); //This behavior could change
                              }, 1);
                            } else {//Another kind of Error happened
                              $timeout(function () {
                                  if (data && data.messageerror) {
                                      errorMessage = window.atob(data.messageerror);
                                      $scope.model.modelState.errorMessages = [errorMessage];
                                  }
                                  $scope.$emit('HidePreloader');          
                              }, 1);
                            }
                        }, true );
                }

            }

            $scope.changeButton = function()
            {
                if($scope.acceptsNewTerms)
                    $scope.termsButtonText =  "CONTINUAR";
                else
                    $scope.termsButtonText = "SALIR";
            }


            function getContentResources(activityIdentifierId) {
                drupalFactory.Services.GetContent(activityIdentifierId, function (data, key) {
                    _loadedResources = true;
                    $scope.contentResources = data.node;
                    if (_loadedResources && _pageLoaded) { $scope.$emit('HidePreloader'); }
                }, function () { _loadedResources = true; if (_loadedResources && _pageLoaded) { $scope.$emit('HidePreloader'); } }, false);
            }

}]);
