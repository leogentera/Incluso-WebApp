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
            var _loadedResources = false;
            var _pageLoaded = true;
            $scope.$emit('ShowPreloader');

            $scope.validateConnection(initController, offlineCallback);

            function offlineCallback() {
                $timeout(function () {
                    $location.path("/Offline");
                }, 1000);
            }

            function initController() {

                var _userProfile = moodleFactory.Services.GetCacheJson("Perfil/" + moodleFactory.Services.GetCacheObject("userId"));
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


                $scope.shareToCommunity = function () {

                    $scope.validateConnection(function () {

                        $scope.$emit('ShowPreloader');

                        if ($scope.discussion == null || $scope.forumId == null) {
                            getCommunityData(shareToCommunityAndRedirect);
                        } else {
                            shareToCommunityAndRedirect();
                        }

                    }, offlineCallback);

                };

                $scope.removeImage = function (index) {

                    $scope.limitPhotoSize--;

                    $scope.model.attachedImages.splice(index, 1);
                };

                $scope.attachImage = function () {
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
                    moodleFactory.Services.GetAsyncForumDiscussions(_course.community.coursemoduleid, _currentUser.token, function (data, key) {
                        $scope.discussion = data.discussions[0];
                        $scope.forumId = data.forumid;
                        callback();

                    }, function (obj) {
                                $scope.$emit('HidePreloader');
                                if (obj && obj.statusCode && obj.statusCode == 408) {//Request Timeout
                                  $timeout(function () {
                                    $location.path('/Offline'); //This behavior could change
                                  }, 1);
                                } else {//Another kind of Error happened
                                  $timeout(function () {
                                      console.log("Another kind of Error happened");
                                      $scope.$emit('HidePreloader');
                                      $location.path('/connectionError');
                                  }, 1);
                                }
                            }, true);
                }

                //Time Out Message modal
                $scope.openModal = function (size) {
                    var modalInstance = $modal.open({
                        animation: $scope.animationsEnabled,
                        templateUrl: 'timeOutModal.html',
                        controller: 'timeOutSharingExperience',
                        size: size,
                        windowClass: 'user-help-modal dashboard-programa'
                    });
                };

                function shareToCommunityAndRedirect() {
                    if ($scope.hasCommunityAccess) {

                        var fileContents = [],
                            fileNames = [];

                        for (var ai = 0; ai < $scope.model.attachedImages.length; ai++) {

                            var attachedImage = $scope.model.attachedImages[ai];
                            fileContents.push(attachedImage.image);
                            fileNames.push(attachedImage.fileName);
                        }

                        var requestData = {
                            "userid": _userId,
                            "discussionid": $scope.discussion.discussion,
                            "parentid": $scope.discussion.id,
                            "message": $scope.model.testimony,
                            "createdtime": moment(Date.now()).unix(),//$filter("date")(new Date(), "MM/dd/yyyy"),
                            "modifiedtime": moment(Date.now()).unix(),//$filter("date")(new Date(), "MM/dd/yyyy"),
                            "posttype": 5,
                            "filecontent": fileContents,
                            "filename": fileNames,
                            "iscountable": 0
                        };

                        moodleFactory.Services.PostAsyncForumPost('new_post', requestData,
                            function () {//Success
                                $scope.$emit('HidePreloader');
                                $location.path("/Community/50000");
                            }, function (obj) {
                                $scope.$emit('HidePreloader');
                                if (obj && obj.statusCode && obj.statusCode == 408) {//Request Timeout
                                  $timeout(function () {
                                    $location.path('/Offline'); //This behavior could change
                                  }, 1);
                                } else {//Another kind of Error happened
                                  $timeout(function () {
                                      console.log("Another kind of Error happened");
                                      $scope.$emit('HidePreloader');
                                      $location.path('/connectionError');
                                  }, 1);
                                }
                            });
                    }
                }

                function getContentResources(nodeNameRelation) {
                    $scope.$emit('ShowPreloader');
                    drupalFactory.Services.GetContent(nodeNameRelation, function (data, key) {
                        _loadedResources = true;
                        $scope.contentResources = data.node;
                        $rootScope.pageName = $scope.contentResources.sec_title_toolbar;
                        if (_loadedResources && _pageLoaded) {
                            $scope.$emit('HidePreloader');
                        }
                    }, function () {
                        _loadedResources = true;
                        if (_loadedResources && _pageLoaded) {
                            $scope.$emit('HidePreloader');
                        }
                    }, false);
                }

                getContentResources("compartir-experiencia");
            }

        }]).controller('timeOutSharingExperience', ['$scope', '$modalInstance', function ($scope, $modalInstance) {//TimeOut Robot

    $scope.ToDashboard = function () {
        $scope.$emit('ShowPreloader');
        $modalInstance.dismiss('cancel');
    };

}]);