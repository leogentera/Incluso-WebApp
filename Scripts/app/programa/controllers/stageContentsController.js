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
            $rootScope.navbarBlue = true;
            $rootScope.showToolbar = true;
            $rootScope.showFooter = true; 
            $rootScope.showFooterRocks = false; 
            $scope.userprofile = JSON.parse(moodleFactory.Services.GetCacheObject("profile"));                               
            var activities = JSON.parse(moodleFactory.Services.GetCacheObject("activities"));            
            var currentUser = JSON.parse(moodleFactory.Services.GetCacheObject("CurrentUser"));            
            $scope.scrollToTop();
            $scope.$emit('HidePreloader'); //hide preloader            
            var starsNoMandatory = 0;
            var starsMandatory = 0;            
            if(!activities){
              var activitymanagers = JSON.parse(moodleFactory.Services.GetCacheObject("activityManagers"));
              $scope.fuenteDeEnergia = _.find(activitymanagers,function(a) { 
                                  return a.coursemoduleid == 112
                                  });                    
              getDataAsync();    
            }      
            else{
              $scope.fuenteDeEnergia = activities;
            }                      
            $scope.statusObligatorios = 0;                     

                                          /*{id:50,
                              completed:false, 
                              activity:
                                [{id: 12,
                                  name: "File 1",
                                  description: "Lorem ipsum",
                                  activityType: "file",
                                  mandatory: true,
                                  seen:false,
                                  stars: 200,
                                  file: {
                                        id: 3,
                                        filename: "Archivo 1.txt",
                                        path: "assets/images/avatar.svg",
                                        pageContent:"\u003Cp\u003E\u003Cbr\u003EContenido ejemplo de fotografía\u003C\/p\u003E"
                                      }
                                  },
                                  {id: 16,
                                  name: "URL 1",
                                  description: "Lorem ipsum",
                                  activityType: "url",
                                  isVideo: false,
                                  mandatory: false,
                                  seen:false,
                                  stars: 200,
                                  url: "http:\/\/www.facebook.com"
                                  },
                                 {id:3,
                                    name:"Contenido ejemplo",
                                    description:null,
                                    activityType:"page",
                                    mandatory: true,
                                    seen:false,
                                    stars:null,
                                    pageContent:"\u003Cp\u003E\u003Cbr\u003EContenido ejemplo\u003C\/p\u003E"
                                  },
                                  {id:8,
                                    name:"Contenido ejemplo",
                                    description:null,
                                    activityType:"page",
                                    mandatory: false,
                                    seen:false,
                                    stars:null,
                                    pageContent:"\u003Cp\u003E\u003Cbr\u003EOtro Contenido ejemplo\u003C\/p\u003E"
                                  },
                                 {id: 15,
                                  name: "URL 1",
                                  description: "Lorem ipsum",
                                  activityType: "url",
                                  isVideo: false,
                                  mandatory: false,
                                  seen:false,
                                  stars: 200,
                                  url: "http:\/\/www.google.com"
                                  },
                                  {id: 18,
                                  name: "URL 1",
                                  description: "Lorem ipsum",
                                  activityType: "url",
                                  isVideo: false,
                                  mandatory: false,
                                  seen:false,
                                  stars: 200,
                                  url: "http:\/\/www.elnorte.com"
                                  },
                                  {id:7,
                                  name:"Mira  hasta donde eres capaz de llegar \u00a1Los l\u00edmites los pones t\u00fa!",
                                  description:"video",
                                  activityType:"url",
                                  isVideo: true,
                                  mandatory: true,
                                  seen:false,
                                  stars:null,
                                  url:"https:\/\/www.youtube.com\/embed\/watch?v=ocrjltwc_Fs"
                                  },
                                  { id:6,
                                    name:"Recuerda cu\u00e1les eran tus juguetes favoritos y descubre m\u00e1s sobre tus inteligencias",
                                    description:"\u003Cbr\u003E",
                                    activityType:"url",
                                    stars:null,
                                    isVideo: false,
                                    mandatory: true,
                                    seen:false,
                                    url:"http:\/\/www.imaginarium.es\/images2\/club-acciones\/test_intelig_CAST.pdf"
                                  },
                                  {
                                    id:4,
                                    name:"Contenido",
                                    description:null,
                                    activityType:"page",
                                    stars:null,
                                    mandatory: true,
                                    seen:false,
                                    pageContent:"\u003Cp\u003E\u003Cspan lang=\u0022EN-US\u0022 style=\u0027font-family: \u0022Calibri\u0022,sans-serif; font-size: 11pt; mso-fareast-font-family: Calibri; mso-fareast-theme-font: minor-latin; mso-bidi-font-family: \u0022Times New Roman\u0022; mso-ansi-language: EN-US; mso-fareast-language: ES-MX; mso-bidi-language: AR-SA;\u0027\u003EM00dleAdmin!\u003C\/span\u003E\u003Cbr\u003E\u003C\/p\u003E"
                                  },
                                  {
                                    id:9,
                                    name:"Contenido",
                                    description:null,
                                    activityType:"page",
                                    stars:null,
                                    mandatory: false,
                                    seen:false,
                                    pageContent:"\u003Cp\u003EEjemplo html\u003Cbr\u003Econ \u003Cstrong\u003Enegritas\u003C\/strong\u003E\u003C\/p\u003E"
                                  }
                                 ]
                               };*/            

            function getDataAsync() {                      
              for(i = 0; i < $scope.fuenteDeEnergia.activities.length; i++){                  
                 $scope.fuenteDeEnergia.activities[i].activityContent = (JSON.parse(moodleFactory.Services.GetCacheObject("activity/" + $scope.fuenteDeEnergia.activities[i].coursemoduleid)));
                
                 //moodleFactory.Services.GetAsyncActivity($scope.fuenteDeEnergia.activities[i].coursemoduleid,successfullCallBack, errorCallback);
                 //(JSON.parse(moodleFactory.Services.GetCacheObject("activity/" + $scope.fuenteDeEnergia.activities[i].coursemoduleid)));                 
              }                          
              
            }

            /*function getActivityInfoCallback() {
                $scope.activities.push(JSON.parse(moodleFactory.Services.GetCacheObject("activity/" + 80)));
                       
            }*/
            

            for (var i=0; i<$scope.fuenteDeEnergia.activities.length; i++) {              
              if($scope.fuenteDeEnergia.activities[i].mandatory && $scope.fuenteDeEnergia.activities[i].status){                
                $scope.statusObligatorios+=1; 
                starsMandatory += 50;               
              }
              else if (!$scope.fuenteDeEnergia.activities[i].mandatory && $scope.fuenteDeEnergia.activities[i].status){
                starsNoMandatory += 50;
              }
            }

            $scope.updateStatus = function(contentId){                              
              for (var i=0; i<$scope.fuenteDeEnergia.activities.length; i++) {
              if ($scope.fuenteDeEnergia.activities[i].groupid == contentId) {
                if(!$scope.fuenteDeEnergia.activities[i].status){
                  $scope.fuenteDeEnergia.activities[i].status = true;                   
                  moodleFactory.Services.PutEndActivity($scope.fuenteDeEnergia.activities[i].coursemoduleid,$scope.userprofile.id, $scope.fuenteDeEnergia, currentUser.token, successfullCallBack, errorCallback);
                  if($scope.fuenteDeEnergia.activities[i].mandatory){                    
                    $scope.statusObligatorios+=1;    
                    assingStars(true, $scope.fuenteDeEnergia.activities[i].coursemoduleid);
                    starsMandatory += 50;  
                    if($scope.statusObligatorios == 5){
                      $scope.fuenteDeEnergia.status = true;
                      alert("Prueba: Ya has visto 5 elementos obligatorios");
                      moodleFactory.Services.PutEndActivity($scope.fuenteDeEnergia.coursemoduleid,$scope.userprofile.id, $scope.fuenteDeEnergia, currentUser.token,successfullCallBack, errorCallback);
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