//global variables

var API_RESOURCE = "http://incluso.definityfirst.com/RestfulAPI/public/{0}";
//var API_RESOURCE = "http://incluso-api-prod.azurewebsites.net/RestfulAPI/public/{0}";


var _courseId = 4;
var _endActivityCurrentChallenge = null;
var _httpFactory = null;
var _timeout = null;
var _location = null;

var _activityStatus = null;

var _activityDependencies = [
    {
        id:112,
        dependsOn:[150]
    },
    {
        id:145,
        dependsOn:[150]
    },
    {
        id:139,
        dependsOn:[150]
    },
    {
        id:151,
        dependsOn:[150]
    },
    {
        id:149,
        dependsOn:[150,139]
    },
    {
        id:146,
        dependsOn:[150]
    },
    {
        id:71,
        dependsOn:[150]
    },
    {
        id:70,
        dependsOn:[150]
    },
    {
        id:72,
        dependsOn:[150]
    },
    {
        id:73,
        dependsOn:[150]
    },
    {
        id:68,
        dependsOn:[150,112,145,139,151,149,146,71,70,72,73]
    },
    {
        id:100,
        dependsOn:[150,68]
    }

];

var _IsOffline = function() {
  return false;
};

var _syncAll = function(callback) {
    callback();
//    moodleFactory.Services.GetAsyncProfile(_getItem("userId"), allServicesCallback);
};

var allServicesCallback = function(){  
  _syncCallback();
};

var _setToken = function(token) {
  $.ajaxSetup({
      headers: { 'Access_token' : token.token }
  });
};

var _setId = function(userId) {
  _setLocalStorageItem("userId", userId);

};

var _getItem = function(key) {
  return localStorage.getItem(key);
};

var _readNotification = function(currentUserId,currentNotificationId){
    
      var data = {
          userid:  currentUserId,
          notificationid: currentNotificationId};
  
      moodleFactory.Services.PutUserNotificationRead(currentNotificationId,data,function(){        
      },function(){        
        });
};

var _setLocalStorageItem = function(key, value) {
    localStorage.setItem(key, value);
}

var _setLocalStorageJsonItem = function(key, object) {
  try {
    localStorage.setItem(key, JSON.stringify(object));
  }
  catch (e) {
      ClearLocalStorage("activity");
      ClearLocalStorage("activitiesCache");
    localStorage.setItem(key, JSON.stringify(object));
  }
}

function syncCacheData (){

}

//Update activity status for activity blocking binding
var updateActivityStatusDictionary = function(activityId){
    var activityStatus = moodleFactory.Services.GetCacheObject("activityStatus");
    if(activityStatus){
        activityStatus[activityId] = 1;
    }
    _setLocalStorageJsonItem("activityStatus",activityStatus);
    _activityStatus[activityId] =1;
};

var _endActivity = function(activityModel, currentChallenge){                
        //trigger activity type 2 is sent when the activity ends.
        var triggerActivity = 2;
        var currentUser = JSON.parse(moodleFactory.Services.GetCacheObject("CurrentUser"));
        var currentUserId = currentUser.userId;
        var activityId = activityModel.coursemoduleid;
        //create notification
        _createNotification(activityId, triggerActivity);              
        
      if (activityModel.activityType == "Quiz"){        
        _endActivityCurrentChallenge = currentChallenge;        
        moodleFactory.Services.PutEndActivityQuizes(activityId, activityModel.answersResult, activityModel.usercourse, activityModel.token, successQuizCallback, errorCallback);
      }
      else if(activityModel.activityType == "Assign")
      {
        var data = {userid :  currentUserId };
        
        moodleFactory.Services.PutEndActivityQuizes(activityId, data, activityModel.usercourse,activityModel.token,
        successCallback,errorCallback);
      }
      else{            
        var data = {userid :  currentUserId };
        
        // update activity status dictionary used for blocking activity links
        updateActivityStatusDictionary(activityId);
        moodleFactory.Services.PutEndActivity(activityId, data, activityModel, currentUser.token, successCallback, errorCallback);
      }                  
};

