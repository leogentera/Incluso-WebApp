//global variables

var API_RESOURCE = "http://incluso.definityfirst.com/RestfulAPI/public/{0}";
//var API_RESOURCE = "http://incluso-api-prod.azurewebsites.net/RestfulAPI/public/{0}";


var _courseId = 4;
var _endActivityCurrentChallenge = null;
var _httpFactory = null;
var _timeout = null;
var _location = null;

var _activityStatus = [];

var _activityDependencies = [
    {
        id: 112,
        dependsOn: [150]
    },
    {
        id: 145,
        dependsOn: [150]
    },
    {
        id: 139,
        dependsOn: [150]
    },
    {
        id: 151,
        dependsOn: [150]
    },
    {
        id: 149,
        dependsOn: [150, 139]
    },
    {
        id: 146,
        dependsOn: [150]
    },
    {
        id: 71,
        dependsOn: [150]
    },
    {
        id: 70,
        dependsOn: [150]
    },
    {
        id: 72,
        dependsOn: [150]
    },
    {
        id: 73,
        dependsOn: [150]
    },
    {
        id: 68,
        dependsOn: [150, 112, 145, 139, 151, 149, 146, 71, 70, 72, 73]
    },
    {
        id: 100,
        dependsOn: [150, 68]
    }

];

var _IsOffline = function () {
    return false;
};

var _syncAll = function (callback) {
    callback();
//    moodleFactory.Services.GetAsyncProfile(_getItem("userId"), allServicesCallback);
};

var allServicesCallback = function () {
    _syncCallback();
};

var _setToken = function (token) {
    $.ajaxSetup({
        headers: {'Access_token': token.token}
    });
};

var _setId = function (userId) {
    _setLocalStorageItem("userId", userId);

};

var _getItem = function (key) {
    return localStorage.getItem(key);
};

var _readNotification = function (currentUserId, currentNotificationId) {

    var data = {
        userid: currentUserId,
        notificationid: currentNotificationId
    };

    moodleFactory.Services.PutUserNotificationRead(currentNotificationId, data, function () {
    }, function () {
    });
};

var _setLocalStorageItem = function (key, value) {
    try {
        localStorage.setItem(key, value);
        var size = 0;
        for (var x in localStorage) {
            if (localStorage[x].length) {
                size = size + ((localStorage[x].length * 2) / 1024);
            }
        }
    }
    catch (e) {
        ClearLocalStorage("activity");
        ClearLocalStorage("activitiesCache");
        localStorage.setItem(key, value);
    }
}

var _setLocalStorageJsonItem = function (key, object) {
    try {
        localStorage.setItem(key, JSON.stringify(object));
    }
    catch (e) {
        ClearLocalStorage("activity");
        ClearLocalStorage("activitiesCache");
        localStorage.setItem(key, JSON.stringify(object));
    }
}

function syncCacheData() {

}

//Update activity status for activity blocking binding
var updateActivityStatusDictionary = function (activityId) {
    var activityStatus = moodleFactory.Services.GetCacheJson("activityStatus");
    if (activityStatus) {
        activityStatus[activityId] = 1;
    }
    _setLocalStorageJsonItem("activityStatus", activityStatus);
    _activityStatus[activityId] = 1;
};

var _endActivity = function (activityModel, callback, currentChallenge) {

    //trigger activity type 2 is sent when the activity ends.
    var triggerActivity = 2;
    var currentUser = JSON.parse(moodleFactory.Services.GetCacheObject("CurrentUser"));
    var currentUserId = currentUser.userId;
    var activityId = activityModel.coursemoduleid;
    callback = callback || successCallback;
    //create notification
    _createNotification(activityId, triggerActivity);
    if (activityModel.activityType == "Quiz") {
        _endActivityCurrentChallenge = currentChallenge;
        //activityModel.answersResult.dateStart = activityModel.startingTime;
        //activityModel.answersResult.dateEnd = activityModel.endingTime;
        //activityModel.answersResult.others = activityModel.others;
        moodleFactory.Services.PutEndActivityQuizes(activityId, activityModel.answersResult, activityModel.usercourse, activityModel.token, successQuizCallback, errorCallback);
    }
    else if (activityModel.activityType == "Assign") {
        var data = {userid: currentUserId};
        moodleFactory.Services.PutEndActivityQuizes(activityId, data, activityModel.usercourse, activityModel.token, callback, errorCallback);
    }
    else if (activityModel.activityType == "Parent") {
        _endActivityCurrentChallenge = currentChallenge;
        moodleFactory.Services.PutEndActivity(activityId, activityModel.answersResult, activityModel.usercourse, activityModel.token, callback, errorCallback);
    } else {
        var data = {userid: currentUserId};

        // update activity status dictionary used for blocking activity links
        updateActivityStatusDictionary(activityId);
        moodleFactory.Services.PutEndActivity(activityId, data, activityModel, currentUser.token, callback, errorCallback);
    }
};

