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

            $scope.$emit('ShowPreloader');
            _httpFactory = $http;
            _timeout = $timeout;
            $scope.setToolbar($location.$$path,"Incluso");
            $rootScope.showFooter = true;
            $rootScope.showFooterRocks = false;
            $rootScope.showStage1Footer = false;
            $rootScope.showStage2Footer = false;
            $rootScope.showStage3Footer = false; 
            $scope.back = function () {
                $location.path('/ProgramaDashboard');
            };
            var citiesCatalogKey = "citiescatalog";
            $scope.user = moodleFactory.Services.GetCacheJson("CurrentUser");
            $scope.usercourse = JSON.parse(localStorage.getItem("usercourse"));
            moodleFactory.Services.GetAsyncCatalog(citiesCatalogKey,$scope.user.token,getCitiesCatalogCallback,function(data){console.log(data)},true);
            $scope.default = true;
            getTop5("Ver Todo");
            var userId = localStorage.getItem("userId");
            var profileKey = "profile/" + userId;
            var jsonProfile = localStorage.getItem(profileKey);
            var profile = JSON.parse(jsonProfile);
            var imageUrl = $scope.user.profileimageurl;
            var userStats =
            {
                profileImageUrl: imageUrl,
                alias: profile.alias,
                rank: profile.rank,
                progress: JSON.parse(localStorage.getItem("usercourse")).globalProgress,
                stars: JSON.parse(localStorage.getItem("CurrentUser")).stars,
                amount: profile.badges.filter(function(value) { return (value !== undefined && value.status === "won") }).length,
            };
            $scope.userStats = userStats;


            function getTop5(city)
            {
                moodleFactory.Services.GetAsyncHallOfFame($scope.usercourse.courseid,city,$scope.user.token,getTop5Callback, function(data){console.log(data)},true)
            }

            function getCitiesCatalogCallback()
            {
                $scope.cities = moodleFactory.Services.GetCacheJson(citiesCatalogKey);
                //FIND ME Temporary
                $scope.cities = ["M\u00e9xico D.F","Estado de M\u00e9xico","OTRO"];
                $scope.cities.unshift("Ver Todo");


            }

            function getTop5Callback()
            {
                var allTop5 = moodleFactory.Services.GetCacheJson("halloffame");
                $scope.topProgress = allTop5.progress;
                $scope.topStars = allTop5.stars;
                $scope.topBadges = allTop5.badges;
                $scope.topContribution = allTop5.activity;


                $scope.userStats.forum = allTop5.current_user_activity.forum;
                $scope.userStats.messages = allTop5.current_user_activity.messages;
                $scope.userStats.comunity = allTop5.current_user_activity.comunity;
                $scope.$emit('HidePreloader');
            }

            $scope.updateByCity = function()
            {
                if($scope.selectedCity != "Ver Todo" || !$scope.default)
                {
                    $scope.$emit('ShowPreloader');
                    getTop5($scope.selectedCity);
                    $scope.default = false;
                }

            }
}]);

hallOfFameModule.directive('progressBar', function($compile)
    {
        var directDefObject =
        {
            restrict: 'AE',
            template: "<div>"
            + "<div class='container'></div>"
            + "<label></label>"
            + "</div>" ,

            link: function($scope,$element,attributes)
            {
                var dataProgress = attributes["progressBar"];
                $element.find("label").text(dataProgress + "%");
                var container = $element.find(".container");
                var step = Math.round(dataProgress / 5 );
                for(var i=0;i<20;i++)
                {
                    container.append($("<div>", {
                        "class": "bar" + (i < step ? " active" : "")
                    }));
                }
            }
        };
        return directDefObject;
    }
);

hallOfFameModule.filter('numberToCardinal',function()
    {
        return function(number)
        {
            switch (number)
            {
                case 1: return "1er";
                case 2: return "2do";
                case 3: return "3er";
                case 4: return "4to";
                case 5: return "5to";
            }
        };
    }
);

