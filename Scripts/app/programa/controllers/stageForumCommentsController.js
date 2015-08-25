angular
    .module('incluso.stage.forumcommentscontroller', ['GlobalAppConstants'])
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
       '$filter',
       'MoodleIds',
       function ($q, $scope, $location, $routeParams, $timeout, $rootScope, $http, $anchorScroll, $modal, $filter, MoodleIds) {

          $rootScope.pageName = "Estación: Conócete"
          $rootScope.navbarBlue = true;
          $rootScope.showToolbar = true;
          $rootScope.showFooter = true;
          $rootScope.showFooterRocks = false;

          $scope.scrollToTop();
          $scope.$emit('HidePreloader'); //hide preloader

          $scope.isTextCollapsed = true;
          $scope.collapseText = function(){
             $scope.isTextCollapsed = !$scope.isTextCollapsed;
             $scope.isLinkCollapsed = true;
             $scope.isVideoCollapsed = true;
             $scope.isAttachmentCollapsed = true;
          };
          $scope.isLinkCollapsed = true;
          $scope.collapseLink = function(){
             $scope.isLinkCollapsed = !$scope.isLinkCollapsed;
             $scope.isTextCollapsed = true;
             $scope.isVideoCollapsed = true;
             $scope.isAttachmentCollapsed = true;
          };
          $scope.isVideoCollapsed = true;
          $scope.collapseVideo = function(){
             $scope.isVideoCollapsed = !$scope.isVideoCollapsed;
             $scope.isTextCollapsed = true;
             $scope.isLinkCollapsed = true;
             $scope.isAttachmentCollapsed = true;
          };
          $scope.isAttachmentCollapsed = true;
          $scope.collapseAttachment = function(){
             $scope.isAttachmentCollapsed = !$scope.isAttachmentCollapsed;
             $scope.isTextCollapsed = true;
             $scope.isLinkCollapsed = true;
             $scope.isVideoCollapsed = true;
          };

          $scope.isCommentModalCollapsed= [];

          $scope.textToPost = null;
          $scope.linkToPost = null;
          $scope.videoToPost = null;
          $scope.attachmentToPost = null;

          var userId = localStorage.getItem("userId");
          $scope.postTextToForum = function(){

             var dataObject = {
                "userid":userId,
                "discussionid": $scope.discussion.posts[0].discussion,
                "parentid": $scope.discussion.posts[0].id,
                "message": $scope.textToPost,
                "createdtime": $filter('date')(new Date(), 'MM/dd/yyyy'),
                "modifiedtime": $filter('date')(new Date(), 'MM/dd/yyyy'),
                "posttype": 1,
                "fileToUpload":""
             };

             moodleFactory.Services.PostAsyncForumPost ('new_post', dataObject, function(){alert('Success!!');$scope.textToPost='';}, function(){alert('Fail!!'); $scope.textToPost=null; $scope.isTextCollapsed = true;});

          };
          $scope.postLinkToForum = function(){
             var dataObject = {
                "userid":userId,
                "discussionid": $scope.discussion.posts[0].discussion,
                "parentid": $scope.discussion.posts[0].id,
                "message": $scope.linkToPost,
                "createdtime": $filter('date')(new Date(), 'MM/dd/yyyy'),
                "modifiedtime": $filter('date')(new Date(), 'MM/dd/yyyy'),
                "posttype": 2,
                "fileToUpload":""
             };
             moodleFactory.Services.PostAsyncForumPost ('new_post', dataObject, function(){alert('Success!!'); $scope.linkToPost = null;}, function(){alert('Fail!!'); $scope.linkToPost = null; $scope.isLinkCollapsed = true;});
          };
          $scope.postVideoToForum = function(){
             var dataObject = {
                "userid":userId,
                "discussionid": $scope.discussion.posts[0].discussion,
                "parentid": $scope.discussion.posts[0].id,
                "message": $scope.videoToPost,
                "createdtime": $filter('date')(new Date(), 'MM/dd/yyyy'),
                "modifiedtime": $filter('date')(new Date(), 'MM/dd/yyyy'),
                "posttype": 3,
                "fileToUpload":""
             };
             moodleFactory.Services.PostAsyncForumPost ('new_post', dataObject, function(){alert('Success!!'); $scope.videoToPost = null;}, function(){alert('Fail!!');$scope.videoToPost = null; $scope.isVideoCollapsed = true; });
          };
          $scope.postAttachmentToForum = function(){
             alert("Posting ATTACHMENT in the forum " + $scope.attachmentToPost);
          };


          /*$scope.activity = {
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
           };*/

          //$scope.discussion = _.find($scope.activity.discussions, function(d){ return d.discussionId == 3; });

          function getDataAsync() {
             moodleFactory.Services.GetAsyncActivity(64, getActivityInfoCallback);
          }

          function getActivityInfoCallback() {
             //$scope.activity = JSON.parse(moodleFactory.Services.GetCacheObject("activity/" + $routeParams.moodleid + "/" + $routeParams.discussionId));
             $scope.activity = JSON.parse(moodleFactory.Services.GetCacheObject("activity/" + $routeParams.moodleid ));
             $scope.discussion = _.find($scope.activity.discussions, function(d){ return d.id == $routeParams.discussionId; });
             var posts = $scope.discussion.posts[0].replies;
             console.log(posts);
             posts.forEach(createModalReferences);
          }

          getDataAsync();

          //$scope.isCommentModalCollapsed= [];
          //$scope.collapseCommentModal = function(){


          //};
          var createModalReferences = function(element, index, array){
             $scope.isCommentModalCollapsed[index] = true;
          };


          $scope.back = function () {
             $location.path('ZonaDeVuelo/Conocete/PuntoDeEncuentro/Topicos/'+ MoodleIds.forum);
             //$location.path('/ProgramaDashboard');
          };

          $scope.testClick = function(){
             alert("Testing clicks");
          };

       }]);