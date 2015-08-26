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
        userId :  currentUserId };
  
      //_createNotification(activityModel, userId);
      
      moodleFactory.Services.PutEndActivity(activityId, data, activityModel, currentUser.token, successCallback,errorCallback);      
      
}

var _endActivityQuiz = function(activityModel){
                    
      var currentUserId = localStorage.getItem("userId");
      var serviceParameters =  activityModel.answersResult;
  
      //_createNotification(activityModel.activity, activityModel.userId);
      
      moodleFactory.Services.PutEndActivity(activityModel.activity.coursemoduleid, serviceParameters, activityModel.activity,successCallback,errorCallback);      
      
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
  

var successCallback =function(data){  
    console.log("global.js - successCallback - " + data);
}

var errorCallback = function(data){
 console.log("global.js - errorCallback - " + data);
  
}


function getChallengeByActivity_identifier(activity_identifier) {
            var matchingChallenge = null;
            var breakAll = false;
            var userCourse = JSON.parse(localStorage.getItem("usercourse"));
            for (var index = 0; index < userCourse.stages.length; index++) {
                var stage = userCourse.stages[index];
                for (var index = 0; index < stage.challenges.length; index++) {
                    var challenge = stage.challenges[index];
                    if (challenge.activity_identifier == activity_identifier) {
                        matchingChallenge = challenge;
                        breakAll = true;
                        break;
                    }
                }
                if(breakAll)
                 break;
            }
            return matchingChallenge;
        }

function getActivitiesByActivity_identifier(activity_identifier) {
    var activitiesFound = null;
    
    var challenge = getChallengeByActivity_identifier(activity_identifier);
    activitiesFound =challenge.activities;                
  
    return activitiesFound ;
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