var successQuizCallback = function () {
    var currentStage = localStorage.getItem("currentStage");
    /*
    if (_location) {
        _location.path('/ZonaDeVuelo/Dashboard/' + currentStage + '/' + _endActivityCurrentChallenge);
    }
    */
};


//This function updates in localStorage the status of the stage when completed
var _isStageCompleted = function () {

    var userCourse = JSON.parse(localStorage.getItem("usercourse"));

    for (var stageIndex = 0; stageIndex < userCourse.stages.length; stageIndex++) {
        var currentStage = userCourse.stages[stageIndex];
        if (currentStage.status == 1) {
            break;
        } else {
            var totalChallengesByStage = currentStage.challenges.length;
            var totalChallengesCompleted = _.where(currentStage.challenges, {status: 1}).length;
            if (totalChallengesByStage == totalChallengesCompleted) {
                userCourse.stages[stageIndex].status = 1;
                _setLocalStorageJsonItem("usercourse", userCourse);
                return true;
            } else {
                return false;
            }
        }
    }

};

var _isChallengeCompleted = function () {
    var success = 0;
    var userCourse = JSON.parse(localStorage.getItem("usercourse"));
    var lastStageIndex = _.where(userCourse.stages, {status: 1}).length;
    var currentStage = userCourse.stages[lastStageIndex];

    for (var challengeIndex = 0; challengeIndex < currentStage.challenges.length; challengeIndex++) {
        var currentChallenge = currentStage.challenges[challengeIndex];
        if (currentChallenge.status == 0) {
            var totalActivitiesByStage = currentChallenge.activities.length;
            var totalActivitiesCompletedByStage = (_.where(currentChallenge.activities, {status: 1})).length;
            if (totalActivitiesByStage == totalActivitiesCompletedByStage) {

                //updateBadge
                _updateBadgeStatus(currentChallenge.coursemoduleid);
                userCourse.stages[lastStageIndex].challenges[challengeIndex].status = 1;
                _setLocalStorageJsonItem("usercourse", userCourse);
                var currentUser = JSON.parse(moodleFactory.Services.GetCacheObject("CurrentUser"));
                var currentUserId = currentUser.userId;
                var data = {userid: currentUserId};
                var currentActivityModuleId = currentChallenge.coursemoduleid;
                moodleFactory.Services.PutEndActivity(currentActivityModuleId, data, null, currentUser.token, successCallback, errorCallback);
                success = currentActivityModuleId;
                return success;
            } else {
                success = 0;
            }
        } else {
            success = 0;
        }
    }
    ;
    return success;
}


var _updateBadgeStatus = function (coursemoduleid, callback) {
    moodleFactory.Services.GetAsyncProfile(moodleFactory.Services.GetCacheObject("userId"), function () {
        if (callback) callback();
        var profile = moodleFactory.Services.GetCacheJson("profile/" + moodleFactory.Services.GetCacheObject("userId"));
        var badges = profile.badges;
        var currentBadge = _.findWhere(_badgesPerChallenge, {challengeId: coursemoduleid});
        if (currentBadge) {
            for (var indexBadge = 0; indexBadge < badges.length; indexBadge++) {
                if (badges[indexBadge].id == currentBadge.badgeId) {
                    profile.badges[indexBadge].status = "won";
                    _setLocalStorageJsonItem("profile/" + moodleFactory.Services.GetCacheObject("userId"), profile);
                } else {
                    //This else statement is set to avoid errors on execution flows
                }
            }
        } else {//This else statement is set to avoid errors on execution flows
        }
    });
};

var _updateRewardStatus = function () {

    var profile = JSON.parse(localStorage.getItem("profile/" + moodleFactory.Services.GetCacheObject("userId")));
    var totalRewards = profile.rewards;
    var profilePoints = profile.stars;

    for (var i = 0; i < totalRewards.length; i++) {
        var profileReward = profile.rewards[i];
        if (profileReward.status != "won" && profileReward.points_to_get_reward < profilePoints) {
            profile.rewards[i].status = "won";
            profile.rewards[i].dateIssued = new Date();
        }
    }
    localStorage.setItem("profile/" + moodleFactory.Services.GetCacheObject("userId"), JSON.stringify(profile));
}


var _createNotification = function (activityId, triggerActivity) {

    currentUserId = localStorage.getItem("userId");

    var allNotifications = JSON.parse(localStorage.getItem("notifications"));

    for (var indexNotifications = 0; indexNotifications < allNotifications.length; indexNotifications++) {
        var currentNotification = allNotifications[indexNotifications];
        if (currentNotification.trigger == triggerActivity && currentNotification.activityidnumber == activityId) {
            allNotifications[indexNotifications].timemodified = new Date();
            _setLocalStorageJsonItem("notifications", allNotifications);
            var dataModelNotification = {
                notificationid: allNotifications[indexNotifications].id,
                timemodified: new Date(),
                userid: currentUserId,
                already_read: 0
            };
            moodleFactory.Services.PostUserNoitifications(currentUserId, dataModelNotification, successCallback, errorCallback);
        } else {
        }
    }
};


