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
        var currentUser = JSON.parse(moodleFactory.Services.GetCacheObject("CurrentUser"));
        $scope.hasCommunityAccess = _hasCommunityAccessLegacy(_userProfile.communityAccess);
        var albumSrc = null;
        $scope.avatarSrc = null;
        
        $scope.discussion = null;
        $scope.forumId = null;
        
        var canvas = document.createElement('canvas');
        var ctx = canvas.getContext("2d");
        canvas.width = 1280;
        canvas.height = 1329;

        
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
                
                moodleFactory.Services.GetAsyncForumDiscussions(_course.community.coursemoduleid, currentUser.token, function(data, key) {
                    
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
                    moodleFactory.Services.GetAsyncAlbum($scope.currentUser.userId, $scope.currentUser.token, successfullCallBack, errorCallback, true);
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
                var imgBackground = new Image(),
                    imgAvatar = new Image();
                
                imgBackground.onload = function() {
                    ctx.drawImage(imgBackground, 0, 0, 1280, 1329);
                    ctx.restore();
                    
                    imgAvatar.onload = function() {
                        /* Avatar */
                        ctx.drawImage(imgAvatar, 170, 240, 210, 210);
                        ctx.restore();
                        
                        /* Shield */
                        ctx.font = '14px Play,sans-serif,Arial';
                        ctx.fillStyle = '#FFF';
                        ctx.textAlign = "center";
                        wrapText(ctx, "El escudo que me distingue es:", 270, 515, 200, 15);
                        ctx.restore();
                        
                        ctx.font = '14px Play,sans-serif,Arial';
                        ctx.fillStyle = '#BCD431';
                        ctx.textAlign = "center";
                        var shield = $scope.album.shield;
                        wrapText(ctx, shield.toUpperCase(), 270, 535, 200, 15);
                        ctx.restore();
                        
                        /* Strengths */
                        var strengthsTemp = $scope.album.myStrengths;
                        var strengthsTempYPosition = 670;
                        
                        ctx.font = 'bold 17px Play,sans-serif,Arial';
                        ctx.fillStyle = '#FFF';
                        ctx.textAlign = "center";
                        for(var st = 0; st < strengthsTemp.length; st++) {
                            wrapText(ctx, strengthsTemp[st], 270, strengthsTempYPosition, 200, 15);
                            strengthsTempYPosition += 34;
                        }
                        ctx.restore();
                        
                        /* What I like */
                        var whatILikeTemp = $scope.album.myLikes;
                        var whatILikeTempYPosition = 905;
                        
                        ctx.font = 'bold 17px Play,sans-serif,Arial';
                        ctx.fillStyle = '#FFF';
                        ctx.textAlign = "center";
                        for(var wil = 0; wil < whatILikeTemp.length; wil++) {
                            wrapText(ctx, whatILikeTemp[wil], 270, whatILikeTempYPosition, 200, 15);
                            whatILikeTempYPosition += 34;
                        }
                        ctx.restore();
                        
                        /* Qualities */
                        var qualitiesTemp = $scope.album.myAttributes;
                        var qualitiesYPosition = 1130;
                        
                        ctx.font = 'bold 17px Play,sans-serif,Arial';
                        ctx.fillStyle = '#FFF';
                        ctx.textAlign = "center";
                        for(var qt = 0; qt < qualitiesTemp.length; qt++) {
                            wrapText(ctx, qualitiesTemp[qt], 270, qualitiesYPosition, 200, 15);
                            qualitiesYPosition += 34;
                        }
                        ctx.restore();
                        
                        /* What pushes me */
                        var whatPushesMeTemp = $scope.album.myIdeas;
                        var whatPushesMeYPosition = 260;
                        
                        ctx.font = 'bold 17px Play,sans-serif,Arial';
                        ctx.fillStyle = '#FFF';
                        ctx.textAlign = "center";
                        for(var wpm = 0; wpm < whatPushesMeTemp.length; wpm++) {
                            wrapText(ctx, whatPushesMeTemp[wpm], 650, whatPushesMeYPosition, 200, 15);
                            whatPushesMeYPosition += 34;
                        }
                        ctx.restore();
                        
                        /* My Dreams */
                        var myDreamsMeTemp = $scope.album.myDreams;
                        var myDreamsYPosition = 457;
                        
                        ctx.font = 'bold 17px Play,sans-serif,Arial';
                        ctx.fillStyle = '#FFF';
                        ctx.textAlign = "center";
                        for(var my = 0; my < myDreamsMeTemp.length; my++) {
                            wrapText(ctx, myDreamsMeTemp[my], 650, myDreamsYPosition, 200, 15);
                            myDreamsYPosition += 34;
                        }
                        ctx.restore();
                        
                        /* My Plans */
                        var myPlansTemp = $scope.album.myPlans;
                        var myPlansProps = ["oneYear", "threeYear", "fiveYear"];
                        var myPlansYears = ["1 año.", "2 años.", "5 años."];
                        var myPlansYPosition = 670;
                        
                        
                        ctx.font = 'bold 17px Play,sans-serif,Arial';
                        ctx.textAlign = "center";
                        for(var mp = 0; mp < myPlansYears.length; mp++) {
                            ctx.fillStyle = '#08B290';
                            wrapText(ctx, myPlansYears[mp], 550, myPlansYPosition, 200, 15);
                            ctx.fillStyle = '#FFF';
                            wrapText(ctx, myPlansTemp[myPlansProps[mp]], 670, myPlansYPosition, 200, 15);
                            myPlansYPosition += 34;
                        }
                        ctx.restore();
                        
                        /* My Goals */
                        var myGoalsTemp = $scope.album.myGoals;
                        var myGoalsYPosition = 867;
                        
                        ctx.font = 'bold 17px Play,sans-serif,Arial';
                        ctx.fillStyle = '#FFF';
                        ctx.textAlign = "center";
                        for(var mg = 0; mg < myGoalsTemp.length; mg++) {
                            wrapText(ctx, myGoalsTemp[mg], 650, myGoalsYPosition, 270, 15);
                            myGoalsYPosition += 34;
                        }
                        ctx.restore();
                        
                        /* Now I Know */
                        var nowIKnowTemp = $scope.album.iKnowWhatIs;
                        var nowIKnowYPosition = 1135;
                        
                        ctx.font = 'bold 17px Play,sans-serif,Arial';
                        ctx.fillStyle = '#FFF';
                        ctx.textAlign = "center";
                        for(var nik = 0; nik < nowIKnowTemp.length; nik++) {
                            wrapText(ctx, nowIKnowTemp[nik], 650, nowIKnowYPosition, 200, 15);
                            nowIKnowYPosition += 34;
                        }
                        ctx.restore();
                        
                        /* One of my projects */
                        ctx.font = '14px Play,sans-serif,Arial';
                        ctx.fillStyle = '#FFF';
                        ctx.textAlign = "center";
                        wrapText(ctx, $scope.album.project != null ? $scope.album.project[0] : "", 1020, 280, 240, 15);
                        ctx.restore();
                        
                        /* My participation */
                        ctx.font = 'bold 14px Play,sans-serif,Arial';
                        ctx.fillStyle = '#FFF';
                        ctx.textAlign = "center";
                        
                        ctx.fillStyle = '#8098A0';
                        wrapText(ctx, "Comunidad.", 970, 455, 240, 15);
                        
                        ctx.fillStyle = '#FFF';
                        ctx.textAlign = "right";
                        wrapText(ctx, $scope.album.amountOfCommunityPosts + " entradas", 1095, 455, 240, 15);
                        
                        ctx.fillStyle = '#8098A0';
                        ctx.textAlign = "center";
                        wrapText(ctx, "Foros.", 970, 490, 240, 15);
                        
                        ctx.fillStyle = '#FFF';
                        ctx.textAlign = "right";
                        wrapText(ctx, $scope.album.amountOfForumPosts + " entradas", 1075, 490, 240, 15);
                        
                        ctx.fillStyle = '#8098A0';
                        ctx.textAlign = "center";
                        wrapText(ctx, "Estrellas Ganadas", 1020, 540, 240, 15);
                        
                        ctx.font = 'bold 23px Play,sans-serif,Arial';
                        ctx.fillStyle = '#BCD431';
                        var numberOfStars = $scope.album.starsEarned.toString();
                        wrapText(ctx, numberOfStars.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"), 1015, 583, 210, 15);
                        
                        ctx.font = 'bold 14px Play,sans-serif,Arial';
                        ctx.fillStyle = '#8098A0';
                        wrapText(ctx, "Insignias Obtenidas", 1020, 620, 240, 15);
                        ctx.restore();

                        printBadge(1, 1, 1, callback);
                    };
                    
                    var avatarInfo = moodleFactory.Services.GetCacheJson("avatarInfo");
                    if(avatarInfo != null && avatarInfo.pathimagen != null) {
                        imgAvatar.src = "assets/avatar/" + avatarInfo.pathimagen;
                    }else {
                        imgAvatar.src = "assets/avatar/default.png";
                    }
                };
                
                imgBackground.src = "assets/images/bg-share-album.jpg";
                
                
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
        
        $scope.shareAlbumClick = function() {
            $scope.isShareCollapsed = !$scope.isShareCollapsed;
            $scope.showSharedAlbum = false;
        };
        
        
        function printBadge(position, column, row, callback) {
            var myBadges = $scope.album.badges;
            
            if (myBadges.length >= position) {
                
                var imgBadge = new Image();
                imgBadge.onload = function() {
                    
                    var positionX = 0;
                    var positionY = 560 + (80 * row) + (10 * row);
                    
                    switch(column) {
                        case 1:
                            positionX = 885;
                            break;
                        case 2:
                            positionX = 980;
                            break;
                        case 3:
                            positionX = 1075;
                            break;
                    }
                    
                    ctx.drawImage(imgBadge, positionX, positionY, 80, 80);
                    
                    if (myBadges.length == position) {
                        albumSrc = canvas.toDataURL("image/png");
                        callback();
                    }else {
                        
                        var newColumn = 1;
                        switch(column){
                            case 1:
                                newColumn = 2;
                                break;
                            case 2:
                                newColumn = 3;
                                break;
                            case 3:
                                newColumn = 1;
                                row += 1;
                                break;
                        }
                        
                        printBadge(position + 1, newColumn, row, callback);
                    }
                };
                
                imgBadge.src = "assets/images/badges/" + getFileName(myBadges[position - 1].id);
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