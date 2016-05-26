//global variables and functions
//var API_RESOURCE = "http://definityincluso.cloudapp.net:82/testing/api/RestfulAPI/public/{0}" // Internal QA Development environment
 var API_RESOURCE = "http://definityincluso.cloudapp.net:82/restfulapiv1-2/RestfulAPI/public/{0}"; //Azure Development environment
var DRUPAL_API_RESOURCE = "http://definityincluso.cloudapp.net/incluso-drupal/rest/node/{0}"; //Azure Development environment
var DRUPAL_CONTENT_RESOURCE = "http://definityincluso.cloudapp.net/drupal_proxy/proxy.php";
var SIGNALR_API_RESOURCE = "http://signalrchat-incluso.azurewebsites.net/realtime/echo"; //Azure Development environment
//var API_RESOURCE = "http://moodlemysql01.cloudapp.net:801/Incluso-RestfulAPI/RestfulAPI/public/{0}"; //Pruebas de aceptacion Cliente
//var API_RESOURCE = "http://moodlemysql01.cloudapp.net/{0}"; //Azure production environment
//var DRUPAL_API_RESOURCE = "http://moodlemysql01.cloudapp.net:802/incluso-drupal/rest/node/{0}"; //Azure production environment

var _courseId = 4;
var _endActivityCurrentChallenge = null;
var _httpFactory = null;
var _timeout = null;
var _location = null;
var _catalogsLoaded = null;
var _isDeviceOnline = null;
var _queuePaused = false;
var _activityStatus = null;
var _tutorial = false;
var _isCellphone = false;

/* Prototypes */
window.mobilecheck = function() {
  return _isCellphone;
}