var _coachNotification = function () {

    var notifications = JSON.parse(localStorage.getItem("notifications"));
    var userId = localStorage.getItem('userId');
    var notificationCoach = _.find(notifications, function (notif) {
        if (notif.id == 4) {
            return notif;
        } else {

        }
    });

    if (notificationCoach && !notificationCoach.timemodified) {
        var activityId = 68;
        var activity = _getActivityByCourseModuleId(activityId);
        if ((activity)) {

            var triggerActivity = 3;
            var chatUser = JSON.parse(localStorage.getItem("userChat"));
            if (chatUser && chatUser.length > 0) {
                var lastChat = _.max(chatUser, function (chat) {
                    if (chat.messagesenderid == userId) {
                        return chat.messagedate;
                    }
                });

                //'minutes'- 'days'
                var lastDateChat = moment(new Date(lastChat.messagedate)).add(2, 'days');

                var today = new Date();
                if (lastDateChat < today) {
                    _createNotification(activity.coursemoduleid, triggerActivity);
                } else {
                    return false;
                }
            }
        }
    }
};


var successPutStarsCallback = function (data) {
    _updateRewardStatus();
};


var successCallback = function (data) {
};

var errorCallback = function (data) {
};

var _notificationExists = function () {

    var userNotifications = JSON.parse(localStorage.getItem('notifications'));
    //var countNotificationsUnread = _.where(userNotifications, {read: false}).length;
    var countNotificationsUnread = _.filter(userNotifications, function (notif) {
        return (notif.timemodified != null && notif.read != true);
    });
    var totalNotifications = countNotificationsUnread.length;
    return totalNotifications;

};

function getActivityByActivity_identifier(activity_identifier, usercourse) {
    var matchingActivity = null;
    var breakAll = false;
    var userCourse = usercourse || JSON.parse(localStorage.getItem("usercourse"));
    for (var stageIndex = 0; stageIndex < userCourse.stages.length; stageIndex++) {
        var stage = userCourse.stages[stageIndex];
        for (var challengeIndex = 0; challengeIndex < stage.challenges.length; challengeIndex++) {
            var challenge = stage.challenges[challengeIndex];
            for (var activityIndex = 0; activityIndex < challenge.activities.length; activityIndex++) {
                var activity = challenge.activities[activityIndex];
                //console.log(activity.activity_identifier + " : " + activity);
                if (parseInt(activity.activity_identifier) === parseInt(activity_identifier)) {
                    matchingActivity = activity;
                    breakAll = true;
                    break;
                }
            }
            if (breakAll)
                break;
        }
        if (breakAll)
            break;
    }
    return matchingActivity;
}

function _getActivityByCourseModuleId(coursemoduleid, usercourse) {
    var matchingActivity = null;
    var breakAll = false;
    var userCourse = usercourse || JSON.parse(localStorage.getItem("usercourse"));
    for (var stageIndex = 0; stageIndex < userCourse.stages.length; stageIndex++) {
        var stage = userCourse.stages[stageIndex];
        for (var challengeIndex = 0; challengeIndex < stage.challenges.length; challengeIndex++) {
            var challenge = stage.challenges[challengeIndex];
            for (var activityIndex = 0; activityIndex < challenge.activities.length; activityIndex++) {
                var activity = challenge.activities[activityIndex];
                //console.log(activity.activity_identifier + " : " + activity);
                if (activity.coursemoduleid == coursemoduleid) {
                    matchingActivity = activity;
                    breakAll = true;
                    break;
                }
            }
            if (breakAll)
                break;
        }
        if (breakAll)
            break;
    }
    return matchingActivity;
}

function getActivityAtAnyCost(activity_identifier, moodle_id) {

    var parentActivity = getActivityByActivity_identifier(activity_identifier);
    var activity;

    //In case getActivityByActivity_identifier can't reach the parentActivity node
    if (!parentActivity) {
        var moodleId = _.find(relation_MoodleId_ActivityIdentifier, function (activity) {
            return activity.activity_identifier == activity_identifier;
        }).moodleid;
        //switch (Number(moodle_id)){
        //    case 178:
        parentActivity = _getActivityByCourseModuleId(moodleId);
        //break;
        //}

        //If parentActivity happens to be a child node
        parentActivity.activities && parentActivity.activities.length ? activity = parentActivity.activities[0] : activity = parentActivity;

    } else {
        //activity = parentActivity;
        parentActivity.activities && parentActivity.activities.length ? activity = parentActivity.activities[0] : activity = parentActivity;
    }
    console.log('Parent activity:');
    console.log(parentActivity);

    return {
        parentActivity: parentActivity,
        activity: activity
    }

}

