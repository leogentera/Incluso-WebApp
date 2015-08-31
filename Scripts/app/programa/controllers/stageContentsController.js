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
            var moduleid;
            var pagename;                    
            switch($routeParams.moodleid){
              case 'zv_cuartoderecursos_fuentedeenergia':
                moduleid = 112;
                break;
              case 'zv_conocete_fuentedeenergia':
                moduleid = 145;
                break;
              case 'zv_missuenos_fuentedeenergia':
                moduleid = 146;
                break;
            }

            $scope.$emit('ShowPreloader'); //show preloader
            $scope.setToolbar($location.$$path,"");
            $rootScope.showFooter = true; 
            $rootScope.showFooterRocks = false; 
            $scope.statusObligatorios = 0; 
            var waitPreloader = 0;
            var hidePreloader = 0;
            $scope.userprofile = JSON.parse(moodleFactory.Services.GetCacheObject("profile"));                               
            var activities = JSON.parse(moodleFactory.Services.GetCacheObject("activitiesCache/" + moduleid));            
            var currentUser = JSON.parse(moodleFactory.Services.GetCacheObject("CurrentUser"));            
            $scope.token = currentUser.token;
            $scope.scrollToTop();
            //$scope.$emit('HidePreloader'); //hide preloader            
            var starsNoMandatory = 0;
            var starsMandatory = 0;    

            
            var getcoursemoduleids = [];

            if(!activities){
              var activitymanagers = JSON.parse(moodleFactory.Services.GetCacheObject("activityManagers"));
              $scope.fuenteDeEnergia = _.find(activitymanagers,function(a) { 
                                  return a.coursemoduleid == moduleid
                                  });                    
              getDataAsync();    
            }      
            else{
              $scope.fuenteDeEnergia = activities;
              getDataAsync();
              $scope.$emit('HidePreloader'); //hide preloader
            }                                        

            function getDataAsync() {       
            debugger;                                           
              for(i = 0; i < $scope.fuenteDeEnergia.activities.length; i++){                                                
                 var activityCache = (JSON.parse(moodleFactory.Services.GetCacheObject("activity/" + $scope.fuenteDeEnergia.activities[i].coursemoduleid)));
                  if(activityCache){                      
                    $scope.fuenteDeEnergia.activities[i].activityContent = activityCache;
                  }
                  else
                  {
                    waitPreloader += 1;
                    moodleFactory.Services.GetAsyncActivity($scope.fuenteDeEnergia.activities[i].coursemoduleid, getActivityInfoCallback, errorCallback);                 
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
                    if($scope.fuenteDeEnergia.activities[i].coursemoduleid == courseId) {                      
                      $scope.fuenteDeEnergia.activities[i].activityContent = JSON.parse(moodleFactory.Services.GetCacheObject("activity/" + courseId));
                      hidePreloader += 1;
                      break;                      
                    }                    
                  }
                  if(waitPreloader == hidePreloader){
                    $scope.$emit('HidePreloader'); //hide preloader
                  }                  
                }

            /*function getActivityInfoCallback() {
                $scope.activities.push(JSON.parse(moodleFactory.Services.GetCacheObject("activity/" + 80)));
                       
            }*/
                        
            for (var i=0; i<$scope.fuenteDeEnergia.activities.length; i++) {              
              if(!$scope.fuenteDeEnergia.activities[i].optional && $scope.fuenteDeEnergia.activities[i].status){                
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
                  debugger;                 
                  var updatedActivityOnUsercourse = updateSubActivityStatus($scope.fuenteDeEnergia.activities[i].coursemoduleid);  //actualizar arbol
                  localStorage.setItem("usercourse", JSON.stringify(updatedActivityOnUsercourse));
                  _endActivity($scope.fuenteDeEnergia);
                  if(!$scope.fuenteDeEnergia.activities[i].optional){                    
                    $scope.statusObligatorios+=1;    
                    assingStars(true, $scope.fuenteDeEnergia.activities[i].coursemoduleid);
                    starsMandatory += 50;  
                    if($scope.statusObligatorios == 5){
                      $scope.fuenteDeEnergia.status = true;
                      //alert("Prueba: Ya has visto 5 elementos obligatorios");
                      var updatedActivityOnUsercourse = updateActivityStatus($scope.fuenteDeEnergia.activity_identifier);  //actualizar arbol
                      localStorage.setItem("usercourse", JSON.stringify(updatedActivityOnUsercourse));
                      _endActivity($scope.fuenteDeEnergia);
                    }
                  }
                  else{
                    assingStars(false, $scope.fuenteDeEnergia.activities[i].coursemoduleid);
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
                moodleFactory.Services.PutStars(data,$scope.userprofile, $scope.token,successfullCallBack, errorCallback);
                //localStorage.setItem("profile", JSON.stringify($scope.userprofile)); 
              }
              else if(starsNoMandatory < 500){
                $scope.userprofile.stars = parseInt($scope.userprofile.stars)+50;                  
                moodleFactory.Services.PutStars(data,$scope.userprofile, $scope.token,successfullCallBack, errorCallback);
              }                
            }

            $scope.back = function () {
                var userCurrentStage = localStorage.getItem("currentStage");
                $location.path('/ZonaDeVuelo/Dashboard/' + userCurrentStage);
            }

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

            }

            function errorCallback(){

            }
        }]);