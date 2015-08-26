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

            _httpFactory = $http;
            $rootScope.pageName = "Zona de Vuelo"
            $scope.$emit('ShowPreloader'); //show preloader
            $rootScope.navbarBlue = true;
            $rootScope.showToolbar = true;
            $rootScope.showFooter = true; 
            $rootScope.showFooterRocks = false; 
            $scope.userprofile = JSON.parse(moodleFactory.Services.GetCacheObject("profile"));                               
            var activities = JSON.parse(moodleFactory.Services.GetCacheObject("activitiesCache/112"));            
            var currentUser = JSON.parse(moodleFactory.Services.GetCacheObject("CurrentUser"));            
            $scope.scrollToTop();
            //$scope.$emit('HidePreloader'); //hide preloader            
            var starsNoMandatory = 0;
            var starsMandatory = 0;    
            var getcoursemoduleids = [];  
      
            if(!activities){
              var activitymanagers = JSON.parse(moodleFactory.Services.GetCacheObject("activityManagers"));
              $scope.fuenteDeEnergia = _.find(activitymanagers,function(a) { 
                                  return a.coursemoduleid == 112
                                  });                    
              getDataAsync();    
            }      
            else{
              $scope.fuenteDeEnergia = activities;
              $scope.$emit('HidePreloader'); //hide preloader
            }                      
            $scope.statusObligatorios = 0;        

            function getDataAsync() {                                    
              for(i = 0; i < $scope.fuenteDeEnergia.activities.length; i++){                                
                 var activityCache = (JSON.parse(moodleFactory.Services.GetCacheObject("activitiesCache/" + $scope.fuenteDeEnergia.activities[i].coursemoduleid)));
                  if(activityCache){                    
                    $scope.fuenteDeEnergia.activities[i] = activityCache;
                  }
                  else
                  {
                    moodleFactory.Services.GetAsyncActivity($scope.fuenteDeEnergia.activities[i].coursemoduleid, getActivityInfoCallback, errorCallback);                 
                  }                  
                 //moodleFactory.Services.GetAsyncActivity($scope.fuenteDeEnergia.activities[i].coursemoduleid,successfullCallBack, errorCallback);
                 //(JSON.parse(moodleFactory.Services.GetCacheObject("activity/" + $scope.fuenteDeEnergia.activities[i].coursemoduleid)));                 
              }                      
            }

            function getActivityInfoCallback(data, key) {
                  var courseId = key.split('/')[1];

                  for(i = 0; i < $scope.fuenteDeEnergia.activities.length; i++){ 
                    if($scope.fuenteDeEnergia.activities[i].coursemoduleid == courseId) {                      
                      $scope.fuenteDeEnergia.activities[i].activityContent = JSON.parse(moodleFactory.Services.GetCacheObject("activity/" + courseId));
                      break;
                    }                    
                  }
                  $scope.$emit('HidePreloader'); //hide preloader
                }

            /*function getActivityInfoCallback() {
                $scope.activities.push(JSON.parse(moodleFactory.Services.GetCacheObject("activity/" + 80)));
                       
            }*/
                        
            for (var i=0; i<$scope.fuenteDeEnergia.activities.length; i++) {              
              if($scope.fuenteDeEnergia.activities[i].optional && $scope.fuenteDeEnergia.activities[i].status){                
                $scope.statusObligatorios+=1; 
                starsMandatory += 50;               
              }
              else if (!$scope.fuenteDeEnergia.activities[i].optional && $scope.fuenteDeEnergia.activities[i].status){
                starsNoMandatory += 50;
              }
            }

            $scope.updateStatus = function(contentId){                              
              for (var i=0; i<$scope.fuenteDeEnergia.activities.length; i++) {
              if ($scope.fuenteDeEnergia.activities[i].groupid == contentId) {
                if(!$scope.fuenteDeEnergia.activities[i].status){
                  $scope.fuenteDeEnergia.activities[i].status = true;                     
                  _endActivity($scope.fuenteDeEnergia.activities[i]);
                  if($scope.fuenteDeEnergia.activities[i].optional){                    
                    $scope.statusObligatorios+=1;    
                    assingStars(true, $scope.fuenteDeEnergia.activities[i].coursemoduleid);
                    starsMandatory += 50;  
                    if($scope.statusObligatorios == 5){
                      $scope.fuenteDeEnergia.status = true;
                      //alert("Prueba: Ya has visto 5 elementos obligatorios");
                      _endActivity($scope.fuenteDeEnergia);
                    }
                  }
                  else{
                    assingStars(true, $scope.fuenteDeEnergia.activities[i].coursemoduleid);
                    starsNoMandatory+=50;  
                  }                
                }
                break;
                }
              }
            }

            function assingStars(isMandatory, coursemoduleid){
              var data={
                userId: $scope.userprofile.id,
                stars: 50,
                instance: coursemoduleid,
                instanceType: 0,
                date: getdate()
                };
              if(starsMandatory < 250 && isMandatory){                
                $scope.userprofile.stars = parseInt($scope.userprofile.stars)+50;
                moodleFactory.Services.PutStars(data,$scope.userprofile, currentUser.token,successfullCallBack, errorCallback);
                //localStorage.setItem("profile", JSON.stringify($scope.userprofile)); 
              }
              else if(starsNoMandatory < 500){
                $scope.userprofile.stars = parseInt($scope.userprofile.stars)+50;                  
                moodleFactory.Services.PutStars(data,$scope.userprofile, currentUser.token,successfullCallBack, errorCallback);
              }                
            }

            $scope.back = function () {
                $location.path('/ProgramaDashboard');
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

            function successfullCallBack(){

            }

            function errorCallback(){

            }
        }]);