var relation_MoodleId_ActivityIdentifier = [
    {
        'recievedMoodleId': 91,
        'activity_identifier': 3404,
        'moodleid': 91
    },
    {
        'recievedMoodleId': 93,
        'activity_identifier': 3304,
        'moodleid': 93
    },
    {
        'recievedMoodleId': 151,
        'activity_identifier': 1010,
        'moodleid': 64
    },
    {
        'recievedMoodleId': 64,
        'activity_identifier': 1010,
        'moodleid': 64
    },
    {
        'recievedMoodleId': 73,
        'activity_identifier': 1008,
        'moodleid': 73
    },
    {
        'recievedMoodleId': 147,
        'activity_identifier': 1049,
        'moodleid': 147
    },
    {
        'recievedMoodleId': 148,
        'activity_identifier': 1049,
        'moodleid': 148
    },
    {
        'recievedMoodleId': 179,
        'activity_identifier': 2008,
        'moodleid': 178
    },
    {
        'recievedMoodleId': 178,
        'activity_identifier': 2008,
        'moodleid': 178
    },
    {
        'recievedMoodleId': 85,
        'activity_identifier': 2018,
        'moodleid': 85
    }

];

function updateSubActivityStatus(coursemoduleid) {
    //Update activity status for activity blocking binding
    //updateActivityStatusDictionary(coursemoduleid);
    //Update activity status in usercourse
    var breakAll = false;
    var theUserCouerse = JSON.parse(localStorage.getItem("usercourse"));
    for (var stageIndex = 0; stageIndex < theUserCouerse.stages.length; stageIndex++) {
        var stage = theUserCouerse.stages[stageIndex];
        for (var challengeIndex = 0; challengeIndex < stage.challenges.length; challengeIndex++) {
            var challenge = stage.challenges[challengeIndex];
            for (var activityIndex = 0; activityIndex < challenge.activities.length; activityIndex++) {
                var activity = challenge.activities[activityIndex];
                if (activity.activities) {
                    for (var subactivityIndex = 0; subactivityIndex < activity.activities.length; subactivityIndex++) {
                        var subactivity = activity.activities[subactivityIndex];
                        if (subactivity.coursemoduleid == coursemoduleid) {
                            subactivity.status = 1;
                            breakAll = true;
                            break;
                        }
                    }
                }
            }
            if (breakAll)
                break;
        }
        if (breakAll)
            break;
    }
    var theUserCouerseUpdated = theUserCouerse;
    return theUserCouerseUpdated;
}

function updateActivityStatus(activity_identifier) {
    //Update activity status for activity blocking binding
    //Update activity status in usercourse
    var breakAll = false;
    var theUserCouerse = JSON.parse(localStorage.getItem("usercourse"));
    for (var stageIndex = 0; stageIndex < theUserCouerse.stages.length; stageIndex++) {
        var stage = theUserCouerse.stages[stageIndex];
        for (var challengeIndex = 0; challengeIndex < stage.challenges.length; challengeIndex++) {
            var challenge = stage.challenges[challengeIndex];
            for (var activityIndex = 0; activityIndex < challenge.activities.length; activityIndex++) {
                var activity = challenge.activities[activityIndex];
                if (activity.activity_identifier == activity_identifier) {
                    activity.status = 1;
                    updateActivityStatusDictionary(activity.coursemoduleid);
                    breakAll = true;
                    break;
                }
            }
            if (breakAll)
                break;
        }
        if (breakAll)
            break;
    }
    var theUserCouerseUpdated = theUserCouerse;
    return theUserCouerseUpdated;
}

function updateMultipleSubActivityStatuses(parentActivity, subactivitiesCourseModuleId) {
    var breakAll = false;
    var subactivitiesCompleted = 0;
    var theUserCourse = JSON.parse(localStorage.getItem("usercourse"));
    for (var stageIndex = 0; stageIndex < theUserCourse.stages.length; stageIndex++) {
        var stage = theUserCourse.stages[stageIndex];
        for (var challengeIndex = 0; challengeIndex < stage.challenges.length; challengeIndex++) {
            var challenge = stage.challenges[challengeIndex];
            for (var activityIndex = 0; activityIndex < challenge.activities.length; activityIndex++) {
                var activity = challenge.activities[activityIndex];
                if (activity.activities && activity.activity_identifier == parentActivity.activity_identifier) {
                    if (activity.status == 1) {
                        breakAll = true;
                        break;
                    } else if(activity.activities.length == subactivitiesCourseModuleId.length) {
                        activity.status = 1;
                    }
                    for (var subactivityIndex = 0; subactivityIndex < activity.activities.length; subactivityIndex++) {
                        var subactivity = activity.activities[subactivityIndex];
                        for (var subactivityCourseModuleId = 0; subactivityCourseModuleId < subactivitiesCourseModuleId.length; subactivityCourseModuleId++) {
                            if (subactivity.coursemoduleid == subactivitiesCourseModuleId[subactivityCourseModuleId] && subactivity.status == 0) {
                                subactivity.status = 1;
                                subactivitiesCompleted++;
                                break;
                            }
                        }
                        if (subactivitiesCompleted == subactivitiesCourseModuleId.length) {
                          breakAll = true;
                        }
                        if (breakAll)
                            break;
                    }
                }
                if (breakAll)
                    break;
            }
            if (breakAll)
                break;
        }
        if (breakAll)
            break;
    }
    return theUserCourse;
}

