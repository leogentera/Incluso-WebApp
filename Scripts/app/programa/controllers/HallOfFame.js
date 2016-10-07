var hallOfFameModule = angular.module('incluso.program.hallOfFame', []);

hallOfFameModule
    .controller('HallOfFameController', [
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
            var _pageLoaded = false;

            $scope.$emit('ShowPreloader');
            //var citiesCatalogKey = "citiescatalog";
            $scope.validateConnection(initController, offlineCallback);
            $scope.mobilecheck = _comboboxCompat;
            $scope.selectClick = function (items, field) {
                var selectItems = items.slice();
                selectItems.unshift(field);
                if (window.mobilecheck()) {
                    cordova.exec(function (data) {
                        $("select[name='" + field + "'] option").eq(data.which).prop('selected', true);
                        $timeout(function () {
                            $("select[name='" + field + "'] option").change();
                        }, 10);
                    }, function () {
                    }, "CallToAndroid", "showCombobox", selectItems);
                }
            };

            function offlineCallback() {
                $timeout(function () {
                    $location.path("/Offline");
                }, 1000);
            }

            function initController() {

                drupalFactory.Services.GetContent("HallOfFame", function (data, key) {
                    _loadedResources = true;
                    $scope.contentResources = data.node;
                    if (_loadedResources && _pageLoaded) {
                        $scope.$emit('HidePreloader');
                    }
                }, function () {
                    _loadedResources = true;
                    if (_loadedResources && _pageLoaded) {
                        $scope.$emit('HidePreloader');
                    }
                }, false);

                _httpFactory = $http;
                _timeout = $timeout;
                $scope.setToolbar($location.$$path, "Incluso");
                $rootScope.showFooter = true;
                $rootScope.showFooterRocks = false;
                $rootScope.showStage1Footer = false;
                $rootScope.showStage2Footer = false;
                $rootScope.showStage3Footer = false;

                $scope.back = function () {
                    $location.path('/ProgramaDashboard');
                };

                $scope.user = moodleFactory.Services.GetCacheJson("CurrentUser");
                $scope.usercourse = JSON.parse(localStorage.getItem("usercourse"));
                var profile = moodleFactory.Services.GetCacheJson("Perfil/" + $scope.user.userId);

                $scope.cities = _.find(moodleFactory.Services.GetCacheJson("catalogs"), function (object) {
                    return object.catalog == "citiesCatalog";
                }).values;

                $scope.cities.unshift("Ver Todo");
                $scope.default = true;

                //############# ENTRY POINT  ################
                getTop5("Ver Todo");
                //###########################################

                //if (profile.profileimageurl) {
                //    profile.profileimageurl = profile.profileimageurl + "?rnd=" + new Date().getTime();
                //}

                var userStats = {
                    profileImageUrl: profile.profileimageurl,
                    alias: profile.alias,
                    rank: profile.rank,
                    progress: $scope.usercourse.globalProgress,
                    stars: profile.stars,
                    amount: profile.badges.filter(function (value) {
                        return (value !== undefined && value.status === "won")
                    }).length
                };

                if (!userStats.stars) {
                    userStats.stars = 0;
                }

                $scope.userStats = userStats;

                $scope.userProgressBars = [];

                var step = Math.round(userStats.progress / 5);
                for (var i = 0; i < 20; i++) {
                    var classObjectActive = i < step ? "bar active" : "bar";
                    var classObject = {
                        objectClass: classObjectActive
                    };

                    $scope.userProgressBars.push(classObject);
                }

                //function getCitiesCatalogCallback() {
                //    $scope.cities = moodleFactory.Services.GetCacheJson(citiesCatalogKey);
                //    $scope.cities.unshift("Ver Todo");
                //
                //}

                function getTop5Callback() {
                    var allTop5 = moodleFactory.Services.GetCacheJson("halloffame");
                    $scope.topProgress = allTop5.progress;
                    $scope.topStars = allTop5.stars;
                    $scope.topBadges = allTop5.badges;
                    $scope.topContribution = allTop5.activity;
                    $scope.userStats.forum = allTop5.current_user_activity.forum;
                    $scope.userStats.messages = allTop5.current_user_activity.messages;
                    $scope.userStats.comunity = allTop5.current_user_activity.comunity;

                    $timeout(function () {

                        $('#top-users-statistics').data('owlCarousel').reinit({
                            singleItem: false
                        });
                        $('#top-users-detail').data('owlCarousel').reinit({
                            singleItem: false
                        });

                        _pageLoaded = true;
                        if (_loadedResources && _pageLoaded) {
                            $scope.$emit('HidePreloader');
                        }
                    }, 1000);
                }

                //Time Out Message modal
                $scope.openModal = function (size) {
                    var modalInstance = $modal.open({
                        animation: $scope.animationsEnabled,
                        templateUrl: 'timeOutModal.html',
                        controller: 'timeOutFame',
                        size: size,
                        windowClass: 'user-help-modal dashboard-programa'
                    });
                };

                function getTop5(city) {
                    $scope.validateConnection(function () {
                        moodleFactory.Services.GetAsyncHallOfFame($scope.usercourse.courseid, city, $scope.user.token,
                            getTop5Callback, //Success
                            function (obj) {//Error

                                if (obj.statusCode == 408) {//Request Timeout
                                    $scope.$emit('HidePreloader');
                                    $scope.openModal();
                                }

                            }, true);
                    }, offlineCallback);
                }

                $scope.updateByCity = function () {
                    if ($scope.selectedCity != "Ver Todo" || !$scope.default) {
                        $scope.$emit('ShowPreloader');
                        getTop5($scope.selectedCity);
                        $scope.default = false;
                    }
                }
            }
        }]);

hallOfFameModule.controller('timeOutFame', ['$scope', '$modalInstance', '$route', function ($scope, $modalInstance, $route) {//TimeOut Robot
    $scope.ToDashboard = function () {
        $modalInstance.dismiss('cancel');
        //$route.reload();
    };
}]);

hallOfFameModule.directive('progressBar', function ($compile) {
        var directDefObject =
        {
            restrict: 'AE',
            template: "<div>"
            + "<div class='container'></div>"
            + "<label></label>"
            + "</div>",

            link: function ($scope, $element, attributes) {
                var dataProgress = attributes["progressBar"];
                $element.find("label").text(dataProgress + "%");
                var container = $element.find(".container");
                var step = Math.round(dataProgress / 5);
                for (var i = 0; i < 20; i++) {
                    container.append($("<div>", {
                        "class": "bar" + (i < step ? " active" : "")
                    }));
                }
            }
        };
        return directDefObject;
    }
);

hallOfFameModule.filter('numberToCardinal', function () {
    return function (number) {
        switch (number) {
            case 1:
                return "1er";
            case 2:
                return "2do";
            case 3:
                return "3er";
            case 4:
                return "4to";
            case 5:
                return "5to";
        }
    };
});



