angular
.module('incluso.programa.reconocimiento', [])
.controller('reconocimientoController', [
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
        
        var _course = moodleFactory.Services.GetCacheJson("course");
        var _userId = moodleFactory.Services.GetCacheObject("userId");
        var reconocimientoSrc = null;
        
        $scope.setToolbar($location.$$path, "Reconocimiento");
        $rootScope.showFooter = true;
        $rootScope.showFooterRocks = false;
        $scope.currentYear = moment().format('YYYY');
        
        $scope.hasCommunityAccess = false;
        $scope.discussion = null;
        $scope.forumId = null;
        $scope.communityModalOpen = true;
        $scope.shareToCommunityOpen = false;
        $scope.shareToDownloadOpen = false;
        $scope.shareToEmailOpen = false;
        $scope.shareToSocialNetworksOpen = false;
        $scope.textToCommunity = "";

        function controllerInit() {
            $scope.currentUser = JSON.parse(localStorage.getItem("CurrentUser"));
            $scope.profile = JSON.parse(localStorage.getItem("profile/" + $scope.currentUser.id));
            $scope.hasCommunityAccess = _hasCommunityAccessLegacy($scope.profile.communityAccess);
        }
        
        function generateReconocimientoImgSrc(callback) {
return;
            if (reconocimientoSrc == null) {
                
                    var awardSelector = "#" + "gold";
                    //$scope.profile.awards.title
                    var logo = document.querySelector(awardSelector).cloneNode(true);
                    document.querySelector('#XMLID_8578_').appendChild(logo);
                    
                    var svgString = new XMLSerializer().serializeToString(document.querySelector('svg#container'));
                    var svg = new Blob([svgString], {type: "image/svg+xml;charset=utf-8"});
                    var DOMURL = self.URL || self.webkitURL || self;
                    var url = DOMURL.createObjectURL(svg);
                    
                    var canvas = document.getElementById("canvas");
                    var ctx = canvas.getContext("2d");
                    
                    var img = new Image();
                    img.onload = function() {
                        ctx.drawImage(img, 0, 0);
                        reconocimientoSrc = canvas.toDataURL("image/png");
                        callback();
                    };
                    img.src = url;
            }else{
                callback();   
            }
        }
              
        $scope.download = function() {
            return;
            $scope.$emit('ShowPreloader');
            
            generateReconocimientoImgSrc(function() {
                cordova.exec(function() {
                    $scope.shareToDownloadOpen = true;
                    $scope.$emit('HidePreloader');
                }, function() {
                    $scope.shareToDownloadOpen = false;
                    $scope.$emit('HidePreloader');
                },
                "CallToAndroid", "download", [reconocimientoSrc]);
            });
        };
        
        $scope.shareByEmail = function() {
            return;
            $scope.$emit('ShowPreloader');
            
            generateReconocimientoImgSrc(function() {
                cordova.exec(function() {
                    $scope.shareToEmailOpen = true;
                    $scope.$emit('HidePreloader');
                }, function() {
                    $scope.shareToEmailOpen = false;
                    $scope.$emit('HidePreloader');
                },
                "CallToAndroid","shareByMail", [reconocimientoSrc, "reconocimiento.png", "mi reconocimiento"]);
            });
        };
        
        $scope.shareToSocialNetworks = function() {
            return;
            $scope.$emit('ShowPreloader');
            
            generateReconocimientoImgSrc(function() {
                cordova.exec(function() {
                    $scope.shareToSocialNetworksOpen = true;
                    $scope.$emit('HidePreloader');
                }, function() {
                    $scope.shareToSocialNetworksOpen = false;
                    $scope.$emit('HidePreloader');
                },
                "CallToAndroid", "share", [reconocimientoSrc]);
            });
        };
        
        $scope.shareToCommunity = function() {
            return;
            generateReconocimientoImgSrc(shareToCommunityCallback);
        };
        
        function shareToCommunityCallback() {
            return;
            $scope.$emit('ShowPreloader');
                
            if ($scope.discussion == null || $scope.forumId == null) {
                
                moodleFactory.Services.GetAsyncForumDiscussions(_course.community.coursemoduleid, function(data, key) {
                    
                    $scope.discussion = data.discussions[0];
                    $scope.forumId = data.forumid;
                    postReconocimientoToCommunity();
                    
                    }, function(data){
                        $scope.$emit('HidePreloader');
                    }, true);
            } else {
                postReconocimientoToCommunity();
            }
        }
        
        function postReconocimientoToCommunity() {
            return;
                var requestData = {
                    "userid": _userId,
                    "discussionid": $scope.discussion.discussion,
                    "parentid": $scope.discussion.id,
                    "message": $scope.textToCommunity,
                    "createdtime": $filter("date")(new Date(), "MM/dd/yyyy"),
                    "modifiedtime": $filter("date")(new Date(), "MM/dd/yyyy"),
                    "posttype": 4,
                    "filecontent":reconocimientoSrc.replace("data:image/png;base64", ""),
                    "filename": 'reconocimiento.png',
                    "picture_post_author": $scope.profile.profileimageurlsmall
                };
                
                moodleFactory.Services.PostAsyncForumPost ('new_post', requestData,
                    function() {
                        $scope.communityModalOpen = true;
                        $scope.shareToCommunityOpen = true;
                        $scope.$emit('HidePreloader');
                    },
                    function(){
                        $scope.communityModalOpen = true;
                        $scope.shareToCommunityOpen = false;
                        $scope.$emit('HidePreloader');
                    }
                );
        }
              
        $scope.shareToCommunityClick = function() {
            return;
            $scope.communityModalOpen = !$scope.communityModalOpen;
        }
          
        controllerInit();
        $scope.$emit('HidePreloader');
    }]);