function updateMultipleSubactivityStars(parentActivity, subactivitiesCourseModuleId) {
    var profile = JSON.parse(moodleFactory.Services.GetCacheObject("profile/" + moodleFactory.Services.GetCacheObject("userId")));
    var currentUser = JSON.parse(moodleFactory.Services.GetCacheObject("CurrentUser"));
    var stars = 0;
    for (var i = 0; i < parentActivity.activities.length; i++) {
        for (var j = 0; j < subactivitiesCourseModuleId.length; j++) {
            if (parentActivity.activities[i].coursemoduleid == subactivitiesCourseModuleId[j] && parentActivity.activities[i].status == 0) {
                stars += parentActivity.activities[i].points;
            }
        }
    }
    stars += (subactivitiesCourseModuleId.length == parentActivity.activities.length ? parentActivity.points : 0);
    profile.stars = parseInt(profile.stars) + stars;
    currentUser.stars = profile.stars;
    if (stars > 0) {
        var data = {
            userId: profile.id,
            stars: stars + parentActivity.points,
            instance: parentActivity.coursemoduleid,
            instanceType: 0,
            date: getdate()
        };
        moodleFactory.Services.PutStars(data, profile, currentUser.token, successPutStarsCallback, errorCallback);
        _setLocalStorageJsonItem("profile/" + moodleFactory.Services.GetCacheObject("userId"), profile)
        _setLocalStorageJsonItem("CurrentUser", currentUser)
    }
}

function updateUserStars(activityIdentifier, extraPoints) {
    var profile = JSON.parse(moodleFactory.Services.GetCacheObject("profile/" + moodleFactory.Services.GetCacheObject("userId")));
    var currentUser = JSON.parse(moodleFactory.Services.GetCacheObject("CurrentUser"));
    //var activity = getActivityByActivity_identifier(activity_identifier);
    var activity = getActivityAtAnyCost(activityIdentifier).activity;

    extraPoints ? '' : extraPoints = 0;

    /*
     if (activity_identifier == '1009' || activity_identifier == '1001') {
     activity.points = 50;
     }

     */

    if (extraPoints != 0) {
        profile.stars = Number(profile.stars) + Number(extraPoints);
    } else {
        profile.stars = Number(profile.stars) + Number(activity.points) + Number(extraPoints);
    }


    var data = {
        userId: profile.id,
        stars: Number(activity.points) + Number(extraPoints),
        instance: activity.coursemoduleid,
        instanceType: 0,
        date: getdate()
    };
    moodleFactory.Services.PutStars(data, profile, currentUser.token, successPutStarsCallback, errorCallback);
}

function updateUserStarsUsingExternalActivity(activity_identifier) {
    var profile = JSON.parse(moodleFactory.Services.GetCacheObject("profile/" + moodleFactory.Services.GetCacheObject("userId")));
    var currentUser = JSON.parse(moodleFactory.Services.GetCacheObject("CurrentUser"));
    var activity = getExtActivityByActivity_identifier(activity_identifier);
    //profile.stars = Number(profile.stars) +  Number(activity.points);
    var data = {
        userId: profile.id,
        stars: activity.points,
        instance: activity.coursemoduleid,
        instanceType: 0,
        date: getdate()
    };

    moodleFactory.Services.PutStars(data, profile, currentUser.token, successPutStarsCallback, errorCallback);
}

function updateActivityManager(activityManager, coursemoduleid, activity_identifier) {
    var breakAll = false;
    if (!activityManager) {
        activityManager = moodleFactory.Services.GetCacheJson("activityManagers");
    }
    for (var activityIndex = 0; activityIndex < activityManager.length; activityIndex++) {
        var activity = activityManager[activityIndex];
        for (var subactivityIndex = 0; subactivityIndex < activity.activities.length; subactivityIndex++) {
            var subactivity = activity.activities[subactivityIndex];
            if (subactivity.coursemoduleid == coursemoduleid) {
                subactivity.status = 1;
                breakAll = true;
                break;
            }
            if (subactivity.activities) {
                for (var subsubactivityIndex = 0; subsubactivityIndex < subactivity.activities.length; subsubactivityIndex++) {
                    var subsubactivity = subactivity.activities[subsubactivityIndex];
                    if (subsubactivity && subsubactivity.coursemoduleid == coursemoduleid  && !activity_identifier) {
                        subsubactivity.status = 1;
                        breakAll = true;
                        break;
                    }
                }
                if (breakAll)
                    break;
            }
        }
        if (breakAll)
            break;
    }
    return activityManager;
}

