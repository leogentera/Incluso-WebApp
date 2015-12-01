//global variables

var API_RESOURCE = "http://definityincluso.cloudapp.net:82/restfulapiv2-2/RestfulAPI/public/{0}"; //Azure Development environment
//var API_RESOURCE = "http://moodlemysql01.cloudapp.net:801/Incluso-RestfulAPI/RestfulAPI/public/{0}"; //Pruebas de aceptacion Cliente
var DRUPAL_API_RESOURCE = "http://definityincluso.cloudapp.net/incluso-drupal/rest/node/{0}"; //Azure Development environment
//var API_RESOURCE = "http://incluso.definityfirst.com/v1-2/RestfulAPI/public/{0}";          // Nora
//var API_RESOURCE = "http://definityincluso.cloudapp.net:82/restfulapiv2-0/RestfulAPI/public/{0}";
//var API_RESOURCE = "http://definityincluso.cloudapp.net:82/restfulapiv2-0/RestfulAPI/public/{0}";
//var API_RESOURCE = "http://apidevelopment.azurewebsites.net/RestfulAPI/public/{0}";     // Definity Azure
//var API_RESOURCE = "http://moodlemysql01.cloudapp.net/{0}"; // Production


var _courseId = 4;
var _endActivityCurrentChallenge = null;
var _httpFactory = null;
var _timeout = null;
var _location = null;
var _catalogsLoaded = null;

/* Prototypes */
window.mobilecheck = function() {
  var check = false;
  (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)))check = true})(navigator.userAgent||navigator.vendor||window.opera);
  return check;
}

var _isDeviceOnline = null;
var _queuePaused = false;

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
    "gender"
];


var _activityStatus = null;

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

var _IsOffline = function () {
    return false;
};

var notificationTypes = {    
    activityNotifications: 1,
    generalNotifications: 2,
    profileNotifications: 3,
    progressNotifications: 4
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
        //activityModel.answersResult.dateStart = activityModel.startingTime;
        //activityModel.answersResult.dateEnd = activityModel.endingTime;
        //activityModel.answersResult.others = activityModel.others;
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

var successQuizCallback = function () {
    var currentStage = localStorage.getItem("currentStage");

    if (_location) {
        _endActivityCurrentChallenge ? _location.path(_endActivityCurrentChallenge) : "";
    }
};

var _hasCommunityAccessLegacy = function(value) {
    return (value == "Enable" || value == "1");
};

//This function updates in localStorage the status of the stage when completed
var _updateStageStatus = function () {
    console.log("update stage status");
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
                console.log("challengeCompleted true");                    
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
    var profile = moodleFactory.Services.GetCacheJson("profile/" + moodleFactory.Services.GetCacheObject("userId"));    
    var badges = profile.badges;
    var activity = _getActivityByCourseModuleId(coursemoduleid);
    if (activity) {
      var currentBadge = _.findWhere(_badgesPerChallenge, {activity_identifier: activity.activity_identifier});
      if (currentBadge) {
        console.log("badge won" + currentBadge.badgeName + " " + coursemoduleid);
          for (var indexBadge = 0; indexBadge < badges.length; indexBadge++) {
              if (badges[indexBadge].id == currentBadge.badgeId) {
                  profile.badges[indexBadge].status = "won";
                  _setLocalStorageJsonItem("profile/" + moodleFactory.Services.GetCacheObject("userId"), profile);
              } else {
                  //This else statement is set to avoid errors on execution flows
              }
          }
      } else {//This else statement is set to avoid errors while debugging in firefox
      }
    }else{          
    }    
};

var _updateRewardStatus = function () {

    var profile = JSON.parse(localStorage.getItem("profile/" + moodleFactory.Services.GetCacheObject("userId")));
    console.log('Stars from rewards: ' + profile.stars);
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

            if (_.find(_activitiesCabinaDeSoporte, function (id) { return activityId == id})) {
                 console.log("global");
                var key = "startedActivityCabinaDeSoporte/" + currentUser.id;
                if (localStorage.getItem(key) == null && !treeActivity.status && localStorage.getItem("finishCabinaSoporte/" + currentUser.id) == null) {
                    moodleFactory.Services.GetServerDate(function(date){
                    _setLocalStorageJsonItem(key, {
                        datestarted: date.time,
                        coursemoduleid: treeActivity.coursemoduleid,
                        activity_identifier: treeActivity.activity_identifier
                    });
                    
                    localStorage.removeItem("finishCabinaSoporte/" + currentUser.id);
                    })                    
                }
            }
            
            console.log('logStartSctivityAction Is working from dashboard');

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
    
    if (activity) {
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

          moodleFactory.Services.PostUserNotifications(dataModelNotification, function(){
              console.log("create notification successful");
          }, errorCallback, true);
            
        } else {
          
        }
    }
    }
};