var successQuizCallback = function(){
  var currentStage = localStorage.getItem("currentStage");
  if (_location) {
    _location.path('/ZonaDeVuelo/Dashboard/' + currentStage + '/' + _endActivityCurrentChallenge);
  }else{
    
  }  
}


//This function updates in localStorage the status of the stage when completed
var _isStageCompleted = function(){
    
    var userCourse = JSON.parse(localStorage.getItem("usercourse"));
    
    for(var stageIndex = 0; stageIndex < userCourse.stages.length; stageIndex++){
        var currentStage = userCourse.stages[stageIndex];
        if (currentStage.status == 1) {
          break;
        }else{
          var totalChallengesByStage = currentStage.challenges.length;
          var totalChallengesCompleted = _.where(currentStage.challenges,{status:1}).length;
          if (totalChallengesByStage == totalChallengesCompleted) {
              userCourse.stages[stageIndex].status = 1;
              _setLocalStorageJsonItem("usercourse",userCourse);
              return true;
          }else{
              return false;
          }
        }
    }
  
};

var _isChallengeCompleted = function(){
    console.log("challenge Completed starts");
    var success = 0;
    var userCourse = JSON.parse(localStorage.getItem("usercourse"));      
    var lastStageIndex = _.where(userCourse.stages,{status: 1}).length;
    var currentStage = userCourse.stages[lastStageIndex];
    
    for(var challengeIndex = 0; challengeIndex < currentStage.challenges.length; challengeIndex++){
        var currentChallenge = currentStage.challenges[challengeIndex];
        if(currentChallenge.status == 0){              
            var totalActivitiesByStage = currentChallenge.activities.length;
            var totalActivitiesCompletedByStage = (_.where(currentChallenge.activities, {status: 1})).length;
            console.log("TotalActivitiesByStage" + totalActivitiesByStage + "TotalActivitiesCompleted:" + totalActivitiesCompletedByStage);
            if (totalActivitiesByStage == totalActivitiesCompletedByStage){
                
                //updateBadge
                _updateBadgeStatus(currentChallenge.coursemoduleid);
                userCourse.stages[lastStageIndex].challenges[challengeIndex].status = 1;
                console.log(userCourse);
                _setLocalStorageJsonItem("usercourse", userCourse);
                var currentUser = JSON.parse(moodleFactory.Services.GetCacheObject("CurrentUser"));
                var currentUserId = currentUser.userId;
                var data = { userid :  currentUserId };
                var currentActivityModuleId = currentChallenge.coursemoduleid;
                console.log("inside currentChallengeCompleted");
                console.log(currentChallenge);
                moodleFactory.Services.PutEndActivity(currentActivityModuleId, data, null, currentUser.token, function(){
                    console.log("success Callback");
                  },errorCallback);
                success = currentActivityModuleId;
                return success;
            }else{
              success = 0;
            }          
        }else{
          success = 0;
        }
    }
    return success;
    
};



var _updateBadgeStatus = function(coursemoduleid, callback){
    moodleFactory.Services.GetAsyncProfile(_getItem("userId"), function() {
    if (callback) callback();
    var profile = moodleFactory.Services.GetCacheJson("profile");
    var badges = profile.badges;
    var currentBadge = _.findWhere(_badgesPerChallenge,{ challengeId : coursemoduleid});    
    if (currentBadge) {
      for (var indexBadge = 0; indexBadge < badges.length; indexBadge++) {
        if (badges[indexBadge].id == currentBadge.badgeId) {
          profile.badges[indexBadge].status = "won";
          _setLocalStorageJsonItem("profile",profile);
        }else{
          //This else statement is set to avoid errors on execution flows
        }
      }
    }else{//This else statement is set to avoid errors on execution flows
    }
    });
};