function getExtActivityByActivity_identifier(activity_identifier) {
    var userCourse = JSON.parse(localStorage.getItem("usercourse"));
    for (var activityIndex = 0; activityIndex < userCourse.activities.length; activityIndex++) {
        var extActivity = userCourse.activities[activityIndex];
        if (extActivity.activity_identifier == activity_identifier) {
            return extActivity;
        }
    }
}

function getdate() {
    var date = new Date(),
        year = date.getFullYear(),
        month = formatValue(date.getMonth() + 1), // months are zero indexed
        day = formatValue(date.getDate()),
        hour = formatValue(date.getHours()),
        minute = formatValue(date.getMinutes()),
        second = formatValue(date.getSeconds());

    function formatValue(value) {
        return value >= 10 ? value : '0' + value;
    }

    return year + ":" + month + ":" + day + " " + hour + ":" + minute + ":" + second;
}

syncCacheData();
var logout = function ($scope, $location) {
    $scope.currentUser = JSON.parse(moodleFactory.Services.GetCacheObject("CurrentUser"));

    if (!_IsOffline()) {
        _httpFactory(
            {
                method: 'POST',
                url: API_RESOURCE.format("authentication"),
                headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                data: $.param(
                    {
                        token: $scope.currentUser.token,
                        userid: $scope.currentUser.userId,
                        action: "logout"
                    })
            }
        ).success(function (data, status, headers, config) {
            }
        );
    }
    localStorage.removeItem("CurrentUser");
    localStorage.removeItem("profile/" + moodleFactory.Services.GetCacheObject("userId"));
    localStorage.removeItem("course");
    localStorage.removeItem("stage");
    localStorage.removeItem("usercourse");
    localStorage.removeItem("currentStage");
    localStorage.removeItem("notifications");
    localStorage.removeItem("userChat");
    localStorage.removeItem("leaderboard");
    localStorage.removeItem("activityStatus");
    ClearLocalStorage("activity");
    ClearLocalStorage("activitiesCache");
    ClearLocalStorage("activityAnswers");
    ClearLocalStorage("album");
    $location.path('/');
};

function ClearLocalStorage(startsWith) {
    var myLength = startsWith.length;

    Object.keys(localStorage).forEach(function (key) {
        if (key.substring(0, myLength) == startsWith) {
            localStorage.removeItem(key);
        }
    });
}

playVideo = function (videoAddress, videoName) {
    //var videoAddress = "assets/media";
    //var videoName = "TutorialTest2.mp4";
    cordova.exec(SuccessVideo, FailureVideo, "CallToAndroid", "PlayLocalVideo", [videoAddress, videoName]);
};

function SuccessVideo() {

}

function FailureVideo() {

}

