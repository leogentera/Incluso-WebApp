angular
.module('incluso.programa.sharingExperience', [])
.controller('sharingExperienceController', [
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
        
        var _userProfile = moodleFactory.Services.GetCacheJson("profile/" + moodleFactory.Services.GetCacheObject("userId"));
        var _course = moodleFactory.Services.GetCacheJson("course");
        var _currentUser = JSON.parse(moodleFactory.Services.GetCacheObject("CurrentUser"));
        var _userId = moodleFactory.Services.GetCacheObject("userId");
    
        $scope.setToolbar($location.$$path, "Album Incluso");
        $rootScope.showFooter = false;
        $rootScope.showFooterRocks = false;
        $rootScope.showStage1Footer = false;
        $rootScope.showStage2Footer = false;
        $rootScope.showStage3Footer = false;
        $scope.hasCommunityAccess = _hasCommunityAccessLegacy(_userProfile.communityAccess);
        $scope.discussion = null;
        $scope.forumId = null;
        
        $scope.model = {
                testimony: "",
                attachedImages: []
        };
        
        $scope.limitPhotoSize = 0;
        
        $scope.validateConnection(initController, offlineCallback);
        
        function offlineCallback() {
                $location.path("/Offline");
        }
        
        function initController() {
                $scope.shareToCommunity = function() {
                        
                        $scope.validateConnection(function() {
                        
                                $scope.$emit('ShowPreloader');
                
                                if ($scope.discussion == null || $scope.forumId == null) {
                                        getCommunityData(shareToCommunityAndRedirect);
                                }else{
                                        shareToCommunityAndRedirect();
                                }
                        
                        }, offlineCallback);
                        
                };
                
                $scope.removeImage = function(index) {
                        
                        $scope.limitPhotoSize--;
                        
                        $scope.model.attachedImages.splice(index, 1);
                };
                
                $scope.attachImage = function() {
                        cordova.exec(attachImageSuccessCallback, attachImageErrorCallback, "CallToAndroid", "AttachPicture", []);
                };
                
                function attachImageSuccessCallback(data) {
                        
                        $scope.limitPhotoSize++;
                        
                        var fileNameParts = data.fileName.split(".");
                        data.fileExtension = fileNameParts[fileNameParts.length - 1];
                        data.fileName = _userId + Date.now() + "." + "data.fileExtension";
                        
                        $scope.model.attachedImages.push(data);
                        $scope.$apply();
                }
                
                function attachImageErrorCallback() {
                }
                
                function getCommunityData(callback) {
                        moodleFactory.Services.GetAsyncForumDiscussions(_course.community.coursemoduleid, _currentUser.token, function(data, key) {
                            $scope.discussion = data.discussions[0];
                            $scope.forumId = data.forumid;
                            callback();
                            
                            }, function(data){
                                $scope.$emit('HidePreloader');
                            }, true);
                }
                
                function shareToCommunityAndRedirect() {
                        if ($scope.hasCommunityAccess) {
                                
                                var fileContents = [],
                                    fileNames = [];
                                    
                                for(var ai = 0; ai < $scope.model.attachedImages.length; ai++) {
                                
                                        var attachedImage = $scope.model.attachedImages[ai];
                                        
                                        fileContents.push(attachedImage.image);
                                        fileNames.push(attachedImage.fileName);
                                }
        
                                var requestData = {
                                        "userid": _userId,
                                        "discussionid": $scope.discussion.discussion,
                                        "parentid": $scope.discussion.id,
                                        "message": $scope.model.testimony,
                                        "createdtime": $filter("date")(new Date(), "MM/dd/yyyy"),
                                        "modifiedtime": $filter("date")(new Date(), "MM/dd/yyyy"),
                                        "posttype": 5,
                                        "filecontent": fileContents,
                                        "filename": fileNames
                                };
                                
                                moodleFactory.Services.PostAsyncForumPost ('new_post', requestData,
                                    function(){
                                        $scope.$emit('HidePreloader');
                                        $location.path("/Community/50000");
                                    },
                                    function(data){
                                        $scope.$emit('HidePreloader');
                                    });
                        }
                }
                
                function getContentResources(nodeNameRelation) {
                        $scope.$emit('ShowPreloader');
                        drupalFactory.Services.GetContent(nodeNameRelation, function (data, key) {
                                $scope.contentResources = data.node;
                                $rootScope.pageName = $scope.contentResources.sec_title_toolbar;
                                $scope.$emit('HidePreloader');
                        }, function () {}, true);
                }
                
                getContentResources("compartir-experiencia");
        }
        
    }]);