var _createNotification = function(activityId, triggerActivity){
  
  currentUserId = localStorage.getItem("userId");

  var allNotifications = JSON.parse(localStorage.getItem("notifications"));
 
  for(var indexNotifications = 0; indexNotifications < allNotifications.length; indexNotifications++ ){
      var currentNotification = allNotifications[indexNotifications];
      if (currentNotification.trigger == triggerActivity && currentNotification.activityidnumber == activityId){
          allNotifications[indexNotifications].timemodified = new Date();
          _setLocalStorageJsonItem("notifications",allNotifications);
          var dataModelNotification = {
              notificationid: allNotifications[indexNotifications].id,
              timemodified : new Date(),
              userid: currentUserId,
              already_read: 0
              };              
          moodleFactory.Services.PostUserNoitifications(currentUserId,dataModelNotification,successCallback,errorCallback);
      }else{
      }
  }
};


var _coachNotification = function(){
  
  var notifications = JSON.parse(localStorage.getItem("notifications"));
  var userId = localStorage.getItem('userId');
  var notificationCoach = _.find(notifications,function(notif){
      if(notif.id == 4){
        return notif;
        }else{}
    });                                
  
  if (notificationCoach && !notificationCoach.timemodified) {
    var activityId = 68;
    var activity = _getActivityByCourseModuleId(activityId);
    if ((activity) ){     
      
      var triggerActivity = 3;
      var chatUser = JSON.parse(localStorage.getItem("userChat"));                        
      if (chatUser && chatUser.length > 0){      
        var lastChat = _.max(chatUser,function(chat){
          if (chat.messagesenderid == userId) {
              return chat.messagedate;
            }
          });
          
          //'minutes'- 'days'
          var lastDateChat = moment(new Date(lastChat.messagedate)).add(2, 'days');        
        
        var today = new Date();
         if(lastDateChat < today){
           _createNotification(activity.coursemoduleid,triggerActivity);
         }else{return false;}
      }          
    }      
  }  
};
                
      
      






var successCallback = function(data){
};

var errorCallback = function(data){
};

var _notificationExists = function(){
  
    var userNotifications = JSON.parse(localStorage.getItem('notifications'));
    //var countNotificationsUnread = _.where(userNotifications, {read: false}).length;
    var countNotificationsUnread = _.filter(userNotifications, function(notif){
        return (notif.timemodified != null && notif.read != true);
    });       
    var totalNotifications = countNotificationsUnread.length;
    return  totalNotifications;
  
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
                      if (activity.activity_identifier == activity_identifier) {
                        matchingActivity = activity;
                        breakAll = true;
                        break;
                        }
                    }
                    if(breakAll)
                     break;
                }
                if(breakAll)
                 break;
            }
            return matchingActivity;
}

