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

var _endActivity = function(currentUserId,currentActivityId, currentActivityType){
        
      var data = {
        userId :  currentUserId,
        activityId : currentActivityId,
        activityType: currentActivityType                  
      };
  
    moodleFactory.Services.PutAsyncActivity(userId,data,successCallback,errorCallback);
          
    var dataUserNotifications = {
            
    }
    
          
}

var _createNotification = function(){
  
  var dataModelNotification = {
      notificationid: 3,
      timemodified : "08/25/2015",      
      userid: 47,
      already_read: 0
  };
  
  moodleFactory.Services.PostUserNoitifications(47,dataModelNotification,successCallback,errorCallback);  
}

var successCallback =function(){  
  
}

var errorCallback = function(data){
  debugger;
  
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
