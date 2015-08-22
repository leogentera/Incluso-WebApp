// http://weblogs.asp.net/dwahlin/archive/2013/09/18/building-an-angularjs-modal-service.aspx
angular
    .module('incluso.stage.gameretomultipleresultscontroller', [])
    .controller('stageGameRetoMultipleResultsController', [
        '$q',
        '$scope',
        '$location',
        '$routeParams',
        '$timeout',
        '$rootScope',
        '$http',
        '$anchorScroll',
        '$modal',
        function ($q, $scope, $location, $routeParams, $timeout, $rootScope, $http, $anchorScroll, $modal) {

            $rootScope.pageName = "Estación: Conócete"
            $rootScope.navbarBlue = true;
            $rootScope.showToolbar = true;
            $rootScope.showFooter = true; 
            $rootScope.showFooterRocks = false; 

            $scope.scrollToTop();
            $scope.$emit('HidePreloader'); //hide preloader

            $scope.activityDetails = [
                        {  
                           "id":21,
                           "name":"Juego Naturista",
                           "description":null,
                           "activityType":"quiz",
                           "status":"-1",
                           "stars":-1,
                           "dateIssued":null,
                           "score":-1,
                           "quizType":"survey",
                           "grade":null,
                           "questions":[  
                              {  
                                 "id":22,
                                 "question":"\u003Cp\u003E\u00bfNivel naturista?\u003Cbr\u003E\u003C\/p\u003E",
                                 "questiontype":"multichoice",
                                 "answers":[  
                                    {  
                                       "id":69,
                                       "answer":"\u003Cp\u003EAlto\u003C\/p\u003E",
                                       "fraction":"1.0000000"
                                    },
                                    {  
                                       "id":70,
                                       "answer":"\u003Cp\u003EMedio\u003C\/p\u003E",
                                       "fraction":"0.0000000"
                                    },
                                    {  
                                       "id":71,
                                       "answer":"\u003Cp\u003EBajo\u003C\/p\u003E",
                                       "fraction":"0.0000000"
                                    }
                                 ],
                                 "userAnswer":""
                              }
                           ]
                        },
                        {  
                           "id":21,
                           "name":"Juego Musical",
                           "description":null,
                           "activityType":"quiz",
                           "status":"-1",
                           "stars":-1,
                           "dateIssued":null,
                           "score":-1,
                           "quizType":"survey",
                           "grade":null,
                           "questions":[  
                              {  
                                 "id":22,
                                 "question":"\u003Cp\u003E\u00bfNivel musical?\u003Cbr\u003E\u003C\/p\u003E",
                                 "questiontype":"multichoice",
                                 "answers":[  
                                    {  
                                       "id":69,
                                       "answer":"\u003Cp\u003EAlto\u003C\/p\u003E",
                                       "fraction":"1.0000000"
                                    },
                                    {  
                                       "id":70,
                                       "answer":"\u003Cp\u003EMedio\u003C\/p\u003E",
                                       "fraction":"0.0000000"
                                    },
                                    {  
                                       "id":71,
                                       "answer":"\u003Cp\u003EBajo\u003C\/p\u003E",
                                       "fraction":"0.0000000"
                                    }
                                 ],
                                 "userAnswer":""
                              }
                           ]
                        }
            ];

            $scope.back = function () {
                $location.path('/ProgramaDashboard');
            }

        }]);