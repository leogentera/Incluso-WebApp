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
        function ($q, $scope, $location, $routeParams, $timeout, $rootScope, $http, $anchorScroll, $modal) {
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
                $timeout(function () { $location.path("/Offline"); }, 1000);
            }

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

                activitymanagers = JSON.parse(moodleFactory.Services.GetCacheObject("activityManagers"));
                if (!activities) {
                    $scope.fuenteDeEnergia = _.find(activitymanagers, function (a) {
                        return a.activity_identifier == moduleid
                    });
                    getDataAsync();
                }
                else {
                    $scope.fuenteDeEnergia = activities;
                    getDataAsync();
                }

                checkProgress();

                $scope.navigateToPage = function (pageNumber) {
                    $scope.currentPage = pageNumber;
                };

                function getDataAsync() {
                    for (i = 0; i < $scope.fuenteDeEnergia.activities.length; i++) {

                        activitiesData += "activity[" + i + "]=" + $scope.fuenteDeEnergia.activities[i].coursemoduleid + "&";
                    }
                    if (activitiesData != "") {
                        waitPreloader++;
                        activitiesData = activitiesData.slice(0, -1);
                        console.log(activitiesData);
                        moodleFactory.Services.GetAsyncActivitiesEnergy(activitiesData, $scope.token, getActivityInfoCallback, getActivityErrorCallback, true);
                    }
                    if (waitPreloader == 0) {
                        _pageLoaded = true;
                        if (_loadedResources && _pageLoaded) { $scope.$emit('HidePreloader') };
                    }
                }

                function getActivityInfoCallback(data, key) {
                    for (i = 0; i < $scope.fuenteDeEnergia.activities.length; i++) {
                        var myActivity = $scope.fuenteDeEnergia.activities[i];

                        if (!myActivity.activityContent) {
                            myActivity.activityContent = data[i];

                            setResources(myActivity);
                        }
                    }
                    _pageLoaded = true;
                    if (_loadedResources && _pageLoaded) { $scope.$emit('HidePreloader') };
                }

                function getActivityErrorCallback() {
                    _pageLoaded = true;
                    if (_loadedResources && _pageLoaded) { $scope.$emit('HidePreloader') };
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
                    if ($scope.statusObligatorios >= 5 && $scope.fuenteDeEnergia.status == 0) {
                        $scope.currentPage = 2;
                    }
                }

                $scope.updateStatus = function (contentId) {

                    $scope.validateConnection(function () {

                        for (var i = 0; i < $scope.fuenteDeEnergia.activities.length; i++) {
                            if ($scope.fuenteDeEnergia.activities[i].groupid == contentId) {
                                if (!$scope.fuenteDeEnergia.activities[i].status) {
                                    $scope.fuenteDeEnergia.activities[i].status = true;
                                    _setLocalStorageJsonItem("activitiesCache/" + moduleid, $scope.fuenteDeEnergia);
                                    //Update cache even if not read from the loading, the cache object could have been created by interaction with anoother element such as "like"

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
                                    _endActivity($scope.fuenteDeEnergia.activities[i]);
                                    if (!$scope.fuenteDeEnergia.activities[i].optional) {
                                        $scope.statusObligatorios += 1;
                                        assingStars(true, $scope.fuenteDeEnergia.activities[i].coursemoduleid, $scope.fuenteDeEnergia.activities[i].points);
                                        starsMandatory += 50;
                                        if ($scope.statusObligatorios >= 5 && !$scope.fuenteDeEnergia.status) {
                                            $scope.navigateToPage(2);
                                        }
                                    }
                                    else {
                                        assingStars(false, $scope.fuenteDeEnergia.activities[i].coursemoduleid, $scope.fuenteDeEnergia.activities[i].points);
                                        starsNoMandatory += 50;
                                    }
                                }
                                break;
                            }
                        }

                    }, offlineCallback);

                };

                function assingStars(isMandatory, coursemoduleid, stars) {

                    $scope.validateConnection(function () {



                        profile = JSON.parse(moodleFactory.Services.GetCacheObject("Perfil/" + moodleFactory.Services.GetCacheObject("userId")));
                        var data = {
                            userId: profile.id,
                            stars: stars,
                            instance: coursemoduleid,
                            instanceType: 0,
                            date: getdate(),
                            is_extra: false
                        };
                        console.log("Updating Stars");                        
                        if (starsMandatory < 250 && isMandatory) {
                            profile.stars = parseInt(profile.stars) + stars;                            
                            moodleFactory.Services.PutStars(data, profile, $scope.token, successfullCallBack, errorCallback);
                        }                        
                        else if (!isMandatory && totalOptionalPoints < $scope.fuenteDeEnergia.max_resources) {
                            if (totalOptionalPoints + stars > $scope.fuenteDeEnergia.max_resources) {
                                stars = $scope.fuenteDeEnergia.max_resources - totalOptionalPoints;
                            }
                            data.is_extra = true;

                            profile.stars = parseInt(profile.stars) + stars;
                                                                                            
                            moodleFactory.Services.PutStars(data, profile, $scope.token, successfullCallBack, errorCallback);
                            totalOptionalPoints += stars;                            
                        }

                        var userStars = JSON.parse(localStorage.getItem("userStars"));

                        var localStorageStarsData = {
                            dateissued: (new Date() / 1000 | 0),
                            instance: data.instance,
                            instance_type: data.instanceType,
                            message: "",
                            is_extra: data.is_extra,
                            points: data.stars,
                            userid: parseInt(data.userId)
                        };

                        userStars.push(localStorageStarsData);

                        localStorage.setItem("userStars", JSON.stringify(userStars));

                    }, offlineCallback);

                }

                $scope.back = function () {                    
                    $scope.$emit("ShowPreloader");

                    $timeout(function () {
                        $location.path('/' + stage + '/Dashboard/' + userCurrentStage + '/' + currentChallenge);
                    }, 1000);
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

                function errorCallback() {

                }

                function successEndFuente() {                    
                    console.log("success end fuente");
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
                            var data = { userid: currentUserId, like_status: like_status };
                            $scope.fuenteDeEnergia.status = 1;
                            // update activity status dictionary used for blocking activity links
                            updateActivityStatusDictionary($scope.fuenteDeEnergia.activity_identifier);
                            moodleFactory.Services.PutEndActivity(activityId, data, $scope.fuenteDeEnergia, currentUser.token, successEndFuente, function () {
                                $scope.$emit('HidePreloader');
                            });
                        }, 1000);


                    }, offlineCallback);

                }

                $scope.likeSubActivity = function (contentId) {

                    $scope.validateConnection(function () {

                        for (var i = 0; i < $scope.fuenteDeEnergia.activities.length; i++) {

                            if ($scope.fuenteDeEnergia.activities[i].groupid == contentId) {

                                var activityId = $scope.fuenteDeEnergia.activities[i].coursemoduleid;                                
                                var currentUserId = currentUser.userId;
                                var isLike = $scope.fuenteDeEnergia.activities[i].activityContent.liked == 0 ? 1 : 0;
                                $scope.fuenteDeEnergia.activities[i].activityContent.liked = isLike;
                                var data = { userid: currentUserId, like_status: isLike, only_like: 1 };

                                var likes = Number($scope.fuenteDeEnergia.activities[i].activityContent.likes);

                                if ($scope.fuenteDeEnergia.activities[i].activityContent.liked == 0) {
                                    likes -= 1;
                                } else {
                                    likes += 1;
                                }

                                $scope.fuenteDeEnergia.activities[i].activityContent.likes = likes;

                                moodleFactory.Services.PutEndActivity(activityId, data, $scope.fuenteDeEnergia, currentUser.token, countLikesByUser, errorCallback);
                            }
                        }

                    }, offlineCallback);

                }
            }

            function countLikesByUser() {

                var userCourse = JSON.parse(localStorage.getItem("usercourse"));
                moodleFactory.Services.CountLikesByUser(userCourse.courseid, currentUser.token, function (data) {
                    if (data) {
                        var likes = parseInt(data.likes);
                        if (likes > 13) {
                            assignLikesBadge();
                        }
                    }
                }, function () { }, true);
            }

            function assignLikesBadge() {
                var badgeModel = {
                    badgeid: 15 //badge earned when a user completes his profile.
                };

                moodleFactory.Services.PostBadgeToUser(currentUser.userId, badgeModel, function () {
                    console.log("created badge successfully");
                }, function () { });
            }

            $scope.commentSubActivity = function (contentId) {

                $scope.validateConnection(function () {

                    for (var i = 0; i < $scope.fuenteDeEnergia.activities.length; i++) {
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

                            var newCommentObject = {
                                user_comment: newComment,
                                dateissued: (new Date() / 1000 | 0),
                                alias: currentUser.alias
                            };

                            $scope.fuenteDeEnergia.activities[i].activityContent.comments.push(newCommentObject);

                            $scope.fuenteDeEnergia.activities[i].activityContent.newComment = "";
                            $scope.fuenteDeEnergia.activities[i].activityContent.commentsQty++;
                            moodleFactory.Services.PostCommentActivity(activityId, data, function () {
                            }, function () {
                            });
                        }
                    }

                }, offlineCallback);

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
            }

            $scope.showMoreComments = function (contentId) {
                for (var i = 0; i < $scope.fuenteDeEnergia.activities.length; i++) {
                    if ($scope.fuenteDeEnergia.activities[i].groupid == contentId) {
                        $scope.fuenteDeEnergia.activities[i].activityContent.commentsQty = $scope.fuenteDeEnergia.activities[i].activityContent.comments.length;
                    }
                }
            }

            function getContentResources(activityIdentifierId) {
                console.log(activityIdentifierId);
                drupalFactory.Services.GetContent(activityIdentifierId, function (data, key) {
                    _loadedResources = true;
                    $scope.contentResources = data.node;
                    $rootScope.pageName = $scope.contentResources.title_toolbar;
                    if (_loadedResources && _pageLoaded) { $scope.$emit('HidePreloader'); }

                }, function () { _loadedResources = true; if (_loadedResources && _pageLoaded) { $scope.$emit('HidePreloader'); } }, false);

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
                }, function () { _loadedResources = true; }, false);
            }

        } ]);