var _staticStages = [
    {
        "sectionname": "Zona de Vuelo",
        "challenges": [
            {
                "sectionname": "Exploración inicial",
                "activities": [
                    {
                        "activityname": "Exploración Inicial",
                        "coursemoduleid": 140,
                        "points": 0,
                        "started": 0
                    },
                    {
                        "activityname": "Exploracion Inicial",
                        "coursemoduleid": 150,
                        "points": 100,
                        "started": 0
                    }
                ]
            },
            {
                "sectionname": "Cuarto de recursos",
                "activities": [
                    {
                        "activityname": "Fuente de energía",
                        "coursemoduleid": 112,
                        "points": 250,
                        "started": 0
                    },
                    {
                        "activityname": "Cuarto de recursos",
                        "coursemoduleid": 113,
                        "points": 0,
                        "started": 0
                    }
                ]
            },
            {
                "sectionname": "Conócete",
                "activities": [
                    {
                        "activityname": "Zona de Contacto",
                        "coursemoduleid": 149,
                        "points": 100,
                        "started": 0
                    },
                    {
                        "activityname": "Fuente de energía",
                        "coursemoduleid": 145,
                        "points": 0,
                        "started": 0
                    },
                    {
                        "activityname": "Reto múltiple",
                        "coursemoduleid": 139,
                        "points": 0,
                        "started": 0
                    },
                    {
                        "activityname": "Punto de Encuentro",
                        "coursemoduleid": 64,
                        "points": 100,
                        "started": 0
                    },
                    {
                        "activityname": "Conócete",
                        "coursemoduleid": 114,
                        "points": 0,
                        "started": 0
                    }
                ]
            },
            {
                "sectionname": "Mis sueños",
                "activities": [
                    {
                        "activityname": "Fuente de energía",
                        "coursemoduleid": 146,
                        "points": 0,
                        "started": 0
                    },
                    {
                        "activityname": "Mis gustos",
                        "coursemoduleid": 70,
                        "points": 300,
                        "started": 0
                    },
                    {
                        "activityname": "Mis cualidades",
                        "coursemoduleid": 71,
                        "points": 300,
                        "started": 0
                    },
                    {
                        "activityname": "Sueña",
                        "coursemoduleid": 72,
                        "points": 300,
                        "started": 0
                    },
                    {
                        "activityname": "Punto de encuentro",
                        "coursemoduleid": 73,
                        "points": 100,
                        "started": 0
                    },
                    {
                        "activityname": "Mis sueños",
                        "coursemoduleid": 115,
                        "points": 0,
                        "started": 0
                    }
                ]
            },
            {
                "sectionname": "Cabina de soporte",
                "activities": [
                    {
                        "activityname": "Cabina de soporte",
                        "coursemoduleid": 116,
                        "points": 0,
                        "started": 0
                    }
                ]
            },
            {
                "sectionname": "Exploración final",
                "activities": [
                    {
                        "activityname": "Exploración final",
                        "coursemoduleid": 100,
                        "points": 0,
                        "started": 0
                    }
                ]
            }
        ]
    },
    {
        "sectionname": "Zona de navegación",
        "challenges": [
            {
                "sectionname": "Exploración inicial",
                "activities": [
                    {
                        "activityname": "Exploración inicial",
                        "coursemoduleid": 75,
                        "points": 0,
                        "started": 0
                    }
                ]
            },
            {
                "sectionname": "Cuarto de recursos",
                "activities": [
                    {
                        "activityname": "Fuente de energía",
                        "coursemoduleid": -1,
                        "points": 0,
                        "started": 0
                    }
                ]
            },
            {
                "sectionname": "Competencias sociales",
                "activities": [
                    {
                        "activityname": "Fuente de energía",
                        "coursemoduleid": -1,
                        "points": 0,
                        "started": 0
                    },
                    {
                        "activityname": "Toma de decisiones",
                        "coursemoduleid": -1,
                        "points": 0,
                        "started": 0
                    },
                    {
                        "activityname": "Creencias",
                        "coursemoduleid": -1,
                        "points": 0,
                        "started": 0
                    },
                    {
                        "activityname": "Punto de contacto",
                        "coursemoduleid": 79,
                        "points": 0,
                        "started": 0
                    }
                ]
            },
            {
                "sectionname": "Proyecto de vida",
                "activities": [
                    {
                        "activityname": "Fuente de energía",
                        "coursemoduleid": -1,
                        "points": 0,
                        "started": 0
                    },
                    {
                        "activityname": "Proyección de vida",
                        "coursemoduleid": -1,
                        "points": 0,
                        "started": 0
                    },
                    {
                        "activityname": "Canvas",
                        "coursemoduleid": 81,
                        "points": 0,
                        "started": 0
                    },
                    {
                        "activityname": "Foro",
                        "coursemoduleid": 85,
                        "points": 0,
                        "started": 0
                    }
                ]
            },
            {
                "sectionname": "Cabina de soporte",
                "activities": []
            },
            {
                "sectionname": "Exploración final",
                "activities": [
                    {
                        "activityname": "Exploración final",
                        "coursemoduleid": 86,
                        "points": 0,
                        "started": 0
                    }
                ]
            }
        ]
    },
    {
        "sectionname": "Zona de aterrizaje",
        "challenges": [
            {
                "sectionname": "Exploración inicial",
                "activities": [
                    {
                        "activityname": "Exploración Inicial",
                        "coursemoduleid": 89,
                        "points": 0,
                        "started": 0
                    }
                ]
            },
            {
                "sectionname": "Descubre más",
                "activities": [
                    {
                        "activityname": "Fuente de energía",
                        "coursemoduleid": -1,
                        "points": 0,
                        "started": 0
                    }
                ]
            },
            {
                "sectionname": "Proyecto de emprendimiento",
                "activities": [
                    {
                        "activityname": "Fuente de energía",
                        "coursemoduleid": -1,
                        "points": 0,
                        "started": 0
                    },
                    {
                        "activityname": "Canvas",
                        "coursemoduleid": 90,
                        "points": 0,
                        "started": 0
                    },
                    {
                        "activityname": "Foro",
                        "coursemoduleid": 91,
                        "points": 0,
                        "started": 0
                    }
                ]
            },
            {
                "sectionname": "Educación financiera",
                "activities": [
                    {
                        "activityname": "Fuente de energía",
                        "coursemoduleid": -1,
                        "points": 0,
                        "started": 0
                    },
                    {
                        "activityname": "Habilidades financieras",
                        "coursemoduleid": -1,
                        "points": 0,
                        "started": 0
                    },
                    {
                        "activityname": "Foro",
                        "coursemoduleid": 93,
                        "points": 0,
                        "started": 0
                    }
                ]
            },
            {
                "sectionname": "Cabina de soporte",
                "activities": []
            },
            {
                "sectionname": "Exploración final",
                "activities": [
                    {
                        "activityname": "Exploración final",
                        "coursemoduleid": 96,
                        "points": 0,
                        "started": 0
                    }
                ]
            }
        ]
    }
];

