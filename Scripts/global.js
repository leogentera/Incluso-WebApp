//global variables

var API_RESOURCE = "http://incluso.definityfirst.com/RestfulAPI/public/{0}";
//var API_RESOURCE = "http://incluso-api-prod.azurewebsites.net/RestfulAPI/public/{0}";


var _courseId = 4;

var _httpFactory = null;
var _timeout = null;

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
        dependsOn:[150,112,145,139,151,149,146,71,70,72,73,68]
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
  _syncCallback = callback;

  //check if the session is OnLine
  if (!_IsOffline()) {
    moodleFactory.Services.GetAsyncProfile(_getItem("userId"), allServicesCallback);
  }
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
  localStorage.setItem("userId", userId);
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

function syncCacheData (){

    //localStorage.setItem("profile", JSON.stringify(dummyProfile));
    //localStorage.setItem("user", JSON.stringify(User));
    //localStorage.setItem("course", JSON.stringify(Course));
    //localStorage.setItem("usercourse", JSON.stringify(UserCourse));

}

//Update activity status for activity blocking binding
var updateActivityStatusDictionary = function(activityId){
    var activityStatus = moodleFactory.Services.GetCacheObject("activityStatus");
    if(activityStatus){
        activityStatus[activityId] = 1;
    }
    localStorage.setItem("activityStatus",JSON.stringify(activityStatus));
    _activityStatus[activityId] =1;
};

var _endActivity = function(activityModel){
        
        //trigger activity type 2 is sent when the activity ends.
        var triggerActivity = 2;
        var currentUser = JSON.parse(moodleFactory.Services.GetCacheObject("CurrentUser"));
        var currentUserId = currentUser.userId;
        var activityId = activityModel.coursemoduleid;
        //create notification
        _createNotification(activityId, triggerActivity);
        //complete stage
        _isStageCompleted();
        //update badge status
        _updateBadgeStatus(activityId);
      if (activityModel.activityType == "Quiz"){
        moodleFactory.Services.PutEndActivityQuizes(activityId, activityModel.answersResult, activityModel.usercourse,activityModel.token,
        successCallback,errorCallback);        
      }else{            
        var data = {userid :  currentUserId };
        
        // update activity status dictionary used for blocking activity links
        updateActivityStatusDictionary(activityId);
        moodleFactory.Services.PutEndActivity(activityId, data, activityModel, currentUser.token, successCallback, errorCallback);
      }                  
};


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
              localStorage.setItem("usercourse",JSON.stringify(userCourse));
          }
        }
    }
  
};

var _isChallengeCompleted = function(){
    var userCourse = JSON.parse(localStorage.getItem("usercourse"));      
    var lastStageIndex = _.where(userCourse.stages,{status: 1}).length;
    var currentStage = userCourse.stages[lastStageIndex];
    
    for(var challengeIndex = 0; challengeIndex < currentStage.challenges.length; challengeIndex ++){
        var currentChallenge = currentStage.challenges[challengeIndex];
        if(currentChallenge.status == 0){        
          var totalActivitiesByStage = currentChallenge.activities.length;
          var totalActivitiesCompletedByStage = (_.where(currentChallenge.activities, {status: 1})).length;
          if (totalActivitiesByStage == totalActivitiesCompletedByStage){
              
              //updateBadge
              _updateBadgeStatus(currentChallenge.coursemoduleid);
              
              userCourse.stages[lastStageIndex].challenges[challengeIndex].status = 1;
              localStorage.setItem("usercourse", JSON.stringify(userCourse));              
              var currentUser = JSON.parse(moodleFactory.Services.GetCacheObject("CurrentUser"));
              var currentUserId = currentUser.userId;
              var data = { userid :  currentUserId };
              var currentActivityModuleId = currentChallenge.coursemoduleid;              
              moodleFactory.Services.PutEndActivity(currentActivityModuleId, data, null, currentUser.token, function(){},errorCallback);
              return currentActivityModuleId;
          }else{
            return false;
          }
        }else{
          return false;
        }
    }
};


