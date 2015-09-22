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
            _timeout = $timeout;
            _httpFactory = $http;
            var moduleid = $routeParams.moodleid;
            var pagename;      
            var currentChallenge; 
            var stage;             
            switch(moduleid){
              case "1101":  
                currentChallenge = 1;
                stage = "ZonaDeVuelo";
                break;
              case "1020":                
                currentChallenge = 2;
                stage = "ZonaDeVuelo";
                break;
              case "1021":                
                currentChallenge = 3;
                stage = "ZonaDeVuelo";
                break;
              case "2004":
                currentChallenge = 1;
                stage = "ZonaDeNavegacion";
                break;
              case "2006":
                currentChallenge = 2;
                stage = "ZonaDeNavegacion";
                break;
              case "2011":
                currentChallenge = 3;
                stage = "ZonaDeNavegacion";
                break;
              case "2015":
                currentChallenge = 4;
                stage = "ZonaDeNavegacion";
                break;
              case "3201":
                currentChallenge = 1;
                stage = "ZonaDeAterrizaje";
                break;
              case "3301":
                currentChallenge = 2;
                stage = "ZonaDeAterrizaje";
                break;
              case "3401":
                currentChallenge = 3;
                stage = "ZonaDeAterrizaje";
                break;

            }

            $scope.currentPage = 1;  
            $scope.$emit('ShowPreloader'); //show preloader
            $scope.setToolbar($location.$$path,"");
            $rootScope.showFooter = true; 
            $rootScope.showFooterRocks = false; 
            $scope.statusObligatorios = 0; 
            var waitPreloader = 0;
            var hidePreloader = 0;
            var profile;                            
            var activities = JSON.parse(moodleFactory.Services.GetCacheObject("activitiesCache/" + moduleid));            
            var currentUser = JSON.parse(moodleFactory.Services.GetCacheObject("CurrentUser"));            
            $scope.token = currentUser.token;
            $scope.scrollToTop();
            //$scope.$emit('HidePreloader'); //hide preloader            
            var starsNoMandatory = 0;
            var starsMandatory = 0;                
            var getcoursemoduleids = [];
            $scope.like_status = 1;

            if(!activities){
              var activitymanagers = JSON.parse(moodleFactory.Services.GetCacheObject("activityManagers"));
              $scope.fuenteDeEnergia = _.find(activitymanagers,function(a) { 
                                  return a.activity_identifier == moduleid
                                  });                    
              getDataAsync();    
            }      
            else{
              $scope.fuenteDeEnergia = activities;
              getDataAsync();
              $scope.$emit('HidePreloader'); //hide preloader
            }     

            checkProgress();

            $scope.navigateToPage = function (pageNumber) {
                $scope.currentPage = pageNumber;
            }                                

            function getDataAsync() {                            
              for(i = 0; i < $scope.fuenteDeEnergia.activities.length; i++){   
                var activityCache = JSON.parse(moodleFactory.Services.GetCacheObject("activitiesCache/" + $scope.fuenteDeEnergia.activities[i].coursemoduleid)); 
                if(activityCache){
                  $scope.fuenteDeEnergia.activities[i] = activityCache;
                }
                else{
                  var activityContentCache = (JSON.parse(moodleFactory.Services.GetCacheObject("activity/" + $scope.fuenteDeEnergia.activities[i].coursemoduleid)));
                  if(activityContentCache){                      
                    $scope.fuenteDeEnergia.activities[i].activityContent = activityContentCache;
                  }
                  else
                  {
                    waitPreloader = 1;
                    
                        moodleFactory.Services.GetAsyncActivity($scope.fuenteDeEnergia.activities[i].coursemoduleid, getActivityInfoCallback, getActivityErrorCallback);
                    
                  }  
                }
                                 
                 //moodleFactory.Services.GetAsyncActivity($scope.fuenteDeEnergia.activities[i].coursemoduleid,successfullCallBack, errorCallback);
                 //(JSON.parse(moodleFactory.Services.GetCacheObject("activity/" + $scope.fuenteDeEnergia.activities[i].coursemoduleid)));                 
              }  
              if(waitPreloader == 0){
                $scope.$emit('HidePreloader');
              }
            }

            function getActivityInfoCallback(data, key) {
                  var courseId = key.split('/')[1];

                  for(i = 0; i < $scope.fuenteDeEnergia.activities.length; i++){ 
                    var myActivity = $scope.fuenteDeEnergia.activities[i];
                    if(myActivity.coursemoduleid == courseId) {                      
                      myActivity.activityContent = JSON.parse(moodleFactory.Services.GetCacheObject("activity/" + courseId));
                      myActivity.activityContent.thumbnail = "assets/images/svg/img_placeholder-01.svg";
                      if(myActivity.activity_type == 'resource'){                                           
                          myActivity.activityContent.content[0].fileurl = myActivity.activityContent.content[0].fileurl + "&token=" + $scope.token;
                          if(myActivity.activityContent.content[0].fileurl.indexOf(".mp4") > -1){
                            myActivity.activityintro = "video";
                            myActivity.activity_type = "video";
                            myActivity.activityContent.url = myActivity.activityContent.content[0].fileurl;
                            myActivity.activityContent.thumbnail = myActivity.activityContent.content[1].fileurl + "&token=" + $scope.token;
                          }    
                          if(myActivity.activityContent.content[1]){
                            myActivity.activityContent.content[1].fileurl = myActivity.activityContent.content[1].fileurl + "&token=" + $scope.token;
                            if(myActivity.activityContent.content[1].fileurl.indexOf(".mp4") > -1){
                              myActivity.activityintro = "video";
                              myActivity.activity_type = "video";
                              myActivity.activityContent.url = myActivity.activityContent.content[1].fileurl;
                              myActivity.activityContent.thumbnail = myActivity.activityContent.content[0].fileurl;
                            }
                          }                                                                                          
                      }
                      hidePreloader += 1;
                      break;                      
                    }                    
                  }
                  if(waitPreloader == hidePreloader){
                    $scope.$emit('HidePreloader'); //hide preloader
                  }                  
                }

              function getActivityErrorCallback(){
                hidePreloader += 1;
                if(waitPreloader == hidePreloader){
                    $scope.$emit('HidePreloader'); //hide preloader
                  }  
              }

            /*function getActivityInfoCallback() {
                $scope.activities.push(JSON.parse(moodleFactory.Services.GetCacheObject("activity/" + 80)));
                       
            }*/
             function checkProgress(){              
              for (var i=0; i<$scope.fuenteDeEnergia.activities.length; i++) {                              
                if(!$scope.fuenteDeEnergia.activities[i].optional && $scope.fuenteDeEnergia.activities[i].status){                
                  $scope.statusObligatorios+=1; 
                  starsMandatory += 50;               
                }
                else if (!$scope.fuenteDeEnergia.activities[i].optional && $scope.fuenteDeEnergia.activities[i].status){
                  starsNoMandatory += 50;
                }
              }               
              if($scope.statusObligatorios >= 5 && $scope.fuenteDeEnergia.status == 0){
                $scope.currentPage = 2 ;
              } 
             }                   

            $scope.updateStatus = function(contentId){               
              for (var i=0; i<$scope.fuenteDeEnergia.activities.length; i++) {
              if ($scope.fuenteDeEnergia.activities[i].groupid == contentId) {
                if(!$scope.fuenteDeEnergia.activities[i].status){
                  $scope.fuenteDeEnergia.activities[i].status = true;  
                                   
                  var updatedActivityOnUsercourse = updateSubActivityStatus($scope.fuenteDeEnergia.activities[i].coursemoduleid);  //actualizar arbol
                  _setLocalStorageJsonItem("usercourse", updatedActivityOnUsercourse);
                  _endActivity($scope.fuenteDeEnergia.activities[i]);
                  if(!$scope.fuenteDeEnergia.activities[i].optional){                    
                    $scope.statusObligatorios+=1;    
                    assingStars(true, $scope.fuenteDeEnergia.activities[i].coursemoduleid, $scope.fuenteDeEnergia.activities[i].points);
                    starsMandatory += 50;    
                    if($scope.statusObligatorios >= 5 && !$scope.fuenteDeEnergia.status){
                      $scope.navigateToPage(2);
                    }                  
                  }
                  else{
                    assingStars(false, $scope.fuenteDeEnergia.activities[i].coursemoduleid, $scope.fuenteDeEnergia.activities[i].points);
                    starsNoMandatory+=50;  
                  }                
                }
                break;
                }
              }
            };

            function assingStars(isMandatory, coursemoduleid, stars){
              profile = JSON.parse(moodleFactory.Services.GetCacheObject("profile/" + moodleFactory.Services.GetCacheObject("userId")));              
              var data={
                userId: profile.id,
                stars: stars,
                instance: coursemoduleid,
                instanceType: 0,
                date: getdate()
                };
                console.log("Updating Stars");
              if(starsMandatory < 250 && isMandatory){                
                profile.stars = parseInt(profile.stars)+stars;
                //_setLocalStorageJsonItem('profile', profile);
                moodleFactory.Services.PutStars(data,profile, $scope.token,successfullCallBack, errorCallback);                
              }
              else if(starsNoMandatory < 500){
                profile.stars = parseInt(profile.stars)+stars;              
                //_setLocalStorageJsonItem('profile', profile);    
                moodleFactory.Services.PutStars(data,profile, $scope.token,successfullCallBack, errorCallback);
              }                
            }

            $scope.back = function () {   
            var userCurrentStage = localStorage.getItem("currentStage");              
                $location.path('/'+ stage +'/Dashboard/' + userCurrentStage + '/' + currentChallenge);
            };

            function getdate(){
              var currentdate = new Date(); 
              var datetime = currentdate.getFullYear() + ":"
                + addZeroBefore((currentdate.getMonth()+1))  + ":" 
                + addZeroBefore(currentdate.getDate()) + " "  
                + addZeroBefore(currentdate.getHours()) + ":"  
                + addZeroBefore(currentdate.getMinutes()) + ":" 
                + addZeroBefore(currentdate.getSeconds());
                return datetime;
            }

            function addZeroBefore(n) {
              return (n < 10 ? '0' : '') + n;
            }

            function successfullCallBack(){
                  _updateRewardStatus();
            }

            function errorCallback(){

            }

            function successEndFuente(){
              var userCurrentStage = localStorage.getItem("currentStage"); 
              $scope.$emit('HidePreloader'); //hide preloader
              $location.path('/'+ stage +'/Dashboard/' + userCurrentStage + '/' + currentChallenge);
            }          

            $scope.finishActivity = function(){   
                $scope.$emit('ShowPreloader'); //show preloader           
                var updatedActivityOnUsercourse = updateActivityStatus($scope.fuenteDeEnergia.activity_identifier);  //actualizar arbol
                _setLocalStorageJsonItem("usercourse", updatedActivityOnUsercourse);                
                 //trigger activity type 2 is sent when the activity ends.
                var triggerActivity = 2;                
                var currentUserId = currentUser.userId;
                var activityId = $scope.fuenteDeEnergia.coursemoduleid;
                //create notification
                _createNotification(activityId, triggerActivity);
                //complete stage                
                var like_status = $scope.like_status;
                var data = {userid :  currentUserId, like_status: like_status };
                $scope.fuenteDeEnergia.status = 1;
                // update activity status dictionary used for blocking activity links
                updateActivityStatusDictionary($scope.fuenteDeEnergia.activity_identifier);
                moodleFactory.Services.PutEndActivity(activityId, data, $scope.fuenteDeEnergia, currentUser.token,successEndFuente, function(){$scope.$emit('HidePreloader');});                                                                    
            }            
        }]);