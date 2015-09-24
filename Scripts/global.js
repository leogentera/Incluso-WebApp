//global variables

var API_RESOURCE = "http://incluso.definityfirst.com/RestfulAPI/public/{0}";
//var API_RESOURCE = "http://incluso-api-prod.azurewebsites.net/RestfulAPI/public/{0}";


var _courseId = 4;
var _endActivityCurrentChallenge = null;
var _httpFactory = null;
var _timeout = null;
var _location = null;

var _activityStatus = [];

var _activityDependencies=[
    //Stage 1 dependencies
    {
        id: 1101,
        dependsOn: [1001]
    },
    {
        id: 1020,
        dependsOn: [1001]
    },
    {
        id: 1039,
        dependsOn: [1001]
    },
    {
        id: 1010,
        dependsOn: [1001]
    },
    {
        id: 1049,
        dependsOn: [1001, 1039]
    },
    {
        id: 1021,
        dependsOn: [1001]
    },
    {
        id: 1005,
        dependsOn: [1001]
    },
    {
        id: 1006,
        dependsOn: [1001]
    },
    {
        id: 1007,
        dependsOn: [1001]
    },
    {
        id: 1008,
        dependsOn: [1001]
    },
    {
        id: 1002,
        dependsOn: [1001, 1101, 1020, 1039, 1010, 1049, 1021, 1005, 1006, 1007, 1008]
    },
    {
        id: 1009,
        dependsOn: [1001, 1002]
    },
    //Stage 2 dependencies
    {
        id:2001,
        dependsOn:[1009]
    },
    {
        id:2004,
        dependsOn:[2001]
    },
    {
        id:2006,
        dependsOn:[2001]
    },
    {
        id:2007,
        dependsOn:[2001]
    },
    {
        id:2030,
        dependsOn:[2001]
    },
    {
        id:2011,
        dependsOn:[2001]
    },
    {
        id:2012,
        dependsOn:[2001]
    },
    {
        id:2015,
        dependsOn:[2001]
    },
    {
        id:2016,
        dependsOn:[2001]
    },
    {
        id:2017,
        dependsOn:[2001]
    },
    {
        id:2026,
        dependsOn:[2001]
    },
    {
        id:2022,
        dependsOn:[2001,2004,2006,2009,2008,2011,2013,2015,2025,2017,2018]
    },
    {
        id:2023,
        dependsOn:[2001,2022]
    },
    //Stage 3 dependencies
    {
        id:3101,
        dependsOn:[2023]
    },
    {
        id:3201,
        dependsOn:[3101]
    },
    {
        id:3301,
        dependsOn:[3101]
    },
    {
        id:3302,
        dependsOn:[3101]
    },
    {
        id:3304,
        dependsOn:[3101]
    },
    {
        id:3401,
        dependsOn:[3101]
    },
    {
        id:3402,
        dependsOn:[3101]
    },
    {
        id:3404,
        dependsOn:[3101]
    },
    {
        id:3501,
        dependsOn:[3101,3201,3301,3303,3305,3401,3403,3405]
    },
    {
        id:3601,
        dependsOn:[3501]
    }
];

var _activityDependenciesLegacy = [
    //Stage 1 dependencies
    {
        id: 1101,
        dependsOn: [150]
    },
    {
        id: 1020,
        dependsOn: [150]
    },
    {
        id: 1039,
        dependsOn: [150]
    },
    {
        id: 1010,
        dependsOn: [150]
    },
    {
        id: 1049,
        dependsOn: [150, 139]
    },
    {
        id: 1021,
        dependsOn: [150]
    },
    {
        id: 1005,
        dependsOn: [150]
    },
    {
        id: 1006,
        dependsOn: [150]
    },
    {
        id: 1007,
        dependsOn: [150]
    },
    {
        id: 1008,
        dependsOn: [150]
    },
    {
        id: 1002,
        dependsOn: [150, 112, 145, 139, 64, 149, 146, 71, 70, 72, 73]
    },
    {
        id: 1009,
        dependsOn: [150, 68]
    },

    //Stage 2 dependencies on stage 1
    {
        id:2002,
        dependsOn:[100]
    }
];

var _IsOffline = function () {
    return false;
};

