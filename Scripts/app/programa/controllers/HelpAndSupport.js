angular
    .module('incluso.program.helpAndSupport', [])
    .controller('HelpAndSupportController', [
        '$q',
        '$scope',
        '$location',
        '$routeParams',
        '$timeout',
        '$rootScope',
        '$http',
        '$modal',
        function ($q, $scope, $location, $routeParams, $timeout, $rootScope, $http, $modal) {
            $scope.setToolbar($location.$$path,"Incluso");
            $scope.$emit('ShowPreloader');

            drupalFactory.Services.GetContent("HelpAndSupport", function (data, key) {
                $scope.contentResources = data.node;
                var sectionsContents = $scope.contentResources.section_content;
                var sectionSubtitles = $scope.contentResources.section_subtitle;
                var contents = sectionsContents.length < sectionSubtitles.length ? sectionsContents.length : sectionSubtitles.length;
                $scope.contentObjects = [];
                for(var i=0;i<contents;i++)
                {
                    var newContent =
                    {
                        subtitle:sectionSubtitles[i],
                        content:sectionsContents[i]
                    }
                    $scope.contentObjects.push(newContent);
                }

                $scope.$emit('HidePreloader');
            }, function () {
            }, false);

            $rootScope.showFooter = true;
            $rootScope.showFooterRocks = false;
            $rootScope.showStage1Footer = false;
            $rootScope.showStage2Footer = false;
            $rootScope.showStage3Footer = false;
           
}]);
