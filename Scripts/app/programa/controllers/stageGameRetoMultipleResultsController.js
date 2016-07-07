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
            var _loadedResources = false;
            var _pageLoaded = true;

            $scope.$emit('ShowPreloader');

            $scope.retoMultipleActivities = moodleFactory.Services.GetCacheJson("retoMultipleActivities");

            $scope.profile = moodleFactory.Services.GetCacheJson("Perfil/" + moodleFactory.Services.GetCacheObject("userId"));

            drupalFactory.Services.GetContent("1039results",
                function (data, key) {
                    _loadedResources = true;
                    var i;
                    $scope.contentResources = data.node;
                    $scope.fortalezas = _.filter($scope.retoMultipleActivities, function (a) {
                        return a.score == "3";
                    });
                    $scope.fortalezas = _.sortBy($scope.fortalezas, function (f) {
                        if (f.name.slice(0, 4).toLowerCase().indexOf($scope.profile.shield.slice(0, 4).toLowerCase()) > -1) {
                            f.total_score *= 1000;
                        }
                        return -f.total_score;
                    });
                    $scope.aFortalecer = _.filter($scope.retoMultipleActivities, function (a) {
                        return a.score != "3" && a.score != "-1";
                    });

                    //Las 8 inteligencias son: ["Linguística", "Matemática", "Espacial", "Musical", "Corporal", "Interpersonal", "Intrapersonal", "Naturalista"];

                    for (i = 0; i < $scope.fortalezas.length; i++) {

                        switch ($scope.fortalezas[i].name) {
                            case "Lingüística":
                                $scope.fortalezas[i].description = $scope.contentResources.mul_cha_res_intel_content[7].safe_value;
                                break;
                            case "Matemática":
                                $scope.fortalezas[i].description = $scope.contentResources.mul_cha_res_intel_content[6].safe_value;
                                break;
                            case "Espacial":
                                $scope.fortalezas[i].description = $scope.contentResources.mul_cha_res_intel_content[5].safe_value;
                                break;
                            case "Musical":
                                $scope.fortalezas[i].description = $scope.contentResources.mul_cha_res_intel_content[0].safe_value;
                                break;
                            case "Corporal":
                                $scope.fortalezas[i].description = $scope.contentResources.mul_cha_res_intel_content[4].safe_value;
                                break;
                            case "Interpersonal":
                                $scope.fortalezas[i].description = $scope.contentResources.mul_cha_res_intel_content[1].safe_value;
                                break;
                            case "Intrapersonal":
                                $scope.fortalezas[i].description = $scope.contentResources.mul_cha_res_intel_content[3].safe_value;
                                break;
                            case "Naturalista":
                                $scope.fortalezas[i].description = $scope.contentResources.mul_cha_res_intel_content[2].safe_value;
                                break;
                        }

                    }

                    for (i = 0; i < $scope.aFortalecer.length; i++) {

                        switch ($scope.aFortalecer[i].name) {
                            case "Lingüística":
                                $scope.aFortalecer[i].description = $scope.contentResources.mul_cha_res_intel_content[7].safe_value;
                                break;
                            case "Matemática":
                                $scope.aFortalecer[i].description = $scope.contentResources.mul_cha_res_intel_content[6].safe_value;
                                break;
                            case "Espacial":
                                $scope.aFortalecer[i].description = $scope.contentResources.mul_cha_res_intel_content[5].safe_value;
                                break;
                            case "Musical":
                                $scope.aFortalecer[i].description = $scope.contentResources.mul_cha_res_intel_content[0].safe_value;
                                break;
                            case "Corporal":
                                $scope.aFortalecer[i].description = $scope.contentResources.mul_cha_res_intel_content[4].safe_value;
                                break;
                            case "Interpersonal":
                                $scope.aFortalecer[i].description = $scope.contentResources.mul_cha_res_intel_content[1].safe_value;
                                break;
                            case "Intrapersonal":
                                $scope.aFortalecer[i].description = $scope.contentResources.mul_cha_res_intel_content[3].safe_value;
                                break;
                            case "Naturalista":
                                $scope.aFortalecer[i].description = $scope.contentResources.mul_cha_res_intel_content[2].safe_value;
                                break;
                        }
                    }

                    if (_loadedResources && _pageLoaded) {
                        $scope.$emit('HidePreloader');
                    }
                },
                function () {
                    _loadedResources = true;
                    if (_loadedResources && _pageLoaded) {
                        $scope.$emit('HidePreloader');
                    }
                }, false);

            $scope.setToolbar($location.$$path, "");
            $rootScope.showFooter = true;
            $rootScope.showFooterRocks = false;
            $rootScope.showStage1Footer = false;
            $rootScope.showStage2Footer = false;
            $rootScope.showStage3Footer = false;

            $scope.scrollToTop();
            $scope.isCollapsed = true;

            if (_loadedResources && _pageLoaded) {
                $scope.$emit('HidePreloader');
            }
            $scope.back = function () {
                $location.path('/ZonaDeVuelo/Dashboard/1/2');
            }

        }]);