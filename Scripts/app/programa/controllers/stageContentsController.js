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
            $rootScope.pageName = "Estación: Conócete"
            $rootScope.navbarBlue = true;
            $rootScope.showToolbar = true;
            $rootScope.showFooter = true; 
            $rootScope.showFooterRocks = false; 
            $scope.userprofile = JSON.parse(moodleFactory.Services.GetCacheObject("profile"));     
            var course = JSON.parse(localStorage.getItem("course"));            
            $scope.scrollToTop();
            $scope.$emit('HidePreloader'); //hide preloader
            $scope.jsonActivities = [];            
            var starsNoMandatory = 0;
            var starsMandatory = 0;

            $scope.statusObligatorios = 0;            
            $scope.activities={id:50,
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
                                        path: "assets/images/avatar.svg"
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
                               };

             for (var i=0; i<$scope.activities.activity.length; i++) {
              if ($scope.activities.activity[i].isVideo) {
                $scope.activities.activity[i].activityType = "video";                
              }
              if($scope.activities.activity[i].mandatory && $scope.activities.activity[i].seen){                
                $scope.statusObligatorios+=1; 
                starsMandatory += 50;               
              }
              else if (!$scope.activities.activity[i].mandatory && $scope.activities.activity[i].seen){
                starsNoMandatory += 50;
              }
            }

            $scope.updateStatus = function(contentId){                        
              for (var i=0; i<$scope.activities.activity.length; i++) {
              if ($scope.activities.activity[i].id == contentId) {
                if(!$scope.activities.activity[i].seen){
                  $scope.activities.activity[i].seen = true; 
                  if($scope.activities.activity[i].mandatory){                    
                    $scope.statusObligatorios+=1;    
                    assingStars(true);
                    starsMandatory += 50;  
                    if($scope.statusObligatorios == 5){
                      $scope.activities.completed = true;
                      alert("Prueba: Ya has visto 5 elementos obligatorios");
                      $scope.activities.completed = true;
                    }
                  }
                  else{
                    assingStars(false);
                    starsNoMandatory+=50;  
                  }                
                }
                break;
                }
              }
            }

            function assingStars(isMandatory){
              if(starsMandatory < 250 && isMandatory){
                $scope.userprofile.stars += 50;   
                alert("Tienes "+$scope.userprofile.stars+" estrellas")
                localStorage.setItem("profile", JSON.stringify($scope.userprofile)); 
              }
              else if(starsNoMandatory < 500){
                $scope.userprofile.stars += 50;   
                alert("Tienes "+$scope.userprofile.stars+" estrellas")
                localStorage.setItem("profile", JSON.stringify($scope.userprofile));           
              }                
            }

            function getDataAsync() {
                moodleFactory.Services.GetAsyncActivity(80, getActivityInfoCallback);
            }

            function getActivityInfoCallback() {
                $scope.jsonActivities.push(JSON.parse(moodleFactory.Services.GetCacheObject("activity/" + 80)));   
                       
            }

            //getDataAsync();

            $scope.back = function () {
                $location.path('/ProgramaDashboard');
            }

        }]);