var _coachNotification = function (stageIndex) {

    var notifications = JSON.parse(localStorage.getItem("notifications"));
    
    var userId = localStorage.getItem('userId');
        
    var notificationCoach = _.find(notifications, function (notif) {
        if (notif.type == notificationTypes.activityNotifications && notif.trigger_condition == 3) {
          return notif; 
        }      
    });
        
    if (notificationCoach && notificationCoach.status == "pending") {      
        var activity = getActivityByActivity_identifier(notificationCoach.activityidnumber);
                
        var notificationId = notificationCoach.id;        
        if ((activity)) {          
            var chatUser = JSON.parse(localStorage.getItem("userChat"));
            if (chatUser && chatUser.length > 0) {
                var lastChat = _.max(chatUser, function (chat) {
                    if (chat.messagesenderid == userId) {
                        return chat.messagedate;
                    }
                });

                //'minutes'- 'days'
                var daysOfNoChat = notificationCoach.days;
                var lastDateChat = moment(new Date(lastChat.messagedate)).add(daysOfNoChat, 'days');

                var today = new Date();
                if (lastDateChat < today) {
                    //Create chat notification
                    //moodleFactory.services.createNotification(userId,notificationId, function(){},function(){});
                    var dataModelNotification = {
                        notificationid : notificationId,
                        userid: userId                        
                      };                                            
                    
                    moodleFactory.Services.PostUserNotifications( dataModelNotification, function(){
                        console.log("create notification successful");
                      }, errorCallback,true);
                    
                } else {
                    return false;
                }
            }
        }
    }
};


var _progressNotification = function(indexStageId, currentProgress){
    
    var currentUser = JSON.parse(localStorage.getItem("CurrentUser"));
    
    var notifications = JSON.parse(localStorage.getItem("notifications"));
    
    var progressNotifications = _.where(notifications, { type: notificationTypes.progressNotifications });
    
    var stageId = indexStageId + 1 ;
    
    for(i = 0; i < progressNotifications.length; i++){
        var currentNotification = progressNotifications[i];
        
        if (currentNotification.status != "won" && currentProgress >= currentNotification.progressmin
            && stageId == currentNotification.stageid || stageId > currentNotification.stageid) {
            console.log("progress notification created" + currentNotification.name);
            //Add create notification logic.
            
            var wonDate = new Date();
            var dataModelNotification = {
              notificationid : String(currentNotification.id),
              userid: currentUser.id,
              wondate : wonDate
            };
  
            moodleFactory.Services.PostUserNotifications(dataModelNotification, function(){
                console.log("progress notification created" + currentNotification.name);
            }, errorCallback, true);
            
        }        
    }
}

var successPutStarsCallback = function (data) {
    _updateRewardStatus();
};


var successCallback = function (data) {
};

var errorCallback = function (data) {
};

function getActivityByActivity_identifier(activity_identifier, usercourse) {
    
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

function updateMultipleSubActivityStatuses(parentActivity, subactivitiesCourseModuleId, firstActivityLock) {
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
                    } else if(activity.activities.length == subactivitiesCourseModuleId.length || !firstActivityLock) {
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

function updateMultipleSubactivityStars(parentActivity, subactivitiesCourseModuleId, firstActivityLock) {
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
        moodleFactory.Services.PutStars(data, profile, currentUser.token, function(){}, function(){});
        _setLocalStorageJsonItem("profile/" + moodleFactory.Services.GetCacheObject("userId"), profile)
        _setLocalStorageJsonItem("CurrentUser", currentUser)
    }
}

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
    var profile = JSON.parse(moodleFactory.Services.GetCacheObject("profile/" + moodleFactory.Services.GetCacheObject("userId")));
    var currentUser = JSON.parse(moodleFactory.Services.GetCacheObject("CurrentUser"));
    var activity = getActivityByActivity_identifier(activityIdentifier);

    extraPoints ? '' : extraPoints = 0;

    var stars = 0;
    if (extraPoints != 0) {
        profile.stars = Number(profile.stars) + Number(extraPoints);
        stars = extraPoints;
    } else {

        if (activityIdentifier == "2016") {
            profile.stars = parseInt(profile.stars) + parseInt(activity.activities[0].points);
        } else {
            profile.stars = Number(profile.stars) + Number(activity.points);
            stars = activity.points;
        }
    }

    console.log("Profile stars = " + profile.stars);
    console.log("Forum stars to assign: " + stars);

    var data = {
        userId: profile.id,
        stars: activityIdentifier == "2016" ? parseInt(activity.activities[0].points) + parseInt(extraPoints) : stars,
        instance: activity.coursemoduleid,
        instanceType: 0,
        date: getdate()
    };

    moodleFactory.Services.PutStars(data, profile, currentUser.token, successPutStarsCallback, errorCallback);
}