/* catalog keys from moodle */
var _catalogNames = ["sports",
    "arts",
    "hobbiescatalog",
    "talentscatalog",
    "valuescatalog",
    "habilitiescatalog",
    "relativeOrTutor",
    "activity",
    "studiesLevel",
    "studiesGrade",
    "periodOfStudies",
    "moneyInComecatalog",
    "medicalInsurancecatalog",
    "devices",
    "phoneActivity",
    "videogamesFrecuencycatalog",
    "videogamesHourscatalog",
    "kindOfVideogamescatalog",
    "educationStatus",
    "phoneType",
    "socialNetworkType",
    "kindOfCharacter",
    "relationship",
    "citiescatalog",
    "secretquestion",
    "country",
    "maritalStatus",
    "medicalCoverage",
    "children",
    "gotMoneyIncome",
    "playVideogames",
    "communityAccess",
    "citiesCatalog",
    "gender",
    "socialcatalog",
    "emprendedorcatalog",
    "metThisAppBy"
];

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
        dependsOn:[2001,2004,2006,2007,2030,2011,2012,2015,2016,2017,2026]
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
        dependsOn:[3101,3201,3301,3302,3304,3401,3402,3404]
    },
    {
        id:3601,
        dependsOn:[3101,3501]
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

var quizesArray = [150, 71, 70, 72, 100, 75, 159, 82, 86, 89, 96, 257, 57, 58, 59, 60, 61, 62, 105, 106, 255, 258, 170, 242, 243, 244, 245, 246, 211, 250, 251, 252, 253, 249];

var notificationTypes = {    
    activityNotifications: 1,
    generalNotifications: 2,
    profileNotifications: 3,
    progressNotifications: 4,
    globalProgressNotifications: 5,
    commentsNotifications: 6,
    likesNotifications: 7
};

var allServicesCallback = function () {
    _syncCallback();
};

/* save user id in cache */
var _setId = function (userId) {
    _setLocalStorageItem("userId", userId);

};

/* get data from cache */
var _getItem = function (key) {
    return localStorage.getItem(key);
};

/* save data in cache */
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

/* save json data in cache */
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

/* updates counter per discussion after posting in forums */
function updatePostCounter(discussionid) {
    var course = moodleFactory.Services.GetCacheJson("course");
    var forumData = moodleFactory.Services.GetCacheJson("postcounter/" + course.courseid);
    
    var discussionFound = false;

    for(var fd = 0; fd < forumData.forums.length; fd++) {
        
        var forum = forumData.forums[fd];
        var discussions = forum.discussion;
        
        for(var fdd = 0; fdd < discussions.length; fdd++) {
            
            var discussion = discussions[fdd];
            if (discussion.discussionid === discussionid) {
                
                if (forum.status == "1") {
                    forumData.totalExtraPoints++;
                }
                
                var newTotal = Number(discussion.total) + 1;
                discussion.total = newTotal.toString();
                discussionFound = true;
                break;
            }
        }
        
        if (discussionFound) {
            break;
        }
    }
    
    localStorage.setItem("postcounter/" + course.courseid, JSON.stringify(forumData));
}

//Update activity status for activity blocking binding
var updateActivityStatusDictionary = function (activityIdentifierId) {
    var activityStatus = moodleFactory.Services.GetCacheJson("activityStatus");
    if (activityStatus) {
        activityStatus[activityIdentifierId] = 1;
    }
    _setLocalStorageJsonItem("activityStatus", activityStatus);
    _activityStatus = activityStatus;
    _loadActivityBlockStatus();
};

/* ends an activity */
var _endActivity = function (activityModel, callback, pathCh) {

    //trigger activity type 2 is sent when the activity ends.
    var triggerActivity = 2;
    var currentUser = JSON.parse(moodleFactory.Services.GetCacheObject("CurrentUser"));
    var currentUserId = currentUser.userId;
    var activityId = activityModel.coursemoduleid;
    callback = callback || successCallback;
    //create notification
    _activityNotification(activityId, triggerActivity);
    if (activityModel.activityType == "Quiz") {
        _endActivityCurrentChallenge = pathCh;
        moodleFactory.Services.PutEndActivityQuizes(activityId, activityModel.answersResult, activityModel.usercourse, activityModel.token, callback, errorCallback);
    }
    else if (activityModel.activityType == "Assign") {
        var data = {userid: currentUserId};
        moodleFactory.Services.PutEndActivityQuizes(activityId, data, activityModel.usercourse, activityModel.token, callback, errorCallback);
    } else {
        var data = {userid: currentUserId};

        // update activity status dictionary used for blocking activity links
        updateActivityStatusDictionary(activityModel.activity_identifier);
        moodleFactory.Services.PutEndActivity(activityId, data, activityModel, currentUser.token, callback, errorCallback);
    }
};

/* callback from quiz request with status 200 */
var successQuizCallback = function () {
    var currentStage = localStorage.getItem("currentStage");

    if (_location) {
        _endActivityCurrentChallenge ? _location.path(_endActivityCurrentChallenge) : "";
    }
};

/* convert community access value to bool */
var _hasCommunityAccessLegacy = function(value) {
    return (value == "Enable" || value == "1");
};

//This function updates in localStorage the status of the stage when completed
var _updateStageStatus = function () {
    var userCourse = JSON.parse(localStorage.getItem("usercourse"));
    
    var stageCompleted = false;
    
    for (var stageIndex = 0; stageIndex < userCourse.stages.length; stageIndex++) {
        var currentStage = userCourse.stages[stageIndex];
        if (currentStage.status == 0 && currentStage.sectionname != "General") {
            var totalChallengesByStage = currentStage.challenges.length;
            var totalChallengesCompleted = _.where(currentStage.challenges, {status: 1}).length;
            if (totalChallengesByStage == totalChallengesCompleted) {
                userCourse.stages[stageIndex].status = 1;
                //Get current stage for update
                var stage = localStorage.getItem("currentStage");
                //Check if not is the last stage
                if(stageIndex+1 < userCourse.stages.length){
                    stage = stageIndex+1;
                    _setLocalStorageJsonItem("currentStage", stage);    
                }
                _setLocalStorageJsonItem("usercourse", userCourse);
                stageCompleted = true;
            }
        }
    }
    return stageCompleted;
};

//Returns TRUE only if the stage gets closed right here. If it was closed before or has activities pending, will return FALSE.
var _tryCloseStage = function(stageIndex){
    var userCourse = moodleFactory.Services.GetCacheJson("usercourse");
    if(!userCourse) return false;
    var stage = userCourse.stages[stageIndex];
    if(stage.status || stage.sectionname == "General") return false;
    var totalChallengesInStage = stage.challenges.length;
    var totalChallengesCompleted = _.where(stage.challenges, {status: 1}).length;
    if (totalChallengesInStage == totalChallengesCompleted) {
        userCourse.stages[stageIndex].status = 1;
        _setLocalStorageJsonItem("usercourse", userCourse);
        return true;
    }
    return false;
};

/* assigns an award after finishing the course */
var _tryAssignAward = function() {
  
  var userid = localStorage.getItem("userId");
  var user = JSON.parse(localStorage.getItem("Perfil/" + userid));
  
  // assign award
  if (!user.awards.title) {
      var awardData = {
          "award": true,
          "dataissued": moment().format("YYYY/MM/DD h:mm:ss")
      };
      moodleFactory.Services.PutAsyncAward(userid, awardData, function(){}, function(){});
      
      // update profile
      var awards = _getAwards();
      if (awards) {
        
        var stars = Number(user.stars);
        
        for (a = 0; a < awards.length; a++) {
          var award = awards[a];
          
          if (stars >= award.min_points_range && stars <= award.max_points_range) {
            user.awards.title = award.title;
            localStorage.setItem("Perfil/" + userid, JSON.stringify(user));
            break;
          }
        }
      }
  }
};

var _closeChallenge = function (stageId) {    
    var success = 0;
    var userCourse = JSON.parse(localStorage.getItem("usercourse"));    
    var stageIndex = stageId;
    var currentStage = userCourse.stages[stageIndex];

    for (var challengeIndex = 0; challengeIndex < currentStage.challenges.length; challengeIndex++) {
        var currentChallenge = currentStage.challenges[challengeIndex];
        if (currentChallenge.status == 0) {
            var totalActivitiesByChallenge = currentChallenge.activities.length;
            var totalActivitiesCompletedByChallenge = (_.where(currentChallenge.activities, {status: 1})).length;
            if (totalActivitiesByChallenge == totalActivitiesCompletedByChallenge) {
                //updateBadge
                _updateBadgeStatus(currentChallenge.coursemoduleid);
                userCourse.stages[stageIndex].challenges[challengeIndex].status = 1;
                _setLocalStorageJsonItem("usercourse", userCourse);
                var currentUser = JSON.parse(moodleFactory.Services.GetCacheObject("CurrentUser"));
                var currentUserId = currentUser.userId;
                var data = {userid: currentUserId};
                var currentActivityModuleId = currentChallenge.coursemoduleid;                
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
    };
    return success;
}


var _updateBadgeStatus = function (coursemoduleid) {      
    var profile = moodleFactory.Services.GetCacheJson("Perfil/" + moodleFactory.Services.GetCacheObject("userId"));
    var badges = profile.badges;
    var activity = _getActivityByCourseModuleId(coursemoduleid);
    if (activity) {
      var currentBadge = _.findWhere(_badgesPerChallenge, {activity_identifier: activity.activity_identifier});
      if (currentBadge) {
          for (var indexBadge = 0; indexBadge < badges.length; indexBadge++) {
              if (badges[indexBadge].id == currentBadge.badgeId) {
                  profile.badges[indexBadge].status = "won";
                  _setLocalStorageJsonItem("Perfil/" + moodleFactory.Services.GetCacheObject("userId"), profile);
              } else {
                  //This else statement is set to avoid errors on execution flows
              }
          }
      } else {
        //This else statement is set to avoid errors while debugging in firefox
      }
    }else{          
      //This else statement is set to avoid errors while debugging in firefox
    }    
};

var _updateRewardStatus = function () {

    var profile = JSON.parse(localStorage.getItem("Perfil/" + moodleFactory.Services.GetCacheObject("userId")));
    var totalRewards = profile.rewards;
    var profilePoints = profile.stars;

    for (var i = 0; i < totalRewards.length; i++) {
        var profileReward = profile.rewards[i];
        if (profileReward.status != "won" && profileReward.points_to_get_reward < profilePoints) {
            profile.rewards[i].status = "won";
            profile.rewards[i].dateIssued = new Date();
        }
    }
    localStorage.setItem("Perfil/" + moodleFactory.Services.GetCacheObject("userId"), JSON.stringify(profile));
}

var logStartActivityAction = function(activityId, timeStamp) {
    
    if( Number(activityId) == 50000 || activityId == 'null' || !activityId){
            return false;
    } else {

        var userCourse = JSON.parse(localStorage.getItem("usercourse"));
        var treeActivity = getActivityByActivity_identifier(activityId, userCourse);

        var currentUser = JSON.parse(localStorage.getItem("CurrentUser"));
        var data = {
            userid: currentUser.userId,
            datestarted: timeStamp,
            moduleid: treeActivity.coursemoduleid,
            updatetype: 0
        };

        treeActivity.started = 1;
        treeActivity.datestarted = data.datestarted;
        _setLocalStorageJsonItem('usercourse', userCourse);

        moodleFactory.Services.PutStartActivity(data, treeActivity, currentUser.token, function (size) {

            var triggerActivity = 1;
            _activityNotification(treeActivity.coursemoduleid, triggerActivity);

        }, function () {
            console.log('Error callback');
        });
    }
}


var _activityNotification = function (courseModuleId, triggerActivity) {

    currentUserId = localStorage.getItem("userId");

    var allNotifications = JSON.parse(localStorage.getItem("notifications"));

    var userCourse = JSON.parse(localStorage.getItem("usercourse"));
    
    var activity = _getActivityByCourseModuleId(courseModuleId, userCourse );
    
    if (activity && allNotifications) {
      //code
    
    for (var i = 0; i < allNotifications.length; i++) {
        var currentNotification = allNotifications[i];
          if (currentNotification.status == "pending" && currentNotification.trigger_condition == triggerActivity && currentNotification.activityidnumber == activity.activity_identifier) {
                          
            var wonDate = new Date();                        
            var dataModelNotification = {
              notificationid : String(currentNotification.id),
                userid: currentUserId,
              wondate : wonDate
            };
  
            allNotifications[i].wondate = wonDate;
            allNotifications[i].status = "won"
            localStorage.setItem("notifications",JSON.stringify(allNotifications));
            
            moodleFactory.Services.PostUserNotifications(dataModelNotification, function(){
            }, errorCallback, true);
              
        } else {
            
        }
    }
    }
};



function updateUserStarsUsingExternalActivity(activity_identifier) {
    var profile = JSON.parse(moodleFactory.Services.GetCacheObject("Perfil/" + moodleFactory.Services.GetCacheObject("userId")));
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
    
    var userStars = JSON.parse(localStorage.getItem("userStars"));
                                          
    var localStorageStarsData = {
        dateissued: moment(Date.now()).unix(),
        instance: data.instance,
        instance_type: data.instanceType,
        message: "",
        is_extra: false,
        points: data.stars,
        userid: parseInt(data.userId)
    };
    
    userStars.push(localStorageStarsData);
    
    localStorage.setItem("userStars", JSON.stringify(userStars));
    
    moodleFactory.Services.PutStars(data, profile, currentUser.token, successPutStarsCallback, errorCallback);
        }


var _progressNotification = function(){
    
    var currentUser = JSON.parse(localStorage.getItem("CurrentUser"));
    
    var notifications = JSON.parse(localStorage.getItem("notifications"));
    
    var userCourse = JSON.parse(localStorage.getItem("usercourse"));
    
    var profile = JSON.parse(localStorage.getItem("Perfil/" + currentUser.id))
    
    if(profile && notifications){
      
        for(i = 0; i < notifications.length; i++){
            var currentNotification = notifications[i];
          
             //{rangeId : 1, progressMin: 0, progressMax:0},
            if (currentNotification.type == notificationTypes.globalProgressNotifications && currentNotification.globalprogress) {
                 
                var notificationRanges = _.findWhere(_globalProgressRanges, {rangeId: currentNotification.globalprogress} );
                var notificationRegistrerDate = new Date(currentNotification.registerdate * 1000);
                var notificationLastAccessDate = currentNotification.lastaccessdate ? new Date(currentNotification.lastaccessdate * 1000) : null;
                var userRegisterDate = new Date(profile.timeCreated * 1000);
                var userLastAccessDate  = new Date(profile.lastAccess * 1000);
            
                if (currentNotification.status != "won" && 
                        ((notificationRanges.progressMax == 0 && currentNotification.registerdate == moment(userRegisterDate).format('DD-MM-YYYY')) || 
                            (moment(notificationRegistrerDate).format('DD-MM-YYYY') == moment(userRegisterDate).format('DD-MM-YYYY') &&
                                moment(notificationLastAccessDate).format('DD-MM-YYYY') == moment(userLastAccessDate).format('DD-MM-YYYY') && 
                                userCourse.globalProgress > notificationRanges.progressMin && userCourse.globalProgress <= notificationRanges.progressMax))) {
              
                    var wonDate = new Date();
                    var dataModelNotification = {
                      notificationid : String(currentNotification.id),
                      userid: currentUser.id,
                      wondate : wonDate
                    };
                    
                    notifications[i].wondate = wonDate;
                    notifications[i].status = "won";
                    localStorage.setItem("notifications", JSON.stringify(notifications));
          
                    moodleFactory.Services.PostUserNotifications(dataModelNotification, function(){
                    }, errorCallback, true);
                    
                }
            }  
        }
    }
}

var successPutStarsCallback = function (data) {
    _updateRewardStatus();
};

/* function to prevent broken code when calling a service */
var successCallback = function (data) {
};

/* function to prevent broken code when calling a service */
var errorCallback = function (data) {
};

function getActivityByActivity_identifier(activity_identifier, usercourse) {
    console.log("GetActivityByActivityIDentifier");
    var matchingActivity = null;
    var breakAll = false;
    var userCourse = usercourse || JSON.parse(localStorage.getItem("usercourse"));
    
    if (activity_identifier == "50000") {
        matchingActivity = userCourse.community;
    }else {
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
    }
    
    return matchingActivity;
}

function getActivityQuizModuleId(activity_identifier) {
    var breakAll = false;
    var courseModuleId = null;
    var userCourse = JSON.parse(localStorage.getItem("usercourse"));
    
    for (var stageIndex = 0; stageIndex < userCourse.stages.length; stageIndex++) {
        var stage = userCourse.stages[stageIndex];
        
        for (var challengeIndex = 0; challengeIndex < stage.challenges.length; challengeIndex++) {
            var challenge = stage.challenges[challengeIndex];
            
            for (var activityIndex = 0; activityIndex < challenge.activities.length; activityIndex++) {
                var activity = challenge.activities[activityIndex];
                
                if (parseInt(activity.activity_identifier) === parseInt(activity_identifier)) {
                    courseModuleId = activity.coursemoduleid;
                    breakAll = true;
                    break;
                }
                
                if(activity.activities != null) {
                    
                    for(var subactivityIndex = 0; subactivityIndex < activity.activities.length; subactivityIndex++) {
                        var subactivity = activity.activities[subactivityIndex];
                        
                        if (parseInt(subactivity.activity_identifier) === parseInt(activity_identifier)) {
                            courseModuleId = subactivity.coursemoduleid;
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
    
    return courseModuleId;
}

function getChallengeByActivity_identifier(activity_identifier, usercourse) {
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
                    matchingChallengeIndex = challengeIndex;
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
    return matchingChallengeIndex;
}

function _getActivityByCourseModuleId(coursemoduleid, usercourse) {
    var matchingActivity = null;
    var breakAll = false;
    var userCourse = usercourse || JSON.parse(localStorage.getItem("usercourse"));
    for (var stageIndex = 0; stageIndex < userCourse.stages.length; stageIndex++) {
        var stage = userCourse.stages[stageIndex];
        for (var challengeIndex = 0; challengeIndex < stage.challenges.length; challengeIndex++) {
            var challenge = stage.challenges[challengeIndex];
            //Return challenge when courseModuleId match a challenge.
            if (challenge.coursemoduleid == coursemoduleid) {
              return challenge;
            }            
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
    activityFromTree.activities ? moodleId = activityFromTree.activities[0].coursemoduleid : moodleId = activityFromTree.coursemoduleid;

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
                            subactivity.last_status_update = moment(Date.now()).unix();
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
                    activity.last_status_update = moment(Date.now()).unix();
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

function updateMultipleSubActivityStatuses(parentActivity, subactivitiesCourseModuleId, firstActivityLock, isComplete) {
    firstActivityLock = (firstActivityLock === undefined ? true : firstActivityLock);
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
                    if (activity.status == 1 && firstActivityLock) {
                        breakAll = true;
                        break;
                    } else if(activity.activities.length  == subactivitiesCourseModuleId.length || !firstActivityLock || isComplete) {
                        activity.status = 1;
                        activity.last_status_update = moment(Date.now()).unix();
                    }
                    for (var subactivityIndex = 0; subactivityIndex < activity.activities.length; subactivityIndex++) {
                        var subactivity = activity.activities[subactivityIndex];
                        for (var subactivityCourseModuleId = 0; subactivityCourseModuleId < subactivitiesCourseModuleId.length; subactivityCourseModuleId++) {
                            if (subactivity.coursemoduleid == subactivitiesCourseModuleId[subactivityCourseModuleId] && subactivity.status == 0) {
                                subactivity.status = 1;
                                subactivity.last_status_update = moment(Date.now()).unix();
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

function updateMultipleSubactivityStars(parentActivity, subactivitiesCourseModuleId, firstActivityLock) {
    var profile = JSON.parse(moodleFactory.Services.GetCacheObject("Perfil/" + moodleFactory.Services.GetCacheObject("userId")));
    var currentUser = JSON.parse(moodleFactory.Services.GetCacheObject("CurrentUser"));
    var stars = 0;
    for (var i = 0; i < parentActivity.activities.length; i++) {
        for (var j = 0; j < subactivitiesCourseModuleId.length; j++) {
            if (parentActivity.activities[i].coursemoduleid == subactivitiesCourseModuleId[j] && parentActivity.activities[i].status == 0) {
                stars += parentActivity.activities[i].points;
            }
        }
    }
    stars += (subactivitiesCourseModuleId.length == parentActivity.activities.length || !firstActivityLock ? parentActivity.points : 0);
    profile.stars = parseInt(profile.stars) + stars;
    currentUser.stars = profile.stars;
    if (stars > 0) {
        var data = {
            userId: profile.id,
            stars: stars,
            instance: parentActivity.coursemoduleid,
            instanceType: 0,
            date: getdate()
        };
        
        var userStars = JSON.parse(localStorage.getItem("userStars"));
 
        var localStorageStarsData = {
             dateissued: moment(Date.now()).unix(),
             instance: data.instance,
             instance_type: data.instanceType,
             message: "",
             is_extra: false,
             points: data.stars,
             userid: parseInt(data.userId)
        };
 
        userStars.push(localStorageStarsData);
 
        localStorage.setItem("userStars", JSON.stringify(userStars));    
        
        moodleFactory.Services.PutStars(data, profile, currentUser.token, function(){
          
          
                   
          
          }, function(){});
        _setLocalStorageJsonItem("Perfil/" + moodleFactory.Services.GetCacheObject("userId"), profile)
        _setLocalStorageJsonItem("CurrentUser", currentUser)
        
        
        
        
    }
}

/* gets total points from forum */
var getForumExtraPointsCounter = function(discussionIds) {
    
    var course = moodleFactory.Services.GetCacheJson("course");
    var forumData = moodleFactory.Services.GetCacheJson("postcounter/" + course.courseid);
    
    var tempDiscussionIds = [];
    var tempDiscussions = {"status": 0, "discussions": []};
    for(var f = 0; f < forumData.forums.length; f++) {
        
        var forum = forumData.forums[f];
        var discussions = forum.discussion;
        tempDiscussions.status = forum.status;
        
        for(var d = 0; d < discussions.length; d++) {
            tempDiscussionIds.push(discussions[d].discussionid);
            
            tempDiscussions.discussions.push(discussions[d]);
        }
        
        var diff = _.difference(discussionIds,tempDiscussionIds);
        if (diff.length === 0) {
            break;
        }else {
            tempDiscussionIds = [];
            tempDiscussions.discussions = [];
        }
    }

    return tempDiscussions;
};

function updateUserStars(activityIdentifier, extraPoints) {
    var profile = JSON.parse(moodleFactory.Services.GetCacheObject("Perfil/" + moodleFactory.Services.GetCacheObject("userId")));
    var currentUser = JSON.parse(moodleFactory.Services.GetCacheObject("CurrentUser"));
    var activity = getActivityByActivity_identifier(activityIdentifier);

    extraPoints ? '' : extraPoints = 0;

    var stars = 0;
    if (extraPoints != 0) {
        profile.stars = Number(profile.stars) + Number(extraPoints);
        stars = extraPoints;
    } else {
            profile.stars = Number(profile.stars) + Number(activity.points);
            stars = activity.points;
        }

    console.log("Profile stars = " + profile.stars);
    console.log("Forum stars to assign: " + stars);

    var data = {
        userId: profile.id,
        stars: stars,
        instance: activity.coursemoduleid,
        instanceType: 0,
        date: getdate()
    };

    var userStars = JSON.parse(localStorage.getItem("userStars"));
                        
    var localStorageStarsData = {
          dateissued : getdate(),
          instance : data.instance,
          instance_type: data.instanceType,
          message: "",
          is_extra: false,
          points: data.stars,
          userid: parseInt(data.userId)
    };
                        
    userStars.push(localStorageStarsData);
                        
    localStorage.setItem("userStars", JSON.stringify(userStars));

    moodleFactory.Services.PutStars(data, profile, currentUser.token, successPutStarsCallback, errorCallback);
}

function updateUserForumStars(activityIdentifier, points, isExtra, callback) {
    var profile = JSON.parse(moodleFactory.Services.GetCacheObject("Perfil/" + moodleFactory.Services.GetCacheObject("userId")));
    var currentUser = JSON.parse(moodleFactory.Services.GetCacheObject("CurrentUser"));
    var activity = getActivityByActivity_identifier(activityIdentifier);
    
    profile.stars = Number(profile.stars) + Number(points);

    var data = {
        userId: profile.id,
        stars: points,
        instance: activity.coursemoduleid,
        instanceType: 0,
        date: getdate(),
        is_extra: isExtra
    };

      var userStars = JSON.parse(localStorage.getItem("userStars"));

      var localStorageStarsData = {
             dateissued: moment(Date.now()).unix(),
             instance: data.instance,
             instance_type: data.instanceType,
             message: "",
             is_extra: isExtra,
             points: data.stars,
             userid: parseInt(data.userId)
    };

        userStars.push(localStorageStarsData);
 
        localStorage.setItem("userStars", JSON.stringify(userStars)); 
        
    moodleFactory.Services.PutStars(data, profile, currentUser.token, callback, errorCallback);
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

/* returns current date in a specific format */
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

var logout = function ($scope, $location) {
    $scope.currentUser = JSON.parse(moodleFactory.Services.GetCacheObject("CurrentUser"));

    _forceUpdateConnectionStatus(function(){
      
      if (_isDeviceOnline) {

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
                if ($scope.currentUser && $scope.currentUser.token) {
                    var objectToken = {
                        moodleAPI: API_RESOURCE.format(''),
                        moodleToken: $scope.currentUser.token
                    };

                    cordova.exec(function () {}, function () {},"CallToAndroid", "logout", [objectToken]);
            }
            }
        );
    }
    
    }, function(){});

   clearLocalStorage($location);
};


var fillProfilePoints = function(pointsToAdd, activityType){
    var profilePoints = JSON.parse(localStorage.getItem("profilePoints"));
    var profileCatalogs = JSON.parse(localStorage.getItem("profileCatalogs"));
    
    //set profilePoints for the first time
    if (!profilePoints) {
      profilePoints = profileCatalogs.profiles;
      for(var i= 0; i < profilePoints.length; i++){
          profilePoints[i].points = 0;
      }
    }
    
    for(var i = 0; i < pointsToAdd.length; i++){
          var profileIdToAdd = pointsToAdd[i].profileId;
          var points = pointsToAdd[i].points;
          for(var j = 0; j < profilePoints.length; j++){
              if (profilePoints[j].id == profileIdToAdd) {
                profilePoints[j].points += points;
              }
          }
    }
    localStorage.setItem("profilePoints",JSON.stringify(profilePoints));
}



var getProfileCatalogs = function(){
    
    var currentUser = JSON.parse(localStorage.getItem("CurrentUser"));
    if (currentUser) {
      moodleFactory.Services.GetProfileCatalogs(currentUser.token, function(data){},function(data){},true);    
    }
};





var clearLocalStorage = function(location){
  
  ClearLocalStorage("answersQuiz/");
    ClearLocalStorage("otherAnswerQuiz/");
    ClearLocalStorage("activityObject/");
    ClearLocalStorage("owlIndex");
    ClearLocalStorage("activity");

    localStorage.removeItem("CurrentUser");    
    localStorage.removeItem("course");
    localStorage.removeItem("stage");
    localStorage.removeItem("usercourse");
    localStorage.removeItem("currentStage");
    localStorage.removeItem("notifications");    
    localStorage.removeItem("leaderboard");
    localStorage.removeItem("activityStatus");
    localStorage.removeItem("userId");
    localStorage.removeItem("avatarInfo");
    localStorage.removeItem("chatAmountRead");
    localStorage.removeItem("challengeMessageId");
    localStorage.removeItem("userCurrentStage");
    localStorage.removeItem("halloffame");
    localStorage.removeItem("citiescatalog");
    localStorage.removeItem("tuEligesActivities");
    localStorage.removeItem("reply");    
    localStorage.removeItem("mapaDeVidaActivities");
    localStorage.removeItem("starsToAssignedAfterFinishActivity");
    localStorage.removeItem("userStars");
    localStorage.removeItem("likesByUser");    
    localStorage.removeItem("retoMultiplePartials");
    localStorage.removeItem("retoMultipleCompleted");
    
    ClearLocalStorage("termsAndConditions");
    ClearLocalStorage("activity");
    ClearLocalStorage("drupal"); //If content must be refreshed every time user log in - TODO: Is better to not delete this info and create a process to uptated? 
    ClearLocalStorage("forum");
    ClearLocalStorage("discussion");
    ClearLocalStorage("activitiesCache");
    ClearLocalStorage("activityAnswers");
    ClearLocalStorage("album");    
    ClearLocalStorage("profile");
    ClearLocalStorage("Perfil/");
    ClearLocalStorage("originalProfile/");
    ClearLocalStorage("UserTalents");
    ClearLocalStorage("postcounter");
    ClearLocalStorage("currentDiscussionIds");
    
    if (location) {
        location.path('/');
    }

}




function ClearLocalStorage(startsWith) {
    var myLength = startsWith.length;

    Object.keys(localStorage).forEach(function (key) {
        if (key.substring(0, myLength) == startsWith) {
            localStorage.removeItem(key);
        }
    });
}

/* play video from dashboard */
playVideo = function (videoAddress, videoName) {
    if (window.mobilecheck()) {
        cordova.exec(function(){}, function(){}, "CallToAndroid", "PlayLocalVideo", [videoAddress, videoName]);
    }
};

var _badgesPerChallenge = [
    {badgeId: 2, badgeName: "Combustible", challengeId: 113, activity_identifier : "1100"},
    {badgeId: 3, badgeName: "Turbina C0N0-CT", challengeId: 114, activity_identifier : "1200"},
    {badgeId: 4, badgeName: "Ala Ctu-3000", challengeId: 115, activity_identifier : "1300"},
    {badgeId: 5, badgeName: "Sistema de Navegación", challengeId: 116, activity_identifier : "1002"},
    {badgeId: 6, badgeName: "Propulsor", challengeId: 155, activity_identifier : "2003"},
    {badgeId: 7, badgeName: "Misiles", challengeId: 157, activity_identifier : "2005"},
    {badgeId: 8, badgeName: "Campo de fuerza", challengeId: 160, activity_identifier : "2010"},
    {badgeId: 9, badgeName: "Radar", challengeId: 167, activity_identifier : "2020"},
    {badgeId: 18, badgeName: "Turbo", challengeId: 81, activity_identifier : "2014"},
    {badgeId: 10, badgeName: "Tanque de oxígeno", challengeId: 206, activity_identifier : "3200"},
    {badgeId: 16, badgeName: "Casco espacial", challengeId: 208, activity_identifier : "3300"},
    {badgeId: 11, badgeName: "Sonda espacial", challengeId: 90, activity_identifier : "3400"},
    {badgeId: 17, badgeName: "Radio de comunicación", challengeId: 217, activity_identifier : "3500"}
];


var _globalProgressRanges = [
    {rangeId : 1, progressMin: 0, progressMax:0},
    {rangeId : 2, progressMin: 0, progressMax:5},
    {rangeId : 3, progressMin: 5, progressMax:10},
    {rangeId : 4, progressMin: 10, progressMax:15},
    {rangeId : 5, progressMin: 15, progressMax:20},
    {rangeId : 6, progressMin: 20, progressMax:25},
    {rangeId : 7, progressMin: 25, progressMax:30},
    {rangeId : 8, progressMin: 30, progressMax:35},
    {rangeId : 9, progressMin: 35, progressMax:40},
    {rangeId : 10, progressMin: 40, progressMax:45},
    {rangeId : 11, progressMin: 45, progressMax:50},
    {rangeId : 12, progressMin: 50, progressMax:55},
    {rangeId : 13, progressMin: 55, progressMax:60},
    {rangeId : 14, progressMin: 60, progressMax:65},
    {rangeId : 15, progressMin: 65, progressMax:70},
    {rangeId : 16, progressMin: 70, progressMax:75},
    {rangeId : 17, progressMin: 75, progressMax:80},
    {rangeId : 18, progressMin: 80, progressMax:85},
    {rangeId : 19, progressMin: 85, progressMax:90},
    {rangeId : 20, progressMin: 90, progressMax:95},
    {rangeId : 21, progressMin: 95, progressMax:100}
];

//This array is a dictionary of activities and their route in the application
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
    {id: 1002, name: '', url: '/ZonaDeVuelo/Retroalimentacion'},
    {id: 1009, name: '', url: '/ZonaDeVuelo/ExploracionFinal/1009'},
    {id: 2001, name: '', url: '/ZonaDeNavegacion/ExploracionInicial/2001'},
    {id: 2004, name: '', url: '/ZonaDeNavegacion/CuartoDeRecursos/FuenteDeEnergia/2004'},
    {id: 2006, name: '', url: '/ZonaDeNavegacion/Transformate/FuenteDeEnergia/2006'},
    {id: 2007, name: '', url: '/ZonaDeNavegacion/Transformate/TusIdeas/2007'},
    {id: 2030, name: '', url: '/ZonaDeNavegacion/Transformate/PuntoDeEncuentro/Topicos/2030'},
    {id: 2011, name: '', url: '/ZonaDeNavegacion/TuEliges/FuenteDeEnergia/2011'},
    {id: 2012, name: '', url: '/ZonaDeNavegacion/TuEliges/TuEliges/2012'},
    {id: 2015, name: '', url: '/ZonaDeNavegacion/ProyectaTuVida/FuenteDeEnergia/2015'},
    {id: 2016, name: '', url: '/ZonaDeNavegacion/ProyectaTuVida/13y5/2016'},
    {id: 2017, name: '', url: '/ZonaDeNavegacion/ProyectaTuVida/MapaDeVida/2017'},
    {id: 2026, name: '', url: '/ZonaDeNavegacion/ProyectaTuVida/PuntoDeEncuentro/Topicos/2026'},
    {id: 2022, name: '', url: '/ZonaDeNavegacion/Retroalimentacion/2022'},
    {id: 2023, name: '', url: '/ZonaDeNavegacion/ExploracionFinal/2023'},
    {id: 3101, name: '', url: '/ZonaDeAterrizaje/ExploracionInicial/3101'},
    {id: 3201, name: '', url: '/ZonaDeAterrizaje/CuartoDeRecursos/FuenteDeEnergia/3201'},
    {id: 3301, name: '', url: '/ZonaDeAterrizaje/EducacionFinanciera/FuenteDeEnergia/3301'},
    {id: 3302, name: '', url: '/ZonaDeAterrizaje/EducacionFinanciera/MultiplicaTuDinero/3302'},
    {id: 3304, name: '', url: '/ZonaDeAterrizaje/EducacionFinanciera/PuntoDeEncuentro/Topicos/3304'},
    {id: 3401, name: '', url: '/ZonaDeAterrizaje/MapaDelEmprendedor/FuenteDeEnergia/3401'},
    {id: 3402, name: '', url: '/ZonaDeAterrizaje/MapaDelEmprendedor/MapaDelEmprendedor/3402'},
    {id: 3404, name: '', url: '/ZonaDeAterrizaje/MapaDelEmprendedor/PuntoDeEncuentro/Topicos/3404'},
    {id: 3601, name: '', url: '/ZonaDeAterrizaje/ExploracionFinal/3601'},
    {id: 50000, name: 'Comunidad General', url: '/Community/50000'}
    //{ id: 0, url: ''}  // TODO: Fill remaining
];

//This OBJECT is loaded with a flag indicating whether the link to an activity should be enabled or disabled. Each property is named with the activity ID.
var _activityBlocked = [];

//This array contains all activity IDs that will be used for navigation
var _activityRouteIds = [
    1001,
    1101,
    1049,
    1020,
    1039,
    1010,
    1021,
    1006,
    1005,
    1007,
    1008,
    1002,
    1009,
    2001,
    2004,
    2006,
    2007,
    2030,
    2011,
    2012,
    2015,
    2016,
    2017,
    2026,
    2022,
    2023,
    3101,
    3201,
    3301,
    3302,
    3304,
    3401,
    3402,
    3404,
    3501,
    3601
];

var _loadActivityBlockStatus = function () {
    if(!_activityBlocked) _activityBlocked = {};
    var activityCount = _activityRouteIds.length;
    for(var i = 0; i < activityCount; i++ ) {
        _activityBlocked[_activityRouteIds[i]] ={
            disabled:!_canStartActivity(_activityRouteIds[i])
        };
    }
    _setLocalStorageJsonItem("activityblocked",_activityBlocked);
};

//Helps defining if activity can be started
var _canStartActivity = function(activityIdentifier){

    //If activity tree has not been loaded, return false.
    var userCourse = moodleFactory.Services.GetCacheJson("usercourse");
    if(!userCourse ) {
        return false;
    }
    //Load activity
    var activity = getActivityByActivity_identifier(activityIdentifier);
    if(!activity) return false;
    //Load activity status dictionary from local cache
    if(!_activityStatus) {
        _activityStatus = moodleFactory.Services.GetCacheJson("activityStatus");
    }
    //Return TRUE if no activity status in cache or activity has been completed already
    if(!_activityStatus || _activityStatus[activity.activity_identifier] || _activityStatus[activity.coursemoduleid]){
        return true;
    }
    //Load dependencies for activity, from current activity_identifier-based collection and legacy coursemoduleid-based collection
    var activityDependenciesRecord = _.filter(_activityDependencies, function (x) {
        return x.id == activity.activity_identifier;
    });
    var legacyActivityDependenciesRecord = _.filter(_activityDependenciesLegacy, function (x) {
        return x.id == activity.activity_identifier;
    });
    //Check status for found dependencies. If any dependency is still pending, the activity cannot be started
    if (activityDependenciesRecord[0]) {
        var activityDependencies = activityDependenciesRecord[0].dependsOn;
        var activityDependenciesLegacy = legacyActivityDependenciesRecord[0]?legacyActivityDependenciesRecord[0].dependsOn:activityDependencies;//if not in legacy dependencies, then just use the current definition, will take care of itself in the evaluation
        var dependenciesCount = activityDependencies.length;
        for (var i = 0; i < dependenciesCount; i++) {
            if (!(_activityStatus[activityDependencies[i]] || _activityStatus[activityDependenciesLegacy[i]]))  {
                return false;
            }
        }
    }
    //No dependencies found or all have been completed, the activity can be started
    return true;
};

/* encodes html characters before saving post */
function removeHtmlTag(value) {
    value = value.replace(/</g, '&lt;');
    value = value.replace(/>/g, '&gt;');
    return value;
}

/* decodes html characters before returning to forum page */
function restoreHtmlTag(value) {
    value = value.replace(/&lt;/g, "<");
    value = value.replace(/&gt;/g, ">");
    return value;
}

document.addEventListener("deviceready", onDeviceReady, false);

function onDeviceReady() {
    // Register the event listener
    document.addEventListener("backbutton", function(){}, false);
}

/* Validates device version, update version if necessary */
var _getDeviceVersionAsync = function() {
    
    var deviceVersion = JSON.parse(localStorage.getItem("device-version"));
    
    if (deviceVersion != null) {
        var currentDate = new Date();
        var difTimeStamp = currentDate.getTime() - deviceVersion.lastTimeUpdated
        
        /* 60 minutes */
        if ((difTimeStamp / 60000) >= 60) {
            _updateDeviceVersionCache();
        }
    }else {
        _updateDeviceVersionCache();
    }
};

/* Compares remote version against local version */
var _compareSyncDeviceVersions = function() {
    var sync = false;
    
    if (localStorage.getItem("device-version") != null) {
        var deviceVersion = JSON.parse(localStorage.getItem("device-version"));
        
        var localVSplit = deviceVersion.localVersion.split("."),
            remoteVSplit = deviceVersion.remoteVersion.split(".");
            
        sync = Number(localVSplit[0]) >= Number(remoteVSplit[0]) &&
               Number(localVSplit[1]) >= Number(remoteVSplit[1]) &&
               Number(localVSplit[2]) >= Number(remoteVSplit[2]);
    }else {
        sync = true;
    }
    
    return sync;
};


var FLAG_DEVICE_VERSION_RUNNING = false;

function _updateDeviceVersionCache () {
    var currentDate = new Date();
    
    var deviceVersion = {
        lastTimeUpdated: currentDate.getTime(),
        localVersion: "0.0.0",
        remoteVersion: "0.0.0"
    };

    if (localStorage.getItem("device-version") != null) {
        deviceVersion = JSON.parse(localStorage.getItem("device-version"));
        deviceVersion.lastTimeUpdated = currentDate.getTime();
    }
    
    if (window.mobilecheck()) {
        if (!FLAG_DEVICE_VERSION_RUNNING) {
            FLAG_DEVICE_VERSION_RUNNING = true;
            //ejecutando device-version
            cordova.exec(function(data) {
                deviceVersion.localVersion = data.currentVersion;
                deviceVersion.remoteVersion = data.latestVersion;
                localStorage.setItem("device-version", JSON.stringify(deviceVersion));
                FLAG_DEVICE_VERSION_RUNNING = false;
            }, function() { console.log("fail"); FLAG_DEVICE_VERSION_RUNNING = false }, "CallToAndroid", "getversion", []);
        }
    }
}

function _forceUpdateConnectionStatus(callback, errorIsOnlineCallback) {

    if(window.mobilecheck()){
        cordova.exec(function(data) {
            _isDeviceOnline = data.online;

            callback();
        }, function() { errorIsOnlineCallback();}, "CallToAndroid", "isonline", []);
    }
    else{
        _isDeviceOnline = true;
        callback();
    }
}

/* gets catalog values by key from moodle */
var _getCatalogValuesBy = function (catalogName) {
    
    var catalogs = moodleFactory.Services.GetCacheJson("catalogs");
    
    if (catalogs) {
        var catalog = _.filter(catalogs, function(c) { return c.type === "catalogs" && c.catalog === catalogName; });
        return (catalog != null && catalog[0].values.length) > 0 ? catalog[0].values : [];
    }else{
        return [];
    }
};

/* gets awards data */
var _getAwards = function () {
    
    var catalogs = moodleFactory.Services.GetCacheJson("catalogs");
    
    if (catalogs) {
        var awards = _.filter(catalogs, function(c) { return c.type === "award" });
        return (awards != null && awards[0].values.length) > 0 ? awards[0].values : null;
    }else{
        return null;
    }
};

var _updateConnectionStatus = function(sucessIsOnlineCallback, errorIsOnlineCallback) {
    _forceUpdateConnectionStatus(sucessIsOnlineCallback, errorIsOnlineCallback);
};


/* params:
   images - array of objects { path, name, downloadLink }
*/
function saveLocalImages(images) {
    
    _forceUpdateConnectionStatus(function() {
        
        if(window.mobilecheck()) {
        
            if(images.length > 0) {
                cordova.exec(function() {}, function(){}, "CallToAndroid", "downloadPictures", [JSON.stringify(images)]);
            }
        }
        
    }, function() {});
    
}

function getImageOrDefault(localPath, imageUrl, getImageOrDefaultCallback) {
    
    if(window.mobilecheck()) {
        cordova.exec(function(data) {
            if(data.exists) {
                getImageOrDefaultCallback(localPath);
            } else {
                getImageOrDefaultCallback("assets/avatar/default.png");
            }

        }, function(){}, "CallToAndroid", "fileExists", [localPath]);
    } else {
        getImageOrDefaultCallback(imageUrl);
    }
}

function encodeImageWithUri(imageUri, datatype, callback) {
    var c = document.createElement('canvas');
    var ctx = c.getContext("2d");
    var img = new Image();
    img.onload = function () {
        c.width = this.width;
        c.height = this.height;
        ctx.drawImage(img, 0, 0);

        if (typeof callback === 'function') {
            var dataURL = c.toDataURL(datatype);
            callback(dataURL.slice(22, dataURL.length));
        }
    };
    img.src = imageUri;
}

function getcurrentVersion() {  
    var deviceVersion = JSON.parse(localStorage.getItem("device-version"));
    var localVersion = "V-TEST";
    if (deviceVersion && deviceVersion.localVersion) {
      localVersion = deviceVersion.localVersion;
    }
    return localVersion;
}


var progressBar = {
    set: function (val) {
        var bar = $(".app-preloader .incluso");
        val = val < 0 ?  0 : val > 100 ? 100 : val;

        var labelWidth = parseInt(bar.find(".label-progress span:first-child").text(), 10);

        if (val == 0) {//This is for being able to reset the style of the bar.
            bar.find(".fill-bar").width(val + "%");
            bar.find(".label-progress span:first-child").text(val);
        }

        if (val > labelWidth) {//Update percentage
            bar.find(".fill-bar").width(val + "%");
            bar.find(".label-progress span:first-child").text(val);
        }
    }
};

/* Waits until page is loaded */
$(document).ready(function(){
    setTimeout(function() {
    _updateDeviceVersionCache();

    (function() {
        /* Load catalogs */
        var requestData = {"catalog": _catalogNames};
        moodleFactory.Services.GetAsyncCatalogs(requestData, function(key, data) { _catalogsLoaded = true; }, function(){ _catalogsLoaded = false; }, true);
    })();
    
    }, 2000);
});
