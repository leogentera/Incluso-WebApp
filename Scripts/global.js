//global variables

var API_RESOURCE = "http://incluso.definityfirst.com/RestfulAPI/public/{0}";
//var API_RESOURCE = "http://incluso-api-prod.azurewebsites.net/RestfulAPI/public/{0}";


var _courseId = 4;

var _httpFactory = null;

var _IsOffline = function() {
  return false;
}

var _syncAll = function(callback) {
  _syncCallback = callback;

  console.log('is offline:' + _IsOffline());

  //check if the session is OnLine
  if (!_IsOffline()) {
    moodleFactory.Services.GetAsyncProfile(_getItem("userId"), allServicesCallback);
  }
};

var allServicesCallback = function(){
  console.log("allServicesCallback");
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
        //LocalStorage.setItem("notifications",data.notifications);
      },function(){
        //console.log(error on getting notifications data);
        });
}

function syncCacheData (){

    //localStorage.setItem("profile", JSON.stringify(dummyProfile));
    //localStorage.setItem("user", JSON.stringify(User));
    //localStorage.setItem("course", JSON.stringify(Course));
    //localStorage.setItem("usercourse", JSON.stringify(UserCourse));

}

var _endActivity = function(activityModel){
      var currentUser = JSON.parse(moodleFactory.Services.GetCacheObject("CurrentUser"));
      var currentUserId = currentUser.userId;
      var activityId = activityModel.coursemoduleid;
      var data = {
        userid :  currentUserId };
  
      //_createNotification(activityModel, userId);
      
      moodleFactory.Services.PutEndActivity(activityId, data, activityModel, currentUser.token, successCallback,errorCallback);      
      
      // end actual challenge when all its activities are completed;
      _isChallengeCompleted();
      
}

var _endActivityQuiz = function(activityModel){
                    
      //var currentUserId = localStorage.getItem("userId");
      var serviceParameters =  activityModel.answersResult;
  
      //_createNotification(activityModel.activity, activityModel.userId);
      
      moodleFactory.Services.PutEndActivityQuizes(activityModel.coursemoduleid, activityModel.answersResult, activityModel.usercourse,successCallback,errorCallback);      
 
      _isChallengeCompleted(activityModel);     
}


var _isChallengeCompleted = function(activityModel){
  
    var userCourse = JSON.parse(localStorage.getItem("usercourse"));
    var lastStageIndex = _.where(userCourse.stages,{status: 1}).length;    
    var currentStage = userCourse.stages[lastStageIndex];
       
    var lastChallenge = _.where(currentStage.challenges,{status:1}).length;    
    var currentChallenge = currentStage.challenges[lastChallenge];
    
    var totalActivitiesByStage = currentChallenge.activities.length;    
    var totalActivitiesCompletedByStage = (_.where(currentChallenge.activities, {status: 1})).length;
    
    
    if (totalActivitiesByStage == totalActivitiesCompletedByStage) {
        var currentUser = JSON.parse(moodleFactory.Services.GetCacheObject("CurrentUser"));
        var currentUserId = currentUser.userId;
        var activityId = activityModel.coursemoduleid;
        var data = {
          userid :  currentUserId };
          
        var currentActivityModuleId = currentChallenge.coursemoduleid;
        moodleFactory.Services.PutEndActivity(currentActivityModuleId, data, activityModel, currentUser.token, successEndChallengeCallback,errorCallback);
        return true;
    }
    else{
      return false;
    }
}

var successEndChallengeCallback = function(){
  localStorage.setItem("closeStageModal",'true');
}


var _createNotification = function(activityModel, currentUserId){
    
  var activityId = acitivityModel.coursemoduleid;  
  var sectionId = activityModel.section;
  currentUserId = localStorage.getItem("userId");
  
  var notifications = JSON.parse(localStorage.getItem("notifications"));
  var endTypeNotifications = _.where(notifications, {trigger : 2});  
  
  for(var i= 0; i< notifications.length; i++){      
      if (notifications[i].activityidnumber && (activityId == notifications[i].activityidnumber)) {
          var dataModelNotification = {
              notificationid: notifications[i].id,
              timemodified : new Date(),
              userid: currentUserId ,
              already_read: 0
          };
          moodleFactory.Services.PostUserNoitifications(currentUserId,dataModelNotification,successCallback,errorCallback);        
      }else{
        if (sectionId == notifications[i].sectionid){                    
          var dataModelNotification = {
              notificationid: notifications[i].id,
              timemodified : new Date(),
              userid: currentUserId ,
              already_read: 0
          };
          moodleFactory.Services.PostUserNoitifications(currentUserId,dataModelNotification,successCallback,errorCallback);              
        }      
      }  
  }
}

var _createMultipleActivitiesNotification = function(alertsId){
  var notifications = JSON.parse(localStorage.getItem("notifications"));
  var startTypeNotifications = _.where(notifications, {trigger : 1});
  var alerts = alertsId.split(',');
  var countAlertsConditionsMet = 0;
  for(var i= 0; i< notifications.length; i++){
    for(var j= 0; j< alerts.length;j++){
      var activityId = alerts[j].id;
      if (activityId == notifications[i].activityidnumber || activityId == notifications[i].sectionid) {
        countAlertsConditionsMet ++;
      }
    }
  }
  if (countAlertsConditionsMet > 1){
      var dataModelNotification = {
          notificationid: notifications[i].id,
          timemodified : new Date(),
          userid: currentUserId ,
          already_read: 0
      };
      moodleFactory.Services.PostUserNoitifications(currentUserId,dataModelNotification,successCallback,errorCallback);
  }
} 

var successCallback =function(data){  
    console.log("global.js - successCallback - " + data);
}

var errorCallback = function(data){
 console.log("global.js - errorCallback - " + data);
  
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

 function updateActivityStatus(activity_identifier) {              
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

function getdate(){
              var currentdate = new Date(); 
              var datetime = currentdate.getFullYear() + ":"
                + (currentdate.getMonth()+1)  + ":" 
                + currentdate.getDate() + " "  
                + currentdate.getHours() + ":"  
                + currentdate.getMinutes() + ":" 
                + currentdate.getSeconds();
                return datetime;
            }


syncCacheData();
var logout = function($scope, $location){
    console.log("Logout function ");
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

          console.log('successfully logout');
          }
        );
      }
      localStorage.removeItem("CurrentUser");
      localStorage.removeItem("profile");
      localStorage.removeItem("course");
      localStorage.removeItem("stage");
      localStorage.removeItem("usercourse");
      localStorage.removeItem("currentStage");
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
