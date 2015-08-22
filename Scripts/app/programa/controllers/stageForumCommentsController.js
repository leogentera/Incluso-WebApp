angular
    .module('incluso.stage.forumcommentscontroller', [])
    .controller('stageForumCommentsController', [
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

            $rootScope.pageName = "Estación: Conócete"
            $rootScope.navbarBlue = true;
            $rootScope.showToolbar = true;
            $rootScope.showFooter = true; 
            $rootScope.showFooterRocks = false; 

            $scope.scrollToTop();
            $scope.$emit('HidePreloader'); //hide preloader

            $scope.activity = {
                   id:7,
                   name:"Foro",
                   description:"",
                   activityType:"forum",
                   stars:280,
                   discussions:[
                      {
                         id:3,
                         name: "Topico1",
                         message:"¿cuáles son las ventajas de tener habilidades diferentes? ¿cómo pueden aprovecharse? <a href=\"https://github.com/Sieena/Incluso/wiki/Restful-API\">https://github.com/Sieena/Incluso/wiki/Restful-API</a>",
                         image:[
                            {
                               filename:"foro.jpg",
                               mimetype:"image/jpeg",
                               fileurl:"https://thenypost.files.wordpress.com/2013/11/dog1.jpg"
                            }],
                         posts:[
                            {
                               id:3,
                               discussion:3,
                               parent:null,
                               created:1438628970,
                               subject:"Discusión 1",
                               message:"¿Que te motiva para lograr conseguir tus sueños?",
                               hasAttachment:null,
                               attachments:[
                                  {
                                     filename:"file_attachment.txt",
                                     mimetype:"text\/plain",
                                     fileurl:"http:\/moodle/file_attachment.txt"
                                  },
                                  {
                                     filename:"file_attachment.txt",
                                     mimetype:"text\/plain",
                                     fileurl:"http:\/moodle/file_attachment.txt"
                                  }
                               ],
                               postAutor:"Alias de usuario",
                               picturePostAutor:null,
                               likes:30,
                               liked:null,
                               replies:[
                                  {
                                     id:4,
                                     discussion:3,
                                     parent:3,
                                     created:1438629059,
                                     subject:"Foto",
                                     message:"Les comparto una foto que tome",
                                     hasAttachment:null,
                                     attachments:null,
                                     postAutor:"Alias de usuario",
                                     picturePostAutor:null,
                                     likes:3,
                                     liked:null,
                                  },
                                  {
                                     id:9,
                                     discussion:3,
                                     parent:3,
                                     created:1438722729,
                                     subject:"Re: Discusión 1",
                                     message:"Reply",
                                     hasAttachment:null,
                                     attachments:null,
                                     postAutor:"Alias de usuario",
                                     picturePostAutor:null,
                                     likes:null,
                                     liked:null,
                                     replies:null
                                  }
                               ]
                            },
                            {
                               id:3,
                               discussion:3,
                               parent:null,
                               created:1438628970,
                               subject:"Discusión 1",
                               message:"¿Post 2?",
                               hasAttachment:null,
                               attachments:null,
                               postAutor:"Alias de usuario",
                               picturePostAutor:null,
                               likes:30,
                               liked:null,
                               replies:[
                                  {
                                     id:4,
                                     discussion:3,
                                     parent:3,
                                     created:1438629059,
                                     subject:"Foto",
                                     message:"Les comparto una foto que tome",
                                     hasAttachment:null,
                                     attachments:null,
                                     postAutor:"Alias de usuario",
                                     picturePostAutor:null,
                                     likes:3,
                                     liked:null,
                                  },
                                  {
                                     id:9,
                                     discussion:3,
                                     parent:3,
                                     created:1438722729,
                                     subject:"Re: Discusión 1",
                                     message:"Reply",
                                     hasAttachment:null,
                                     attachments:null,
                                     postAutor:"Alias de usuario",
                                     picturePostAutor:null,
                                     likes:null,
                                     liked:null,
                                     replies:null
                                  },
                                  {
                                     id:9,
                                     discussion:3,
                                     parent:3,
                                     created:1438722729,
                                     subject:"Re: Discusión 1",
                                     message:"Reply 3",
                                     hasAttachment:null,
                                     attachments:null,
                                     postAutor:"Alias de usuario",
                                     picturePostAutor:null,
                                     likes:null,
                                     liked:null,
                                     replies:null
                                  }
                               ]
                            }
                         ]
                      },
                      {
                         id:5,
                         name: "Topico2",
                         message:"¿Que te motiva para lograr conseguir tus sueños?",
                         posts:[
                            {
                               id:3,
                               discussion:3,
                               parent:null,
                               created:1438628970,
                               subject:"Discusión 1",
                               message:"¿Que te motiva para lograr conseguir tus sueños?",
                               hasAttachment:null,
                               attachments:null,
                               postAutor:"Alias de usuario",
                               picturePostAutor:null,
                               likes:30,
                               liked:null,
                               replies:[
                                  {
                                     id:4,
                                     discussion:3,
                                     parent:3,
                                     created:1438629059,
                                     subject:"Foto",
                                     message:"Les comparto una foto que tome",
                                     hasAttachment:null,
                                     attachments:null,
                                     postAutor:"Alias de usuario",
                                     picturePostAutor:null,
                                     likes:3,
                                     liked:null,
                                     replies:[
                                        {
                                           id:5,
                                           discussion:3,
                                           parent:4,
                                           created:1438629110,
                                           subject:"Re: Foto",
                                           message:"Me gusta mucho tu foto",
                                           hasAttachment:null,
                                           attachments:null,
                                           postAutor:"Alias de usuario",
                                           picturePostAutor:null,
                                           likes:4,
                                           liked:null,
                                           replies:[
                                              {
                                                 id:10,
                                                 discussion:3,
                                                 parent:5,
                                                 created:1438724205,
                                                 subject:"Re: Foto",
                                                 message:"Reply",
                                                 hasAttachment:null,
                                                 attachments:null,
                                                 postAutor:null,
                                                 picturePostAutor:null,
                                                 likes:null,
                                                 liked:null,
                                                 replies:null
                                              }
                                           ]
                                        },
                                        {
                                           id:6,
                                           discussion:3,
                                           parent:4,
                                           created:1438629137,
                                           subject:"Re: Foto",
                                           message:"Ahí salgo yooo jajajaja",
                                           hasAttachment:null,
                                           attachments:null,
                                           postAutor:"Alias de usuario 1",
                                           picturePostAutor:null,
                                           likes:1,
                                           liked:null,
                                           replies:[
                                              {
                                                 id:11,
                                                 discussion:3,
                                                 parent:6,
                                                 created:1438724232,
                                                 subject:"Re: Foto",
                                                 message:"Reply",
                                                 hasAttachment:null,
                                                 attachments:null,
                                                 postAutor:null,
                                                 picturePostAutor:null,
                                                 likes:null,
                                                 liked:null,
                                                 replies:null
                                              }
                                           ]
                                        },
                                        {
                                           id:7,
                                           discussion:3,
                                           parent:4,
                                           created:1438629183,
                                           subject:"Re: Foto",
                                           message:"Me encanta",
                                           hasAttachment:null,
                                           attachments:null,
                                           postAutor:"Alias de usuario",
                                           picturePostAutor:null,
                                           likes:null,
                                           liked:null,
                                           replies:null
                                        },
                                        {
                                           id:8,
                                           discussion:3,
                                           parent:4,
                                           created:1438630789,
                                           subject:"Re: Foto",
                                           message:"Revisen",
                                           hasAttachment:"1",
                                           attachments:[
                                              {
                                                 filename:"file_attachment.txt",
                                                 mimetype:"text\/plain",
                                                 fileurl:"http:\/moodle/file_attachment.txt"
                                              }
                                           ],
                                           postAutor:"Alias de usuario 1",
                                           picturePostAutor:null,
                                           likes:null,
                                           liked:null,
                                           replies:null
                                        }
                                     ]
                                  },
                                  {
                                     id:9,
                                     discussion:3,
                                     parent:3,
                                     created:1438722729,
                                     subject:"Re: Discusión 1",
                                     message:"Reply",
                                     hasAttachment:null,
                                     attachments:null,
                                     postAutor:"Alias de usuario",
                                     picturePostAutor:null,
                                     likes:null,
                                     liked:null,
                                     replies:null
                                  }
                               ]
                            }
                         ]
                      }
                   ]
                };

            $scope.discussion = _.find($scope.activity.discussions, function(d){ return d.id == $routeParams.discussionId; });


            function getDataAsync() {
                moodleFactory.Services.GetAsyncActivity(64, getActivityInfoCallback);
//                moodleFactory.Services.GetAsyncActivity($routeParams.moodleid, getActivityInfoCallback);
            }

            function getActivityInfoCallback() {
                $scope.activity = JSON.parse(moodleFactory.Services.GetCacheObject("activity/" + $routeParams.moodleid));
            }

            getDataAsync();

            $scope.back = function () {
               $location.path('ZonaDeVuelo/Conocete/PuntoDeEncuentro/Topicos/zv_puntodeencuentro#top');
               //$location.path('/ProgramaDashboard');
            }

        }]);