var _updateBadgeStatus = function(coursemoduleid){    
    var profile = JSON.parse(localStorage.getItem("profile"));
    var badges = profile.badges;
    
    var badge = _.findWhere(_badgesPerChallenge,{ challengeId : coursemoduleid});
    if (badge) {
      for (var indexBadge = 0; indexBadge < badges.length; indexBadge++) {
        if (badges[indexBadge].id == badge.badgeId) {
          profile.badges[indexBadge].status = "won";
        }else{
          break;
        }
      }
    }
}

var _createNotification = function(activityId, triggerActivity){
  
  currentUserId = localStorage.getItem("userId");
  var currentDate = new Date();
  var currentMonth = (currentDate.getMonth() + 1) < 10 ? ("0" + (currentDate.getMonth() + 1)) : (currentDate.getMonth() + 1);
  var currentDay = (currentDate.getDay() < 10) ? ("0" + currentDate.getDay()) : currentDate.getDay();
  var formattedDate = currentMonth + "/" + currentDate.getDate() + "/" + currentDate.getFullYear();
  var allNotifications = JSON.parse(localStorage.getItem("notifications"));
 
  for(var indexNotifications = 0; indexNotifications < allNotifications.length; indexNotifications++ ){
      var currentNotification = allNotifications[indexNotifications];
      if (currentNotification.trigger == triggerActivity && currentNotification.activityidnumber == activityId){
          allNotifications[indexNotifications].timemodified = formattedDate;        
          localStorage.setItem("notifications",JSON.stringify(allNotifications));
          var dataModelNotification = {
              notificationid: allNotifications[indexNotifications].id,
              timemodified : formattedDate,
              userid: currentUserId,
              already_read: 0
              };              
          moodleFactory.Services.PostUserNoitifications(currentUserId,dataModelNotification,successCallback,errorCallback);
      }else{        
      }
  }
};

var _coachNotification = function(){
                      
  var userCourse = JSON.parse(localStorage.getItem("usercourse"));
  var activityChatStarted = userCourse.stages[0].challenges[4].activities[0].started;  
  if (activityChatStarted){
      var activityDateStarted = userCourse.stages[0].challenges[4].activities[0].datestarted;      
      var activityChatId = 68;
      var triggerActivity = 3;      
      var notifications = JSON.parse(localStorage.getItem("notifications"));
      var userCourse = JSON.parse(localStorage.getItem("usercourse"));
      
      var userId = localStorage.getItem('userId');
      var twoDaysAfterLastMessage = new Date(activityDateStarted);
      twoDaysAfterLastMessage.setDate(twoDaysAfterLastMessage.getDate()+2);
  
      var today = new Date();
      if (twoDaysAfterLastMessage < today){
        _createNotification(activityChatId,triggerActivity);
      }else{
        return false;
      }
  }
}

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
  
}

function getActivityByActivity_identifier(activity_identifier) {          
            var matchingActivity = null;
            var breakAll = false;
            var userCourse = JSON.parse(localStorage.getItem("usercourse"));
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
                              console.log(activity.activities.length);
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



 function updateUserStars (activity_identifier){
   var profile = JSON.parse(moodleFactory.Services.GetCacheObject("profile"));   
   var currentUser = JSON.parse(moodleFactory.Services.GetCacheObject("CurrentUser"));
   var activity = getActivityByActivity_identifier(activity_identifier);
   profile.stars = profile.stars+activity.points;   
    var data={
      userId: profile.id,
      stars: activity.points,
      instance: activity.coursemoduleid,
      instanceType: 0,
      date: getdate()
   };
   moodleFactory.Services.PutStars(data,profile, currentUser.token,successCallback, errorCallback);
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
      localStorage.removeItem("userChat")
      $location.path('/');
    };
    
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
    badgeId: 6,
    badgeName: "Combustible",
    challengeId: 113},
  {
    badgeId: 7,
    badgeName: "Turbina C0N0-CT",
    challengeId: 114},
  {
    badgeId: 8,
    badgeName: "Ala Ctu-3000",
    challengeId: 115},
  {
    badgeId: 2,
    badgeName: "Combustible",
    challengeId: ""},
  {
    badgeId: 3,
    badgeName: "Turbina C0N0-CT",
    challengeId: ""}
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
