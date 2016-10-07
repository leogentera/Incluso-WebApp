angular
    .module('incluso.stage.contentscontroller', [])
    .controller('stageContentsController', [
        '$q',
        '$scope',
        '$location',
        '$routeParams',
        '$timeout',
        '$rootScope',
        '$http',
        '$anchorScroll',
        '$modal',
        '$route',
        function ($q, $scope, $location, $routeParams, $timeout, $rootScope, $http, $anchorScroll, $modal, $route) {
            var _loadedResources = false;
            var _pageLoaded = false;
            var currentUser;
            var fuentesDeEnergiaIds;
            var totalOptionalPoints;
            var activitymanagers;

            $scope.setToolbar($location.$$path, "");
            $scope.$emit('ShowPreloader');
            $scope.validateConnection(initController, offlineCallback);

            function offlineCallback() {
                $timeout(function () {
                    $location.path("/Offline");
                }, 1000);
            }

            $scope.modelState = {
                isValid: null,
                errorMessages: []
            };
            /* Watchers */
            $scope.$watch("modelState.errorMessages", function (newValue, oldValue) {
                $scope.modelState.isValid = (newValue.length === 0);
            });

            $scope.mobilecheck = _comboboxCompat;

            $scope.selectClick = function (items, field) {
                var selectItems = [];
                _.each(items, function (item) {
                    selectItems.push(item.name);
                });

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

            $scope.changeitem = function (field) {
                var index = $("select[name='" + field + "']").prop('selectedIndex') - 1;
                $scope.filtertext = $scope.items[index].name;
            };

            $scope.items = [{
                name: 'Ver Todo',
                value: ''
            }, {
                name: 'Obligatorio',
                value: 'Obligatorio'
            }, {
                name: 'Fotografías',
                value: 'resource'
            }, {
                name: 'Videos',
                value: 'video'
            }, {
                name: 'Textos',
                value: 'page'
            }, {
                name: 'Frases',
                value: 'label'
            }, {
                name: 'Enlaces',
                value: 'url'
            }];

            function initController() {

                _timeout = $timeout;
                _httpFactory = $http;
                var moduleid = $routeParams.moodleid;
                var pagename;
                var currentChallenge;
                var stage;
                var userCurrentStage;
                fuentesDeEnergiaIds = ["1101", "1020", "1021", "2004", "2006", "2011", "2015", "3201", "3301", "3401"];
                switch (moduleid) {

                    case "1101":
                        userCurrentStage = 1;
                        currentChallenge = 1;
                        stage = "ZonaDeVuelo";
                        break;
                    case "1020":
                        userCurrentStage = 1;
                        currentChallenge = 2;
                        stage = "ZonaDeVuelo";
                        break;
                    case "1021":
                        userCurrentStage = 1;
                        currentChallenge = 3;
                        stage = "ZonaDeVuelo";
                        break;
                    case "2004":
                        userCurrentStage = 2;
                        currentChallenge = 1;
                        stage = "ZonaDeNavegacion";
                        break;
                    case "2006":
                        userCurrentStage = 2;
                        currentChallenge = 2;
                        stage = "ZonaDeNavegacion";
                        break;
                    case "2011":
                        userCurrentStage = 2;
                        currentChallenge = 3;
                        stage = "ZonaDeNavegacion";
                        break;
                    case "2015":
                        userCurrentStage = 2;
                        currentChallenge = 4;
                        stage = "ZonaDeNavegacion";
                        break;
                    case "3201":
                        userCurrentStage = 3;
                        currentChallenge = 1;
                        stage = "ZonaDeAterrizaje";
                        break;
                    case "3301":
                        userCurrentStage = 3;
                        currentChallenge = 2;
                        stage = "ZonaDeAterrizaje";
                        break;
                    case "3401":
                        userCurrentStage = 3;
                        currentChallenge = 3;
                        stage = "ZonaDeAterrizaje";
                        break;

                }

                $scope.contentResources = {};
                $scope.currentPage = 1;
                $scope.currentDate = new Date().getTime();

                getContentResources(moduleid);
                $rootScope.showFooter = true;
                $rootScope.showFooterRocks = false;
                $rootScope.showStage1Footer = false;
                $rootScope.showStage2Footer = false;
                $rootScope.showStage3Footer = false;
                $scope.statusObligatorios = 0;
                var waitPreloader = 0;
                var hidePreloader = 0;
                var profile;
                var activities = JSON.parse(moodleFactory.Services.GetCacheObject("activitiesCache/" + moduleid));
                currentUser = JSON.parse(moodleFactory.Services.GetCacheObject("CurrentUser"));
                $scope.token = currentUser.token;
                $scope.scrollToTop();
                var starsNoMandatory = 0;
                var starsMandatory = 0;
                totalOptionalPoints = 0;
                var getcoursemoduleids = [];
                $scope.like_status = 1;
                var activitymanagers = [];
                var activitiesData = "";
                var numOblRemaining = 0;
                var totalObligatorios = 0;

                activitymanagers = JSON.parse(moodleFactory.Services.GetCacheObject("activityManagers"));

                if (!activities) {
                    $scope.fuenteDeEnergia = _.find(activitymanagers, function (a) {
                        return a.activity_identifier == moduleid
                    });
                } else {
                    $scope.fuenteDeEnergia = activities;
                }

                getDataAsync();
                checkProgress();

                $scope.navigateToPage = function (pageNumber) {
                    $scope.currentPage = pageNumber;
                };

                function getDataAsync() {
                    for (var i = 0; i < $scope.fuenteDeEnergia.activities.length; i++) {
                        activitiesData += "activity[" + i + "]=" + $scope.fuenteDeEnergia.activities[i].coursemoduleid + "&";
                        totalObligatorios += (1 - parseInt($scope.fuenteDeEnergia.activities[i].optional)); //Count total Required resources.

                        if (!$scope.fuenteDeEnergia.activities[i].status) {//Count Required & non Finished resources.
                            numOblRemaining += (1 - parseInt($scope.fuenteDeEnergia.activities[i].optional));
                        }
                    }

                    if (totalObligatorios >= $scope.fuenteDeEnergia.resources_required) {
                        totalObligatorios = $scope.fuenteDeEnergia.resources_required;
                    }

                    if (activitiesData != "") {
                        waitPreloader++;
                        activitiesData = activitiesData.slice(0, -1);
                        moodleFactory.Services.GetAsyncActivitiesEnergy(activitiesData, $scope.token, getActivityInfoCallback, getActivityErrorCallback, true);
                    }

                    if (waitPreloader == 0) {
                        _pageLoaded = true;
                        if (_loadedResources && _pageLoaded) {
                            $scope.$emit('HidePreloader')
                        }
                    }
                }

                function getActivityInfoCallback(data, key) {
                    for (var i = 0; i < $scope.fuenteDeEnergia.activities.length; i++) {
                        var myActivity = $scope.fuenteDeEnergia.activities[i];
                        myActivity.activityContent = data[i];
                        setResources(myActivity);
                    }
                    _pageLoaded = true;
                    if (_loadedResources && _pageLoaded) {
                        $scope.$emit('HidePreloader')
                    }
                }

                function getActivityErrorCallback(obj) {
                    _pageLoaded = true;
                    if (_loadedResources && _pageLoaded) {
                        $scope.$emit('HidePreloader')
                    }

                    $scope.$emit('HidePreloader');
                        if (obj && obj.statusCode && obj.statusCode == 408) {//Request Timeout
                          $timeout(function () {
                            $location.path('/Offline'); //This behavior could change
                          }, 1);
                        } else {//Another kind of Error happened
                          $timeout(function () {
                              $scope.$emit('HidePreloader');
                              $location.path('/connectionError');
                          }, 1);
                        }  
                }

                function setResources(myActivity) {
                    if (myActivity.activityContent.thumbnail) {
                        myActivity.activityContent.thumbnail = myActivity.activityContent.thumbnail.fileurl + "&token=" + $scope.token;
                    }
                    else {
                        myActivity.activityContent.thumbnail = "assets/images/svg/img_placeholder-01.svg";
                    }
                    if (myActivity.activity_type == 'resource') {
                        myActivity.activityContent.content[0].fileurl = myActivity.activityContent.content[0].fileurl + "&token=" + $scope.token;
                        if (myActivity.activityContent.content[0].fileurl.indexOf(".mp4") > -1) {
                            myActivity.activityintro = "video";
                            myActivity.activity_type = "video";
                            myActivity.activityContent.url = myActivity.activityContent.content[0].fileurl;
                            myActivity.activityContent.thumbnail = myActivity.activityContent.content[1].fileurl + "&token=" + $scope.token;
                        }
                        if (myActivity.activityContent.content[1]) {//Si es una actividad con video y thumbnail
                            myActivity.activityContent.content[1].fileurl = myActivity.activityContent.content[1].fileurl + "&token=" + $scope.token;
                            if (myActivity.activityContent.content[1].fileurl.indexOf(".mp4") > -1) {
                                myActivity.activityintro = "video";
                                myActivity.activity_type = "video";
                                myActivity.activityContent.url = myActivity.activityContent.content[1].fileurl;
                                myActivity.activityContent.thumbnail = myActivity.activityContent.content[0].fileurl;
                            }
                        }
                    }
                    myActivity.activityContent.commentsQty = 3;
                }

                function checkProgress() {
                    /* Calculates total points got from optional activities in all "Fuentes de energía" */
                    for (var i = 0; i < activitymanagers.length; i++) {
                        if (fuentesDeEnergiaIds.indexOf(activitymanagers[i].activity_identifier) != -1) {
                            var subactivities = activitymanagers[i].activities;
                            for (var j = 0; j < subactivities.length; j++) {
                                if (subactivities[j].optional && subactivities[j].status) {
                                    totalOptionalPoints += subactivities[j].points;
                                }
                            }
                        }
                    }

                    //Not all were actually aearned (if more than max resources) but if less than max_resources the user will be able to earn more
                    for (var i = 0; i < $scope.fuenteDeEnergia.activities.length; i++) {
                        if (!$scope.fuenteDeEnergia.activities[i].optional && $scope.fuenteDeEnergia.activities[i].status) {
                            $scope.statusObligatorios += 1;
                            starsMandatory += 50;
                        }
                    }

                    if ($scope.statusObligatorios >= totalObligatorios && $scope.fuenteDeEnergia.status == 0) {
                        $scope.currentPage = 2;
                    }
                }

                $scope.updateStatus = function (contentId) {

                    $scope.validateConnection(function () {

                        for (var i = 0; i < $scope.fuenteDeEnergia.activities.length; i++) {
                            if ($scope.fuenteDeEnergia.activities[i].groupid == contentId) {
                                if (!$scope.fuenteDeEnergia.activities[i].status) {

                                    // update model
                                    $scope.fuenteDeEnergia.activities[i].status = true;

                                    if (window.mobilecheck()){
                                          $scope.$digest();
                                    }
                                    
                                    //Update cache even if not read from the loading, the cache object could have been created by interaction with anoother element such as "like"
                                    var fuenteDeEnergiaCache = JSON.parse(moodleFactory.Services.GetCacheObject("activitiesCache/" + $routeParams.moodleid));
                                    if (fuenteDeEnergiaCache) {
                                        fuenteDeEnergiaCache.activities[i].status = true;
                                        _setLocalStorageJsonItem("activitiesCache/" + $routeParams.moodleid, fuenteDeEnergiaCache);
                                    } else {
                                        _setLocalStorageJsonItem("activitiesCache/" + $routeParams.moodleid, $scope.fuenteDeEnergia);
                                    }

                                    // Update activityManagers
                                    for (var am = 0; am < activitymanagers.length; am++) {
                                        if (activitymanagers[am].activity_identifier == moduleid) {
                                            var fuenteDeEnergiaManager = activitymanagers[am];

                                            for (var fem = 0; fem < fuenteDeEnergiaManager.activities.length; fem++) {
                                                if (fuenteDeEnergiaManager.activities[fem].groupid == contentId) {
                                                    fuenteDeEnergiaManager.activities[fem].status = true;
                                                }
                                            }
                                        }
                                    }

                                    var updatedActivityOnUsercourse = updateSubActivityStatus($scope.fuenteDeEnergia.activities[i].coursemoduleid);  //actualizar arbol
                                    _setLocalStorageJsonItem("usercourse", updatedActivityOnUsercourse);
                                    _setLocalStorageJsonItem("activityManagers", activitymanagers);
                                    _endActivity($scope.fuenteDeEnergia.activities[i], function() {}, function (obj) {
                                          $scope.$emit('HidePreloader');
                                          if (obj && obj.statusCode && obj.statusCode == 408) {//Request Timeout
                                                $timeout(function () {
                                                      $location.path('/Offline'); //This behavior could change
                                                }, 1);
                                          } else {//Another kind of Error happened
                                                $timeout(function () {
                                                      $scope.$emit('HidePreloader');
                                                      $location.path('/connectionError');
                                                }, 1);
                                          }
                                    });
                                    if (!$scope.fuenteDeEnergia.activities[i].optional) {
                                        $scope.statusObligatorios += 1;
                                        starsMandatory += 50;
                                        if ($scope.statusObligatorios >= totalObligatorios && !$scope.fuenteDeEnergia.status) {
                                            assingStars(true, $scope.fuenteDeEnergia.coursemoduleid, $scope.fuenteDeEnergia.points);
                                            $scope.currentPage = 2;
                                        }
                                    } else {
                                        assingStars(false, $scope.fuenteDeEnergia.activities[i].coursemoduleid, $scope.fuenteDeEnergia.activities[i].points);
                                    }
                                }

                                break;
                            }
                        }
                    }, offlineCallback);
                };

                function assingStars(isMandatory, coursemoduleid, stars) {

                    profile = JSON.parse(moodleFactory.Services.GetCacheObject("Perfil/" + moodleFactory.Services.GetCacheObject("userId")));

                    var data = {
                        userId: profile.id,
                        stars: stars,
                        instance: coursemoduleid,
                        instanceType: 0,
                        date: getdate(),
                        is_extra: false
                    };
                    if (isMandatory) {
                        profile.stars = parseInt(profile.stars) + stars;
                        updateLocalStorageStars(data);
                        moodleFactory.Services.PutStars(data, profile, $scope.token, function () {
                        }, function (obj) {
                              $scope.$emit('HidePreloader');
                              if (obj && obj.statusCode && obj.statusCode == 408) {//Request Timeout
                                $timeout(function () {
                                  $location.path('/Offline'); //This behavior could change
                                }, 1);
                              } else {//Another kind of Error happened
                                $timeout(function () {
                                    $scope.$emit('HidePreloader');
                                    $location.path('/connectionError');
                                }, 1);
                              }
                          });
                    }
                    else if (!isMandatory && ((totalOptionalPoints + stars) <= $scope.fuenteDeEnergia.max_resources)) {
                        data.is_extra = true;
                        profile.stars = parseInt(profile.stars) + stars;
                        moodleFactory.Services.PutStars(data, profile, $scope.token, successfullCallBack, function (obj) {
                                $scope.$emit('HidePreloader');
                                if (obj && obj.statusCode && obj.statusCode == 408) {//Request Timeout
                                  $timeout(function () {
                                    $location.path('/Offline'); //This behavior could change
                                  }, 1);
                                } else {//Another kind of Error happened
                                  $timeout(function () {
                                      $scope.$emit('HidePreloader');
                                      $location.path('/connectionError');
                                  }, 1);
                                }
                            });
                        totalOptionalPoints += stars;
                        updateLocalStorageStars(data);
                    }
                }

                function updateLocalStorageStars(data) {
                    var userStars = JSON.parse(localStorage.getItem("userStars"));

                    var localStorageStarsData = {
                        dateissued: moment(Date.now()).unix(),
                        instance: data.instance,
                        instance_type: data.instanceType,
                        message: "",
                        is_extra: data.is_extra,
                        points: data.stars,
                        userid: parseInt(data.userId)
                    };

                    userStars.push(localStorageStarsData);
                    localStorage.setItem("userStars", JSON.stringify(userStars));
                }

                $scope.back = function () {
                    $location.path('/' + stage + '/Dashboard/' + userCurrentStage + '/' + currentChallenge);
                };

                function getdate() {
                    var currentdate = new Date();
                    var datetime = currentdate.getFullYear() + ":"
                        + addZeroBefore((currentdate.getMonth() + 1)) + ":"
                        + addZeroBefore(currentdate.getDate()) + " "
                        + addZeroBefore(currentdate.getHours()) + ":"
                        + addZeroBefore(currentdate.getMinutes()) + ":"
                        + addZeroBefore(currentdate.getSeconds());
                    return datetime;
                }

                function addZeroBefore(n) {
                    return (n < 10 ? '0' : '') + n;
                }

                function successfullCallBack() {
                    _updateRewardStatus();
                }
                
                function successEndFuente() {
                    $scope.$emit('HidePreloader');
                    $location.path('/' + stage + '/Dashboard/' + userCurrentStage + '/' + currentChallenge);
                }

                $scope.finishActivity = function () {

                    $scope.validateConnection(function () {

                        $scope.$emit("ShowPreloader");

                        $timeout(function () {//This is to avoid killing the preloader beforehand
                            var updatedActivityOnUsercourse = updateActivityStatus($scope.fuenteDeEnergia.activity_identifier);  //actualizar arbol
                            _setLocalStorageJsonItem("usercourse", updatedActivityOnUsercourse);

                            for (var am = 0; am < activitymanagers.length; am++) {
                                if (activitymanagers[am].activity_identifier == moduleid) {
                                    activitymanagers[am].status = true;
                                    break;
                                }
                            }
                            _setLocalStorageJsonItem("activityManagers", activitymanagers);
                            //trigger activity type 2 is sent when the activity ends.
                            var triggerActivity = 2;
                            var currentUserId = currentUser.userId;
                            var activityId = $scope.fuenteDeEnergia.coursemoduleid;
                            //create notification
                            _activityNotification(activityId, triggerActivity);
                            //complete stage
                            var like_status = $scope.like_status;
                            var data = {userid: currentUserId, like_status: like_status};
                            $scope.fuenteDeEnergia.status = 1;
                            // update activity status dictionary used for blocking activity links
                            updateActivityStatusDictionary($scope.fuenteDeEnergia.activity_identifier);
                            moodleFactory.Services.PutEndActivity(activityId, data, $scope.fuenteDeEnergia, currentUser.token, successEndFuente, function (obj) {
                              $scope.$emit('HidePreloader');
                              if (obj && obj.statusCode && obj.statusCode == 408) {//Request Timeout
                                $timeout(function () {
                                  $location.path('/Offline'); //This behavior could change
                                }, 1);
                              } else {//Another kind of Error happened
                                $timeout(function () {
                                    $scope.$emit('HidePreloader');
                                    $location.path('/connectionError');
                                }, 1);
                              }
                          });
                        }, 1000);

                    }, offlineCallback);
                };

                $scope.likeSubActivity = function (contentId) {

                    $scope.validateConnection(function () {

                        for (var i = 0; i < $scope.fuenteDeEnergia.activities.length; i++) {

                            if ($scope.fuenteDeEnergia.activities[i].groupid == contentId) {

                                var userLikes = JSON.parse(localStorage.getItem("likesByUser"));
                                var activityId = $scope.fuenteDeEnergia.activities[i].coursemoduleid;
                                var currentUserId = currentUser.userId;
                                var isLike = $scope.fuenteDeEnergia.activities[i].activityContent.liked == 0 ? 1 : 0;
                                $scope.fuenteDeEnergia.activities[i].activityContent.liked = isLike;

                                var data = {
                                    userid: currentUserId,
                                    like_status: isLike,
                                    only_like: 1
                                };

                                var likes = Number($scope.fuenteDeEnergia.activities[i].activityContent.likes);

                                if ($scope.fuenteDeEnergia.activities[i].activityContent.liked == 0) {
                                    likes -= 1;
                                    //userLikes.likes = parseInt(userLikes.likes) - 1;
                                } else {
                                    likes += 1;
                                    //userLikes.likes = parseInt(userLikes.likes) + 1;
                                }

                                $scope.fuenteDeEnergia.activities[i].activityContent.likes = likes;

                                localStorage.setItem("likesByUser", JSON.stringify(userLikes));
                                moodleFactory.Services.PutEndActivity(activityId, data, $scope.fuenteDeEnergia, currentUser.token, function () {
                                    }, function (obj) {
                                          $scope.$emit('HidePreloader');
                                          if (obj && obj.statusCode && obj.statusCode == 408) {//Request Timeout
                                            $timeout(function () {
                                              $location.path('/Offline'); //This behavior could change
                                            }, 1);
                                          } else {//Another kind of Error happened
                                            $timeout(function () {
                                                $scope.$emit('HidePreloader');
                                                $location.path('/connectionError');
                                            }, 1);
                                          }
                                      });
                            }
                        }
                    }, offlineCallback);
                };

                $scope.openRequirementsModal = function (size) {
                    var modalInstance = $modal.open({
                        animation: false,
                        templateUrl: 'openingRequirementsModal.html',
                        controller: ['$scope', '$modalInstance', function ($scope, $modalInstance) {
                            $scope.neverShowAgain = false;
                            drupalFactory.Services.GetContent("fuenteDeEnergiaRequirements", function (data, key) {
                                $scope.contentResources = data.node;
                            }, function () {
                                $scope.contentResources = {};
                            }, false);

                            $scope.continue = function () {
                                $timeout(function(){
                                    if ($scope.neverShowAgain) {

                                        var currentUser = moodleFactory.Services.GetCacheJson("CurrentUser");
                                        var profile = moodleFactory.Services.GetCacheJson("Perfil/" + currentUser.userId);
                                        profile.hasRequiredApps = true;

                                        moodleFactory.Services.PutAsyncProfile(currentUser.userId, profile,function(){},function (obj) {
                                                $scope.$emit('HidePreloader');
                                                if (obj && obj.statusCode && obj.statusCode == 408) {//Request Timeout
                                                  $timeout(function () {
                                                    $location.path('/Offline'); //This behavior could change
                                                  }, 1);
                                                } else {//Another kind of Error happened
                                                  $timeout(function () {
                                                      $scope.$emit('HidePreloader');
                                                      $location.path('/connectionError');
                                                  }, 1);
                                                }
                                            });
                                    }

                                    $modalInstance.dismiss('cancel');
                                }, 500);
                            };
                        }],
                        size: size,
                        windowClass: 'user-help-modal dashboard-stage-intro'
                    });
                };

                function openRequirementsModal() {
                    var profile = moodleFactory.Services.GetCacheJson("Perfil/" + currentUser.userId);

                    if (!profile.hasRequiredApps && !$rootScope.dontShowRobot) {
                        $scope.openRequirementsModal();
                    }
                }

                openRequirementsModal();
            }

            $scope.commentSubActivity = function (contentId) {

                $scope.validateConnection(function () {

                    for ( i = 0; i < $scope.fuenteDeEnergia.activities.length; i++) {
                        if ($scope.fuenteDeEnergia.activities[i].groupid == contentId) {
                            var activityId = $scope.fuenteDeEnergia.activities[i].coursemoduleid;
                            var currentUserId = currentUser.userId;
                            var newComment = $scope.fuenteDeEnergia.activities[i].activityContent.newComment;

                            $scope.fuenteDeEnergia.activities[i].activityContent.showCommentBox = false;
                            var data = {
                                coursemoduleid: activityId,
                                userid: currentUserId,
                                dateissued: (new Date() / 1000 | 0),
                                comment: newComment
                            };

                            var profile = JSON.parse(moodleFactory.Services.GetCacheObject("Perfil/" + currentUserId));

                            var newCommentObject = {
                                user_comment: newComment,
                                dateissued: (new Date() / 1000 | 0),
                                alias: currentUser.alias,
                                picture_comment_author: profile.profileimageurl
                            };



                            $scope.showMoreComments(contentId);
                            moodleFactory.Services.PostCommentActivity(activityId, data, function () {

                                    // update model
                                    $scope.fuenteDeEnergia.activities[i].activityContent.comments.unshift(newCommentObject);
                                    $scope.fuenteDeEnergia.activities[i].activityContent.newComment = "";
                                    $scope.fuenteDeEnergia.activities[i].activityContent.commentsQty = 3;

                                    // update cache
                                    var fuenteDeEnergiaCache = JSON.parse(moodleFactory.Services.GetCacheObject("activitiesCache/" + $routeParams.moodleid));

                                    if (fuenteDeEnergiaCache) {
                                        if (!fuenteDeEnergiaCache.activities[i].activityContent) {
                                            fuenteDeEnergiaCache.activities[i].activityContent = {};
                                        }
                                        if (!fuenteDeEnergiaCache.activities[i].activityContent.comments) {
                                            fuenteDeEnergiaCache.activities[i].activityContent.comments = [];
                                        }

                                        fuenteDeEnergiaCache.activities[i].activityContent.comments.unshift(newCommentObject);
                                        fuenteDeEnergiaCache.activities[i].activityContent.newComment = "";
                                        fuenteDeEnergiaCache.activities[i].activityContent.commentsQty = 3;

                                        _setLocalStorageJsonItem("activitiesCache/" + $routeParams.moodleid, fuenteDeEnergiaCache);


                                    } else {
                                        _setLocalStorageJsonItem("activitiesCache/" + $routeParams.moodleid, $scope.fuenteDeEnergia);
                                    }

                                    //Success
                                    $rootScope.dontShowRobot = true;
                                    $rootScope.groupid = contentId;
                                    $route.reload();
                                },
                                function (obj) {//Error
                                    console.log('Error!!');
                                    if (obj.statusCode == 408) {//Request Timeout
                                        $timeout(function () {
                                          $location.path('/Offline'); //This behavior could change
                                        }, 1);
                                    } else {//A different Error happened
                                        var errorMessage = [window.atob(obj.messageerror)];
                                        $scope.modelState.errorCode = obj.statusCode;
                                        $scope.modelState.errorMessages = errorMessage;
                                        $scope.scrollToTop();
                                    }
                                });
                        }
                    }

                }, offlineCallback);

            };

            //Time Out Message modal
            $scope.openModalFE = function (size) {
                var modalInstance = $modal.open({
                    animation: $scope.animationsEnabled,
                    templateUrl: 'timeOutModal.html',
                    controller: 'timeOutFuentesEnergia',
                    size: size,
                    windowClass: 'user-help-modal dashboard-programa'
                });
            };

            $scope.showCommentBox = function (contentId) {
                for (var i = 0; i < $scope.fuenteDeEnergia.activities.length; i++) {
                    if ($scope.fuenteDeEnergia.activities[i].groupid == contentId) {
                        if ($scope.fuenteDeEnergia.activities[i].activityContent.showCommentBox != true) {
                            $scope.fuenteDeEnergia.activities[i].activityContent.showCommentBox = true;
                        } else {
                            $scope.fuenteDeEnergia.activities[i].activityContent.showCommentBox = false;
                        }

                        $scope.fuenteDeEnergia.activities[i].activityContent.newComment = '';
                    }
                }
            };

            if ($rootScope.groupid) {
                $timeout(function(){
                    $scope.showMoreComments($rootScope.groupid);
                    $rootScope.groupid = null;
                }, 2000);
            }

            $scope.showMoreComments = function (contentId) {console.log(contentId);
                for (var i = 0; i < $scope.fuenteDeEnergia.activities.length; i++) {
                    if ($scope.fuenteDeEnergia.activities[i].groupid == contentId) {
                        $scope.fuenteDeEnergia.activities[i].activityContent.commentsQty = $scope.fuenteDeEnergia.activities[i].activityContent.comments.length;
                    }
                }
            };

            function getContentResources(activityIdentifierId) {
                drupalFactory.Services.GetContent(activityIdentifierId, function (data, key) {
                    _loadedResources = true;
                    $scope.contentResources = data.node;
                    $rootScope.pageName = $scope.contentResources.title_toolbar;
                    if (_loadedResources && _pageLoaded) {
                        $scope.$emit('HidePreloader');
                    }

                }, function () {
                    _loadedResources = true;
                    if (_loadedResources && _pageLoaded) {
                        $scope.$emit('HidePreloader');
                    }
                }, false);

                /*Closing message content*/
                var stageClosingContent = "";
                if (activityIdentifierId > 999 && activityIdentifierId < 2000)
                    stageClosingContent = "ZonaDeVueloClosing";
                else if (activityIdentifierId > 1999 && activityIdentifierId < 3000)
                    stageClosingContent = "ZonaDeNavegacionClosing";
                else
                    stageClosingContent = "ZonaDeAterrizajeClosing";

                drupalFactory.Services.GetContent(stageClosingContent, function (data, key) {
                    _loadedResources = true;
                    $scope.closingContent = data.node;
                }, function () {
                    _loadedResources = true;
                }, false);
            }

        }]).controller('timeOutFuentesEnergia', ['$scope', '$modalInstance', function ($scope, $modalInstance) {//TimeOut Robot

    $scope.ToDashboard = function () {
        $scope.$emit('ShowPreloader');
        $modalInstance.dismiss('cancel');
    };

}]);
