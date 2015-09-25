angular
.module('incluso.programa.album', [])
.controller('AlbumInclusoController', [
    '$q',
    '$scope',
    '$location',
    '$routeParams',
    '$timeout',
    '$rootScope',
    '$http',
    '$modal',
    '$filter',
    function ($q, $scope, $location, $routeParams, $timeout, $rootScope, $http, $modal, $filter) {
        
        $scope.setToolbar($location.$$path, "Album Incluso");
        $rootScope.showFooter = false;
        $rootScope.showFooterRocks = false;
        $scope.isShareCollapsed = false;
        $scope.showSharedAlbum = false;
        $scope.sharedAlbumMessage = null;
        
        var _course = moodleFactory.Services.GetCacheJson("course");
        var _userId = moodleFactory.Services.GetCacheObject("userId");
        var _userProfile = moodleFactory.Services.GetCacheJson("profile/" + moodleFactory.Services.GetCacheObject("userId"));
        $scope.hasCommunityAccess = _hasCommunityAccessLegacy(_userProfile.communityAccess);
        var albumSrc = null;
        $scope.avatarSrc = null;
        
        $scope.discussion = null;
        $scope.forumId = null;

        
        $scope.$emit('ShowPreloader');
        
        $timeout(function () {
            //apply carousel to album layout
            var owlAlbum = $("#owlAlbum");

            owlAlbum.owlCarousel({
                navigation: false,
                pagination: false,
                goToFirstSpeed: 2000,
                singleItem: true,
                autoHeight: true,
                touchDrag: false,
                mouseDrag: false,
                transitionStyle: "fade",
                afterInit: function (el) {}
            });

            $(".next").click(function (ev) {
                $scope.scrollToTop();
                owlAlbum.trigger('owl.next');
                ev.preventDefault();

            });

            $(".back").click(function (ev) {
                $scope.scrollToTop();
                owlAlbum.trigger('owl.prev');
                ev.preventDefault();
            });            
        }, 1000);

        $scope.message = "Todos los logros en un solo lugar. <br/> Recuerda lo vivido en esta misi&#243;n y no te olvides de continuar con tus prop&#243;sitos.";
        
        $scope.postTextToCommunity = function(){
            
            $scope.$emit('ShowPreloader');
                
            if ($scope.discussion == null || $scope.forumId == null) {
                
                moodleFactory.Services.GetAsyncForumDiscussions(_course.community.coursemoduleid, function(data, key) {
                    
                    $scope.discussion = data.discussions[0];
                    $scope.forumId = data.forumid;
                    generateAlbumImgSrc(postAlbumToCommunity);
                    
                    }, function(data){
                        $scope.sharedAlbumMessage = null;
                        $scope.isShareCollapsed = false;
                        $scope.showSharedAlbum = false;
                        $scope.$emit('HidePreloader');
                    }, true);
            } else {
                generateAlbumImgSrc(postAlbumToCommunity);
            }
            
        };
        
        function getFileName(id) {
            var filename = "";

            switch (id) {
                case 2:
                    filename = "insignias-combustible.gif";
                    break;
                case 3:
                    filename = "insignias-turbina.gif";
                    break;
                case 4:
                    filename = "insignias-ala.gif";
                    break;
                case 5:
                    filename = "insignias-sist-navegacion.gif";
                    break;
                case 6:
                    filename = "insignias-propulsor.gif";
                    break;
                case 7:
                    filename = "insignias-misiles.gif";
                    break;
                case 8:
                    filename = "insignias-campodefuerza.gif";
                    break;
                case 9:
                    filename = "insignias-radar.gif";
                    break;
                case 10:
                    filename = "insignias-tanqueoxigeno.gif";
                    break;
                case 11:
                    filename = "insignias-sondaespacial.gif";
                    break;
                case 12:
                    filename = "insignias-foro.gif";
                    break;
                case 13:
                    filename = "insignias-id.gif";
                    break;
                case 14:
                    filename = "insignias-participacion.gif";
                    break;
                case 15:
                    filename = "insignias-corazon.gif";
                    break;
                case 16:
                    filename = "insignias-casco.gif";
                    break;
                case 17:
                    filename = "insignias-radio.gif";
                    break;
                case 18:
                    filename = "insignias-turbo.gif";
                    break;
                default:
                    filename = "insignia-bloqueada.gif";
            }

            return filename;
        }

        function getAlt(id) {
            var alt = "";

            switch (id) {
                case 2:
                    alt = "combustible";
                    break;
                case 3:
                    alt = "turbina";
                    break;
                case 4:
                    alt = "ala";
                    break;
                case 5:
                    alt = "sist-navegacion";
                    break;
                case 6:
                    alt = "propulsor";
                    break;
                case 7:
                    alt = "misiles";
                    break;
                case 8:
                    alt = "campodefuerza";
                    break;
                case 9:
                    alt = "radar";
                    break;
                case 10:
                    alt = "tanqueoxigeno";
                    break;
                case 11:
                    alt = "sondaespacial";
                    break;
                case 12:
                    alt = "foro";
                    break;
                case 13:
                    alt = "id";
                    break;
                case 14:
                    alt = "participacion";
                    break;
                case 15:
                    alt = "corazon";
                    break;
                case 16:
                    alt = "casco";
                    break;
                case 17:
                    alt = "radio";
                    break;
                case 18:
                    alt = "turbo";
                    break;
                default:
                    alt = "bloqueada";
            }

            return alt;
        }

        controllerInit();

        function controllerInit() {
            
            $scope.album = JSON.parse(_getItem("album"));
            $scope.currentUser = JSON.parse(localStorage.getItem("CurrentUser"));

            if ($scope.album == null) {
                if ($scope.currentUser.userId != null) {
                    moodleFactory.Services.GetAsyncAlbum($scope.currentUser.userId, successfullCallBack, errorCallback, true);
                }
                else {
                    //Albun no reachable
                }
            }
            else {
                generateAvatarImgSrc();
                $scope.$emit('HidePreloader');
            }
        }

        function successfullCallBack(albumData) {
            if (albumData != null) {
                _setLocalStorageJsonItem("album", albumData);
                //get names for badges
                for(var i=0; i<albumData.badges.length; i++){
                    albumData.badges[i].filename = getFileName(albumData.badges[i].id);
                    albumData.badges[i].alt = getAlt(albumData.badges[i].id);
                }

                $scope.album = albumData;
                generateAvatarImgSrc();
                $scope.$emit('HidePreloader');
            }
            else {
                //Albun no reachable
            }
        }
        
        function generateAlbumImgSrc(callback) {
            
            if (albumSrc == null) {
                    var svgString = new XMLSerializer().serializeToString(document.querySelector('svg'));
                    var svg = new Blob([svgString], {type: "image/svg+xml;charset=utf-8"});
                    var DOMURL = self.URL || self.webkitURL || self;
                    var url = DOMURL.createObjectURL(svg);
                    
                    var canvas = document.getElementById("canvas");
                    var ctx = canvas.getContext("2d");
                    
                    var img = new Image();
                    img.onload = function() {
                        ctx.drawImage(img, 0, 0);
                        albumSrc = canvas.toDataURL("image/png");
                        callback();
                    };
                    img.src = url;
            }else{
                callback();   
            }
        }
        
        function generateAvatarImgSrc() {
            
            $timeout(function(){
                if ($scope.avatarSrc == null) {
                var canvas = document.getElementById("canvasAvatar");
                var ctx = canvas.getContext("2d");
                
                var img = new Image();
                img.width = "127px";
                img.height = "155px";
                img.crossOrigin="Anonymous";
                img.onload = function() {
                    ctx.drawImage(img, 0, 0);
                    $scope.avatarSrc = canvas.toDataURL("image/png");
                    console.log($scope.avatarSrc);
                };
                img.src = $scope.album.profileimageurl;
            }
                }, 3000)
        }
        
        function postAlbumToCommunity() {
            
                var requestData = {
                    "userid": _userId,
                    "discussionid": $scope.discussion.discussion,
                    "parentid": $scope.discussion.id,
                    "message": $scope.sharedAlbumMessage,
                    "createdtime": $filter("date")(new Date(), "MM/dd/yyyy"),
                    "modifiedtime": $filter("date")(new Date(), "MM/dd/yyyy"),
                    "posttype": 4,
                    "filecontent":albumSrc.replace("data:image/png;base64", ""),
                    "filename": 'album.png',
                    "picture_post_author": _userProfile.profileimageurlsmall
                };
                
                moodleFactory.Services.PostAsyncForumPost ('new_post', requestData,
                    function() {
                        $scope.sharedAlbumMessage = null;
                        $scope.isShareCollapsed = false;
                        $scope.showSharedAlbum = true;
                        $scope.$emit('HidePreloader');
                    },
                    function(){
                        $scope.sharedAlbumMessage = null;
                        $scope.isShareCollapsed = false;
                        $scope.showSharedAlbum = false;
                        $scope.$emit('HidePreloader');
                    }
                );
        }

    }]);