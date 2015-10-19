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
            $scope.$emit('ShowPreloader');



            $scope.cities =
            [
                "Ver Todo",
                "Aguascalientes",
                "Baja California",
                "Baja California Sur",
                "Campeche",
                "Chiapas",
                "Chihuahua",
                "Coahuila",
                "Colima",
                "DF",
                "Durango",
                "Estado de México",
                "Guanajuato",
                "Guerrero",
                "Hidalgo",
                "Jalisco",
                "Michoacán",
                "Morelos",
                "Nayarit",
                "Nuevo León",
                "Oaxaca",
                "Puebla",
                "Querétaro",
                "Quintana Roo",
                "San Luis Potosí",
                "Sinaloa",
                "Sonora",
                "Tabasco",
                "Tamaulipas",
                "Tlaxcala",
                "Veracruz",
                "Yucatán",
                "Zacatecas"
            ];
            $scope.user = moodleFactory.Services.GetCacheJson("CurrentUser");

            moodleFactory.Services.GetAsyncCatalog("citiescatalog",$scope.user.token,function(){},function(data){console.log(data)},true);
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

            //var topProgress = [];
            //var topStars = [];
            //var topBadges = [];
            //var topContribution = [];
            //for(var i=0;i<5;i++)   //Dummies under construction
            //{
            //    var newUserProgress =
            //    {
            //        profileimageurl : imageUrl,
            //        alias: "UserByProgress" + (i+1),
            //        rank: i+1,
            //        progress: parseInt(Math.round(Math.random() * 10) + (90 - i * 10))
            //    }
            //    topProgress.push(newUserProgress);
            //
            //    var newUserStars =
            //    {
            //        profileimageurl : imageUrl,
            //        alias: "UserByStars" + (i+1),
            //        rank: i+1,
            //        stars: parseInt(parseInt(Math.round(Math.random() * 100))  + (1000 - i*100) )
            //    }
            //    topStars.push(newUserStars);
            //
            //    var newUserBadges =
            //    {
            //        profileimageurl : imageUrl,
            //        alias: "UserByBadges" + (i+1),
            //        rank: i+1,
            //        amount:parseInt(Math.random()*5 + 50 - (i * 5))
            //    }
            //    topBadges.push(newUserBadges);
            //
            //    var newUserContribution =
            //    {
            //        profileimageurl : imageUrl,
            //        alias: "UserByCotribution" + (i+1),
            //        rank: i+1,
            //        forum:parseInt(50 - 10 * i + Math.random() * 10),
            //        messages:parseInt(50 - 10 * i + Math.random()*10),
            //        community:parseInt(50 - 10 * i + Math.random()*10)
            //    }
            //    topContribution.push(newUserContribution);
            //}
            //
            //$scope.topProgress = topProgress;
            //$scope.topStars = topStars;
            //$scope.topBadges = topBadges;
            //$scope.topContribution = topContribution;

            function getTop5(city)
            {
                $scope.usercourse = JSON.parse(localStorage.getItem("usercourse"));
                moodleFactory.Services.GetAsyncHallOfFame($scope.usercourse.courseid,city,$scope.user.token,getTop5Callback, function(data){console.log(data)})
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