function _getActivityByCourseModuleId(coursemoduleid) {          
            var matchingActivity = null;
            var breakAll = false;
            var userCourse = JSON.parse(localStorage.getItem("usercourse"));
            for (var stageIndex = 0; stageIndex < userCourse.stages.length; stageIndex++) {
                var stage = userCourse.stages[stageIndex];
                for (var challengeIndex = 0; challengeIndex < stage.challenges.length; challengeIndex++) {
                    var challenge = stage.challenges[challengeIndex];
                    for (var activityIndex = 0; activityIndex < challenge.activities.length; activityIndex++) {
                      var activity = challenge.activities[activityIndex];
                      if (activity.coursemoduleid == coursemoduleid) {
                        matchingActivity = activity;
                        breakAll = true;
                        break;
                        }
                    }
                    if(breakAll)
                     break;
                }
                if(breakAll)
                 break;
            }
            return matchingActivity;
}

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
                            if(activity.activities){
                              for(var subactivityIndex = 0; subactivityIndex < activity.activities.length; subactivityIndex++)
                              {
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
                updateActivityStatusDictionary(activity_identifier);
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

function updateMultipleSubActivityStatuses(parentActivity, subactivitiesCourseModuleId){
  var breakAll = false;
  var theUserCourse = JSON.parse(localStorage.getItem("usercourse"));
  for (var stageIndex = 0; stageIndex < theUserCourse.stages.length; stageIndex++) {
      var stage = theUserCourse.stages[stageIndex];
      for (var challengeIndex = 0; challengeIndex < stage.challenges.length; challengeIndex++) {
          var challenge = stage.challenges[challengeIndex];
          for (var activityIndex = 0; activityIndex < challenge.activities.length; activityIndex++) {
            var activity = challenge.activities[activityIndex];
            if(activity.activities && activity.activity_identifier == parentActivity.activity_identifier){
              if (activity.status == 1){
                breakAll = true;
                break;
              } else {
                activity.status = 1;
              }
              for(var subactivityIndex = 0; subactivityIndex < activity.activities.length; subactivityIndex++){
                var subactivity = activity.activities[subactivityIndex];
                for(var subactivityCourseModuleId = 0; subactivityCourseModuleId < subactivitiesCourseModuleId.length; subactivitiesCourseModuleId++){
                  if (subactivity.coursemoduleid == subactivitiesCourseModuleId[subactivityCourseModuleId] && subactivity.status == 0){
                    subactivity.status = 1;
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
          if (breakAll)
              break;
      }
      if (breakAll)
          break;
  }
  return theUserCourse;
}

function updateMultipleSubactivityStars (parentActivity, subactivitiesCourseModuleId){
    var profile = JSON.parse(moodleFactory.Services.GetCacheObject("profile"));   
    var currentUser = JSON.parse(moodleFactory.Services.GetCacheObject("CurrentUser"));
    var stars = 0;
    for(var i=0; i < parentActivity.activities.length; i++){
      for(var j=0; j < subactivitiesCourseModuleId.length; j++){
        if(parentActivity.activities[i].coursemoduleid == subactivitiesCourseModuleId[j] && parentActivity.activities[i].status == 0){
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
      moodleFactory.Services.PutStars(data, profile, currentUser.token, successCallback, errorCallback);
      _setLocalStorageJsonItem("profile", profile)
      _setLocalStorageJsonItem("CurrentUser", currentUser)
    }
}

 function updateUserStars (activity_identifier, extraPoints){
   var profile = JSON.parse(moodleFactory.Services.GetCacheObject("profile"));   
   var currentUser = JSON.parse(moodleFactory.Services.GetCacheObject("CurrentUser"));
   var activity = getActivityByActivity_identifier(activity_identifier);
     extraPoints ? '' : extraPoints = 0;
     
     
     if (activity_identifier == '1009' || activity_identifier == '1001') {
         activity.points = 0;
     }
     
     profile.stars = Number(profile.stars) + Number(activity.points) + Number(extraPoints);  

    var data={
      userId: profile.id,
      stars: Number(activity.points) + Number(extraPoints),
      instance: activity.coursemoduleid,
      instanceType: 0,
      date: getdate()
   };
   moodleFactory.Services.PutStars(data,profile, currentUser.token,successCallback, errorCallback);
}

function updateUserStarsUsingExternalActivity (activity_identifier){
   var profile = JSON.parse(moodleFactory.Services.GetCacheObject("profile"));   
   var currentUser = JSON.parse(moodleFactory.Services.GetCacheObject("CurrentUser"));
   var activity = getExtActivityByActivity_identifier(activity_identifier);   
   //profile.stars = Number(profile.stars) +  Number(activity.points);
    var data={
       userId: profile.id,
       stars: activity.points ,
       instance: activity.coursemoduleid,
       instanceType: 0,
       date: getdate()
   };
   
   moodleFactory.Services.PutStars(data,profile, currentUser.token, successCallback, errorCallback);
}

function getExtActivityByActivity_identifier(activity_identifier){     
     var userCourse = JSON.parse(localStorage.getItem("usercourse"));
     for (var activityIndex = 0; activityIndex < userCourse.activities.length; activityIndex++) {
       var extActivity = userCourse.activities[activityIndex];
        if(extActivity.activity_identifier == activity_identifier){
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
var logout = function($scope, $location){    
    $scope.currentUser = JSON.parse(moodleFactory.Services.GetCacheObject("CurrentUser"));

      if(!_IsOffline()){
        _httpFactory(
          {
            method: 'POST',
            url: API_RESOURCE.format("authentication"), 
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            data: $.param(
                { token: $scope.currentUser.token,
                  userid: $scope.currentUser.userId,
                  action: "logout"})
          }
        ).success(function(data, status, headers, config) {        
          }
        );
      }
      localStorage.removeItem("CurrentUser");
      localStorage.removeItem("profile");
      localStorage.removeItem("course");
      localStorage.removeItem("stage");
      localStorage.removeItem("usercourse");
      localStorage.removeItem("currentStage");
      localStorage.removeItem("notifications");
      localStorage.removeItem("userChat");
      localStorage.removeItem("leaderboard");
      ClearLocalStorage("activity");
      ClearLocalStorage("activitiesCache");
      $location.path('/');
    };
      
      function ClearLocalStorage(startsWith) {
          var myLength = startsWith.length;

          Object.keys(localStorage).forEach(function(key){ 
                  if (key.substring(0,myLength) == startsWith) {
                      localStorage.removeItem(key); 
                  } 
              }); 
      }

      playVideo = function(videoAddress, videoName){                 
                 //var videoAddress = "assets/media";
                 //var videoName = "TutorialTest2.mp4";
                cordova.exec(SuccessVideo, FailureVideo, "CallToAndroid", "PlayLocalVideo", [videoAddress,videoName]);
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
  {
    badgeId: 2,
    badgeName: "Combustible",
    challengeId: 113
  },

  {
    badgeId: 3,
    badgeName: "Turbina C0N0-CT",
    challengeId: 114
  },
  {
    badgeId: 4,
    badgeName: "Ala Ctu-3000",
    challengeId: 115
  },
  {
    badgeId: 5,
    badgeName: "Combustible",
    challengeId: 68
  }
];



var _activityRoutes = [
  { id: 150, url: '/ZonaDeVuelo/ExploracionInicial/1001'},
  { id: 112, url: '/ZonaDeVuelo/CuartoDeRecursos/FuenteDeEnergia/zv_cuartoderecursos_fuentedeenergia'},
  { id: 113, url: '#'},
  { id: 149, url: '/ZonaDeVuelo/Conocete/ZonaDeContacto/149'},
  { id: 145, url: '/ZonaDeVuelo/Conocete/FuenteDeEnergia/zv_conocete_fuentedeenergia'},
  { id: 139, url: '/ZonaDeVuelo/Conocete/RetoMultiple/1039'},
  { id: 151, url: '/ZonaDeVuelo/Conocete/PuntoDeEncuentro/Topicos/64'},
  { id: 114, url: '#'},
  { id: 146, url: '/ZonaDeVuelo/MisSuenos/FuenteDeEnergia/zv_missuenos_fuentedeenergia'},
  { id: 70, url: '/ZonaDeVuelo/MisSuenos/MisGustos/1006'},
  { id: 71, url: '/ZonaDeVuelo/MisSuenos/MisCualidades/1005'},
  { id: 72, url: '/ZonaDeVuelo/MisSuenos/Suena/1007'},
  { id: 73, url: '/ZonaDeVuelo/MisSuenos/PuntosDeEncuentro/Topicos/73'},
  { id: 115, url: '#'},
  { id: 68, url: '/ZonaDeVuelo/CabinaDeSoporte/zv_cabinadesoporte_chat'}, 
  { id: 100, url: '/ZonaDeVuelo/ExploracionFinal/1009'}
  //{ id: 0, url: ''}  // TODO: Fill remaining
];
