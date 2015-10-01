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
        $rootScope.showStage1Footer = false;
        $rootScope.showStage2Footer = false;
        $rootScope.showStage3Footer = false;
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
        
        var canvas = document.getElementById('canvas');
        var ctx = canvas.getContext("2d");
        //canvas.width = 1280;
        //canvas.height = 1329;

        
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
                postAlbumToCommunity();
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
                $scope.$emit('HidePreloader');
            }
            else {
                //Albun no reachable
            }
        }
        
        function generateAlbumImgSrc(callback) {
            
            if (albumSrc == null) {
                var imgBackground = new Image();
                
                imgBackground.onload = function(){
                    ctx.drawImage(imgBackground, 0, 0, 1280, 1329);
                    
                    // Shield
                    ctx.translate(140, 515);
                    ctx.rotate(0.01);
                    ctx.font = '16px Calibri';
                    ctx.fillStyle = 'white';
                    wrapText(ctx, "mi es escudo es este ejemplo po rquefk  ", 0, 0, 200, 15);
                    ctx.restore();
                    
                    // mis habilidades
                    ctx.translate(60, 150);
                    ctx.rotate(0.03);
                    wrapText(ctx, "habilidad 1", 0, 0, 200, 15);
        
                    ctx.translate(0, 35);
                    ctx.rotate(-0.01);
                    wrapText(ctx, "habilidad 2", 0, 0, 200, 15);
                    
                    // lo que me gusta
                    ctx.translate(0, 199);
                    ctx.rotate(0.01);
                    wrapText(ctx, "Musica", 0, 0, 200, 15);
                    
                    ctx.translate(0, 37);
                    ctx.rotate(0.01);
                    wrapText(ctx, "Deportes", 0, 0, 200, 15);
                    
                    // Mis cualidades
                    ctx.translate(5, 190);
                    ctx.rotate(0.01);
                    wrapText(ctx, "Cualidad 1", 0, 0, 200, 15);
                    
                    ctx.translate(0, 37);
                    ctx.rotate(0.01);
                    wrapText(ctx, "Cualidad 2", 0, 0, 200, 15);
                    ctx.restore();
                    
                    // Lo que me impulsa
                    ctx.translate(320, -935);
                    ctx.rotate(0);
                    wrapText(ctx, "Mi Familia", 0, 0, 200, 15);
                    
                    ctx.translate(0, 37);
                    ctx.rotate(0);
                    wrapText(ctx, "Mi trabajo", 0, 0, 200, 15);
                    
                    // Mis sueños
                    ctx.translate(20, 170);
                    ctx.rotate(-0.1);
                    wrapText(ctx, "Trabajar", 0, 0, 200, 15);
                    
                    ctx.translate(0, 37);
                    ctx.rotate(0);
                    wrapText(ctx, "Ser el mejor", 0, 0, 200, 15);
                    
                    // Mis planes a futuro
                    ctx.translate(20, 170);
                    ctx.rotate(0);
                    wrapText(ctx, "plan a futuro 1", 0, 0, 200, 15);
                    
                    ctx.translate(0, 37);
                    ctx.rotate(0);
                    wrapText(ctx, "plan a futuro 2", 0, 0, 200, 15);
                    
                    // Mis metas son
                    ctx.translate(-40, 160);
                    ctx.rotate(0);
                    wrapText(ctx, "meta 1", 0, 0, 200, 15);
                    
                    ctx.translate(0, 37);
                    ctx.rotate(0);
                    wrapText(ctx, "meta 2", 0, 0, 200, 15);
                    
                    ctx.translate(0, 37);
                    ctx.rotate(0);
                    wrapText(ctx, "meta 3", 0, 0, 200, 15);
                    
                    ctx.translate(0, 33);
                    ctx.rotate(0);
                    wrapText(ctx, "meta 4", 0, 0, 200, 15);
                    
                    // ahora se que es
                    ctx.translate(0, 160);
                    ctx.rotate(0);
                    wrapText(ctx, "ahora se que es 1", 0, 0, 200, 15);
                    
                    ctx.translate(0, 37);
                    ctx.rotate(0);
                    wrapText(ctx, "ahora se que es 2", 0, 0, 200, 15);
                    ctx.restore();
                    
                    // Uno de mis proyectos es
                    ctx.translate(350, -870);
                    ctx.rotate(0);
                    wrapText(ctx, "Uno de mis proyectos es tener muchos proyectos para nunca dejar de tener proyectos", 0, 0, 300, 15);
                    debugger;
                    printBadge(1, callback);
                };
                
                imgBackground.src = "assets/images/bg-share-album.jpg" + "?rnd=" + new Date().getTime();
                
                
            }else {
                callback();   
            }
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
        
        
        function printBadge(position, callback) {
            var myBadges = $scope.album.badges;
            
            if (myBadges.length >= position) {
                
                var imgBadge = new Image();
                imgBadge.onload = function() {
                    ctx.drawImage(imgBadge, -30, 320, 80, 80);
                    
                    if (myBadges.length == position) {
                        albumSrc = canvas.toDataURL("image/png");
                        //callback();
                    }else {
                        printBadge(position + 1, callback);
                    }
                };
                
                imgBadge.src = "assets/images/badges/" + getFileName(myBadges[position - 1].id) + "?rnd=" + new Date().getTime();
            }
        }
        
        function wrapText(context, text, x, y, maxWidth, lineHeight) {
			var words = text.split(' ');
			var line = '';
	
			for(var n = 0; n < words.length; n++) {
			  var testLine = line + words[n] + ' ';
			  var metrics = context.measureText(testLine);
			  var testWidth = metrics.width;
			  if (testWidth > maxWidth && n > 0) {
				context.fillText(line, x, y);
				line = words[n] + ' ';
				y += lineHeight;
			  }
			  else {
				line = testLine;
			  }
			}
			context.fillText(line, x, y);
		  }

    }]);