function updateUserForumStars(activityIdentifier, extraPoints, callback) {
    var profile = JSON.parse(moodleFactory.Services.GetCacheObject("profile/" + moodleFactory.Services.GetCacheObject("userId")));
    var currentUser = JSON.parse(moodleFactory.Services.GetCacheObject("CurrentUser"));
    var activity = getActivityByActivity_identifier(activityIdentifier);
    
    profile.stars = Number(profile.stars) + Number(extraPoints);

    var data = {
        userId: profile.id,
        stars: extraPoints,
        instance: activity.coursemoduleid,
        instanceType: 0,
        date: getdate(),
        is_extra: false
    };
    
    if (extraPoints) {
        data.is_extra = true;
    }
    
    moodleFactory.Services.PutStars(data, profile, currentUser.token, callback, errorCallback);
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

    //Deleting objects from Quizes
    ClearLocalStorage("answersQuiz/");
    ClearLocalStorage("otherAnswerQuiz/");
    ClearLocalStorage("activityObject/");
    ClearLocalStorage("owlIndex");
     ClearLocalStorage("activity");
    //-------------------------------

    localStorage.removeItem("CurrentUser");    
    localStorage.removeItem("course");
    localStorage.removeItem("stage");
    localStorage.removeItem("usercourse");
    localStorage.removeItem("currentStage");
    localStorage.removeItem("notifications");
    localStorage.removeItem("userChat");
    localStorage.removeItem("leaderboard");
    localStorage.removeItem("activityStatus");
    localStorage.removeItem("userId");
    localStorage.removeItem("avatarInfo");
    localStorage.removeItem("chatRead");
    localStorage.removeItem("chatAmountRead");
    localStorage.removeItem("challengeMessageId");
    localStorage.removeItem("userCurrentStage");
    localStorage.removeItem("halloffame");
    localStorage.removeItem("citiescatalog");
    localStorage.removeItem("tuEligesActivities");
    localStorage.removeItem("reply");    
    localStorage.removeItem("mapaDeVidaActivities");
    localStorage.removeItem("starsToAssignedAfterFinishActivity");
    ClearLocalStorage("termsAndConditions");
    ClearLocalStorage("activity");
    ClearLocalStorage("drupal"); //If content must be refreshed every time user log in - TODO: Is better to not delete this info and create a process to uptated? 
    ClearLocalStorage("forum");
    ClearLocalStorage("discussion");
    ClearLocalStorage("activitiesCache");
    ClearLocalStorage("activityAnswers");
    ClearLocalStorage("album");    
    ClearLocalStorage("profile");
    ClearLocalStorage("UserTalents");
    ClearLocalStorage("postcounter");
    ClearLocalStorage("currentDiscussionIds");
    var existingInterval = localStorage.getItem('Interval');
    if(existingInterval){
        clearInterval(existingInterval);
        localStorage.removeItem("Interval");
    }    
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
    if (window.mobilecheck()) {
        cordova.exec(SuccessVideo, FailureVideo, "CallToAndroid", "PlayLocalVideo", [videoAddress, videoName]);
    }
};

function SuccessVideo() {

}

function FailureVideo() {

}