var _syncAll = function (callback) {
    moodleFactory.Services.GetAsyncUserCourse(_getItem("userId"), callback, function() {} );
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
var updateActivityStatusDictionary = function (activityIdentifierId) {
    var activityStatus = moodleFactory.Services.GetCacheJson("activityStatus");
    if (activityStatus) {
        activityStatus[activityIdentifierId] = 1;
    }
    _setLocalStorageJsonItem("activityStatus", activityStatus);
    _activityStatus[activityIdentifierId] = 1;
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
        updateActivityStatusDictionary(activityModel.activity_identifier);
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
    
    var stageCompleted = false;
    
    for (var stageIndex = 0; stageIndex < userCourse.stages.length; stageIndex++) {
        var currentStage = userCourse.stages[stageIndex];
        if (currentStage.status == 0 && currentStage.sectionname != "General") {
            var totalChallengesByStage = currentStage.challenges.length;
            var totalChallengesCompleted = _.where(currentStage.challenges, {status: 1}).length;
            if (totalChallengesByStage == totalChallengesCompleted) {
                userCourse.stages[stageIndex].status = 1;
                _setLocalStorageJsonItem("usercourse", userCourse);
                stageCompleted = true;
            }
        }
    }
    return stageCompleted;
};

var _isChallengeCompleted = function () {
    var success = 0;
    var userCourse = JSON.parse(localStorage.getItem("usercourse"));
    var lastStageIndex = _.where(userCourse.stages, {status: 1}).length;
    var currentStage = userCourse.stages[lastStageIndex];

    for (var challengeIndex = 0; challengeIndex < currentStage.challenges.length; challengeIndex++) {
        var currentChallenge = currentStage.challenges[challengeIndex];
        if (currentChallenge.status == 0) {
            var totalActivitiesByChallenge = currentChallenge.activities.length;
            var totalActivitiesCompletedByChallenge = (_.where(currentChallenge.activities, {status: 1})).length;
            if (totalActivitiesByChallenge == totalActivitiesCompletedByChallenge) {

                //updateBadge
                _updateBadgeStatus(currentChallenge.coursemoduleid);
                userCourse.stages[lastStageIndex].challenges[challengeIndex].status = 1;
                _setLocalStorageJsonItem("usercourse", userCourse);
                var currentUser = JSON.parse(moodleFactory.Services.GetCacheObject("CurrentUser"));
                var currentUserId = currentUser.userId;
                var data = {userid: currentUserId};
                var currentActivityModuleId = currentChallenge.coursemoduleid;
                var activityIdentifier = _getActivityByCourseModuleId();                
                var activitymodel = {
                    activity_identifier: currentChallenge.activity_identifier
                };
                moodleFactory.Services.PutEndActivity(currentActivityModuleId, data, activitymodel, currentUser.token, successCallback, errorCallback);
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

function getMoodleIdFromTreeActivity(activityId){
    var moodleId;
    var activityFromTree = getActivityByActivity_identifier(activityId);
    activityFromTree.activities? moodleId = activityFromTree.activities[0].coursemoduleid : moodleId = activityFromTree.coursemoduleid;

    return moodleId;
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
                    updateActivityStatusDictionary(activity.activity_identifier);
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
    var activity = getActivityByActivity_identifier(activityIdentifier);

    extraPoints ? '' : extraPoints = 0;

    if (extraPoints != 0) {
        profile.stars = Number(profile.stars) + Number(extraPoints);
    } else {
        if (activityIdentifier == "2016") {
            profile.stars = Number(profile.stars) + Number(activity.activities[0].points) + Number(extraPoints);
        }
        else {
            profile.stars = Number(profile.stars) + Number(activity.points) + Number(extraPoints);
        }


    }
    console.log("Profile stars = " + profile.stars);

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



var _badgesPerChallenge = [
    {badgeId: 2, badgeName: "Combustible", challengeId: 113},
    {badgeId: 3, badgeName: "Turbina C0N0-CT", challengeId: 114},
    {badgeId: 4, badgeName: "Ala Ctu-3000", challengeId: 115},
    {badgeId: 5, badgeName: "Sistema de Navegación", challengeId: 68},
    {badgeId: 6, badgeName: "Propulsor", challengeId: 155},
    {badgeId: 7, badgeName: "Misiles", challengeId: 157},
    {badgeId: 8, badgeName: "Campo de fuerza", challengeId: 81},
    {badgeId: 9, badgeName: "Radar", challengeId: 167},
    {badgeId: 18, badgeName: "Turbo", challengeId: 160},
    {badgeId: 10, badgeName: "Tanque de oxígeno", challengeId: 206},
    {badgeId: 16, badgeName: "Casco espacial", challengeId: 208},
    {badgeId: 11, badgeName: "Sonda espacial", challengeId: 90},
    {badgeId: 17, badgeName: "Radio de comunicación", challengeId: 217}
];


var _activityRoutes = [
    {id: 1001, name: '', url: '/ZonaDeVuelo/ExploracionInicial/1001'},
    {id: 1101, name: '', url: '/ZonaDeVuelo/CuartoDeRecursos/FuenteDeEnergia/1101'},
    {id: 1049, name: '', url: '/ZonaDeVuelo/Conocete/ZonaDeContacto/1049'},
    {id: 1020, name: '', url: '/ZonaDeVuelo/Conocete/FuenteDeEnergia/1020'},
    {id: 1039, name: 'Reto Multiple', url: '/ZonaDeVuelo/Conocete/RetoMultiple/1039'},
    {id: 1010, name: '', url: '/ZonaDeVuelo/Conocete/PuntoDeEncuentro/Topicos/1010'},
    {id: 1021, name: '', url: '/ZonaDeVuelo/MisSuenos/FuenteDeEnergia/1021'},
    {id: 1006, name: '', url: '/ZonaDeVuelo/MisSuenos/MisGustos/1006'},
    {id: 1005, name: '', url: '/ZonaDeVuelo/MisSuenos/MisCualidades/1005'},
    {id: 1007, name: '', url: '/ZonaDeVuelo/MisSuenos/Suena/1007'},
    {id: 1008, name: '', url: '/ZonaDeVuelo/MisSuenos/PuntosDeEncuentro/Topicos/1008'},
    {id: 1002, name: '', url: '/ZonaDeVuelo/CabinaDeSoporte/1002'},
    {id: 1009, name: '', url: '/ZonaDeVuelo/ExploracionFinal/1009'},
    {id: 2001, name: '', url: '/ZonaDeNavegacion/ExploracionInicial/2001'},
    {id: 2004, name: '', url: '/ZonaDeNavegacion/CuartoDeRecursos/FuenteDeEnergia/2004'},
    {id: 2006, name: '', url: '/ZonaDeNavegacion/Transformate/FuenteDeEnergia/2006'},
    {id: 2007, name: '', url: '/ZonaDeNavegacion/Transformate/TusIdeas/2007'},
    {id: 2030, name: '', url: '/ZonaDeNavegacion/Transformate/PuntoDeEncuentro/Topicos/2030'},
    {id: 2011, name: '', url: '/ZonaDeNavegacion/TuEliges/FuenteDeEnergia/2011'},
    {id: 2012, name: '', url: '/ZonaDeNavegacion/TuEliges/2012'},
    {id: 2015, name: '', url: '/ZonaDeNavegacion/ProyectaTuVida/FuenteDeEnergia/2015'},
    {id: 2016, name: '', url: '/ZonaDeNavegacion/ProyectaTuVida/13y5/2016'},
    {id: 2017, name: '', url: '/ZonaDeNavegacion/ProyectaTuVida/MapaDeVida/2017'},
    {id: 2026, name: '', url: '/ZonaDeNavegacion/ProyectaTuVida/PuntoDeEncuentro/Topicos/2026'},
    {id: 2022, name: '', url: '/ZonaDeNavegacion/CabinaDeSoporte/2022'},
    {id: 2023, name: '', url: '/ZonaDeNavegacion/ExploracionFinal/2023'},
    {id: 3101, name: '', url: '/ZonaDeAterrizaje/ExploracionInicial/3101'},
    {id: 3201, name: '', url: '/ZonaDeAterrizaje/CuartoDeRecursos/FuenteDeEnergia/3201'},
    {id: 3301, name: '', url: '/ZonaDeAterrizaje/EducacionFinanciera/FuenteDeEnergia/3301'},
    {id: 3302, name: '', url: '/ZonaDeAterrizaje/EducacionFinanciera/MultiplicaTuDinero/3302'},
    {id: 3304, name: '', url: '/ZonaDeAterrizaje/EducacionFinanciera/PuntoDeEncuentro/Topicos/93'},
    {id: 3401, name: '', url: '/ZonaDeAterrizaje/MapaDelEmprendedor/FuenteDeEnergia/3401'},
    {id: 3402, name: '', url: '/ZonaDeAterrizaje/MapaDelEmprendedor/MapaDelEmprendedor/3402'},
    {id: 3404, name: '', url: '/ZonaDeAterrizaje/MapaDelEmprendedor/PuntoDeEncuentro/Topicos/91'},
    {id: 3501, name: '', url: '/ZonaDeAterrizaje/CabinaDeSoporte/3501'},
    {id: 3601, name: '', url: '/ZonaDeAterrizaje/ExploracionFinal/3601'},
    {id: 50000, name: 'Comunidad General', url: '/Community/50000'}
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
