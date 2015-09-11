angular
    .module('incluso.programa.comunidad', ['GlobalAppConstants', 'naif.base64'])
    .controller('programaComunidadController', [
        '$q',
        '$scope',
        '$location',
        '$routeParams',
        '$timeout',
        '$rootScope',
        '$http',
        '$anchorScroll',
        '$modal',
        '$filter',
        'MoodleIds',
        function ($q, $scope, $location, $routeParams, $timeout, $rootScope, $http, $anchorScroll, $modal, $filter, MoodleIds) {

            _httpFactory = $http;
            _timeout = $timeout;
            $scope.$emit('ShowPreloader');
            $timeout(
                function() {
                    $scope.$emit('HidePreloader'); //Poner esta linea cuando en la función de callback al cargarse la página.
            }, 3000);
            $rootScope.pageName = "Comunidad"
            $rootScope.navbarBlue = false;
            $rootScope.showToolbar = true;

            $scope.setToolbar($location.$$path,"Comunidad");
            $rootScope.showFooter = true;
            $rootScope.showFooterRocks = false;

            $scope.userToken = JSON.parse(localStorage.getItem('CurrentUser')).token;
            $scope.liked = null;
            $scope.moodleId = $routeParams.moodleid;

            $scope.scrollToTop();

            $scope.communityModals = {
                "isTextCollapsed":true,
                "isLinkCollapsed":true,
                "isVideoCollapsed":true,
                "isAttachmentCollapsed":true,
                "isReportCollapsed":false
            };

            var _uncollapse = function(element, elementsArray){
                for(var key in elementsArray){
                    key==element? elementsArray[key] = !elementsArray[key] : elementsArray[key] = true;
                };
            };
            $scope.collapseForumButtomsTrigger = function(element){
                _uncollapse(element, $scope.forumModals);
            };
            
            $scope.back = function () {
                $location.path('/ProgramaDashboard');
            }

        }]);