var _badgesPerChallenge = [
    {badgeId: 2, badgeName: "Combustible", challengeId: 113},
    {badgeId: 3, badgeName: "Turbina C0N0-CT", challengeId: 114},
    {badgeId: 4, badgeName: "Ala Ctu-3000", challengeId: 115},
    {badgeId: 5, badgeName: "Sistema de Navegación", challengeId: 68},
    {badgeId: 6, badgeName: "Propulsor", challengeId: 155},
    {badgeId: 7, badgeName: "Misiles", challengeId: 157},
    {badgeId: 8, badgeName: "Campo de fuerza", challengeId: 81},
    {badgeId: 9, badgeName: "Radar", challengeId: 167},
    {badgeId: 18, badgeName: "Turbo", challengeId: 160}
];


var _activityRoutes = [
    {id: 150, name: '', url: '/ZonaDeVuelo/ExploracionInicial/1001'},
    {id: 112, name: '', url: '/ZonaDeVuelo/CuartoDeRecursos/FuenteDeEnergia/zv_cuartoderecursos_fuentedeenergia'},
    {id: 113, name: '', url: '#'},
    {id: 149, name: '', url: '/ZonaDeVuelo/Conocete/ZonaDeContacto/149'},
    {id: 145, name: '', url: '/ZonaDeVuelo/Conocete/FuenteDeEnergia/zv_conocete_fuentedeenergia'},
    {id: 139, name: 'Reto Multiple', url: '/ZonaDeVuelo/Conocete/RetoMultiple/1039'},
    {id: 151, name: '', url: '/ZonaDeVuelo/Conocete/PuntoDeEncuentro/Topicos/64'},
    {id: 114, name: '', url: '#'},
    {id: 146, name: '', url: '/ZonaDeVuelo/MisSuenos/FuenteDeEnergia/zv_missuenos_fuentedeenergia'},
    {id: 70, name: '', url: '/ZonaDeVuelo/MisSuenos/MisGustos/1006'},
    {id: 71, name: '', url: '/ZonaDeVuelo/MisSuenos/MisCualidades/1005'},
    {id: 72, name: '', url: '/ZonaDeVuelo/MisSuenos/Suena/1007'},
    {id: 73, name: '', url: '/ZonaDeVuelo/MisSuenos/PuntosDeEncuentro/Topicos/73'},
    {id: 115, name: '', url: '#'},
    {id: 68, name: '', url: '/ZonaDeVuelo/CabinaDeSoporte/zv_cabinadesoporte_chat'},
    {id: 100, name: '', url: '/ZonaDeVuelo/ExploracionFinal/1009'},
    {id:89,name:'',url:'/ZonaDeAterrizaje/ExploracionInicial/3101'},
    {id:207,name:'',url:'/ZonaDeAterrizaje/CuartoDeRecursos/FuenteDeEnergia/207'},
    {id:209,name:'',url:'/ZonaDeAterrizaje/EducacionFinanciera/FuenteDeEnergia/209'},
    {id:210,name:'',url:'/ZonaDeAterrizaje/EducacionFinanciera/MultiplicaTuDinero/3302'},
    {id:212,name:'',url:'/ZonaDeAterrizaje/EducacionFinanciera/PuntoDeEncuentro/Topicos/93'},
    {id:213,name:'',url:'/ZonaDeAterrizaje/MapaDelEmprendedor/FuenteDeEnergia/213'},
    {id:214,name:'',url:'/ZonaDeAterrizaje/MapaDelEmprendedor/MapaDelEmprendedor/3402'},
    {id:216,name:'',url:'/ZonaDeAterrizaje/MapaDelEmprendedor/PuntoDeEncuentro/Topicos/91'},
    {id:95,name:'',url:'/ZonaDeAterrizaje/CabinaDeSoporte/95'},
    {id:96,name:'',url:'/ZonaDeAterrizaje/ExploracionFinal/3601'}
    //{ id: 0, url: ''}  // TODO: Fill remaining
];


function removeHtmlTag(value) {
    value = value.replace(/</g, '&lt;');
    value = value.replace(/>/g, '&gt;');
    return value;
}

function restoreHtmlTag(value) {
    value = value.replace(/&lt;/g, "<");
    value = value.replace(/&gt;/g, ">");
    return value;
}

document.addEventListener("deviceready", onDeviceReady, false);

function onDeviceReady() {
    // Register the event listener
    document.addEventListener("backbutton", onBackKeyDown, false);
}

// Handle the back button
//
function onBackKeyDown() {
}
