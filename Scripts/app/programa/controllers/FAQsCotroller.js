var FAQsModule = angular.module('incluso.program.FAQs', []);

FAQsModule
    .controller('FAQsController', [
        '$q',
        '$scope',
        '$location',
        '$routeParams',
        '$timeout',
        '$rootScope',
        '$http',
        '$modal',
        '$anchorScroll',
        function ($q, $scope, $location, $routeParams, $timeout, $rootScope, $http, $modal, $anchorScroll) {
            var _loadedResources = false;
            var _pageLoaded = true;

            $scope.$emit('ShowPreloader');

            _httpFactory = $http;
            _timeout = $timeout;
            $scope.setToolbar($location.$$path,"Incluso");
            $rootScope.showFooter = true;
            $rootScope.showFooterRocks = false;
            $rootScope.showStage1Footer = false;
            $rootScope.showStage2Footer = false;
            $rootScope.showStage3Footer = false;
            $scope.outsideDetails = true;

            $scope.back = function () {
                $location.path('/ProgramaDashboard');
            };

            drupalFactory.Services.GetContent("FAQS", function (data, key) {
                _loadedResources = true;
                $scope.content = data.node;
                var questions = $scope.content.faqs_question;
                var answers = $scope.content.faqs_answer;
                $scope.showingList=true;
                $scope.showingDetailIndex = -1;
                $scope.FAQsContent = [];
                var totalFaqs = questions.length < answers.length ? questions.length : answers.length;
                for(var i=0;i<totalFaqs;i++)
                {
                    var newFaq =
                    {
                        question: questions[i],
                        answer: answers[i],
                        showingDetail: false
                    };
                    $scope.FAQsContent.push(newFaq);
                }
                if (_loadedResources && _pageLoaded) { $scope.$emit('HidePreloader'); }
            }, function () {
                _loadedResources = true;
                if (_loadedResources && _pageLoaded) { $scope.$emit('HidePreloader'); }
            }, false);

            $scope.goToDetail = function(index)
            {
                $scope.showingList = false;
                $scope.FAQsContent[index].showingDetail = true;
                $scope.showingDetailIndex = index;
                $scope.outsideDetails = false;
            };

            $scope.showList = function()
            {
                $scope.FAQsContent[$scope.showingDetailIndex].showingDetail = false;
                $scope.showingDetailIndex = -1;
                $scope.showingList = true;
                $scope.outsideDetails = true;
            };

            $scope.backToDashboard = function()
            {
                $scope.loaderRandom();
                $rootScope.loading = true; //Start spinner
                $timeout(function(){
                    $location.path('/ProgramaDashboard');
                }, 200);
            };
}]);