var _badgesPerChallenge = [
    {badgeId: 2, badgeName: "Combustible", challengeId: 113, activity_identifier : "1100"},
    {badgeId: 3, badgeName: "Turbina C0N0-CT", challengeId: 114, activity_identifier : "1200"},
    {badgeId: 4, badgeName: "Ala Ctu-3000", challengeId: 115, activity_identifier : "1300"},
    {badgeId: 5, badgeName: "Sistema de Navegación", challengeId: 116, activity_identifier : "1002"},
    {badgeId: 6, badgeName: "Propulsor", challengeId: 155, activity_identifier : "2003"},
    {badgeId: 7, badgeName: "Misiles", challengeId: 157, activity_identifier : "2005"},
    {badgeId: 8, badgeName: "Campo de fuerza", challengeId: 81, activity_identifier : "2010"},
    {badgeId: 9, badgeName: "Radar", challengeId: 167, activity_identifier : "2020"},
    {badgeId: 18, badgeName: "Turbo", challengeId: 160, activity_identifier : "2010"},
    {badgeId: 10, badgeName: "Tanque de oxígeno", challengeId: 206, activity_identifier : "3200"},
    {badgeId: 16, badgeName: "Casco espacial", challengeId: 208, activity_identifier : "3300"},
    {badgeId: 11, badgeName: "Sonda espacial", challengeId: 90, activity_identifier : "3400"},
    {badgeId: 17, badgeName: "Radio de comunicación", challengeId: 217, activity_identifier : "3500"}
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
    {id: 1002, name: '', url: '/ZonaDeVuelo/CabinaDeSoporte/1002'},
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
    {id: 2022, name: '', url: '/ZonaDeNavegacion/CabinaDeSoporte/2022'},
    {id: 2023, name: '', url: '/ZonaDeNavegacion/ExploracionFinal/2023'},
    {id: 3101, name: '', url: '/ZonaDeAterrizaje/ExploracionInicial/3101'},
    {id: 3201, name: '', url: '/ZonaDeAterrizaje/CuartoDeRecursos/FuenteDeEnergia/3201'},
    {id: 3301, name: '', url: '/ZonaDeAterrizaje/EducacionFinanciera/FuenteDeEnergia/3301'},
    {id: 3302, name: '', url: '/ZonaDeAterrizaje/EducacionFinanciera/MultiplicaTuDinero/3302'},
    {id: 3304, name: '', url: '/ZonaDeAterrizaje/EducacionFinanciera/PuntoDeEncuentro/Topicos/3304'},
    {id: 3401, name: '', url: '/ZonaDeAterrizaje/MapaDelEmprendedor/FuenteDeEnergia/3401'},
    {id: 3402, name: '', url: '/ZonaDeAterrizaje/MapaDelEmprendedor/MapaDelEmprendedor/3402'},
    {id: 3404, name: '', url: '/ZonaDeAterrizaje/MapaDelEmprendedor/PuntoDeEncuentro/Topicos/3404'},
    {id: 3501, name: '', url: '/ZonaDeAterrizaje/CabinaDeSoporte/3501'},
    {id: 3601, name: '', url: '/ZonaDeAterrizaje/ExploracionFinal/3601'},
    {id: 50000, name: 'Comunidad General', url: '/Community/50000'}
    //{ id: 0, url: ''}  // TODO: Fill remaining
];

//This OBJECT is loaded with a flag indicating whether the link to an activity should be enabled or disabled. Each property is named with the activity ID.
var _activityBlocked = [];

var _activitiesCabinaDeSoporte = [1002,2022,3501];

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
    console.log('canStartActivity');

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

var _getDeviceVersionAsync = function() {
    
    var deviceVersion = JSON.parse(localStorage.getItem("device-version"));
    
    if (deviceVersion != null) {
        var currentDate = new Date();
        var difTimeStamp = currentDate.getTime() - deviceVersion.lastTimeUpdated
        
        /* 60 minutes */
        if ((difTimeStamp / 60000) >= 60) {
            console.log("ya pasaron 2 minutos... a actualizar");
            _updateDeviceVersionCache();
        }
    }else {
        _updateDeviceVersionCache();
    }
};

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
            console.log("ejecutando device-version");
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

var _getCatalogValuesBy = function (catalogName) {
    
    var catalogs = moodleFactory.Services.GetCacheJson("catalogs");
    
    if (catalogs != null) {
        var catalog = _.filter(catalogs, function(c) { return c.catalog === catalogName; });
        return (catalog != null && catalog[0].values.length) > 0 ? catalog[0].values : [];
    }else{
        return [];
    }
};

var _updateConnectionStatus = function(sucessIsOnlineCallback, errorIsOnlineCallback) {
    _forceUpdateConnectionStatus(sucessIsOnlineCallback, errorIsOnlineCallback);
};

var _loadedDrupalResources = false;
var _loadDrupalResources = function() {
    _loadedDrupalResources = false;
    var propCounter = 0;
    
    for (var prop in drupalFactory.NodeRelation) {
        drupalFactory.Services.GetContent(prop, function() {
            propCounter++;
            _loadedDrupalResources = propCounter === Object.keys(drupalFactory.NodeRelation).length;
            }, function(){
                propCounter++;
                _loadedDrupalResources = propCounter === Object.keys(drupalFactory.NodeRelation).length;
                }, true);
    }
}

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
