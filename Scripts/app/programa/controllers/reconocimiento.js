angular
    .module('incluso.programa.reconocimiento', [])
    .controller('reconocimientoController', [
        '$q',
        '$scope',
        '$location',
        '$routeParams',
        '$timeout',
        '$rootScope',
        '$http',
        '$modal',
        '$filter',
        function ($q, $scope, $location, $routeParams, $timeout, $rootScope, $http, $modal, $filter) {
            var _loadedResources = false;
            var _pageLoaded = true;
            $scope.$emit('scrollTop');

            drupalFactory.Services.GetContent("Recognition", function (data, key) {
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

            var _course = moodleFactory.Services.GetCacheJson("course");
            var _userId = moodleFactory.Services.GetCacheObject("userId");
            var reconocimientoSrc = null;

            $scope.setToolbar($location.$$path, "Reconocimiento");
            $rootScope.showFooter = true;
            $rootScope.showFooterRocks = false;
            $rootScope.showStage1Footer = false;
            $rootScope.showStage2Footer = false;
            $rootScope.showStage3Footer = false;

            //Get last activity's year of Incluso course.
            $scope.lastActivityYear = lastActivityYear();

            $scope.hasCommunityAccess = false;
            $scope.discussion = null;
            $scope.forumId = null;
            $scope.communityModalOpen = true;
            $scope.shareToCommunityOpen = false;
            $scope.shareToDownloadOpen = false;
            $scope.shareToEmailOpen = false;
            $scope.shareToSocialNetworksOpen = false;
            $scope.textToCommunity = "";


            var canvas = document.createElement("canvas"),
                ctx = canvas.getContext('2d');
            canvas.width = 1200;
            canvas.height = 1200;

            var lastActivityYear = moment($scope.lastActivityYear * 1000).year();
            var courseYear = 'Incluso {0}'.format(String(lastActivityYear));

            var oText = {
                username: '',
                title: 'OTORGA EL PRESENTE RECONOCIMIENTO A',
                reason: ['Por su participación en la misión', courseYear, 'Para una inclusión Productiva Sana'],
                quote: ['Todos tenemos sueños', 'pero para que se vuelvan realidad se necesita una gran', 'determinación, autodisciplina y esfuerzo…', 'Jesse Owens']
            };

            var prevCurrentDiscussionIds;

            function controllerInit() {
                $scope.currentUser = JSON.parse(localStorage.getItem("CurrentUser"));
                $scope.profile = JSON.parse(localStorage.getItem("Perfil/" + $scope.currentUser.id));
                $scope.hasCommunityAccess = _hasCommunityAccessLegacy($scope.profile.communityAccess);

                oText.username = $scope.profile.firstname + " " + $scope.profile.lastname + " " + $scope.profile.mothername;


                // update profile
                var awards = _getAwards();
                if (awards && !$scope.profile.awards.title) {

                    var stars = Number($scope.profile.stars);

                    for (a = 0; a < awards.length; a++) {
                        var award = awards[a];

                        if (stars >= award.min_points_range && stars <= award.max_points_range) {
                            $scope.profile.awards.title = award.title;
                            localStorage.setItem("Perfil/" + $scope.currentUser.id, JSON.stringify($scope.profile));
                            break;
                        }
                    }
                }
            }

            function offlineCallback() {
                $timeout(function () {
                    $location.path("/Offline");
                }, 1000);
            }

            function generateReconocimientoImgSrc(callback) {

                if (reconocimientoSrc == null) {

                    drawBackgroundSky(ctx);
                    drawBackgroundStars(ctx);
                    drawInclusoLogo(ctx);
                    drawDiplomaFrame(ctx);
                    drawStripesDeco(ctx);

                    drawMedal(ctx, $scope.profile.awards.title);
                    renderText(ctx, oText);

                    reconocimientoSrc = canvas.toDataURL("image/png");
                    var indexComma = reconocimientoSrc.indexOf(',');
                    reconocimientoSrc = reconocimientoSrc.substring(indexComma + 1, reconocimientoSrc.length);
                }

                callback();
            }

            $scope.download = function () {
                $scope.communityModalOpen = true;
                generateReconocimientoImgSrc(function () {
                    cordova.exec(function () {
                            $scope.shareToDownloadOpen = true;
                            $timeout(function () {
                                $scope.shareToDownloadOpen = true;
                            }, 1000);
                        }, function () {
                            $scope.shareToDownloadOpen = false;
                            $timeout(function () {
                                $scope.shareToDownloadOpen = false;
                            }, 1000);
                        },
                        "CallToAndroid", "download", [reconocimientoSrc]);
                });
            };

            $scope.shareByEmail = function () {
                $scope.communityModalOpen = true;
                $scope.validateConnection(function () {
                    generateReconocimientoImgSrc(function () {
                        cordova.exec(function () {
                            }, function () {
                            },
                            "CallToAndroid", "shareByMail", [reconocimientoSrc, "reconocimiento.png", "mi reconocimiento"]);
                    });

                }, offlineCallback);

            };

            $scope.shareToSocialNetworks = function () {
                $scope.communityModalOpen = true;
                $scope.validateConnection(function () {
                    generateReconocimientoImgSrc(function () {
                        cordova.exec(function () {
                            }, function () {
                            },
                            "CallToAndroid", "share", [reconocimientoSrc]);
                    });
                }, offlineCallback);

            };

            $scope.shareToCommunity = function () {
                $scope.validateConnection(function () {
                    generateReconocimientoImgSrc(shareToCommunityCallback);
                }, offlineCallback);

            };

            function shareToCommunityCallback() {
                $scope.$emit('ShowPreloader');
                if ($scope.discussion == null || $scope.forumId == null) {
                    moodleFactory.Services.GetAsyncForumDiscussions(_course.community.coursemoduleid, $scope.currentUser.token, function (data, key) {
                        var currentDiscussionIds = [];

                        for (var d = 0; d < data.discussions.length; d++) {
                            currentDiscussionIds.push(data.discussions[d].discussion);
                        }

                        //Save previous value of "currentDiscussionIds" object.
                        prevCurrentDiscussionIds = localStorage.getItem("currentDiscussionIds");

                        localStorage.setItem("currentDiscussionIds", JSON.stringify(currentDiscussionIds));
                        $scope.discussion = data.discussions[0];
                        $scope.forumId = data.forumid;
                        postReconocimientoToCommunity();
                    }, function (obj) {
                                $scope.$emit('HidePreloader');
                                if (obj && obj.statusCode && obj.statusCode == 408) {//Request Timeout
                                  $timeout(function () {
                                    $location.path('/Offline'); //This behavior could change
                                  }, 1);
                                } else {//Another kind of Error happened
                                  $timeout(function () {
                                      console.log("Another kind of Error happened");
                                      $scope.$emit('HidePreloader');
                                      $location.path('/connectionError');
                                  }, 1);
                                }
                            }, true);
                } else {
                    postReconocimientoToCommunity();
                }
            }

            //Time Out Message modal
            $scope.openModal = function (size) {
                var modalInstance = $modal.open({
                    animation: $scope.animationsEnabled,
                    templateUrl: 'timeOutModal.html',
                    controller: 'timeOutReconocimiento',
                    size: size,
                    windowClass: 'user-help-modal dashboard-programa'
                });
            };

            function postReconocimientoToCommunity() {
                var requestData = {
                    "userid": _userId,
                    "discussionid": $scope.discussion.discussion,
                    "parentid": $scope.discussion.id,
                    "message": $scope.textToCommunity,
                    "createdtime": moment(Date.now()).unix(),
                    "modifiedtime": moment(Date.now()).unix(),
                    "posttype": 4,
                    "filecontent": reconocimientoSrc.replace("data:image/png;base64", ""),
                    "filename": 'reconocimiento.png',
                    "picture_post_author": $scope.profile.profileimageurlsmall,
                    "iscountable": 0
                };

                moodleFactory.Services.PostAsyncForumPost('new_post', requestData,
                    function () {//Success
                        $scope.communityModalOpen = true;
                        $scope.shareToCommunityOpen = true;
                        $scope.$emit('HidePreloader');
                    },
                    function (obj) {//Error
                        $scope.communityModalOpen = true;
                        $scope.shareToCommunityOpen = false;
                        $scope.$emit('HidePreloader');

                        if (obj.statusCode == 408) {//Request Timeout
                            $scope.openModal();
                        }

                        //Revert previous request action.
                        if (prevCurrentDiscussionIds === null) {
                            localStorage.removeItem("currentDiscussionIds");
                        } else {
                            localStorage.setItem("currentDiscussionIds", prevCurrentDiscussionIds);
                        }
                    }
                );
            }

            function lastActivityYear() {
                var userCourse = JSON.parse(localStorage.getItem('usercourse'));
                if (userCourse) {
                    var courseStages = _.filter(userCourse.stages, function (stage) {
                        return stage.activityname != 'General';
                    });

                    var lastStage = userCourse.stages[courseStages.length - 1];
                    var lastChallenge = lastStage.challenges[lastStage.challenges.length - 1];
                    var lastActivity = lastChallenge.activities[lastChallenge.activities.length - 1];
                    return lastActivity.last_status_update;
                }
            }


            $scope.shareToCommunityClick = function () {
                $scope.validateConnection(function () {
                    $timeout(function () {
                        $scope.communityModalOpen = !$scope.communityModalOpen;
                    }, 500);
                }, offlineCallback);
            }

            var drawBackgroundSky = function (ctx) {
                // sky background
                var grd = ctx.createLinearGradient(599, 310, 599, 1565);
                grd.addColorStop(0, 'rgba(21,25,30,1)');
                grd.addColorStop(1, 'rgba(22,66,84,1)');
                ctx.fillStyle = grd;
                ctx.fillRect(0, 0, 1200, 1200);
                ctx.fill();
            }
            var drawBackgroundStars = function (ctx) {
                // stars
                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(23, 738);
                ctx.bezierCurveTo(24, 737, 24, 736, 23, 735);
                ctx.bezierCurveTo(22, 734, 21, 734, 20, 735);
                ctx.bezierCurveTo(19, 736, 20, 738, 20, 738);
                ctx.bezierCurveTo(21, 739, 23, 739, 23, 738);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(101, 1053);
                ctx.bezierCurveTo(102, 1053, 103, 1054, 103, 1055);
                ctx.bezierCurveTo(102, 1056, 102, 1057, 100, 1057);
                ctx.bezierCurveTo(99, 1057, 99, 1056, 99, 1055);
                ctx.bezierCurveTo(99, 1054, 100, 1053, 101, 1053);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(52, 1121);
                ctx.bezierCurveTo(53, 1121, 54, 1122, 54, 1123);
                ctx.bezierCurveTo(54, 1124, 53, 1125, 52, 1125);
                ctx.bezierCurveTo(51, 1125, 50, 1124, 50, 1123);
                ctx.bezierCurveTo(50, 1122, 51, 1121, 52, 1121);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(91, 1110);
                ctx.bezierCurveTo(92, 1110, 93, 1111, 93, 1112);
                ctx.bezierCurveTo(93, 1113, 92, 1114, 91, 1114);
                ctx.bezierCurveTo(90, 1114, 89, 1113, 89, 1112);
                ctx.bezierCurveTo(89, 1111, 90, 1110, 91, 1110);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(22, 537);
                ctx.bezierCurveTo(21, 537, 20, 536, 20, 535);
                ctx.bezierCurveTo(20, 534, 21, 533, 22, 533);
                ctx.bezierCurveTo(23, 533, 24, 534, 24, 535);
                ctx.bezierCurveTo(24, 537, 23, 538, 22, 537);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(25, 818);
                ctx.bezierCurveTo(24, 818, 23, 817, 23, 816);
                ctx.bezierCurveTo(23, 814, 24, 813, 25, 813);
                ctx.bezierCurveTo(26, 814, 27, 815, 27, 816);
                ctx.bezierCurveTo(27, 817, 26, 818, 25, 818);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(4, 1073);
                ctx.bezierCurveTo(3, 1073, 2, 1074, 2, 1075);
                ctx.bezierCurveTo(2, 1076, 3, 1077, 4, 1077);
                ctx.bezierCurveTo(5, 1078, 6, 1077, 6, 1075);
                ctx.bezierCurveTo(6, 1074, 6, 1073, 4, 1073);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(6, 958);
                ctx.bezierCurveTo(5, 958, 4, 959, 4, 960);
                ctx.bezierCurveTo(3, 961, 4, 962, 5, 962);
                ctx.bezierCurveTo(6, 962, 7, 961, 7, 960);
                ctx.bezierCurveTo(8, 959, 7, 958, 6, 958);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(79, 654);
                ctx.bezierCurveTo(80, 654, 81, 655, 81, 657);
                ctx.bezierCurveTo(81, 658, 80, 659, 79, 659);
                ctx.bezierCurveTo(78, 659, 77, 658, 77, 656);
                ctx.bezierCurveTo(77, 655, 78, 654, 79, 654);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(118, 643);
                ctx.bezierCurveTo(119, 643, 120, 644, 120, 645);
                ctx.bezierCurveTo(120, 647, 119, 648, 118, 647);
                ctx.bezierCurveTo(117, 647, 116, 646, 116, 645);
                ctx.bezierCurveTo(116, 644, 117, 643, 118, 643);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(23, 118);
                ctx.bezierCurveTo(24, 117, 24, 116, 23, 115);
                ctx.bezierCurveTo(22, 114, 21, 114, 20, 115);
                ctx.bezierCurveTo(19, 116, 20, 118, 20, 119);
                ctx.bezierCurveTo(21, 119, 23, 119, 23, 118);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(101, 433);
                ctx.bezierCurveTo(102, 433, 103, 434, 103, 435);
                ctx.bezierCurveTo(102, 437, 102, 438, 100, 437);
                ctx.bezierCurveTo(99, 437, 99, 436, 99, 435);
                ctx.bezierCurveTo(99, 434, 100, 433, 101, 433);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(52, 501);
                ctx.bezierCurveTo(53, 501, 54, 502, 54, 503);
                ctx.bezierCurveTo(54, 505, 53, 505, 52, 505);
                ctx.bezierCurveTo(51, 505, 50, 504, 50, 503);
                ctx.bezierCurveTo(50, 502, 51, 501, 52, 501);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(91, 490);
                ctx.bezierCurveTo(92, 490, 93, 491, 93, 492);
                ctx.bezierCurveTo(93, 493, 92, 494, 91, 494);
                ctx.bezierCurveTo(90, 494, 89, 493, 89, 492);
                ctx.bezierCurveTo(89, 491, 90, 490, 91, 490);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(25, 198);
                ctx.bezierCurveTo(24, 198, 23, 197, 23, 196);
                ctx.bezierCurveTo(23, 194, 24, 194, 25, 194);
                ctx.bezierCurveTo(26, 194, 27, 195, 27, 196);
                ctx.bezierCurveTo(27, 197, 26, 198, 25, 198);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(4, 453);
                ctx.bezierCurveTo(3, 453, 2, 454, 2, 455);
                ctx.bezierCurveTo(2, 456, 3, 458, 4, 458);
                ctx.bezierCurveTo(5, 458, 6, 457, 6, 456);
                ctx.bezierCurveTo(6, 454, 6, 453, 4, 453);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(6, 338);
                ctx.bezierCurveTo(5, 338, 4, 339, 4, 340);
                ctx.bezierCurveTo(3, 341, 4, 342, 5, 342);
                ctx.bezierCurveTo(6, 342, 7, 341, 7, 340);
                ctx.bezierCurveTo(8, 339, 7, 338, 6, 338);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(79, 34);
                ctx.bezierCurveTo(80, 34, 81, 35, 81, 37);
                ctx.bezierCurveTo(81, 38, 80, 39, 79, 39);
                ctx.bezierCurveTo(78, 39, 77, 38, 77, 36);
                ctx.bezierCurveTo(77, 35, 78, 34, 79, 34);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(118, 23);
                ctx.bezierCurveTo(119, 23, 120, 24, 120, 26);
                ctx.bezierCurveTo(120, 27, 119, 28, 118, 28);
                ctx.bezierCurveTo(117, 28, 116, 26, 116, 25);
                ctx.bezierCurveTo(116, 24, 117, 23, 118, 23);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(438, 810);
                ctx.bezierCurveTo(439, 810, 440, 809, 440, 808);
                ctx.bezierCurveTo(440, 807, 439, 806, 438, 806);
                ctx.bezierCurveTo(437, 806, 436, 807, 436, 808);
                ctx.bezierCurveTo(436, 809, 436, 810, 438, 810);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(145, 740);
                ctx.bezierCurveTo(146, 738, 146, 737, 145, 736);
                ctx.bezierCurveTo(144, 735, 143, 736, 142, 737);
                ctx.bezierCurveTo(141, 738, 142, 739, 143, 740);
                ctx.bezierCurveTo(143, 741, 145, 741, 145, 740);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(49, 880);
                ctx.bezierCurveTo(50, 880, 51, 879, 51, 878);
                ctx.bezierCurveTo(51, 877, 50, 875, 49, 875);
                ctx.bezierCurveTo(48, 875, 47, 876, 47, 878);
                ctx.bezierCurveTo(47, 879, 48, 880, 49, 880);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(351, 773);
                ctx.bezierCurveTo(351, 772, 351, 771, 350, 770);
                ctx.bezierCurveTo(349, 769, 348, 769, 347, 770);
                ctx.bezierCurveTo(346, 772, 347, 773, 348, 774);
                ctx.bezierCurveTo(349, 775, 350, 774, 351, 773);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(229, 760);
                ctx.bezierCurveTo(230, 760, 231, 759, 232, 758);
                ctx.bezierCurveTo(232, 757, 231, 756, 230, 756);
                ctx.bezierCurveTo(228, 756, 227, 757, 227, 758);
                ctx.bezierCurveTo(227, 759, 228, 760, 229, 760);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(236, 548);
                ctx.bezierCurveTo(237, 548, 238, 547, 238, 546);
                ctx.bezierCurveTo(238, 544, 238, 543, 236, 543);
                ctx.bezierCurveTo(235, 543, 234, 544, 234, 545);
                ctx.bezierCurveTo(234, 547, 235, 548, 236, 548);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(269, 665);
                ctx.bezierCurveTo(272, 665, 274, 663, 274, 660);
                ctx.bezierCurveTo(274, 657, 273, 655, 270, 655);
                ctx.bezierCurveTo(267, 654, 265, 657, 265, 660);
                ctx.bezierCurveTo(265, 662, 267, 665, 269, 665);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(430, 936);
                ctx.bezierCurveTo(431, 936, 433, 935, 433, 933);
                ctx.bezierCurveTo(433, 931, 432, 929, 430, 929);
                ctx.bezierCurveTo(428, 929, 427, 930, 427, 932);
                ctx.bezierCurveTo(427, 934, 428, 936, 430, 936);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(198, 887);
                ctx.bezierCurveTo(200, 887, 201, 886, 202, 884);
                ctx.bezierCurveTo(202, 882, 200, 880, 199, 880);
                ctx.bezierCurveTo(197, 880, 195, 881, 195, 883);
                ctx.bezierCurveTo(195, 885, 197, 887, 198, 887);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(262, 572);
                ctx.bezierCurveTo(263, 572, 264, 573, 264, 575);
                ctx.bezierCurveTo(263, 576, 262, 577, 261, 577);
                ctx.bezierCurveTo(260, 577, 259, 576, 259, 574);
                ctx.bezierCurveTo(259, 573, 260, 572, 262, 572);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(433, 1110);
                ctx.bezierCurveTo(435, 1110, 436, 1112, 435, 1113);
                ctx.bezierCurveTo(435, 1114, 434, 1115, 433, 1115);
                ctx.bezierCurveTo(432, 1115, 431, 1114, 431, 1113);
                ctx.bezierCurveTo(431, 1111, 432, 1110, 433, 1110);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(382, 1183);
                ctx.bezierCurveTo(383, 1183, 384, 1184, 384, 1186);
                ctx.bezierCurveTo(384, 1187, 383, 1188, 382, 1188);
                ctx.bezierCurveTo(380, 1188, 379, 1187, 380, 1185);
                ctx.bezierCurveTo(380, 1184, 381, 1183, 382, 1183);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(212, 953);
                ctx.bezierCurveTo(213, 953, 214, 955, 214, 956);
                ctx.bezierCurveTo(214, 957, 213, 958, 212, 958);
                ctx.bezierCurveTo(211, 958, 210, 957, 210, 956);
                ctx.bezierCurveTo(210, 954, 211, 953, 212, 953);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(424, 1171);
                ctx.bezierCurveTo(425, 1171, 426, 1172, 426, 1174);
                ctx.bezierCurveTo(425, 1175, 424, 1176, 423, 1176);
                ctx.bezierCurveTo(422, 1176, 421, 1175, 421, 1173);
                ctx.bezierCurveTo(421, 1172, 422, 1171, 424, 1171);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(413, 1058);
                ctx.bezierCurveTo(415, 1058, 416, 1059, 416, 1061);
                ctx.bezierCurveTo(416, 1063, 415, 1065, 413, 1065);
                ctx.bezierCurveTo(411, 1065, 410, 1063, 410, 1061);
                ctx.bezierCurveTo(410, 1059, 412, 1057, 413, 1058);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(103, 555);
                ctx.bezierCurveTo(102, 555, 101, 554, 101, 553);
                ctx.bezierCurveTo(101, 551, 102, 550, 103, 551);
                ctx.bezierCurveTo(104, 551, 105, 552, 105, 553);
                ctx.bezierCurveTo(105, 554, 104, 555, 103, 555);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(85, 747);
                ctx.bezierCurveTo(84, 747, 83, 746, 83, 745);
                ctx.bezierCurveTo(83, 743, 84, 742, 85, 743);
                ctx.bezierCurveTo(86, 743, 87, 744, 87, 745);
                ctx.bezierCurveTo(87, 746, 86, 747, 85, 747);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(44, 640);
                ctx.bezierCurveTo(43, 640, 42, 639, 42, 637);
                ctx.bezierCurveTo(42, 636, 43, 635, 44, 635);
                ctx.bezierCurveTo(45, 635, 46, 636, 46, 638);
                ctx.bezierCurveTo(46, 639, 45, 640, 44, 640);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(202, 648);
                ctx.bezierCurveTo(201, 648, 200, 647, 200, 646);
                ctx.bezierCurveTo(200, 645, 201, 644, 202, 644);
                ctx.bezierCurveTo(203, 644, 204, 645, 204, 646);
                ctx.bezierCurveTo(204, 647, 203, 648, 202, 648);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(112, 993);
                ctx.bezierCurveTo(111, 993, 110, 992, 110, 991);
                ctx.bezierCurveTo(110, 989, 111, 988, 112, 988);
                ctx.bezierCurveTo(113, 989, 114, 990, 114, 991);
                ctx.bezierCurveTo(114, 992, 113, 993, 112, 993);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(18, 1000);
                ctx.bezierCurveTo(17, 1000, 16, 999, 16, 998);
                ctx.bezierCurveTo(16, 996, 17, 995, 18, 995);
                ctx.bezierCurveTo(20, 995, 20, 997, 20, 998);
                ctx.bezierCurveTo(20, 999, 19, 1000, 18, 1000);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(349, 559);
                ctx.bezierCurveTo(348, 559, 347, 558, 347, 556);
                ctx.bezierCurveTo(347, 555, 348, 554, 349, 554);
                ctx.bezierCurveTo(350, 554, 351, 555, 351, 557);
                ctx.bezierCurveTo(351, 558, 350, 559, 349, 559);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(352, 859);
                ctx.bezierCurveTo(351, 859, 350, 858, 350, 856);
                ctx.bezierCurveTo(350, 855, 351, 854, 352, 854);
                ctx.bezierCurveTo(354, 854, 354, 855, 354, 857);
                ctx.bezierCurveTo(354, 858, 353, 859, 352, 859);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(148, 923);
                ctx.bezierCurveTo(147, 923, 146, 922, 146, 920);
                ctx.bezierCurveTo(146, 919, 147, 918, 148, 918);
                ctx.bezierCurveTo(150, 918, 150, 919, 150, 921);
                ctx.bezierCurveTo(150, 922, 149, 923, 148, 923);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(58, 573);
                ctx.bezierCurveTo(57, 573, 55, 571, 55, 569);
                ctx.bezierCurveTo(55, 567, 57, 566, 59, 566);
                ctx.bezierCurveTo(60, 566, 62, 568, 62, 570);
                ctx.bezierCurveTo(62, 571, 60, 573, 58, 573);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(307, 647);
                ctx.bezierCurveTo(305, 647, 304, 646, 304, 644);
                ctx.bezierCurveTo(304, 642, 305, 640, 307, 640);
                ctx.bezierCurveTo(309, 640, 310, 642, 310, 644);
                ctx.bezierCurveTo(310, 646, 308, 647, 307, 647);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(161, 569);
                ctx.bezierCurveTo(160, 569, 159, 570, 159, 572);
                ctx.bezierCurveTo(159, 573, 159, 574, 161, 574);
                ctx.bezierCurveTo(162, 574, 163, 573, 163, 572);
                ctx.bezierCurveTo(163, 571, 162, 570, 161, 569);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(221, 987);
                ctx.bezierCurveTo(220, 987, 219, 988, 219, 989);
                ctx.bezierCurveTo(219, 990, 219, 991, 221, 991);
                ctx.bezierCurveTo(222, 991, 223, 990, 223, 989);
                ctx.bezierCurveTo(223, 988, 222, 987, 221, 987);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(331, 1132);
                ctx.bezierCurveTo(329, 1132, 328, 1133, 328, 1134);
                ctx.bezierCurveTo(328, 1135, 329, 1137, 330, 1137);
                ctx.bezierCurveTo(331, 1137, 332, 1136, 333, 1134);
                ctx.bezierCurveTo(333, 1133, 332, 1132, 331, 1132);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(332, 1008);
                ctx.bezierCurveTo(331, 1008, 330, 1009, 330, 1011);
                ctx.bezierCurveTo(329, 1012, 330, 1013, 332, 1013);
                ctx.bezierCurveTo(333, 1013, 334, 1012, 334, 1011);
                ctx.bezierCurveTo(334, 1010, 333, 1009, 332, 1008);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(158, 1077);
                ctx.bezierCurveTo(157, 1077, 156, 1077, 156, 1079);
                ctx.bezierCurveTo(156, 1080, 156, 1081, 158, 1081);
                ctx.bezierCurveTo(159, 1081, 160, 1080, 160, 1079);
                ctx.bezierCurveTo(160, 1078, 159, 1077, 158, 1077);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(88, 806);
                ctx.bezierCurveTo(86, 806, 85, 807, 85, 809);
                ctx.bezierCurveTo(85, 810, 86, 811, 87, 811);
                ctx.bezierCurveTo(88, 811, 89, 810, 90, 809);
                ctx.bezierCurveTo(90, 808, 89, 806, 88, 806);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(308, 1030);
                ctx.bezierCurveTo(306, 1030, 305, 1032, 305, 1034);
                ctx.bezierCurveTo(305, 1036, 306, 1037, 308, 1037);
                ctx.bezierCurveTo(310, 1037, 311, 1036, 311, 1034);
                ctx.bezierCurveTo(311, 1032, 310, 1030, 308, 1030);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(274, 790);
                ctx.bezierCurveTo(272, 790, 271, 791, 271, 793);
                ctx.bezierCurveTo(271, 795, 272, 797, 274, 797);
                ctx.bezierCurveTo(276, 797, 277, 796, 277, 794);
                ctx.bezierCurveTo(277, 792, 276, 790, 274, 790);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(8, 1123);
                ctx.bezierCurveTo(7, 1123, 6, 1124, 5, 1125);
                ctx.bezierCurveTo(5, 1127, 6, 1128, 7, 1128);
                ctx.bezierCurveTo(9, 1128, 10, 1127, 10, 1126);
                ctx.bezierCurveTo(10, 1124, 9, 1123, 8, 1123);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(63, 1093);
                ctx.bezierCurveTo(61, 1093, 60, 1094, 60, 1095);
                ctx.bezierCurveTo(60, 1097, 61, 1098, 62, 1098);
                ctx.bezierCurveTo(64, 1098, 65, 1097, 65, 1096);
                ctx.bezierCurveTo(65, 1094, 64, 1093, 63, 1093);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(123, 1084);
                ctx.bezierCurveTo(122, 1084, 120, 1086, 120, 1088);
                ctx.bezierCurveTo(120, 1090, 121, 1091, 123, 1091);
                ctx.bezierCurveTo(125, 1091, 126, 1090, 126, 1088);
                ctx.bezierCurveTo(126, 1086, 125, 1084, 123, 1084);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(11, 820);
                ctx.bezierCurveTo(12, 820, 13, 819, 14, 817);
                ctx.bezierCurveTo(14, 816, 13, 815, 12, 815);
                ctx.bezierCurveTo(10, 815, 9, 816, 9, 817);
                ctx.bezierCurveTo(9, 818, 10, 820, 11, 820);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(213, 1143);
                ctx.bezierCurveTo(216, 1143, 218, 1141, 218, 1138);
                ctx.bezierCurveTo(218, 1135, 216, 1133, 214, 1133);
                ctx.bezierCurveTo(211, 1133, 209, 1135, 209, 1138);
                ctx.bezierCurveTo(209, 1141, 211, 1143, 213, 1143);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(410, 684);
                ctx.bezierCurveTo(411, 684, 412, 685, 412, 686);
                ctx.bezierCurveTo(412, 688, 411, 689, 410, 688);
                ctx.bezierCurveTo(409, 688, 408, 687, 408, 686);
                ctx.bezierCurveTo(408, 685, 409, 684, 410, 684);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(452, 672);
                ctx.bezierCurveTo(453, 672, 454, 673, 454, 674);
                ctx.bezierCurveTo(454, 676, 453, 677, 452, 676);
                ctx.bezierCurveTo(451, 676, 450, 675, 450, 674);
                ctx.bezierCurveTo(450, 673, 451, 672, 452, 672);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(442, 558);
                ctx.bezierCurveTo(444, 558, 445, 560, 445, 562);
                ctx.bezierCurveTo(445, 564, 443, 565, 442, 565);
                ctx.bezierCurveTo(440, 565, 439, 564, 439, 562);
                ctx.bezierCurveTo(439, 560, 440, 558, 442, 558);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(10, 968);
                ctx.bezierCurveTo(11, 968, 12, 969, 12, 971);
                ctx.bezierCurveTo(12, 972, 11, 973, 10, 973);
                ctx.bezierCurveTo(8, 973, 8, 972, 8, 970);
                ctx.bezierCurveTo(8, 969, 9, 968, 10, 968);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(438, 190);
                ctx.bezierCurveTo(439, 190, 440, 190, 440, 188);
                ctx.bezierCurveTo(440, 187, 439, 186, 438, 186);
                ctx.bezierCurveTo(437, 186, 436, 187, 436, 188);
                ctx.bezierCurveTo(436, 189, 436, 190, 438, 190);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(145, 120);
                ctx.bezierCurveTo(146, 119, 146, 117, 145, 116);
                ctx.bezierCurveTo(144, 116, 143, 116, 142, 117);
                ctx.bezierCurveTo(141, 118, 142, 119, 143, 120);
                ctx.bezierCurveTo(143, 121, 145, 121, 145, 120);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(49, 260);
                ctx.bezierCurveTo(50, 260, 51, 259, 51, 258);
                ctx.bezierCurveTo(51, 257, 50, 256, 49, 256);
                ctx.bezierCurveTo(48, 255, 47, 256, 47, 258);
                ctx.bezierCurveTo(47, 259, 48, 260, 49, 260);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(351, 153);
                ctx.bezierCurveTo(351, 152, 351, 151, 350, 150);
                ctx.bezierCurveTo(349, 149, 348, 150, 347, 151);
                ctx.bezierCurveTo(346, 152, 347, 153, 348, 154);
                ctx.bezierCurveTo(349, 155, 350, 154, 351, 153);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(229, 141);
                ctx.bezierCurveTo(230, 141, 231, 140, 232, 138);
                ctx.bezierCurveTo(232, 137, 231, 136, 230, 136);
                ctx.bezierCurveTo(228, 136, 227, 137, 227, 138);
                ctx.bezierCurveTo(227, 139, 228, 140, 229, 141);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(269, 45);
                ctx.bezierCurveTo(272, 45, 274, 43, 274, 40);
                ctx.bezierCurveTo(274, 37, 273, 35, 270, 35);
                ctx.bezierCurveTo(267, 35, 265, 37, 265, 40);
                ctx.bezierCurveTo(265, 43, 267, 45, 269, 45);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(430, 316);
                ctx.bezierCurveTo(431, 316, 433, 315, 433, 313);
                ctx.bezierCurveTo(433, 311, 432, 309, 430, 309);
                ctx.bezierCurveTo(428, 309, 427, 310, 427, 312);
                ctx.bezierCurveTo(427, 314, 428, 316, 430, 316);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(198, 267);
                ctx.bezierCurveTo(200, 267, 201, 266, 202, 264);
                ctx.bezierCurveTo(202, 262, 200, 260, 199, 260);
                ctx.bezierCurveTo(197, 260, 195, 262, 195, 263);
                ctx.bezierCurveTo(195, 265, 197, 267, 198, 267);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(433, 490);
                ctx.bezierCurveTo(435, 491, 436, 492, 435, 493);
                ctx.bezierCurveTo(435, 494, 434, 495, 433, 495);
                ctx.bezierCurveTo(432, 495, 431, 494, 431, 493);
                ctx.bezierCurveTo(431, 491, 432, 490, 433, 490);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(382, 563);
                ctx.bezierCurveTo(383, 563, 384, 564, 384, 566);
                ctx.bezierCurveTo(384, 567, 383, 568, 382, 568);
                ctx.bezierCurveTo(380, 568, 379, 567, 380, 565);
                ctx.bezierCurveTo(380, 564, 381, 563, 382, 563);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(212, 333);
                ctx.bezierCurveTo(213, 334, 214, 335, 214, 336);
                ctx.bezierCurveTo(214, 337, 213, 338, 212, 338);
                ctx.bezierCurveTo(211, 338, 210, 337, 210, 336);
                ctx.bezierCurveTo(210, 334, 211, 333, 212, 333);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(424, 551);
                ctx.bezierCurveTo(425, 551, 426, 552, 426, 554);
                ctx.bezierCurveTo(425, 555, 424, 556, 423, 556);
                ctx.bezierCurveTo(422, 556, 421, 555, 421, 553);
                ctx.bezierCurveTo(421, 552, 422, 551, 424, 551);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(413, 438);
                ctx.bezierCurveTo(415, 438, 416, 439, 416, 441);
                ctx.bezierCurveTo(416, 443, 415, 445, 413, 445);
                ctx.bezierCurveTo(411, 445, 410, 443, 410, 441);
                ctx.bezierCurveTo(410, 439, 412, 438, 413, 438);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(85, 127);
                ctx.bezierCurveTo(84, 127, 83, 126, 83, 125);
                ctx.bezierCurveTo(83, 124, 84, 123, 85, 123);
                ctx.bezierCurveTo(86, 123, 87, 124, 87, 125);
                ctx.bezierCurveTo(87, 126, 86, 127, 85, 127);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(44, 20);
                ctx.bezierCurveTo(43, 20, 42, 19, 42, 17);
                ctx.bezierCurveTo(42, 16, 43, 15, 44, 15);
                ctx.bezierCurveTo(45, 15, 46, 16, 46, 18);
                ctx.bezierCurveTo(46, 19, 45, 20, 44, 20);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(202, 28);
                ctx.bezierCurveTo(201, 28, 200, 27, 200, 26);
                ctx.bezierCurveTo(200, 25, 201, 24, 202, 24);
                ctx.bezierCurveTo(203, 24, 204, 25, 204, 26);
                ctx.bezierCurveTo(204, 28, 203, 29, 202, 28);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(112, 373);
                ctx.bezierCurveTo(111, 373, 110, 372, 110, 371);
                ctx.bezierCurveTo(110, 369, 111, 369, 112, 369);
                ctx.bezierCurveTo(113, 369, 114, 370, 114, 371);
                ctx.bezierCurveTo(114, 372, 113, 373, 112, 373);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(18, 380);
                ctx.bezierCurveTo(17, 380, 16, 379, 16, 378);
                ctx.bezierCurveTo(16, 376, 17, 375, 18, 375);
                ctx.bezierCurveTo(20, 376, 20, 377, 20, 378);
                ctx.bezierCurveTo(20, 379, 19, 380, 18, 380);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(352, 239);
                ctx.bezierCurveTo(351, 239, 350, 238, 350, 236);
                ctx.bezierCurveTo(350, 235, 351, 234, 352, 234);
                ctx.bezierCurveTo(354, 234, 354, 235, 354, 237);
                ctx.bezierCurveTo(354, 238, 353, 239, 352, 239);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(148, 303);
                ctx.bezierCurveTo(147, 303, 146, 302, 146, 300);
                ctx.bezierCurveTo(146, 299, 147, 298, 148, 298);
                ctx.bezierCurveTo(150, 298, 150, 299, 150, 301);
                ctx.bezierCurveTo(150, 302, 149, 303, 148, 303);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(307, 27);
                ctx.bezierCurveTo(305, 27, 304, 26, 304, 24);
                ctx.bezierCurveTo(304, 22, 305, 20, 307, 20);
                ctx.bezierCurveTo(309, 21, 310, 22, 310, 24);
                ctx.bezierCurveTo(310, 26, 308, 28, 307, 27);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(221, 367);
                ctx.bezierCurveTo(220, 367, 219, 368, 219, 369);
                ctx.bezierCurveTo(219, 370, 219, 371, 221, 371);
                ctx.bezierCurveTo(222, 371, 223, 370, 223, 369);
                ctx.bezierCurveTo(223, 368, 222, 367, 221, 367);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(331, 512);
                ctx.bezierCurveTo(329, 512, 328, 513, 328, 514);
                ctx.bezierCurveTo(328, 516, 329, 517, 330, 517);
                ctx.bezierCurveTo(331, 517, 332, 516, 333, 515);
                ctx.bezierCurveTo(333, 513, 332, 512, 331, 512);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(332, 389);
                ctx.bezierCurveTo(331, 389, 330, 390, 330, 391);
                ctx.bezierCurveTo(329, 392, 330, 393, 332, 393);
                ctx.bezierCurveTo(333, 393, 334, 392, 334, 391);
                ctx.bezierCurveTo(334, 390, 333, 389, 332, 389);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(158, 457);
                ctx.bezierCurveTo(157, 457, 156, 458, 156, 459);
                ctx.bezierCurveTo(156, 460, 156, 461, 158, 461);
                ctx.bezierCurveTo(159, 461, 160, 460, 160, 459);
                ctx.bezierCurveTo(160, 458, 159, 457, 158, 457);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(88, 187);
                ctx.bezierCurveTo(86, 186, 85, 187, 85, 189);
                ctx.bezierCurveTo(85, 190, 86, 191, 87, 191);
                ctx.bezierCurveTo(88, 191, 89, 190, 90, 189);
                ctx.bezierCurveTo(90, 188, 89, 187, 88, 187);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(308, 410);
                ctx.bezierCurveTo(306, 410, 305, 412, 305, 414);
                ctx.bezierCurveTo(305, 416, 306, 417, 308, 417);
                ctx.bezierCurveTo(310, 418, 311, 416, 311, 414);
                ctx.bezierCurveTo(311, 412, 310, 411, 308, 410);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(274, 170);
                ctx.bezierCurveTo(272, 170, 271, 171, 271, 173);
                ctx.bezierCurveTo(271, 175, 272, 177, 274, 177);
                ctx.bezierCurveTo(276, 177, 277, 176, 277, 174);
                ctx.bezierCurveTo(277, 172, 276, 170, 274, 170);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(8, 503);
                ctx.bezierCurveTo(7, 503, 6, 504, 5, 505);
                ctx.bezierCurveTo(5, 507, 6, 508, 7, 508);
                ctx.bezierCurveTo(9, 508, 10, 507, 10, 506);
                ctx.bezierCurveTo(10, 504, 9, 503, 8, 503);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(63, 473);
                ctx.bezierCurveTo(61, 473, 60, 474, 60, 476);
                ctx.bezierCurveTo(60, 477, 61, 478, 62, 478);
                ctx.bezierCurveTo(64, 478, 65, 477, 65, 476);
                ctx.bezierCurveTo(65, 474, 64, 473, 63, 473);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(123, 464);
                ctx.bezierCurveTo(122, 464, 120, 466, 120, 468);
                ctx.bezierCurveTo(120, 470, 121, 471, 123, 471);
                ctx.bezierCurveTo(125, 472, 126, 470, 126, 468);
                ctx.bezierCurveTo(126, 466, 125, 465, 123, 464);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(11, 200);
                ctx.bezierCurveTo(12, 200, 13, 199, 14, 198);
                ctx.bezierCurveTo(14, 196, 13, 195, 12, 195);
                ctx.bezierCurveTo(10, 195, 9, 196, 9, 197);
                ctx.bezierCurveTo(9, 199, 10, 200, 11, 200);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(213, 523);
                ctx.bezierCurveTo(216, 523, 218, 521, 218, 518);
                ctx.bezierCurveTo(218, 516, 216, 513, 214, 513);
                ctx.bezierCurveTo(211, 513, 209, 515, 209, 518);
                ctx.bezierCurveTo(209, 521, 211, 523, 213, 523);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(410, 64);
                ctx.bezierCurveTo(411, 64, 412, 65, 412, 66);
                ctx.bezierCurveTo(412, 68, 411, 69, 410, 69);
                ctx.bezierCurveTo(409, 68, 408, 67, 408, 66);
                ctx.bezierCurveTo(408, 65, 409, 64, 410, 64);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(452, 52);
                ctx.bezierCurveTo(453, 52, 454, 53, 454, 54);
                ctx.bezierCurveTo(454, 56, 453, 57, 452, 57);
                ctx.bezierCurveTo(451, 56, 450, 55, 450, 54);
                ctx.bezierCurveTo(450, 53, 451, 52, 452, 52);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(10, 348);
                ctx.bezierCurveTo(11, 348, 12, 349, 12, 351);
                ctx.bezierCurveTo(12, 352, 11, 353, 10, 353);
                ctx.bezierCurveTo(8, 353, 8, 352, 8, 351);
                ctx.bezierCurveTo(8, 349, 9, 348, 10, 348);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(490, 393);
                ctx.bezierCurveTo(488, 393, 487, 394, 487, 395);
                ctx.bezierCurveTo(487, 396, 488, 397, 489, 397);
                ctx.bezierCurveTo(491, 397, 492, 396, 492, 395);
                ctx.bezierCurveTo(492, 394, 491, 393, 490, 393);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(782, 463);
                ctx.bezierCurveTo(781, 464, 781, 466, 782, 467);
                ctx.bezierCurveTo(783, 467, 785, 467, 785, 466);
                ctx.bezierCurveTo(786, 465, 786, 464, 785, 463);
                ctx.bezierCurveTo(784, 462, 782, 462, 782, 463);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(878, 323);
                ctx.bezierCurveTo(877, 323, 876, 324, 876, 325);
                ctx.bezierCurveTo(876, 326, 877, 327, 878, 328);
                ctx.bezierCurveTo(879, 328, 880, 327, 880, 325);
                ctx.bezierCurveTo(880, 324, 879, 323, 878, 323);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(577, 430);
                ctx.bezierCurveTo(576, 431, 576, 432, 577, 433);
                ctx.bezierCurveTo(578, 434, 579, 434, 580, 432);
                ctx.bezierCurveTo(581, 431, 581, 430, 580, 429);
                ctx.bezierCurveTo(579, 428, 577, 429, 577, 430);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(698, 443);
                ctx.bezierCurveTo(697, 442, 696, 443, 696, 445);
                ctx.bezierCurveTo(696, 446, 697, 447, 698, 447);
                ctx.bezierCurveTo(699, 447, 700, 446, 700, 445);
                ctx.bezierCurveTo(700, 444, 699, 443, 698, 443);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(691, 655);
                ctx.bezierCurveTo(690, 655, 689, 656, 689, 657);
                ctx.bezierCurveTo(689, 659, 690, 660, 691, 660);
                ctx.bezierCurveTo(692, 660, 693, 659, 693, 658);
                ctx.bezierCurveTo(693, 656, 692, 655, 691, 655);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(658, 538);
                ctx.bezierCurveTo(655, 538, 653, 540, 653, 543);
                ctx.bezierCurveTo(653, 546, 655, 548, 657, 548);
                ctx.bezierCurveTo(660, 549, 662, 546, 662, 543);
                ctx.bezierCurveTo(662, 541, 660, 538, 658, 538);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(498, 267);
                ctx.bezierCurveTo(496, 267, 494, 268, 494, 270);
                ctx.bezierCurveTo(494, 272, 496, 274, 497, 274);
                ctx.bezierCurveTo(499, 274, 501, 273, 501, 271);
                ctx.bezierCurveTo(501, 269, 499, 267, 498, 267);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(729, 316);
                ctx.bezierCurveTo(727, 316, 726, 317, 726, 319);
                ctx.bezierCurveTo(726, 321, 727, 323, 729, 323);
                ctx.bezierCurveTo(730, 323, 732, 322, 732, 320);
                ctx.bezierCurveTo(732, 318, 731, 316, 729, 316);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(666, 631);
                ctx.bezierCurveTo(665, 631, 664, 630, 664, 628);
                ctx.bezierCurveTo(664, 627, 665, 626, 666, 626);
                ctx.bezierCurveTo(667, 626, 668, 627, 668, 629);
                ctx.bezierCurveTo(668, 630, 667, 631, 666, 631);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(494, 93);
                ctx.bezierCurveTo(493, 93, 492, 91, 492, 90);
                ctx.bezierCurveTo(492, 89, 493, 88, 494, 88);
                ctx.bezierCurveTo(495, 88, 496, 89, 496, 90);
                ctx.bezierCurveTo(496, 92, 495, 93, 494, 93);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(545, 20);
                ctx.bezierCurveTo(544, 20, 543, 19, 544, 17);
                ctx.bezierCurveTo(544, 16, 545, 15, 546, 15);
                ctx.bezierCurveTo(547, 15, 548, 16, 548, 18);
                ctx.bezierCurveTo(548, 19, 547, 20, 545, 20);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(715, 250);
                ctx.bezierCurveTo(714, 250, 713, 248, 713, 247);
                ctx.bezierCurveTo(713, 246, 714, 245, 715, 245);
                ctx.bezierCurveTo(716, 245, 717, 246, 717, 247);
                ctx.bezierCurveTo(717, 249, 716, 250, 715, 250);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(504, 32);
                ctx.bezierCurveTo(503, 32, 502, 31, 502, 29);
                ctx.bezierCurveTo(502, 28, 503, 27, 504, 27);
                ctx.bezierCurveTo(505, 27, 506, 28, 506, 30);
                ctx.bezierCurveTo(506, 31, 505, 32, 504, 32);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(514, 145);
                ctx.bezierCurveTo(512, 145, 511, 144, 511, 142);
                ctx.bezierCurveTo(511, 140, 512, 138, 514, 138);
                ctx.bezierCurveTo(516, 138, 517, 140, 517, 142);
                ctx.bezierCurveTo(517, 144, 516, 145, 514, 145);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(825, 648);
                ctx.bezierCurveTo(826, 648, 827, 649, 826, 650);
                ctx.bezierCurveTo(826, 652, 825, 653, 824, 652);
                ctx.bezierCurveTo(823, 652, 822, 651, 822, 650);
                ctx.bezierCurveTo(822, 649, 823, 648, 825, 648);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(843, 456);
                ctx.bezierCurveTo(844, 456, 845, 457, 845, 458);
                ctx.bezierCurveTo(844, 459, 843, 460, 842, 460);
                ctx.bezierCurveTo(841, 460, 840, 459, 840, 458);
                ctx.bezierCurveTo(840, 457, 841, 456, 843, 456);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(883, 563);
                ctx.bezierCurveTo(884, 563, 885, 564, 885, 566);
                ctx.bezierCurveTo(885, 567, 884, 568, 883, 568);
                ctx.bezierCurveTo(882, 568, 881, 567, 881, 565);
                ctx.bezierCurveTo(881, 564, 882, 563, 883, 563);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(726, 555);
                ctx.bezierCurveTo(727, 555, 728, 556, 728, 557);
                ctx.bezierCurveTo(728, 558, 727, 559, 725, 559);
                ctx.bezierCurveTo(724, 559, 723, 558, 723, 557);
                ctx.bezierCurveTo(723, 555, 724, 555, 726, 555);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(815, 210);
                ctx.bezierCurveTo(816, 210, 817, 211, 817, 212);
                ctx.bezierCurveTo(817, 214, 816, 215, 815, 214);
                ctx.bezierCurveTo(814, 214, 813, 213, 813, 212);
                ctx.bezierCurveTo(813, 211, 814, 210, 815, 210);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(909, 203);
                ctx.bezierCurveTo(910, 203, 911, 204, 911, 205);
                ctx.bezierCurveTo(911, 207, 910, 208, 909, 208);
                ctx.bezierCurveTo(908, 208, 907, 206, 907, 205);
                ctx.bezierCurveTo(907, 204, 908, 203, 909, 203);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(578, 644);
                ctx.bezierCurveTo(579, 644, 580, 645, 580, 647);
                ctx.bezierCurveTo(580, 648, 579, 649, 578, 649);
                ctx.bezierCurveTo(577, 649, 576, 648, 576, 646);
                ctx.bezierCurveTo(576, 645, 577, 644, 578, 644);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(575, 344);
                ctx.bezierCurveTo(576, 344, 577, 345, 577, 347);
                ctx.bezierCurveTo(577, 348, 576, 349, 575, 349);
                ctx.bezierCurveTo(574, 349, 573, 348, 573, 346);
                ctx.bezierCurveTo(573, 345, 574, 344, 575, 344);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(779, 280);
                ctx.bezierCurveTo(780, 280, 781, 281, 781, 283);
                ctx.bezierCurveTo(781, 284, 780, 285, 779, 285);
                ctx.bezierCurveTo(778, 285, 777, 284, 777, 282);
                ctx.bezierCurveTo(777, 281, 778, 280, 779, 280);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(869, 630);
                ctx.bezierCurveTo(871, 630, 872, 632, 872, 634);
                ctx.bezierCurveTo(872, 636, 870, 637, 869, 637);
                ctx.bezierCurveTo(867, 637, 866, 635, 866, 633);
                ctx.bezierCurveTo(866, 631, 867, 630, 869, 630);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(621, 556);
                ctx.bezierCurveTo(622, 556, 624, 557, 624, 559);
                ctx.bezierCurveTo(624, 561, 622, 563, 620, 563);
                ctx.bezierCurveTo(619, 563, 617, 561, 617, 559);
                ctx.bezierCurveTo(617, 557, 619, 556, 621, 556);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(766, 633);
                ctx.bezierCurveTo(768, 634, 769, 633, 769, 631);
                ctx.bezierCurveTo(769, 630, 768, 629, 767, 629);
                ctx.bezierCurveTo(765, 629, 764, 630, 764, 631);
                ctx.bezierCurveTo(764, 632, 765, 633, 766, 633);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(706, 216);
                ctx.bezierCurveTo(708, 216, 709, 215, 709, 214);
                ctx.bezierCurveTo(709, 213, 708, 212, 707, 212);
                ctx.bezierCurveTo(706, 212, 705, 213, 704, 214);
                ctx.bezierCurveTo(704, 215, 705, 216, 706, 216);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(597, 71);
                ctx.bezierCurveTo(598, 71, 599, 70, 599, 69);
                ctx.bezierCurveTo(599, 67, 598, 66, 597, 66);
                ctx.bezierCurveTo(596, 66, 595, 67, 595, 69);
                ctx.bezierCurveTo(595, 70, 596, 71, 597, 71);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(596, 194);
                ctx.bezierCurveTo(597, 195, 598, 194, 598, 192);
                ctx.bezierCurveTo(598, 191, 597, 190, 596, 190);
                ctx.bezierCurveTo(595, 190, 594, 191, 594, 192);
                ctx.bezierCurveTo(593, 193, 594, 194, 596, 194);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(769, 126);
                ctx.bezierCurveTo(771, 126, 772, 125, 772, 124);
                ctx.bezierCurveTo(772, 123, 771, 122, 770, 122);
                ctx.bezierCurveTo(769, 122, 768, 123, 767, 124);
                ctx.bezierCurveTo(767, 125, 768, 126, 769, 126);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(840, 397);
                ctx.bezierCurveTo(841, 397, 842, 396, 842, 394);
                ctx.bezierCurveTo(842, 393, 841, 392, 840, 392);
                ctx.bezierCurveTo(839, 392, 838, 393, 838, 394);
                ctx.bezierCurveTo(838, 395, 839, 396, 840, 397);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(619, 173);
                ctx.bezierCurveTo(621, 173, 622, 171, 622, 169);
                ctx.bezierCurveTo(623, 167, 621, 166, 619, 166);
                ctx.bezierCurveTo(618, 165, 616, 167, 616, 169);
                ctx.bezierCurveTo(616, 171, 617, 173, 619, 173);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(653, 413);
                ctx.bezierCurveTo(655, 413, 656, 412, 656, 410);
                ctx.bezierCurveTo(657, 408, 655, 406, 653, 406);
                ctx.bezierCurveTo(652, 406, 650, 407, 650, 409);
                ctx.bezierCurveTo(650, 411, 651, 413, 653, 413);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(920, 80);
                ctx.bezierCurveTo(921, 80, 922, 79, 922, 78);
                ctx.bezierCurveTo(922, 76, 921, 75, 920, 75);
                ctx.bezierCurveTo(919, 75, 918, 76, 918, 77);
                ctx.bezierCurveTo(918, 79, 918, 80, 920, 80);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(865, 110);
                ctx.bezierCurveTo(866, 110, 867, 109, 867, 108);
                ctx.bezierCurveTo(867, 106, 866, 105, 865, 105);
                ctx.bezierCurveTo(864, 105, 863, 106, 863, 107);
                ctx.bezierCurveTo(863, 109, 863, 110, 865, 110);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(804, 119);
                ctx.bezierCurveTo(806, 119, 807, 117, 807, 115);
                ctx.bezierCurveTo(807, 113, 806, 112, 804, 112);
                ctx.bezierCurveTo(803, 111, 801, 113, 801, 115);
                ctx.bezierCurveTo(801, 117, 802, 119, 804, 119);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(916, 383);
                ctx.bezierCurveTo(915, 383, 914, 384, 914, 385);
                ctx.bezierCurveTo(914, 387, 915, 388, 916, 388);
                ctx.bezierCurveTo(917, 388, 918, 387, 918, 386);
                ctx.bezierCurveTo(918, 384, 917, 383, 916, 383);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(714, 60);
                ctx.bezierCurveTo(711, 60, 709, 62, 709, 65);
                ctx.bezierCurveTo(709, 67, 711, 70, 713, 70);
                ctx.bezierCurveTo(716, 70, 718, 68, 718, 65);
                ctx.bezierCurveTo(718, 62, 716, 60, 714, 60);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(517, 519);
                ctx.bezierCurveTo(516, 519, 515, 518, 515, 517);
                ctx.bezierCurveTo(515, 515, 516, 514, 517, 515);
                ctx.bezierCurveTo(518, 515, 519, 516, 519, 517);
                ctx.bezierCurveTo(519, 518, 518, 519, 517, 519);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(475, 531);
                ctx.bezierCurveTo(474, 531, 473, 530, 473, 529);
                ctx.bezierCurveTo(473, 527, 474, 526, 475, 527);
                ctx.bezierCurveTo(477, 527, 477, 528, 477, 529);
                ctx.bezierCurveTo(477, 530, 476, 531, 475, 531);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(485, 645);
                ctx.bezierCurveTo(484, 645, 482, 643, 482, 641);
                ctx.bezierCurveTo(482, 639, 484, 638, 486, 638);
                ctx.bezierCurveTo(487, 638, 489, 639, 489, 641);
                ctx.bezierCurveTo(489, 643, 487, 645, 485, 645);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(917, 235);
                ctx.bezierCurveTo(916, 235, 915, 234, 915, 232);
                ctx.bezierCurveTo(915, 231, 916, 230, 918, 230);
                ctx.bezierCurveTo(919, 230, 920, 231, 920, 233);
                ctx.bezierCurveTo(920, 234, 919, 235, 917, 235);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(490, 1013);
                ctx.bezierCurveTo(488, 1012, 487, 1013, 487, 1015);
                ctx.bezierCurveTo(487, 1016, 488, 1017, 489, 1017);
                ctx.bezierCurveTo(491, 1017, 492, 1016, 492, 1015);
                ctx.bezierCurveTo(492, 1014, 491, 1013, 490, 1013);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(782, 1083);
                ctx.bezierCurveTo(781, 1084, 781, 1086, 782, 1087);
                ctx.bezierCurveTo(783, 1087, 785, 1087, 785, 1086);
                ctx.bezierCurveTo(786, 1085, 786, 1084, 785, 1083);
                ctx.bezierCurveTo(784, 1082, 782, 1082, 782, 1083);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(878, 943);
                ctx.bezierCurveTo(877, 943, 876, 944, 876, 945);
                ctx.bezierCurveTo(876, 946, 877, 947, 878, 947);
                ctx.bezierCurveTo(879, 947, 880, 947, 880, 945);
                ctx.bezierCurveTo(880, 944, 879, 943, 878, 943);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(577, 1050);
                ctx.bezierCurveTo(576, 1051, 576, 1052, 577, 1053);
                ctx.bezierCurveTo(578, 1054, 579, 1053, 580, 1052);
                ctx.bezierCurveTo(581, 1051, 581, 1050, 580, 1049);
                ctx.bezierCurveTo(579, 1048, 577, 1049, 577, 1050);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(698, 1062);
                ctx.bezierCurveTo(697, 1062, 696, 1063, 696, 1065);
                ctx.bezierCurveTo(696, 1066, 697, 1067, 698, 1067);
                ctx.bezierCurveTo(699, 1067, 700, 1066, 700, 1065);
                ctx.bezierCurveTo(700, 1064, 699, 1063, 698, 1062);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(658, 1158);
                ctx.bezierCurveTo(655, 1158, 653, 1160, 653, 1163);
                ctx.bezierCurveTo(653, 1166, 655, 1168, 657, 1168);
                ctx.bezierCurveTo(660, 1168, 662, 1166, 662, 1163);
                ctx.bezierCurveTo(662, 1160, 660, 1158, 658, 1158);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(498, 887);
                ctx.bezierCurveTo(496, 887, 494, 888, 494, 890);
                ctx.bezierCurveTo(494, 892, 496, 894, 497, 894);
                ctx.bezierCurveTo(499, 894, 501, 893, 501, 891);
                ctx.bezierCurveTo(501, 889, 499, 887, 498, 887);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(729, 936);
                ctx.bezierCurveTo(727, 936, 726, 937, 726, 939);
                ctx.bezierCurveTo(726, 941, 727, 943, 729, 943);
                ctx.bezierCurveTo(730, 943, 732, 941, 732, 939);
                ctx.bezierCurveTo(732, 937, 731, 936, 729, 936);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(494, 712);
                ctx.bezierCurveTo(493, 712, 492, 711, 492, 710);
                ctx.bezierCurveTo(492, 709, 493, 708, 494, 708);
                ctx.bezierCurveTo(495, 708, 496, 709, 496, 710);
                ctx.bezierCurveTo(496, 712, 495, 713, 494, 712);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(545, 640);
                ctx.bezierCurveTo(544, 640, 543, 639, 544, 637);
                ctx.bezierCurveTo(544, 636, 545, 635, 546, 635);
                ctx.bezierCurveTo(547, 635, 548, 636, 548, 638);
                ctx.bezierCurveTo(548, 639, 547, 640, 545, 640);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(715, 869);
                ctx.bezierCurveTo(714, 869, 713, 868, 713, 867);
                ctx.bezierCurveTo(713, 866, 714, 865, 715, 865);
                ctx.bezierCurveTo(716, 865, 717, 866, 717, 867);
                ctx.bezierCurveTo(717, 869, 716, 870, 715, 869);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(504, 652);
                ctx.bezierCurveTo(503, 652, 502, 651, 502, 649);
                ctx.bezierCurveTo(502, 648, 503, 647, 504, 647);
                ctx.bezierCurveTo(505, 647, 506, 648, 506, 649);
                ctx.bezierCurveTo(506, 651, 505, 652, 504, 652);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(514, 765);
                ctx.bezierCurveTo(512, 765, 511, 763, 511, 762);
                ctx.bezierCurveTo(511, 760, 512, 758, 514, 758);
                ctx.bezierCurveTo(516, 758, 517, 760, 517, 762);
                ctx.bezierCurveTo(517, 764, 516, 765, 514, 765);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(843, 1076);
                ctx.bezierCurveTo(844, 1076, 845, 1077, 845, 1078);
                ctx.bezierCurveTo(844, 1079, 843, 1080, 842, 1080);
                ctx.bezierCurveTo(841, 1080, 840, 1079, 840, 1078);
                ctx.bezierCurveTo(840, 1076, 841, 1075, 843, 1076);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(883, 1183);
                ctx.bezierCurveTo(884, 1183, 885, 1184, 885, 1186);
                ctx.bezierCurveTo(885, 1187, 884, 1188, 883, 1188);
                ctx.bezierCurveTo(882, 1188, 881, 1187, 881, 1185);
                ctx.bezierCurveTo(881, 1184, 882, 1183, 883, 1183);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(726, 1174);
                ctx.bezierCurveTo(727, 1175, 728, 1176, 728, 1177);
                ctx.bezierCurveTo(728, 1178, 727, 1179, 725, 1179);
                ctx.bezierCurveTo(724, 1179, 723, 1178, 723, 1177);
                ctx.bezierCurveTo(723, 1175, 724, 1174, 726, 1174);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(815, 830);
                ctx.bezierCurveTo(816, 830, 817, 831, 817, 832);
                ctx.bezierCurveTo(817, 833, 816, 834, 815, 834);
                ctx.bezierCurveTo(814, 834, 813, 833, 813, 832);
                ctx.bezierCurveTo(813, 831, 814, 830, 815, 830);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(909, 823);
                ctx.bezierCurveTo(910, 823, 911, 824, 911, 825);
                ctx.bezierCurveTo(911, 827, 910, 828, 909, 827);
                ctx.bezierCurveTo(908, 827, 907, 826, 907, 825);
                ctx.bezierCurveTo(907, 824, 908, 823, 909, 823);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(575, 964);
                ctx.bezierCurveTo(576, 964, 577, 965, 577, 967);
                ctx.bezierCurveTo(577, 968, 576, 969, 575, 969);
                ctx.bezierCurveTo(574, 969, 573, 968, 573, 966);
                ctx.bezierCurveTo(573, 965, 574, 964, 575, 964);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(779, 900);
                ctx.bezierCurveTo(780, 900, 781, 901, 781, 902);
                ctx.bezierCurveTo(781, 904, 780, 905, 779, 905);
                ctx.bezierCurveTo(778, 905, 777, 904, 777, 902);
                ctx.bezierCurveTo(777, 901, 778, 900, 779, 900);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(621, 1175);
                ctx.bezierCurveTo(622, 1176, 624, 1177, 624, 1179);
                ctx.bezierCurveTo(624, 1181, 622, 1183, 620, 1183);
                ctx.bezierCurveTo(619, 1182, 617, 1181, 617, 1179);
                ctx.bezierCurveTo(617, 1177, 619, 1175, 621, 1175);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(706, 836);
                ctx.bezierCurveTo(708, 836, 709, 835, 709, 834);
                ctx.bezierCurveTo(709, 833, 708, 832, 707, 832);
                ctx.bezierCurveTo(706, 831, 705, 832, 704, 834);
                ctx.bezierCurveTo(704, 835, 705, 836, 706, 836);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(597, 691);
                ctx.bezierCurveTo(598, 691, 599, 690, 599, 689);
                ctx.bezierCurveTo(599, 687, 598, 686, 597, 686);
                ctx.bezierCurveTo(596, 686, 595, 687, 595, 688);
                ctx.bezierCurveTo(595, 690, 596, 691, 597, 691);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(596, 814);
                ctx.bezierCurveTo(597, 814, 598, 813, 598, 812);
                ctx.bezierCurveTo(598, 811, 597, 810, 596, 810);
                ctx.bezierCurveTo(595, 810, 594, 811, 594, 812);
                ctx.bezierCurveTo(593, 813, 594, 814, 596, 814);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(769, 746);
                ctx.bezierCurveTo(771, 746, 772, 745, 772, 744);
                ctx.bezierCurveTo(772, 743, 771, 742, 770, 742);
                ctx.bezierCurveTo(769, 741, 768, 742, 767, 744);
                ctx.bezierCurveTo(767, 745, 768, 746, 769, 746);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(840, 1016);
                ctx.bezierCurveTo(841, 1016, 842, 1015, 842, 1014);
                ctx.bezierCurveTo(842, 1013, 841, 1012, 840, 1012);
                ctx.bezierCurveTo(839, 1012, 838, 1013, 838, 1014);
                ctx.bezierCurveTo(838, 1015, 839, 1016, 840, 1016);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(619, 793);
                ctx.bezierCurveTo(621, 793, 622, 791, 622, 789);
                ctx.bezierCurveTo(623, 787, 621, 786, 619, 785);
                ctx.bezierCurveTo(618, 785, 616, 787, 616, 789);
                ctx.bezierCurveTo(616, 791, 617, 792, 619, 793);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(653, 1033);
                ctx.bezierCurveTo(655, 1033, 656, 1031, 656, 1030);
                ctx.bezierCurveTo(657, 1028, 655, 1026, 653, 1026);
                ctx.bezierCurveTo(652, 1026, 650, 1027, 650, 1029);
                ctx.bezierCurveTo(650, 1031, 651, 1033, 653, 1033);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(920, 700);
                ctx.bezierCurveTo(921, 700, 922, 699, 922, 697);
                ctx.bezierCurveTo(922, 696, 921, 695, 920, 695);
                ctx.bezierCurveTo(919, 695, 918, 696, 918, 697);
                ctx.bezierCurveTo(918, 699, 918, 700, 920, 700);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(865, 730);
                ctx.bezierCurveTo(866, 730, 867, 729, 867, 727);
                ctx.bezierCurveTo(867, 726, 866, 725, 865, 725);
                ctx.bezierCurveTo(864, 725, 863, 726, 863, 727);
                ctx.bezierCurveTo(863, 728, 863, 730, 865, 730);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(804, 739);
                ctx.bezierCurveTo(806, 739, 807, 737, 807, 735);
                ctx.bezierCurveTo(807, 733, 806, 732, 804, 731);
                ctx.bezierCurveTo(803, 731, 801, 733, 801, 735);
                ctx.bezierCurveTo(801, 737, 802, 738, 804, 739);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(916, 1003);
                ctx.bezierCurveTo(915, 1003, 914, 1004, 914, 1005);
                ctx.bezierCurveTo(914, 1007, 915, 1008, 916, 1008);
                ctx.bezierCurveTo(917, 1008, 918, 1007, 918, 1006);
                ctx.bezierCurveTo(918, 1004, 917, 1003, 916, 1003);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(714, 680);
                ctx.bezierCurveTo(711, 680, 709, 682, 709, 685);
                ctx.bezierCurveTo(709, 687, 711, 690, 713, 690);
                ctx.bezierCurveTo(716, 690, 718, 688, 718, 685);
                ctx.bezierCurveTo(718, 682, 716, 680, 714, 680);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(517, 1139);
                ctx.bezierCurveTo(516, 1139, 515, 1138, 515, 1137);
                ctx.bezierCurveTo(515, 1135, 516, 1134, 517, 1134);
                ctx.bezierCurveTo(518, 1134, 519, 1136, 519, 1137);
                ctx.bezierCurveTo(519, 1138, 518, 1139, 517, 1139);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(475, 1151);
                ctx.bezierCurveTo(474, 1151, 473, 1150, 473, 1149);
                ctx.bezierCurveTo(473, 1147, 474, 1146, 475, 1146);
                ctx.bezierCurveTo(477, 1146, 477, 1148, 477, 1149);
                ctx.bezierCurveTo(477, 1150, 476, 1151, 475, 1151);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(917, 855);
                ctx.bezierCurveTo(916, 855, 915, 853, 915, 852);
                ctx.bezierCurveTo(915, 851, 916, 850, 918, 850);
                ctx.bezierCurveTo(919, 850, 920, 851, 920, 852);
                ctx.bezierCurveTo(920, 854, 919, 855, 917, 855);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(1028, 880);
                ctx.bezierCurveTo(1029, 880, 1030, 879, 1030, 878);
                ctx.bezierCurveTo(1030, 877, 1029, 875, 1028, 875);
                ctx.bezierCurveTo(1027, 875, 1026, 876, 1026, 878);
                ctx.bezierCurveTo(1026, 879, 1027, 880, 1028, 880);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(1063, 747);
                ctx.bezierCurveTo(1062, 747, 1061, 746, 1061, 745);
                ctx.bezierCurveTo(1061, 743, 1062, 742, 1064, 743);
                ctx.bezierCurveTo(1065, 743, 1066, 744, 1066, 745);
                ctx.bezierCurveTo(1066, 746, 1065, 747, 1063, 747);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(1023, 640);
                ctx.bezierCurveTo(1021, 640, 1021, 639, 1021, 637);
                ctx.bezierCurveTo(1021, 636, 1022, 635, 1023, 635);
                ctx.bezierCurveTo(1024, 635, 1025, 636, 1025, 638);
                ctx.bezierCurveTo(1025, 639, 1024, 640, 1023, 640);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(997, 1000);
                ctx.bezierCurveTo(996, 1000, 995, 999, 995, 998);
                ctx.bezierCurveTo(995, 996, 996, 995, 997, 995);
                ctx.bezierCurveTo(998, 995, 999, 997, 999, 998);
                ctx.bezierCurveTo(999, 999, 998, 1000, 997, 1000);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(1037, 573);
                ctx.bezierCurveTo(1035, 573, 1034, 571, 1034, 569);
                ctx.bezierCurveTo(1034, 567, 1036, 566, 1037, 566);
                ctx.bezierCurveTo(1039, 566, 1040, 568, 1040, 570);
                ctx.bezierCurveTo(1040, 571, 1039, 573, 1037, 573);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(1066, 806);
                ctx.bezierCurveTo(1065, 806, 1064, 807, 1064, 809);
                ctx.bezierCurveTo(1064, 810, 1065, 811, 1066, 811);
                ctx.bezierCurveTo(1067, 811, 1068, 810, 1068, 809);
                ctx.bezierCurveTo(1068, 808, 1067, 806, 1066, 806);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(986, 1123);
                ctx.bezierCurveTo(985, 1123, 984, 1124, 984, 1125);
                ctx.bezierCurveTo(984, 1127, 985, 1128, 986, 1128);
                ctx.bezierCurveTo(987, 1128, 988, 1127, 988, 1126);
                ctx.bezierCurveTo(988, 1124, 988, 1123, 986, 1123);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(1041, 1093);
                ctx.bezierCurveTo(1040, 1093, 1039, 1094, 1039, 1095);
                ctx.bezierCurveTo(1039, 1097, 1040, 1098, 1041, 1098);
                ctx.bezierCurveTo(1042, 1098, 1043, 1097, 1043, 1096);
                ctx.bezierCurveTo(1043, 1094, 1042, 1093, 1041, 1093);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(990, 820);
                ctx.bezierCurveTo(991, 820, 992, 819, 992, 817);
                ctx.bezierCurveTo(992, 816, 991, 815, 990, 815);
                ctx.bezierCurveTo(989, 815, 988, 816, 988, 817);
                ctx.bezierCurveTo(988, 818, 989, 820, 990, 820);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(989, 968);
                ctx.bezierCurveTo(990, 968, 991, 969, 991, 971);
                ctx.bezierCurveTo(990, 972, 989, 973, 988, 973);
                ctx.bezierCurveTo(987, 973, 986, 972, 986, 970);
                ctx.bezierCurveTo(986, 969, 987, 968, 989, 968);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(1028, 260);
                ctx.bezierCurveTo(1029, 260, 1030, 259, 1030, 258);
                ctx.bezierCurveTo(1030, 257, 1029, 256, 1028, 256);
                ctx.bezierCurveTo(1027, 255, 1026, 256, 1026, 258);
                ctx.bezierCurveTo(1026, 259, 1027, 260, 1028, 260);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(1063, 127);
                ctx.bezierCurveTo(1062, 127, 1061, 126, 1061, 125);
                ctx.bezierCurveTo(1061, 124, 1062, 123, 1064, 123);
                ctx.bezierCurveTo(1065, 123, 1066, 124, 1066, 125);
                ctx.bezierCurveTo(1066, 126, 1065, 127, 1063, 127);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(1023, 20);
                ctx.bezierCurveTo(1021, 20, 1021, 19, 1021, 17);
                ctx.bezierCurveTo(1021, 16, 1022, 15, 1023, 15);
                ctx.bezierCurveTo(1024, 15, 1025, 16, 1025, 18);
                ctx.bezierCurveTo(1025, 19, 1024, 20, 1023, 20);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(997, 380);
                ctx.bezierCurveTo(996, 380, 995, 379, 995, 378);
                ctx.bezierCurveTo(995, 376, 996, 375, 997, 375);
                ctx.bezierCurveTo(998, 376, 999, 377, 999, 378);
                ctx.bezierCurveTo(999, 379, 998, 380, 997, 380);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(1066, 187);
                ctx.bezierCurveTo(1065, 186, 1064, 187, 1064, 189);
                ctx.bezierCurveTo(1064, 190, 1065, 191, 1066, 191);
                ctx.bezierCurveTo(1067, 191, 1068, 190, 1068, 189);
                ctx.bezierCurveTo(1068, 188, 1067, 187, 1066, 187);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(986, 503);
                ctx.bezierCurveTo(985, 503, 984, 504, 984, 505);
                ctx.bezierCurveTo(984, 507, 985, 508, 986, 508);
                ctx.bezierCurveTo(987, 508, 988, 507, 988, 506);
                ctx.bezierCurveTo(988, 504, 988, 503, 986, 503);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(1041, 473);
                ctx.bezierCurveTo(1040, 473, 1039, 474, 1039, 476);
                ctx.bezierCurveTo(1039, 477, 1040, 478, 1041, 478);
                ctx.bezierCurveTo(1042, 478, 1043, 477, 1043, 476);
                ctx.bezierCurveTo(1043, 474, 1042, 473, 1041, 473);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(990, 200);
                ctx.bezierCurveTo(991, 200, 992, 199, 992, 198);
                ctx.bezierCurveTo(992, 196, 991, 195, 990, 195);
                ctx.bezierCurveTo(989, 195, 988, 196, 988, 197);
                ctx.bezierCurveTo(988, 199, 989, 200, 990, 200);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(989, 348);
                ctx.bezierCurveTo(990, 348, 991, 349, 991, 351);
                ctx.bezierCurveTo(990, 352, 989, 353, 988, 353);
                ctx.bezierCurveTo(987, 353, 986, 352, 986, 351);
                ctx.bezierCurveTo(986, 349, 987, 348, 989, 348);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(1117, 738);
                ctx.bezierCurveTo(1118, 737, 1118, 736, 1117, 735);
                ctx.bezierCurveTo(1116, 734, 1115, 734, 1114, 735);
                ctx.bezierCurveTo(1113, 736, 1113, 738, 1114, 738);
                ctx.bezierCurveTo(1115, 739, 1116, 739, 1117, 738);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(1195, 1053);
                ctx.bezierCurveTo(1196, 1053, 1197, 1054, 1196, 1055);
                ctx.bezierCurveTo(1196, 1056, 1195, 1057, 1194, 1057);
                ctx.bezierCurveTo(1193, 1057, 1192, 1056, 1193, 1055);
                ctx.bezierCurveTo(1193, 1054, 1194, 1053, 1195, 1053);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(1146, 1121);
                ctx.bezierCurveTo(1147, 1121, 1148, 1122, 1148, 1123);
                ctx.bezierCurveTo(1148, 1124, 1147, 1125, 1146, 1125);
                ctx.bezierCurveTo(1145, 1125, 1144, 1124, 1144, 1123);
                ctx.bezierCurveTo(1144, 1122, 1145, 1121, 1146, 1121);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(1185, 1110);
                ctx.bezierCurveTo(1186, 1110, 1187, 1111, 1187, 1112);
                ctx.bezierCurveTo(1187, 1113, 1186, 1114, 1185, 1114);
                ctx.bezierCurveTo(1184, 1114, 1183, 1113, 1183, 1112);
                ctx.bezierCurveTo(1183, 1111, 1184, 1110, 1185, 1110);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(1116, 537);
                ctx.bezierCurveTo(1115, 537, 1114, 536, 1114, 535);
                ctx.bezierCurveTo(1114, 534, 1115, 533, 1116, 533);
                ctx.bezierCurveTo(1117, 533, 1118, 534, 1118, 535);
                ctx.bezierCurveTo(1118, 537, 1117, 538, 1116, 537);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(1119, 818);
                ctx.bezierCurveTo(1118, 818, 1117, 817, 1117, 816);
                ctx.bezierCurveTo(1117, 814, 1118, 813, 1119, 813);
                ctx.bezierCurveTo(1120, 814, 1121, 815, 1121, 816);
                ctx.bezierCurveTo(1121, 817, 1120, 818, 1119, 818);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(1098, 1073);
                ctx.bezierCurveTo(1097, 1073, 1096, 1074, 1096, 1075);
                ctx.bezierCurveTo(1096, 1076, 1097, 1077, 1098, 1077);
                ctx.bezierCurveTo(1099, 1078, 1100, 1077, 1100, 1075);
                ctx.bezierCurveTo(1100, 1074, 1100, 1073, 1098, 1073);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(1100, 958);
                ctx.bezierCurveTo(1098, 958, 1098, 959, 1098, 960);
                ctx.bezierCurveTo(1097, 961, 1098, 962, 1099, 962);
                ctx.bezierCurveTo(1100, 962, 1101, 961, 1101, 960);
                ctx.bezierCurveTo(1101, 959, 1101, 958, 1100, 958);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(1173, 654);
                ctx.bezierCurveTo(1174, 654, 1175, 655, 1175, 657);
                ctx.bezierCurveTo(1175, 658, 1174, 659, 1173, 659);
                ctx.bezierCurveTo(1172, 659, 1171, 658, 1171, 656);
                ctx.bezierCurveTo(1171, 655, 1172, 654, 1173, 654);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(1117, 118);
                ctx.bezierCurveTo(1118, 117, 1118, 116, 1117, 115);
                ctx.bezierCurveTo(1116, 114, 1115, 114, 1114, 115);
                ctx.bezierCurveTo(1113, 116, 1113, 118, 1114, 119);
                ctx.bezierCurveTo(1115, 119, 1116, 119, 1117, 118);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(1195, 433);
                ctx.bezierCurveTo(1196, 433, 1197, 434, 1196, 435);
                ctx.bezierCurveTo(1196, 437, 1195, 438, 1194, 437);
                ctx.bezierCurveTo(1193, 437, 1192, 436, 1193, 435);
                ctx.bezierCurveTo(1193, 434, 1194, 433, 1195, 433);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(1146, 501);
                ctx.bezierCurveTo(1147, 501, 1148, 502, 1148, 503);
                ctx.bezierCurveTo(1148, 505, 1147, 505, 1146, 505);
                ctx.bezierCurveTo(1145, 505, 1144, 504, 1144, 503);
                ctx.bezierCurveTo(1144, 502, 1145, 501, 1146, 501);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(1185, 490);
                ctx.bezierCurveTo(1186, 490, 1187, 491, 1187, 492);
                ctx.bezierCurveTo(1187, 493, 1186, 494, 1185, 494);
                ctx.bezierCurveTo(1184, 494, 1183, 493, 1183, 492);
                ctx.bezierCurveTo(1183, 491, 1184, 490, 1185, 490);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(1119, 198);
                ctx.bezierCurveTo(1118, 198, 1117, 197, 1117, 196);
                ctx.bezierCurveTo(1117, 194, 1118, 194, 1119, 194);
                ctx.bezierCurveTo(1120, 194, 1121, 195, 1121, 196);
                ctx.bezierCurveTo(1121, 197, 1120, 198, 1119, 198);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(1098, 453);
                ctx.bezierCurveTo(1097, 453, 1096, 454, 1096, 455);
                ctx.bezierCurveTo(1096, 456, 1097, 458, 1098, 458);
                ctx.bezierCurveTo(1099, 458, 1100, 457, 1100, 456);
                ctx.bezierCurveTo(1100, 454, 1100, 453, 1098, 453);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(1100, 338);
                ctx.bezierCurveTo(1098, 338, 1098, 339, 1098, 340);
                ctx.bezierCurveTo(1097, 341, 1098, 342, 1099, 342);
                ctx.bezierCurveTo(1100, 342, 1101, 341, 1101, 340);
                ctx.bezierCurveTo(1101, 339, 1101, 338, 1100, 338);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(1173, 34);
                ctx.bezierCurveTo(1174, 34, 1175, 35, 1175, 37);
                ctx.bezierCurveTo(1175, 38, 1174, 39, 1173, 39);
                ctx.bezierCurveTo(1172, 39, 1171, 38, 1171, 36);
                ctx.bezierCurveTo(1171, 35, 1172, 34, 1173, 34);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(1143, 880);
                ctx.bezierCurveTo(1144, 880, 1145, 879, 1145, 878);
                ctx.bezierCurveTo(1145, 877, 1144, 875, 1143, 875);
                ctx.bezierCurveTo(1142, 875, 1141, 876, 1141, 878);
                ctx.bezierCurveTo(1141, 879, 1142, 880, 1143, 880);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(1197, 555);
                ctx.bezierCurveTo(1196, 555, 1195, 554, 1195, 553);
                ctx.bezierCurveTo(1195, 551, 1196, 550, 1197, 551);
                ctx.bezierCurveTo(1198, 551, 1199, 552, 1199, 553);
                ctx.bezierCurveTo(1199, 554, 1198, 555, 1197, 555);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(1179, 747);
                ctx.bezierCurveTo(1177, 747, 1177, 746, 1177, 745);
                ctx.bezierCurveTo(1177, 743, 1178, 742, 1179, 743);
                ctx.bezierCurveTo(1180, 743, 1181, 744, 1181, 745);
                ctx.bezierCurveTo(1181, 746, 1180, 747, 1179, 747);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(1138, 640);
                ctx.bezierCurveTo(1137, 640, 1136, 639, 1136, 637);
                ctx.bezierCurveTo(1136, 636, 1137, 635, 1138, 635);
                ctx.bezierCurveTo(1139, 635, 1140, 636, 1140, 638);
                ctx.bezierCurveTo(1140, 639, 1139, 640, 1138, 640);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(1112, 1000);
                ctx.bezierCurveTo(1111, 1000, 1110, 999, 1110, 998);
                ctx.bezierCurveTo(1110, 996, 1111, 995, 1112, 995);
                ctx.bezierCurveTo(1114, 995, 1114, 997, 1114, 998);
                ctx.bezierCurveTo(1114, 999, 1113, 1000, 1112, 1000);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(1152, 573);
                ctx.bezierCurveTo(1151, 573, 1149, 571, 1149, 569);
                ctx.bezierCurveTo(1149, 567, 1151, 566, 1153, 566);
                ctx.bezierCurveTo(1154, 566, 1156, 568, 1156, 570);
                ctx.bezierCurveTo(1155, 571, 1154, 573, 1152, 573);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(1182, 806);
                ctx.bezierCurveTo(1180, 806, 1179, 807, 1179, 809);
                ctx.bezierCurveTo(1179, 810, 1180, 811, 1181, 811);
                ctx.bezierCurveTo(1182, 811, 1183, 810, 1183, 809);
                ctx.bezierCurveTo(1184, 808, 1183, 806, 1182, 806);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(1102, 1123);
                ctx.bezierCurveTo(1100, 1123, 1099, 1124, 1099, 1125);
                ctx.bezierCurveTo(1099, 1127, 1100, 1128, 1101, 1128);
                ctx.bezierCurveTo(1103, 1128, 1104, 1127, 1104, 1126);
                ctx.bezierCurveTo(1104, 1124, 1103, 1123, 1102, 1123);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(1157, 1093);
                ctx.bezierCurveTo(1155, 1093, 1154, 1094, 1154, 1095);
                ctx.bezierCurveTo(1154, 1097, 1155, 1098, 1156, 1098);
                ctx.bezierCurveTo(1158, 1098, 1159, 1097, 1159, 1096);
                ctx.bezierCurveTo(1159, 1094, 1158, 1093, 1157, 1093);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(1105, 820);
                ctx.bezierCurveTo(1106, 820, 1107, 819, 1107, 817);
                ctx.bezierCurveTo(1108, 816, 1107, 815, 1105, 815);
                ctx.bezierCurveTo(1104, 815, 1103, 816, 1103, 817);
                ctx.bezierCurveTo(1103, 818, 1104, 820, 1105, 820);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(1104, 968);
                ctx.bezierCurveTo(1105, 968, 1106, 969, 1106, 971);
                ctx.bezierCurveTo(1106, 972, 1105, 973, 1104, 973);
                ctx.bezierCurveTo(1102, 973, 1102, 972, 1102, 970);
                ctx.bezierCurveTo(1102, 969, 1103, 968, 1104, 968);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(1143, 260);
                ctx.bezierCurveTo(1144, 260, 1145, 259, 1145, 258);
                ctx.bezierCurveTo(1145, 257, 1144, 256, 1143, 256);
                ctx.bezierCurveTo(1142, 255, 1141, 256, 1141, 258);
                ctx.bezierCurveTo(1141, 259, 1142, 260, 1143, 260);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(1179, 127);
                ctx.bezierCurveTo(1177, 127, 1177, 126, 1177, 125);
                ctx.bezierCurveTo(1177, 124, 1178, 123, 1179, 123);
                ctx.bezierCurveTo(1180, 123, 1181, 124, 1181, 125);
                ctx.bezierCurveTo(1181, 126, 1180, 127, 1179, 127);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(1138, 20);
                ctx.bezierCurveTo(1137, 20, 1136, 19, 1136, 17);
                ctx.bezierCurveTo(1136, 16, 1137, 15, 1138, 15);
                ctx.bezierCurveTo(1139, 15, 1140, 16, 1140, 18);
                ctx.bezierCurveTo(1140, 19, 1139, 20, 1138, 20);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(1112, 380);
                ctx.bezierCurveTo(1111, 380, 1110, 379, 1110, 378);
                ctx.bezierCurveTo(1110, 376, 1111, 375, 1112, 375);
                ctx.bezierCurveTo(1114, 376, 1114, 377, 1114, 378);
                ctx.bezierCurveTo(1114, 379, 1113, 380, 1112, 380);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(1182, 187);
                ctx.bezierCurveTo(1180, 186, 1179, 187, 1179, 189);
                ctx.bezierCurveTo(1179, 190, 1180, 191, 1181, 191);
                ctx.bezierCurveTo(1182, 191, 1183, 190, 1183, 189);
                ctx.bezierCurveTo(1184, 188, 1183, 187, 1182, 187);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(1102, 503);
                ctx.bezierCurveTo(1100, 503, 1099, 504, 1099, 505);
                ctx.bezierCurveTo(1099, 507, 1100, 508, 1101, 508);
                ctx.bezierCurveTo(1103, 508, 1104, 507, 1104, 506);
                ctx.bezierCurveTo(1104, 504, 1103, 503, 1102, 503);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(1157, 473);
                ctx.bezierCurveTo(1155, 473, 1154, 474, 1154, 476);
                ctx.bezierCurveTo(1154, 477, 1155, 478, 1156, 478);
                ctx.bezierCurveTo(1158, 478, 1159, 477, 1159, 476);
                ctx.bezierCurveTo(1159, 474, 1158, 473, 1157, 473);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(1105, 200);
                ctx.bezierCurveTo(1106, 200, 1107, 199, 1107, 198);
                ctx.bezierCurveTo(1108, 196, 1107, 195, 1105, 195);
                ctx.bezierCurveTo(1104, 195, 1103, 196, 1103, 197);
                ctx.bezierCurveTo(1103, 199, 1104, 200, 1105, 200);
                ctx.fill();

                ctx.fillStyle = "rgb(82,128,145)";
                ctx.beginPath();
                ctx.moveTo(1104, 348);
                ctx.bezierCurveTo(1105, 348, 1106, 349, 1106, 351);
                ctx.bezierCurveTo(1106, 352, 1105, 353, 1104, 353);
                ctx.bezierCurveTo(1102, 353, 1102, 352, 1102, 351);
                ctx.bezierCurveTo(1102, 349, 1103, 348, 1104, 348);
                ctx.closePath();
                ctx.fill();
            }
            var drawDiplomaFrame = function (ctx) {
                // yellow frame
                ctx.fillStyle = "rgb(253,228,128)";
                ctx.beginPath();
                ctx.moveTo(1131, 111);
                ctx.lineTo(900, 111);
                ctx.lineTo(900, 114);
                ctx.lineTo(1131, 114);
                ctx.bezierCurveTo(1140, 114, 1148, 122, 1148, 131);
                ctx.lineTo(1148, 1131);
                ctx.bezierCurveTo(1148, 1140, 1140, 1148, 1131, 1148);
                ctx.lineTo(69, 1148);
                ctx.bezierCurveTo(60, 1148, 52, 1140, 52, 1131);
                ctx.lineTo(52, 130);
                ctx.bezierCurveTo(52, 121, 60, 113, 69, 113);
                ctx.lineTo(299, 113);
                ctx.lineTo(299, 110);
                ctx.lineTo(69, 110);
                ctx.bezierCurveTo(58, 110, 49, 119, 49, 130);
                ctx.lineTo(49, 1131);
                ctx.bezierCurveTo(49, 1142, 58, 1151, 69, 1151);
                ctx.lineTo(1131, 1151);
                ctx.bezierCurveTo(1142, 1151, 1151, 1142, 1151, 1131);
                ctx.lineTo(1151, 131);
                ctx.bezierCurveTo(1151, 120, 1142, 111, 1131, 111);
                ctx.fill();
            }
            var drawInclusoLogo = function (ctx) {
                // logo
                var grd = ctx.createLinearGradient(670, 95, 670, 126);
                grd.addColorStop(0, 'rgba(104,106,108,1)');
                grd.addColorStop(0.33064598083496094, 'rgba(143,144,145,1)');
                grd.addColorStop(1, 'rgba(95,97,97,1)');
                ctx.fillStyle = grd;
                ctx.fillRect(668, 99, 3, 26);
                ctx.fill();

                var grd = ctx.createLinearGradient(694, 95, 694, 126);
                grd.addColorStop(0, 'rgba(104,106,108,1)');
                grd.addColorStop(0.33064598083496094, 'rgba(143,144,145,1)');
                grd.addColorStop(1, 'rgba(95,97,97,1)');
                ctx.fillStyle = grd;
                ctx.beginPath();
                ctx.moveTo(706, 125);
                ctx.lineTo(701, 125);
                ctx.lineTo(686, 103);
                ctx.lineTo(686, 125);
                ctx.lineTo(683, 125);
                ctx.lineTo(683, 99);
                ctx.lineTo(688, 99);
                ctx.lineTo(702, 121);
                ctx.lineTo(702, 99);
                ctx.lineTo(706, 99);
                ctx.lineTo(706, 125);
                ctx.fill();

                var grd = ctx.createLinearGradient(725, 95, 725, 126);
                grd.addColorStop(0, 'rgba(104,106,108,1)');
                grd.addColorStop(0.33064598083496094, 'rgba(143,144,145,1)');
                grd.addColorStop(1, 'rgba(95,97,97,1)');
                ctx.fillStyle = grd;
                ctx.beginPath();
                ctx.moveTo(735, 125);
                ctx.bezierCurveTo(732, 126, 730, 126, 727, 126);
                ctx.bezierCurveTo(720, 126, 716, 123, 716, 119);
                ctx.lineTo(716, 106);
                ctx.bezierCurveTo(716, 101, 720, 98, 727, 98);
                ctx.bezierCurveTo(730, 98, 732, 98, 734, 99);
                ctx.lineTo(734, 102);
                ctx.bezierCurveTo(732, 101, 729, 101, 727, 101);
                ctx.bezierCurveTo(726, 101, 725, 101, 724, 101);
                ctx.bezierCurveTo(724, 101, 723, 101, 722, 102);
                ctx.bezierCurveTo(721, 102, 721, 103, 720, 103);
                ctx.bezierCurveTo(720, 104, 720, 105, 720, 106);
                ctx.lineTo(720, 118);
                ctx.bezierCurveTo(720, 121, 722, 123, 727, 123);
                ctx.bezierCurveTo(730, 123, 732, 123, 735, 122);
                ctx.lineTo(735, 125);
                ctx.fill();

                var grd = ctx.createLinearGradient(753, 95, 753, 126);
                grd.addColorStop(0, 'rgba(104,106,108,1)');
                grd.addColorStop(0.33064598083496094, 'rgba(143,144,145,1)');
                grd.addColorStop(1, 'rgba(95,97,97,1)');
                ctx.fillStyle = grd;
                ctx.beginPath();
                ctx.moveTo(761, 125);
                ctx.lineTo(744, 125);
                ctx.lineTo(744, 99);
                ctx.lineTo(748, 99);
                ctx.lineTo(748, 123);
                ctx.lineTo(761, 123);
                ctx.lineTo(761, 125);
                ctx.fill();

                var grd = ctx.createLinearGradient(779, 95, 779, 126);
                grd.addColorStop(0, 'rgba(104,106,108,1)');
                grd.addColorStop(0.33064598083496094, 'rgba(143,144,145,1)');
                grd.addColorStop(1, 'rgba(95,97,97,1)');
                ctx.fillStyle = grd;
                ctx.beginPath();
                ctx.moveTo(789, 99);
                ctx.lineTo(789, 119);
                ctx.bezierCurveTo(789, 123, 786, 126, 779, 126);
                ctx.bezierCurveTo(777, 126, 776, 126, 775, 126);
                ctx.bezierCurveTo(774, 125, 773, 125, 772, 125);
                ctx.bezierCurveTo(771, 124, 770, 123, 769, 122);
                ctx.bezierCurveTo(769, 121, 768, 120, 768, 119);
                ctx.lineTo(768, 99);
                ctx.lineTo(772, 99);
                ctx.lineTo(772, 118);
                ctx.bezierCurveTo(772, 120, 773, 121, 774, 122);
                ctx.bezierCurveTo(775, 123, 777, 123, 779, 123);
                ctx.bezierCurveTo(781, 123, 783, 123, 784, 122);
                ctx.bezierCurveTo(785, 121, 785, 120, 785, 118);
                ctx.lineTo(785, 99);
                ctx.lineTo(789, 99);
                ctx.fill();

                var grd = ctx.createLinearGradient(809, 95, 809, 126);
                grd.addColorStop(0, 'rgba(104,106,108,1)');
                grd.addColorStop(0.33064598083496094, 'rgba(143,144,145,1)');
                grd.addColorStop(1, 'rgba(95,97,97,1)');
                ctx.fillStyle = grd;
                ctx.beginPath();
                ctx.moveTo(818, 116);
                ctx.lineTo(818, 118);
                ctx.bezierCurveTo(818, 121, 817, 123, 816, 124);
                ctx.bezierCurveTo(814, 125, 812, 126, 808, 126);
                ctx.bezierCurveTo(806, 126, 803, 126, 800, 125);
                ctx.lineTo(800, 122);
                ctx.bezierCurveTo(803, 122, 806, 123, 808, 123);
                ctx.bezierCurveTo(810, 123, 812, 123, 813, 122);
                ctx.bezierCurveTo(814, 122, 814, 121, 814, 120);
                ctx.lineTo(814, 116);
                ctx.bezierCurveTo(814, 115, 814, 114, 813, 114);
                ctx.bezierCurveTo(813, 113, 811, 113, 810, 113);
                ctx.lineTo(807, 113);
                ctx.bezierCurveTo(804, 113, 802, 112, 801, 111);
                ctx.bezierCurveTo(800, 110, 799, 109, 799, 107);
                ctx.lineTo(799, 104);
                ctx.bezierCurveTo(799, 102, 800, 101, 802, 100);
                ctx.bezierCurveTo(803, 99, 806, 98, 810, 98);
                ctx.bezierCurveTo(812, 98, 814, 98, 817, 99);
                ctx.lineTo(817, 102);
                ctx.bezierCurveTo(814, 101, 811, 101, 810, 101);
                ctx.bezierCurveTo(807, 101, 805, 101, 805, 102);
                ctx.bezierCurveTo(804, 102, 803, 103, 803, 104);
                ctx.lineTo(803, 107);
                ctx.bezierCurveTo(803, 108, 804, 109, 804, 109);
                ctx.bezierCurveTo(805, 110, 806, 110, 808, 110);
                ctx.lineTo(811, 110);
                ctx.bezierCurveTo(814, 110, 816, 111, 817, 112);
                ctx.bezierCurveTo(818, 113, 818, 114, 818, 116);
                ctx.fill();

                var grd = ctx.createLinearGradient(838, 95, 838, 126);
                grd.addColorStop(0, 'rgba(104,106,108,1)');
                grd.addColorStop(0.33064598083496094, 'rgba(143,144,145,1)');
                grd.addColorStop(1, 'rgba(95,97,97,1)');
                ctx.fillStyle = grd;
                ctx.beginPath();
                ctx.moveTo(850, 106);
                ctx.lineTo(850, 119);
                ctx.bezierCurveTo(850, 120, 849, 121, 849, 122);
                ctx.bezierCurveTo(848, 123, 847, 124, 846, 124);
                ctx.bezierCurveTo(845, 125, 843, 125, 842, 126);
                ctx.bezierCurveTo(841, 126, 840, 126, 838, 126);
                ctx.bezierCurveTo(831, 126, 827, 123, 827, 119);
                ctx.lineTo(827, 106);
                ctx.bezierCurveTo(827, 101, 831, 98, 838, 98);
                ctx.bezierCurveTo(846, 98, 850, 101, 850, 106);
                ctx.fill();

                ctx.fillStyle = "rgb(21,25,30)";
                ctx.beginPath();
                ctx.moveTo(846, 118);
                ctx.lineTo(846, 106);
                ctx.bezierCurveTo(846, 102, 843, 101, 838, 101);
                ctx.bezierCurveTo(837, 101, 837, 101, 836, 101);
                ctx.bezierCurveTo(835, 101, 834, 101, 833, 102);
                ctx.lineTo(832, 103);
                ctx.bezierCurveTo(831, 104, 831, 105, 831, 106);
                ctx.lineTo(831, 118);
                ctx.bezierCurveTo(831, 122, 834, 123, 839, 123);
                ctx.bezierCurveTo(843, 123, 846, 122, 846, 118);
                ctx.fill();

                var grd = ctx.createLinearGradient(364, 95, 364, 126);
                grd.addColorStop(0, 'rgba(104,106,108,1)');
                grd.addColorStop(0.33064598083496094, 'rgba(143,144,145,1)');
                grd.addColorStop(1, 'rgba(95,97,97,1)');
                ctx.fillStyle = grd;
                ctx.beginPath();
                ctx.moveTo(378, 125);
                ctx.lineTo(374, 125);
                ctx.lineTo(374, 103);
                ctx.lineTo(374, 103);
                ctx.lineTo(365, 125);
                ctx.lineTo(362, 125);
                ctx.lineTo(353, 103);
                ctx.lineTo(353, 103);
                ctx.lineTo(353, 125);
                ctx.lineTo(349, 125);
                ctx.lineTo(349, 99);
                ctx.lineTo(355, 99);
                ctx.lineTo(364, 121);
                ctx.lineTo(364, 121);
                ctx.lineTo(372, 99);
                ctx.lineTo(378, 99);
                ctx.lineTo(378, 125);
                ctx.fill();

                var grd = ctx.createLinearGradient(391, 95, 391, 126);
                grd.addColorStop(0, 'rgba(104,106,108,1)');
                grd.addColorStop(0.33064598083496094, 'rgba(143,144,145,1)');
                grd.addColorStop(1, 'rgba(95,97,97,1)');
                ctx.fillStyle = grd;
                ctx.fillRect(389, 99, 3, 26);
                ctx.fill();

                var grd = ctx.createLinearGradient(412, 95, 412, 126);
                grd.addColorStop(0, 'rgba(104,106,108,1)');
                grd.addColorStop(0.33064598083496094, 'rgba(143,144,145,1)');
                grd.addColorStop(1, 'rgba(95,97,97,1)');
                ctx.fillStyle = grd;
                ctx.beginPath();
                ctx.moveTo(422, 116);
                ctx.lineTo(422, 118);
                ctx.bezierCurveTo(422, 121, 421, 123, 419, 124);
                ctx.bezierCurveTo(418, 125, 415, 126, 412, 126);
                ctx.bezierCurveTo(409, 126, 407, 126, 403, 125);
                ctx.lineTo(403, 122);
                ctx.bezierCurveTo(407, 122, 409, 123, 412, 123);
                ctx.bezierCurveTo(414, 123, 415, 123, 416, 122);
                ctx.bezierCurveTo(417, 122, 418, 121, 418, 120);
                ctx.lineTo(418, 116);
                ctx.bezierCurveTo(418, 115, 417, 114, 417, 114);
                ctx.bezierCurveTo(416, 113, 415, 113, 413, 113);
                ctx.lineTo(410, 113);
                ctx.bezierCurveTo(407, 113, 406, 112, 404, 111);
                ctx.bezierCurveTo(403, 110, 403, 109, 403, 107);
                ctx.lineTo(403, 104);
                ctx.bezierCurveTo(403, 102, 404, 101, 405, 100);
                ctx.bezierCurveTo(407, 99, 409, 98, 413, 98);
                ctx.bezierCurveTo(415, 98, 418, 98, 420, 99);
                ctx.lineTo(420, 102);
                ctx.bezierCurveTo(417, 101, 415, 101, 413, 101);
                ctx.bezierCurveTo(411, 101, 409, 101, 408, 102);
                ctx.bezierCurveTo(407, 102, 407, 103, 407, 104);
                ctx.lineTo(407, 107);
                ctx.bezierCurveTo(407, 108, 407, 109, 408, 109);
                ctx.bezierCurveTo(408, 110, 410, 110, 411, 110);
                ctx.lineTo(414, 110);
                ctx.bezierCurveTo(417, 110, 419, 111, 420, 112);
                ctx.bezierCurveTo(421, 113, 422, 114, 422, 116);
                ctx.fill();

                var grd = ctx.createLinearGradient(433, 95, 433, 126);
                grd.addColorStop(0, 'rgba(104,106,108,1)');
                grd.addColorStop(0.33064598083496094, 'rgba(143,144,145,1)');
                grd.addColorStop(1, 'rgba(95,97,97,1)');
                ctx.fillStyle = grd;
                ctx.fillRect(431, 99, 3, 26);
                ctx.fill();

                var grd = ctx.createLinearGradient(457, 95, 457, 126);
                grd.addColorStop(0, 'rgba(104,106,108,1)');
                grd.addColorStop(0.33064598083496094, 'rgba(143,144,145,1)');
                grd.addColorStop(1, 'rgba(95,97,97,1)');
                ctx.fillStyle = grd;
                ctx.beginPath();
                ctx.moveTo(468, 106);
                ctx.lineTo(468, 119);
                ctx.bezierCurveTo(468, 120, 468, 121, 467, 122);
                ctx.bezierCurveTo(467, 123, 466, 124, 464, 124);
                ctx.bezierCurveTo(463, 125, 462, 125, 461, 126);
                ctx.bezierCurveTo(460, 126, 458, 126, 457, 126);
                ctx.bezierCurveTo(450, 126, 446, 123, 446, 119);
                ctx.lineTo(446, 106);
                ctx.bezierCurveTo(446, 101, 450, 98, 457, 98);
                ctx.bezierCurveTo(465, 98, 468, 101, 468, 106);
                ctx.fill();

                ctx.fillStyle = "rgb(21,25,30)";
                ctx.beginPath();
                ctx.moveTo(464, 118);
                ctx.lineTo(464, 106);
                ctx.bezierCurveTo(464, 102, 462, 101, 457, 101);
                ctx.bezierCurveTo(456, 101, 455, 101, 454, 101);
                ctx.bezierCurveTo(453, 101, 453, 101, 452, 102);
                ctx.bezierCurveTo(451, 102, 451, 103, 450, 103);
                ctx.bezierCurveTo(450, 104, 450, 105, 450, 106);
                ctx.lineTo(450, 118);
                ctx.bezierCurveTo(450, 122, 452, 123, 457, 123);
                ctx.bezierCurveTo(462, 123, 464, 122, 464, 118);
                ctx.fill();

                var grd = ctx.createLinearGradient(490, 95, 490, 126);
                grd.addColorStop(0, 'rgba(104,106,108,1)');
                grd.addColorStop(0.33064598083496094, 'rgba(143,144,145,1)');
                grd.addColorStop(1, 'rgba(95,97,97,1)');
                ctx.fillStyle = grd;
                ctx.beginPath();
                ctx.moveTo(502, 125);
                ctx.lineTo(497, 125);
                ctx.lineTo(482, 103);
                ctx.lineTo(482, 125);
                ctx.lineTo(479, 125);
                ctx.lineTo(479, 99);
                ctx.lineTo(483, 99);
                ctx.lineTo(498, 121);
                ctx.lineTo(498, 99);
                ctx.lineTo(502, 99);
                ctx.lineTo(502, 125);
                ctx.fill();

                var grd = ctx.createLinearGradient(460, 95, 460, 126);
                grd.addColorStop(0, 'rgba(104,106,108,1)');
                grd.addColorStop(0.33064598083496094, 'rgba(143,144,145,1)');
                grd.addColorStop(1, 'rgba(95,97,97,1)');
                ctx.fillStyle = grd;
                ctx.beginPath();
                ctx.moveTo(464, 90);
                ctx.lineTo(458, 95);
                ctx.lineTo(455, 95);
                ctx.lineTo(459, 90);
                ctx.lineTo(464, 90);
                ctx.fill();

                var grd = ctx.createLinearGradient(540, 112, 641, 112);
                grd.addColorStop(0, 'rgba(35,58,118,1)');
                grd.addColorStop(1, 'rgba(58,106,167,1)');
                ctx.fillStyle = grd;
                ctx.beginPath();
                ctx.moveTo(642, 112);
                ctx.bezierCurveTo(642, 84, 619, 61, 591, 61);
                ctx.bezierCurveTo(563, 61, 540, 84, 540, 112);
                ctx.bezierCurveTo(540, 140, 563, 163, 591, 163);
                ctx.bezierCurveTo(619, 163, 642, 140, 642, 112);
                ctx.fill();

                ctx.fillStyle = "rgb(244,250,252)";
                ctx.beginPath();
                ctx.moveTo(573, 124);
                ctx.bezierCurveTo(563, 124, 564, 115, 564, 115);
                ctx.bezierCurveTo(564, 115, 567, 118, 573, 118);
                ctx.bezierCurveTo(576, 118, 580, 116, 582, 111);
                ctx.bezierCurveTo(580, 107, 576, 105, 572, 105);
                ctx.bezierCurveTo(567, 105, 564, 108, 564, 108);
                ctx.bezierCurveTo(564, 108, 563, 99, 573, 99);
                ctx.bezierCurveTo(584, 99, 589, 110, 589, 111);
                ctx.bezierCurveTo(589, 113, 584, 124, 573, 124);
                ctx.fill();

                ctx.fillStyle = "rgb(244,250,252)";
                ctx.beginPath();
                ctx.moveTo(603, 136);
                ctx.bezierCurveTo(603, 136, 605, 133, 604, 128);
                ctx.bezierCurveTo(603, 124, 600, 121, 595, 120);
                ctx.bezierCurveTo(591, 124, 591, 127, 592, 131);
                ctx.bezierCurveTo(593, 136, 597, 138, 597, 138);
                ctx.bezierCurveTo(597, 138, 588, 142, 585, 132);
                ctx.bezierCurveTo(583, 121, 592, 114, 594, 114);
                ctx.bezierCurveTo(595, 113, 607, 115, 610, 125);
                ctx.bezierCurveTo(612, 135, 603, 136, 603, 136);
                ctx.fill();

                ctx.fillStyle = "rgb(244,250,252)";
                ctx.beginPath();
                ctx.moveTo(611, 104);
                ctx.bezierCurveTo(605, 113, 594, 111, 592, 111);
                ctx.bezierCurveTo(591, 110, 584, 100, 589, 91);
                ctx.bezierCurveTo(595, 82, 602, 88, 602, 88);
                ctx.bezierCurveTo(602, 88, 598, 89, 595, 93);
                ctx.bezierCurveTo(593, 97, 593, 100, 596, 105);
                ctx.bezierCurveTo(601, 105, 604, 103, 606, 100);
                ctx.bezierCurveTo(609, 95, 608, 91, 608, 91);
                ctx.bezierCurveTo(608, 91, 616, 95, 611, 104);
                ctx.fill();

                var grd = ctx.createLinearGradient(552, 145, 551, 145);
                grd.addColorStop(0, 'rgba(41,67,133,0.5)');
                grd.addColorStop(1, 'rgba(41,67,133,1)');
                ctx.fillStyle = grd;
                ctx.beginPath();
                ctx.moveTo(552, 145);
                ctx.lineTo(552, 145);
                ctx.lineTo(552, 145);
                ctx.fill();

                var grd = ctx.createLinearGradient(600, 95, 546, 117);
                grd.addColorStop(0, 'rgba(186,210,49,0.5)');
                grd.addColorStop(1, 'rgba(224,228,85,1)');
                ctx.fillStyle = grd;
                ctx.beginPath();
                ctx.moveTo(529, 127);
                ctx.bezierCurveTo(532, 101, 579, 82, 619, 67);
                ctx.lineTo(615, 59);
                ctx.bezierCurveTo(588, 70, 545, 89, 530, 111);
                ctx.bezierCurveTo(521, 124, 520, 147, 552, 145);
                ctx.bezierCurveTo(549, 145, 527, 146, 529, 127);
                ctx.fill();

                ctx.fillStyle = "rgb(186,210,49)";
                ctx.beginPath();
                ctx.moveTo(626, 64);
                ctx.lineTo(626, 64);
                ctx.lineTo(628, 63);
                ctx.lineTo(631, 59);
                ctx.lineTo(631, 57);
                ctx.lineTo(625, 57);
                ctx.lineTo(623, 57);
                ctx.lineTo(623, 57);
                ctx.lineTo(630, 54);
                ctx.lineTo(623, 56);
                ctx.lineTo(622, 57);
                ctx.lineTo(620, 58);
                ctx.lineTo(618, 56);
                ctx.lineTo(617, 56);
                ctx.lineTo(616, 56);
                ctx.lineTo(616, 56);
                ctx.lineTo(616, 56);
                ctx.lineTo(616, 56);
                ctx.lineTo(615, 55);
                ctx.lineTo(615, 56);
                ctx.lineTo(614, 56);
                ctx.lineTo(614, 56);
                ctx.lineTo(614, 57);
                ctx.lineTo(614, 57);
                ctx.lineTo(614, 58);
                ctx.lineTo(614, 58);
                ctx.lineTo(606, 54);
                ctx.lineTo(606, 54);
                ctx.lineTo(607, 53);
                ctx.lineTo(608, 53);
                ctx.lineTo(615, 50);
                ctx.lineTo(608, 53);
                ctx.lineTo(608, 53);
                ctx.lineTo(611, 51);
                ctx.lineTo(611, 50);
                ctx.lineTo(602, 50);
                ctx.lineTo(598, 55);
                ctx.lineTo(598, 57);
                ctx.lineTo(600, 59);
                ctx.lineTo(601, 60);
                ctx.lineTo(603, 59);
                ctx.lineTo(603, 59);
                ctx.lineTo(603, 59);
                ctx.lineTo(603, 59);
                ctx.lineTo(605, 60);
                ctx.lineTo(607, 64);
                ctx.lineTo(606, 67);
                ctx.lineTo(606, 67);
                ctx.lineTo(606, 67);
                ctx.lineTo(606, 67);
                ctx.lineTo(606, 68);
                ctx.lineTo(606, 68);
                ctx.lineTo(609, 69);
                ctx.lineTo(610, 73);
                ctx.lineTo(609, 75);
                ctx.lineTo(607, 76);
                ctx.lineTo(607, 78);
                ctx.lineTo(607, 80);
                ctx.lineTo(608, 82);
                ctx.lineTo(615, 83);
                ctx.lineTo(621, 77);
                ctx.lineTo(621, 76);
                ctx.lineTo(617, 77);
                ctx.lineTo(617, 77);
                ctx.lineTo(624, 74);
                ctx.lineTo(617, 77);
                ctx.lineTo(617, 77);
                ctx.lineTo(615, 78);
                ctx.lineTo(618, 69);
                ctx.lineTo(619, 69);
                ctx.lineTo(620, 70);
                ctx.lineTo(621, 70);
                ctx.lineTo(622, 68);
                ctx.lineTo(623, 68);
                ctx.lineTo(623, 65);
                ctx.lineTo(625, 64);
                ctx.lineTo(626, 64);
                ctx.lineTo(633, 62);
                ctx.lineTo(626, 64);
                ctx.fill();
            }
            var drawStripesDeco = function (ctx) {
                //stripe top
                var grd = ctx.createLinearGradient(600, 410, 600, 579);
                grd.addColorStop(0.1, 'rgba(255,255,255,0.0)');
                grd.addColorStop(0.6, 'rgba(255,255,255,0.3)');
                grd.addColorStop(0.9, 'rgba(255,255,255,0.6)');
                grd.addColorStop(1.0, 'rgba(255,255,255,0.9)');
                ctx.fillStyle = grd;
                ctx.beginPath();
                ctx.moveTo(602, 578);
                ctx.lineTo(597, 578);
                ctx.lineTo(556, 410);
                ctx.lineTo(643, 410);
                ctx.lineTo(602, 578);
                ctx.fill();

                //stripe bottom
                var grd = ctx.createLinearGradient(600, 747, 600, 579);
                grd.addColorStop(0.1, 'rgba(255,255,255,0.0)');
                grd.addColorStop(0.6, 'rgba(255,255,255,0.3)');
                grd.addColorStop(0.9, 'rgba(255,255,255,0.6)');
                grd.addColorStop(1.0, 'rgba(255,255,255,0.9)');
                ctx.fillStyle = grd;
                ctx.beginPath();
                ctx.moveTo(597, 578);
                ctx.lineTo(602, 578);
                ctx.lineTo(643, 746);
                ctx.lineTo(556, 746);
                ctx.lineTo(597, 578);
                ctx.fill();

                //stripe left
                var grd = ctx.createLinearGradient(326, 578, 600, 578);
                grd.addColorStop(0.1, 'rgba(255,255,255,0.0)');
                grd.addColorStop(0.6, 'rgba(255,255,255,0.3)');
                grd.addColorStop(0.9, 'rgba(255,255,255,0.6)');
                grd.addColorStop(1.0, 'rgba(255,255,255,0.9)');
                ctx.fillStyle = grd;
                ctx.beginPath();
                ctx.moveTo(600, 576);
                ctx.lineTo(600, 580);
                ctx.lineTo(326, 605);
                ctx.lineTo(326, 552);
                ctx.lineTo(600, 576);
                ctx.fill();

                //stripe right
                var grd = ctx.createLinearGradient(873, 578, 600, 578);
                grd.addColorStop(0.1, 'rgba(255,255,255,0.0)');
                grd.addColorStop(0.6, 'rgba(255,255,255,0.3)');
                grd.addColorStop(0.9, 'rgba(255,255,255,0.6)');
                grd.addColorStop(1.0, 'rgba(255,255,255,0.9)');
                ctx.fillStyle = grd;
                ctx.beginPath();
                ctx.moveTo(600, 580);
                ctx.lineTo(600, 576);
                ctx.lineTo(873, 552);
                ctx.lineTo(873, 605);
                ctx.lineTo(600, 580);
                ctx.fill();

                //stripe top-right
                var grd = ctx.createLinearGradient(762, 440, 602, 580);
                grd.addColorStop(0.1, 'rgba(255,255,255,0.0)');
                grd.addColorStop(0.6, 'rgba(255,255,255,0.3)');
                grd.addColorStop(0.9, 'rgba(255,255,255,0.6)');
                grd.addColorStop(1.0, 'rgba(255,255,255,0.9)');
                ctx.fillStyle = grd;
                ctx.beginPath();
                ctx.moveTo(601, 579);
                ctx.lineTo(598, 577);
                ctx.lineTo(762, 440);
                ctx.lineTo(824, 478);
                ctx.lineTo(601, 579);
                ctx.fill();

                //stripe bottom-left
                var grd = ctx.createLinearGradient(489, 716, 598, 577);
                grd.addColorStop(0.1, 'rgba(255,255,255,0.0)');
                grd.addColorStop(0.6, 'rgba(255,255,255,0.3)');
                grd.addColorStop(0.9, 'rgba(255,255,255,0.6)');
                grd.addColorStop(1.0, 'rgba(255,255,255,0.9)');
                ctx.fillStyle = grd;
                ctx.beginPath();
                ctx.moveTo(598, 577);
                ctx.lineTo(601, 579);
                ctx.lineTo(437, 716);
                ctx.lineTo(375, 678);
                ctx.lineTo(598, 577);
                ctx.fill();

                //stripe top-left
                var grd = ctx.createLinearGradient(437, 440, 598, 579);
                grd.addColorStop(0.1, 'rgba(255,255,255,0.0)');
                grd.addColorStop(0.6, 'rgba(255,255,255,0.3)');
                grd.addColorStop(0.9, 'rgba(255,255,255,0.6)');
                grd.addColorStop(1.0, 'rgba(255,255,255,0.9)');
                ctx.fillStyle = grd;
                ctx.beginPath();
                ctx.moveTo(601, 577);
                ctx.lineTo(598, 579);
                ctx.lineTo(375, 478);
                ctx.lineTo(437, 440);
                ctx.lineTo(601, 577);
                ctx.fill();

                //stripe bottom-right
                var grd = ctx.createLinearGradient(762, 716, 602, 577);
                grd.addColorStop(0.1, 'rgba(255,255,255,0.0)');
                grd.addColorStop(0.6, 'rgba(255,255,255,0.3)');
                grd.addColorStop(0.9, 'rgba(255,255,255,0.6)');
                grd.addColorStop(1.0, 'rgba(255,255,255,0.9)');
                ctx.fillStyle = grd;
                ctx.beginPath();
                ctx.moveTo(598, 579);
                ctx.lineTo(601, 577);
                ctx.lineTo(824, 678);
                ctx.lineTo(762, 716);
                ctx.lineTo(598, 579);
                ctx.fill();
            }
            var drawMedal = function (ctx, color) {
                if (color == 'gold') {
                    //gold
                    var grd = ctx.createLinearGradient(490, 583, 709, 583);
                    grd.addColorStop(0, 'rgba(236,194,32,1)');
                    grd.addColorStop(0.3, 'rgba(236,194,32,1)');
                    grd.addColorStop(0.5101440048217774, 'rgba(252,231,138,1)');
                    grd.addColorStop(0.7, 'rgba(236,194,32,1)');
                    grd.addColorStop(1, 'rgba(236,194,32,1)');
                    ctx.fillStyle = grd;
                    ctx.beginPath();
                    ctx.moveTo(709, 583);
                    ctx.bezierCurveTo(709, 644, 660, 693, 600, 693);
                    ctx.bezierCurveTo(539, 693, 490, 644, 490, 583);
                    ctx.bezierCurveTo(490, 523, 539, 473, 600, 473);
                    ctx.bezierCurveTo(660, 473, 709, 523, 709, 583);
                    ctx.fill();

                    var grd = ctx.createLinearGradient(528, 655, 671, 512);
                    grd.addColorStop(0, 'rgba(246,212,54,1)');
                    grd.addColorStop(0.3, 'rgba(246,212,54,1)');
                    grd.addColorStop(0.5101440048217774, 'rgba(255,241,188,1)');
                    grd.addColorStop(0.7, 'rgba(246,212,54,1)');
                    grd.addColorStop(1, 'rgba(246,212,54,1)');
                    ctx.fillStyle = grd;
                    ctx.beginPath();
                    ctx.moveTo(671, 511);
                    ctx.bezierCurveTo(711, 551, 711, 616, 671, 655);
                    ctx.bezierCurveTo(632, 695, 567, 695, 528, 655);
                    ctx.bezierCurveTo(488, 616, 488, 551, 528, 511);
                    ctx.bezierCurveTo(567, 472, 632, 472, 671, 511);
                    ctx.fill();
                } else if (color == 'silver') {
                    //silver
                    var grd = ctx.createLinearGradient(490, 583, 709, 583);
                    grd.addColorStop(0, 'rgba(196,196,196,1)');
                    grd.addColorStop(0.3, 'rgba(196,196,196,1)');
                    grd.addColorStop(0.5101440048217774, 'rgba(179,179,179,1)');
                    grd.addColorStop(0.7, 'rgba(196,196,196,1)');
                    grd.addColorStop(1, 'rgba(196,196,196,1)');

                    ctx.fillStyle = grd;
                    ctx.beginPath();
                    ctx.moveTo(709, 583);
                    ctx.bezierCurveTo(709, 644, 660, 693, 600, 693);
                    ctx.bezierCurveTo(539, 693, 490, 644, 490, 583);
                    ctx.bezierCurveTo(490, 523, 539, 473, 600, 473);
                    ctx.bezierCurveTo(660, 473, 709, 523, 709, 583);
                    ctx.fill();

                    var grd = ctx.createLinearGradient(528, 655, 671, 512);
                    grd.addColorStop(0, 'rgba(201,201,201,1)');
                    grd.addColorStop(0.3, 'rgba(214,214,214,1)');
                    grd.addColorStop(0.5132, 'rgba(245,245,245,1)');
                    grd.addColorStop(0.7, 'rgba(214,214,214,1)');
                    grd.addColorStop(1, 'rgba(214,214,214,1)');

                    ctx.fillStyle = grd;
                    ctx.beginPath();
                    ctx.moveTo(671, 511);
                    ctx.bezierCurveTo(711, 551, 711, 616, 671, 655);
                    ctx.bezierCurveTo(632, 695, 567, 695, 528, 655);
                    ctx.bezierCurveTo(488, 616, 488, 551, 528, 511);
                    ctx.bezierCurveTo(567, 472, 632, 472, 671, 511);
                    ctx.fill();
                } else if (color == 'copper') {
                    // copper
                    var grd = ctx.createLinearGradient(490, 583, 709, 583);
                    grd.addColorStop(0, 'rgba(107,65,29,1)');
                    grd.addColorStop(0.1, 'rgba(107,65,29,1)');
                    grd.addColorStop(0.5101440048217774, 'rgba(199,157,121,1)');
                    grd.addColorStop(0.9, 'rgba(107,65,29,1)');
                    grd.addColorStop(1, 'rgba(107,65,29,1)');

                    ctx.fillStyle = grd;
                    ctx.beginPath();
                    ctx.moveTo(709, 583);
                    ctx.bezierCurveTo(709, 644, 660, 693, 600, 693);
                    ctx.bezierCurveTo(539, 693, 490, 644, 490, 583);
                    ctx.bezierCurveTo(490, 523, 539, 473, 600, 473);
                    ctx.bezierCurveTo(660, 473, 709, 523, 709, 583);
                    ctx.fill();

                    var grd = ctx.createLinearGradient(528, 655, 671, 512);
                    grd.addColorStop(0, 'rgba(150,108,70,1)');
                    grd.addColorStop(0.1, 'rgba(150,108,70,1)');
                    grd.addColorStop(0.5101440048217774, 'rgba(251,215,179,1)');
                    grd.addColorStop(0.9, 'rgba(150,108,70,1)');
                    grd.addColorStop(1, 'rgba(150,108,70,1)');
                    ctx.fillStyle = grd;
                    ctx.beginPath();
                    ctx.moveTo(671, 511);
                    ctx.bezierCurveTo(711, 551, 711, 616, 671, 655);
                    ctx.bezierCurveTo(632, 695, 567, 695, 528, 655);
                    ctx.bezierCurveTo(488, 616, 488, 551, 528, 511);
                    ctx.bezierCurveTo(567, 472, 632, 472, 671, 511);
                    ctx.fill();
                } else {
                    console.log('WARNING: No medal color provided');
                    return;
                }

                //inner shape (gentera symbol)
                var grd = ctx.createLinearGradient(564, 581, 594, 581);
                grd.addColorStop(0, 'rgba(35,44,59,1)');
                grd.addColorStop(1, 'rgba(21,28,38,1)');
                ctx.fillStyle = grd;
                ctx.beginPath();
                ctx.moveTo(578, 581);
                ctx.bezierCurveTo(571, 592, 563, 596, 554, 596);
                ctx.bezierCurveTo(540, 596, 534, 589, 534, 589);
                ctx.bezierCurveTo(534, 589, 531, 612, 555, 612);
                ctx.bezierCurveTo(583, 612, 594, 584, 594, 581);
                ctx.bezierCurveTo(594, 578, 583, 550, 555, 550);
                ctx.bezierCurveTo(531, 550, 534, 573, 534, 573);
                ctx.bezierCurveTo(534, 573, 541, 566, 554, 566);
                ctx.bezierCurveTo(564, 566, 571, 570, 578, 581);
                ctx.fill();

                var grd = ctx.createLinearGradient(616, 617, 646, 617);
                grd.addColorStop(0, 'rgba(35,44,59,1)');
                grd.addColorStop(1, 'rgba(21,28,38,1)');
                ctx.fillStyle = grd;
                ctx.beginPath();
                ctx.moveTo(610, 602);
                ctx.bezierCurveTo(623, 606, 628, 612, 631, 621);
                ctx.bezierCurveTo(635, 635, 629, 643, 629, 643);
                ctx.bezierCurveTo(629, 643, 652, 639, 646, 616);
                ctx.bezierCurveTo(639, 589, 609, 586, 606, 587);
                ctx.bezierCurveTo(603, 588, 579, 605, 586, 632);
                ctx.bezierCurveTo(592, 655, 614, 647, 614, 647);
                ctx.bezierCurveTo(614, 647, 605, 642, 602, 629);
                ctx.bezierCurveTo(599, 620, 600, 612, 610, 602);
                ctx.fill();

                var grd = ctx.createLinearGradient(622, 550, 653, 550);
                grd.addColorStop(0, 'rgba(35,44,59,1)');
                grd.addColorStop(1, 'rgba(21,28,38,1)');
                ctx.fillStyle = grd;
                ctx.beginPath();
                ctx.moveTo(611, 565);
                ctx.bezierCurveTo(605, 554, 605, 545, 610, 537);
                ctx.bezierCurveTo(617, 525, 627, 523, 627, 523);
                ctx.bezierCurveTo(627, 523, 608, 509, 596, 530);
                ctx.bezierCurveTo(582, 554, 600, 577, 603, 579);
                ctx.bezierCurveTo(606, 581, 635, 585, 649, 562);
                ctx.bezierCurveTo(661, 541, 640, 531, 640, 531);
                ctx.bezierCurveTo(640, 531, 643, 541, 636, 552);
                ctx.bezierCurveTo(631, 561, 624, 565, 611, 565);
                ctx.fill();
            }
            var renderText = function (ctx, texts) {
                var sUserName = oText.username;
                var sTitle = oText.title;
                var sReason = oText.reason;
                var sQuote = oText.quote;

                ctx.fillStyle = "rgb(188, 212, 49)";
                ctx.font = 'bold 32px Play';
                ctx.textBaseline = 'top';
                ctx.textAlign = "center";
                ctx.fillText(sTitle, 600, 220);

                ctx.fillStyle = "rgb(255, 255, 255)";
                ctx.font = 'bold 55px Play,sans-serif,Arial';
                ctx.textBaseline = 'top';
                ctx.textAlign = "center";
                ctx.fillText(sUserName, 600, 318);

                ctx.fillStyle = "rgb(255, 255, 255)";
                ctx.font = 'normal 30px Play,sans-serif,Arial';
                ctx.textBaseline = 'bottom';
                ctx.textAlign = "left";
                ctx.fillText(sReason[0], 256, 823);

                ctx.fillStyle = "rgb(188, 212, 49)";
                ctx.font = 'bold 40px Play,sans-serif,Arial';
                ctx.textBaseline = 'bottom';
                ctx.textAlign = "left";
                ctx.fillText(sReason[1], 693, 825);

                ctx.fillStyle = "rgb(255, 255, 255)";
                ctx.font = 'normal 30px Play,sans-serif,Arial';
                ctx.textBaseline = 'bottom';
                ctx.textAlign = "center";
                ctx.fillText(sReason[2], 600, 870);

                ctx.fillStyle = "rgb(188, 212, 49)";
                ctx.font = 'bold 30px Play,sans-serif,Arial';
                ctx.textBaseline = 'bottom';
                ctx.textAlign = "center";
                ctx.fillText(sQuote[0], 600, 956);

                ctx.fillStyle = "rgb(255, 255, 255)";
                ctx.font = 'normal 30px Play,sans-serif,Arial';
                ctx.textBaseline = 'bottom';
                ctx.textAlign = "center";
                ctx.fillText(sQuote[1], 600, 1000);

                ctx.fillStyle = "rgb(255, 255, 255)";
                ctx.font = 'normal 30px Play,sans-serif,Arial';
                ctx.textBaseline = 'bottom';
                ctx.textAlign = "center";
                ctx.fillText(sQuote[2], 600, 1050);

                ctx.fillStyle = "rgb(255, 255, 255)";
                ctx.font = 'bold 30px Play,sans-serif,Arial';
                ctx.textBaseline = 'bottom';
                ctx.textAlign = "center";
                ctx.fillText(sQuote[3], 600, 1090);
            }
            controllerInit();
            $scope.$emit('HidePreloader');
        }]).controller('timeOutReconocimiento', ['$scope', '$modalInstance', function ($scope, $modalInstance) {//TimeOut Robot

    $scope.ToDashboard = function () {
        $scope.$emit('ShowPreloader');
        $modalInstance.dismiss('cancel');
    };

}]);