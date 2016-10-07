angular
    .module('incluso.stage.forumcommentscontroller', ['GlobalAppConstants', 'ngSanitize'])
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
            var _loadedResources = false;
            var _pageLoaded = false;
            $scope.$emit('ShowPreloader');

            var currentUser = JSON.parse(localStorage.getItem("CurrentUser"));
            $scope.validateConnection(initController, offlineCallback);

            function offlineCallback() {
                $timeout(function () {
                    $location.path("/Offline");
                }, 1000);
            }

            function initController() {

                _httpFactory = $http;
                _timeout = $timeout;
                $rootScope.pageName = "Estación: Conócete";
                $rootScope.navbarBlue = true;
                $rootScope.showToolbar = true;

            getContentResources($routeParams.activityId);
            //$scope.setToolbar($location.$$path,"");
            $rootScope.showFooter = true;
            $rootScope.showFooterRocks = false;
            $rootScope.showStage1Footer = false;
            $rootScope.showStage2Footer = false;
            $rootScope.showStage3Footer = false;
            
            $scope.modelState = {
                isValid: null,
                errorMessages: []
            };
            /* Watchers */
            $scope.$watch("modelState.errorMessages", function (newValue, oldValue) {
                $scope.modelState.isValid = (newValue.length === 0);
            });
            
            var _userId = currentUser.id;

            $scope.userToken = currentUser.token;
            $scope.liked = null;
            $scope.moodleId;
            Number($routeParams.activityId) == 1049? $scope.moodleId = $routeParams.moodleId     : $scope.moodleId = getMoodleIdFromTreeActivity($routeParams.activityId);
            $scope.currentActivity = JSON.parse(moodleFactory.Services.GetCacheObject("forum/" + $scope.moodleId));
            $scope.currentDiscussionsIds = moodleFactory.Services.GetCacheJson("currentDiscussionIds");
            $scope.currentDiscussionsExtraPoints;
            var showMoreCounter = 1;
            var postPager = { from: 0, to: 0 };
            $scope.morePendingPosts = true;
            $scope.showAllCommentsByPost = new Array();
            $scope.posts = new Array();
            $scope.currentDate = new Date().getTime();

                $scope.scrollToTop();

                $scope.forumModals = {
                    "isTextCollapsed": true,
                    "isLinkCollapsed": true,
                    "isVideoCollapsed": true,
                    "isAttachmentCollapsed": true
                };
                var profile = JSON.parse(localStorage.getItem("Perfil/" + moodleFactory.Services.GetCacheObject("userId")));

                $scope.clickLikeButton = function (postId) {

                    $scope.modelState.errorMessages = [];

                    $scope.validateConnection(function () {

                        var post = _.find($scope.posts, function (a) {
                            return a.post_id == postId
                        });

                        var userLikes = JSON.parse(localStorage.getItem("likesByUser"));

                        if (post.liked == 0) {
                            post.liked = 1;
                            post.likes = parseInt(post.likes) + 1;
                            userLikes.likes = parseInt(userLikes.likes) + 1;
                        }
                        else {
                            post.liked = 0;
                            post.likes = parseInt(post.likes) - 1;
                            userLikes.likes = parseInt(userLikes.likes) - 1;
                        }

                        localStorage.setItem("likesByUser", JSON.stringify(userLikes));

                        var userIdObject = {'userid': JSON.parse(localStorage.getItem('userId'))};
                        moodleFactory.Services.PutForumPostLikeNoCache(postId, userIdObject, countLikesByUser, function (obj) {
                                $scope.$emit('HidePreloader');
                                if (obj && obj.statusCode && obj.statusCode == 408) {//Request Timeout
                                  $timeout(function () {
                                    $location.path('/Offline'); //This behavior could change
                                  }, 1);
                                } else {//Another kind of Error happened
                                  $timeout(function () {
                                      if (obj && obj.messageerror) {
                                          errorMessage = window.atob(obj.messageerror);
                                          $scope.modelState.errorMessages = [errorMessage];
                                      }
                                      $scope.$emit('HidePreloader');          
                                  }, 1);
                                }
                            });

                    }, offlineCallback);
                };

                function countLikesByUser() {
                    var userLikes = JSON.parse(localStorage.getItem("likesByUser"));
                    if (userLikes && userLikes.likes == 30) {
                        assignLikesBadge();
                    }
                }


                function assignLikesBadge() {
                    var badgeModel = {
                        badgeid: 15 //badge earned when a user likes 30 times.
                    };

                    var userProfile = JSON.parse(localStorage.getItem("Perfil/" + currentUser.userId));
                    for (var i = 0; i < userProfile.badges.length; i++) {
                        if (userProfile.badges[i].id == badgeModel.badgeid && userProfile.badges[i].status == "pending") {
                            userProfile.badges[i].status = "won";

                            showRobotForum();
                            localStorage.setItem("Perfil/" + currentUser.userId, JSON.stringify(userProfile));

                            moodleFactory.Services.PostBadgeToUser(currentUser.userId, badgeModel, function () {}, function (obj) {
                                $scope.$emit('HidePreloader');
                                if (obj && obj.statusCode && obj.statusCode == 408) {//Request Timeout
                                  $timeout(function () {
                                    $location.path('/Offline'); //This behavior could change
                                  }, 1);
                                } else {//Another kind of Error happened
                                  $timeout(function () {
                                      $scope.$emit('HidePreloader');
                                      $location.path('/connectionError');
                                  }, 1);
                                }
                            });

                        }
                    }
                }

                var checkForumExtraPoints = function () {

                    var activityFromTree = getActivityByActivity_identifier($routeParams.activityId);

                    /* check over extra points */
                    var course = moodleFactory.Services.GetCacheJson("course");
                    var forumData = moodleFactory.Services.GetCacheJson("postcounter/" + course.courseid);

                    if (activityFromTree && activityFromTree.status == 1) {
                        /* sumar uno extra al total */
                        //if (forumData.totalExtraPoints < 11) {
                        if (forumData.totalExtraPoints < $scope.activity.points_limit) {
                            updateUserForumStars($routeParams.activityId, $scope.activity.extra_points, true, successPutStarsCallback, function (obj) {
                                $scope.$emit('HidePreloader');
                                if (obj && obj.statusCode && obj.statusCode == 408) {//Request Timeout
                                  $timeout(function () {
                                    $location.path('/Offline'); //This behavior could change
                                  }, 1);
                                } else {//Another kind of Error happened
                                  $timeout(function () {
                                      $scope.$emit('HidePreloader');
                                      $location.path('/connectionError');
                                  }, 1);
                                }
                            });
                        }
                    }
                };

                var forumBadgeReached = function () {

                    var userProfile = JSON.parse(localStorage.getItem("Perfil/" + currentUser.userId));
                    var profileBadges = userProfile.badges;
                    var badgeForum = _.where(profileBadges, {name: "Foro interplanetario"});
                    if (badgeForum && badgeForum[0].status == "pending") {
                        var postCounter = 0;
                        var courseId = $scope.usercourse.courseid;
                        var postCounterForums = JSON.parse(localStorage.getItem("postcounter/" + courseId));
                        if (postCounterForums.forums) {
                            for (var i = 0; i < postCounterForums.forums.length; i++) {
                                if (postCounterForums.forums[i].forumactivityid != "50000") {
                                    var discussions = postCounterForums.forums[i].discussion;
                                    for (var j = 0; j < discussions.length; j++) {
                                        var comments = discussions[j].total;
                                        postCounter = postCounter + parseInt(discussions[j].total);
                                    }
                                }
                            }
                        }

                        if (postCounter >= 40 && badgeForum[0].status == "pending") {
                            var badgeModel = {
                                badgeid: badgeForum[0].id //badge earned when a user completes his profile.
                            };
                            for (var i = 0; i < userProfile.badges.length; i++) {
                                if (userProfile.badges[i].id == badgeModel.badgeid) {
                                    userProfile.badges[i].status = "won";
                                }
                            }
                            localStorage.setItem("Perfil/" + currentUser.userId, JSON.stringify(userProfile));
                            showRobotForum();
                            moodleFactory.Services.PostBadgeToUser(_userId, badgeModel, function(){}, function (obj) {
                                $scope.$emit('HidePreloader');
                                if (obj && obj.statusCode && obj.statusCode == 408) {//Request Timeout
                                  $timeout(function () {
                                    $location.path('/Offline'); //This behavior could change
                                  }, 1);
                                } else {//Another kind of Error happened
                                  $timeout(function () {
                                      $scope.$emit('HidePreloader');
                                      $location.path('/connectionError');
                                  }, 1);
                                }
                            });
                        }
                    }
                };


                function showRobotForum() {
                    $scope.badgeRobotMessages = {
                        title: $scope.robotContentResources.titulo,
                        message: $scope.robotContentResources.mensaje
                    };

                    _setLocalStorageItem("badgeRobotMessage", JSON.stringify($scope.badgeRobotMessages));
                    $scope.openModal_badgeRobotMessage();
                }

                $scope.openModal_badgeRobotMessage = function (size) {
                    var modalInstance = $modal.open({
                        animation: $scope.animationsEnabled,
                        templateUrl: 'badgeForumRobotMessageModal.html',
                        controller: 'badgeForumRobotMessageModal',
                        size: size,
                        windowClass: 'closing-stage-modal user-help-modal'
                    });
                };


                var checkForumProgress = function (callback) {

                    var historicalDiscussions = getForumExtraPointsCounter($scope.currentDiscussionsIds);
                    var historicalDiscussionsFinished = _.filter(historicalDiscussions.discussions, function (hd) {
                        return hd.total >= 1;
                    });

                    var isActivityFinished = (historicalDiscussionsFinished.length === $scope.currentDiscussionsIds.length);
                    var activityFromTree = getActivityByActivity_identifier($routeParams.activityId);


                    forumBadgeReached();

                    if (isActivityFinished && activityFromTree && activityFromTree.status == 0) {

                        var extraPointsCounter = 0;
                        var points = 0;

                        /* check over extra points */
                        var course = moodleFactory.Services.GetCacheJson("course");
                        var forumData = moodleFactory.Services.GetCacheJson("postcounter/" + course.courseid);

                        /* sumar uno extra al total */
                        if (forumData.totalExtraPoints < 11) {
                            _.each(historicalDiscussions.discussions, function (elem, index, list) {
                                if (parseInt(elem.total) > 0) {
                                    extraPointsCounter += (parseInt(elem.total) - 1);
                                }
                            });

                            /* sumar uno extra al total */
                            var availableExtraPoints = (11 - forumData.totalExtraPoints);
                            if (extraPointsCounter > availableExtraPoints) {
                                extraPointsCounter = availableExtraPoints;
                            }

                            points = (extraPointsCounter * 50);
                        }

                        localStorage.setItem("starsToAssignedAfterFinishActivity", points);

                        switch (Number($scope.moodleId)) {
                            case 73:
                                $location.path('/ZonaDeVuelo/ForoCierre/' + $routeParams.activityId + '/' + $scope.discussion.id + '/' + $scope.moodleId);
                                break;
                            case 64:
                                $location.path('/ZonaDeVuelo/ForoCierre/' + $routeParams.activityId + '/' + $scope.discussion.id + '/' + $scope.moodleId);
                                break;
                            case 149:
                                $location.path('/ZonaDeVuelo/ForoCierre/' + $routeParams.activityId + '/' + $scope.discussion.id + '/' + $scope.moodleId);
                                break;
                            case 148:
                                $location.path('/ZonaDeVuelo/ForoCierre/' + $routeParams.activityId + '/' + $scope.discussion.id + '/' + $scope.moodleId);
                                break;
                            case 147:
                                $location.path('/ZonaDeVuelo/ForoCierre/' + $routeParams.activityId + '/' + $scope.discussion.id + '/' + $scope.moodleId);
                                break;
                            case 179:
                                $location.path('/ZonaDeNavegacion/ForoCierre/' + $routeParams.activityId + '/' + $scope.discussion.id + '/' + $scope.moodleId);
                                break;
                            case 178:
                                $location.path('/ZonaDeNavegacion/ForoCierre/' + $routeParams.activityId + '/' + $scope.discussion.id + '/' + $scope.moodleId);
                                break;
                            case 197:
                                $location.path('/ZonaDeNavegacion/ForoCierre/' + $routeParams.activityId + '/' + $scope.discussion.id + '/' + $scope.moodleId);
                                break;
                            case 85:
                                $location.path('/ZonaDeNavegacion/ForoCierre/' + $routeParams.activityId + '/' + $scope.discussion.id + '/' + $scope.moodleId);
                                break;
                            default :
                                $location.path('/ZonaDeAterrizaje/ForoCierre/' + $routeParams.activityId + '/' + $scope.discussion.id + '/' + $scope.moodleId);
                                break;
                                $scope.scrollToTop();
                        }
                    } else {
                        callback();
                    }
                };

                var _uncollapse = function (element, elementsArray) {
                    for (var key in elementsArray) {
                        key == element ? elementsArray[key] = !elementsArray[key] : elementsArray[key] = true;
                    }
                };

                $scope.collapseForumButtomsTrigger = function (element, callFileBrowser) {
                    //callFileBrowser?clickPostAttachment():'';
                    if (callFileBrowser) {
                        clickPostAttachment();
                    } else {
                        _uncollapse(element, $scope.forumModals);
                    }
                };

                var createReplyDataObject = function (parentId, message, postType) {
                    var userId = localStorage.getItem("userId");

                    var dataObject = {
                        "userid": userId,
                        "discussionid": $scope.discussion.discussion,
                        "parentid": parentId,
                        "message": message,
                        "createdtime": moment(Date.now()).unix(),
                        "modifiedtime": moment(Date.now()).unix(),
                        "posttype": postType,
                        "fileToUpload": "",
                        "iscountable": 1
                    };
                    return dataObject;
                };

                $scope.isCommentModalCollapsed = [];
                $scope.isReportedAbuseModalCollapsed = new Array();
                $scope.isReportedAbuseSentModalCollapsed = new Array();

                 function toDataUrl(url, callback) {
                    var xhr = new XMLHttpRequest();
                    xhr.responseType = 'blob';
                    xhr.onload = function() {
                      var reader = new FileReader();
                      reader.onloadend = function() {callback(reader.result);}
                      reader.readAsDataURL(xhr.response);
                    };
                    xhr.open('GET', url);
                    xhr.send();
                };
                
                $scope.download = function(imageUrl) {                    
                    var image = imageUrl + '?token=' + $scope.userToken;                    
                    toDataUrl(image, function(base64Img) {                        
                        var initialIndex = base64Img.indexOf("base64");
                        var image64 = "data:image/png;" + base64Img.substring(initialIndex);                        
                        reconocimientoSrc = [
                            [image64.replace(/^data:image\/(png|jpg);base64,/, "")]
                        ];
                        cordova.exec(function () {}, function () {}, "CallToAndroid", "download", [reconocimientoSrc]);
                    });
                };
                
                
                $scope.replyToPost = function (that, parentId, topicId, isCommentModalCollapsedIndex) {

                    $scope.modelState.errorMessages = [];

                    $scope.validateConnection(function () {

                        var dataObejct = createReplyDataObject(parentId, that.replyText, 1);
                        $scope.$emit('ShowPreloader');

                        $scope.showPreviousComments(parentId);
                        moodleFactory.Services.PostAsyncForumPost('reply', dataObejct,
                            function () {//Success
                                that.replyText = '';
                                $scope.replyText = null;
                                $scope.textToPost = null;
                                $scope.isCommentModalCollapsed[isCommentModalCollapsedIndex] = false;
                                $scope.discussion.replies = $scope.discussion.replies + 1;   //add a new reply to the current discussion
                                checkForumExtraPoints();
                                refreshRepliesToPost(parentId);
                                checkForumProgress(refreshTopicData);
                            }, function (obj) {
                                $scope.$emit('HidePreloader');
                                if (obj && obj.statusCode && obj.statusCode == 408) {//Request Timeout
                                  $timeout(function () {
                                    $location.path('/Offline'); //This behavior could change
                                  }, 1);
                                } else {//Another kind of Error happened
                                  $timeout(function () {
                                      if (obj && obj.messageerror) {
                                          errorMessage = window.atob(obj.messageerror);
                                          $scope.modelState.errorMessages = [errorMessage];
                                      }
                                      $scope.$emit('HidePreloader');
                                      $location.path('/connectionError');
                                  }, 1);
                                }
                            }, null, true);

                    }, offlineCallback);

                };

                $scope.textToPost = null;
                $scope.linkToPost = null;
                $scope.videoToPost = null;
                $scope.attachmentToPost = null;

                var createPostDataObject = function (message, postType, attachment) {
                    var userId = localStorage.getItem("userId");
                    var dataObject = {
                        "userid": userId,
                        "discussionid": $scope.discussion.discussion,
                        "parentid": $scope.discussion.id,
                        "message": message,
                        "createdtime": moment(Date.now()).unix(),
                        "modifiedtime": moment(Date.now()).unix(),
                        "posttype": postType,
                        "fileToUpload": attachment ? attachment.base64 : null,
                        "iscountable": 1
                    };
                    return dataObject;
                };

                //Time Out Message modal
                $scope.openModal = function (size) {
                    var modalInstance2 = $modal.open({
                        animation: $scope.animationsEnabled,
                        templateUrl: 'timeOutModal.html',
                        controller: 'timeOutForum',
                        size: size,
                        windowClass: 'user-help-modal dashboard-programa'
                    });
                };

                $scope.postTextToForum = function () {

                    $scope.modelState.errorMessages = [];

                    $scope.validateConnection(function () {

                        var dataObject = createPostDataObject($scope.textToPost, 1, null);
                        $scope.$emit('ShowPreloader');

                        moodleFactory.Services.PostAsyncForumPost('new_post', dataObject,
                            function () {//Success
                                $scope.textToPost = null;
                                $scope.collapseForumButtomsTrigger('isTextCollapsed');
                                checkForumExtraPoints();
                                checkForumProgress(refreshTopicData);
                            },

                            function (obj) {//Error
                                $scope.textToPost = null;
                                $scope.collapseForumButtomsTrigger('isTextCollapsed');
                                $scope.$emit('HidePreloader');

                                if (obj && obj.statusCode && obj.statusCode == 408) {//Request Timeout
                                    $scope.openModal();
                                } else {//A different Error happened
                                    var errorMessage = [window.atob(obj.messageerror)];
                                    $scope.modelState.errorCode = obj.statusCode;
                                    $scope.modelState.errorMessages = errorMessage;
                                }

                            }, null, true);

                    }, offlineCallback);
                };

                $scope.postLinkToForum = function () {

                    $scope.modelState.errorMessages = [];

                    $scope.validateConnection(function () {

                        var dataObject = createPostDataObject($scope.linkToPost, 2, null);
                        $scope.$emit('ShowPreloader');
                        moodleFactory.Services.PostAsyncForumPost('new_post', dataObject,
                            function () {//Success
                                $scope.linkToPost = null;
                                $scope.collapseForumButtomsTrigger('isLinkCollapsed');
                                checkForumExtraPoints();
                                checkForumProgress(refreshTopicData);
                            },
                            function (obj) {//Error
                                $scope.linkToPost = null;
                                $scope.collapseForumButtomsTrigger('isLinkCollapsed');
                                $scope.$emit('HidePreloader');

                                if (obj && obj.statusCode && obj.statusCode == 408) {//Request Timeout
                                    $scope.openModal();
                                } else {//A different Error happened
                                    var errorMessage = [obj.messageerror];
                                    $scope.modelState.errorCode = obj.statusCode;
                                    $scope.modelState.errorMessages = errorMessage;
                                }

                            }, null, true);
                    }, offlineCallback);

                };
                $scope.postVideoToForum = function () {

                    $scope.modelState.errorMessages = [];

                    $scope.validateConnection(function () {

                        var dataObject = createPostDataObject($scope.videoToPost, 3, null);
                        $scope.$emit('ShowPreloader');
                        moodleFactory.Services.PostAsyncForumPost('new_post', dataObject,
                            function () {//Success
                                $scope.videoToPost = null;
                                $scope.collapseForumButtomsTrigger('isVideoCollapsed');
                                checkForumExtraPoints();
                                checkForumProgress(refreshTopicData);
                            },
                            function (obj) {//Error
                                $scope.videoToPost = null;
                                $scope.collapseForumButtomsTrigger('isVideoCollapsed');
                                $scope.$emit('HidePreloader');

                                if (obj && obj.statusCode && obj.statusCode == 408) {//Request Timeout
                                    $scope.openModal();
                                } else {//A different Error happened
                                    var errorMessage = [obj.messageerror];
                                    $scope.modelState.errorCode = obj.statusCode;
                                    $scope.modelState.errorMessages = errorMessage;
                                }
                            }, null, true);

                    }, offlineCallback);
                };

                $scope.reportPost = function (postId) {

                    $scope.modelState.errorMessages = [];

                    $scope.validateConnection(function () {

                        var createdDate = (new Date().getTime() / 1000).toFixed(0);

                        var requestData = {
                            "postid": postId,
                            "userid": _userId,
                            "create": createdDate,
                            "forumid": $scope.currentActivity.forumid,
                            "discussionid": $scope.discussion.discussion,
                        };

                        $scope.$emit('ShowPreloader');
                        moodleFactory.Services.PostAsyncReportAbuse(null, requestData, function () {

                            $scope.$emit('HidePreloader');
                            $scope.isReportedAbuseModalCollapsed["id" + postId] = false;
                            $scope.isReportedAbuseSentModalCollapsed["id" + postId] = true;
                            $scope.postToReport.reported = 1;

                        }, function (obj) {
                            $scope.$emit('HidePreloader');
                            $scope.isReportedAbuseModalCollapsed["id" + postId] = false;
                            $scope.isReportedAbuseSentModalCollapsed["id" + postId] = false;
                            
                            $scope.$emit('HidePreloader');
                                        if (obj && obj.statusCode && obj.statusCode == 408) {//Request Timeout
                                          $timeout(function () {
                                            $location.path('/Offline'); //This behavior could change
                                          }, 1);
                                        } else {//Another kind of Error happened
                                          $timeout(function () {
                                              $scope.$emit('HidePreloader');
                                              $location.path('/connectionError');
                                          }, 1);
                                        }  
                        }, true);

                    }, offlineCallback);
                };

                $scope.reportModalClick = function (post) {
                    $scope.postToReport = post;
                    var postId = post.post_id;
                    $scope.isReportedAbuseModalCollapsed['id' + postId] = !$scope.isReportedAbuseModalCollapsed['id' + postId];
                    $scope.isCommentModalCollapsed['id' + postId] = false;
                };

                $scope.clickPostAttachment = function () {

                    $scope.modelState.errorMessages = [];
                    $scope.validateConnection(clickPostAttachment, offlineCallback);
                };

                clickPostAttachment = function () {
                    cordova.exec(function (data) {
                        //Expand attachment modal

                        if (data != null) {
                            $scope.$apply(function () {
                                $scope.attachmentToPost = data;
                            });
                            $scope.$apply($scope.collapseForumButtomsTrigger('isAttachmentCollapsed'));
                        } else {
                        }


                    }, function (data) {
                        $scope.$apply($scope.collapseForumButtomsTrigger('isAttachmentCollapsed'));
                    }, "CallToAndroid", "AttachPicture", []);
                };

                $scope.postAttachmentToForum = function () {

                    $scope.modelState.errorMessages = [];

                    $scope.validateConnection(function () {

                        var userId = localStorage.getItem("userId");
                        var dataObject = {
                            "userid": userId,
                            "discussionid": $scope.discussion.discussion,
                            "parentid": $scope.discussion.id,
                            "message": '',
                            "createdtime": moment(Date.now()).unix(),
                            "modifiedtime": moment(Date.now()).unix(),
                            "posttype": 4,
                            "filecontent": $scope.attachmentToPost.image,
                            "filename": userId + $scope.attachmentToPost.fileName,
                            "picture_post_author": profile.profileimageurlsmall,
                            "iscountable": 1
                        };

                        $scope.$emit('ShowPreloader');
                        moodleFactory.Services.PostAsyncForumPost('new_post', dataObject,
                            function () {//Success
                                $scope.attachmentToPost = null;
                                $scope.collapseForumButtomsTrigger('isAttachmentCollapsed');
                                checkForumExtraPoints();
                                checkForumProgress(refreshTopicData);
                            },
                            function (obj) {//Error
                                $scope.attachmentToPost = null;
                                $scope.collapseForumButtomsTrigger('isAttachmentCollapsed');
                                $scope.$emit('HidePreloader');

                                if (obj && obj.statusCode && obj.statusCode == 408) {//Request Timeout
                                    $scope.openModal();
                                } else {//A different Error happened
                                    var errorMessage = [obj.messageerror];
                                    $scope.modelState.errorCode = obj.statusCode;
                                    $scope.modelState.errorMessages = errorMessage;
                                }

                            }, null, true);

                    }, offlineCallback);

                };

                function getTopicData() {
                    $scope.usercourse = JSON.parse(localStorage.getItem("usercourse"));
                    $scope.activity = JSON.parse(moodleFactory.Services.GetCacheObject("forum/" + $scope.moodleId));
                    $scope.discussion = _.find($scope.activity.discussions, function (d) {
                        return d.discussion == Number($routeParams.discussionId);
                    });

                    moodleFactory.Services.GetAsyncDiscussionPosts(moodleFactory.Services.GetCacheJson("CurrentUser").token, $scope.discussion.id, $scope.discussion.discussion,
                        $scope.activity.forumid, postPager.from, postPager.to, 1, "default", getPostsDataCallback, function (obj) {
                                $scope.$emit('HidePreloader');
                                if (obj && obj.statusCode && obj.statusCode == 408) {//Request Timeout
                                  $timeout(function () {
                                    $location.path('/Offline'); //This behavior could change
                                  }, 1);
                                } else {//Another kind of Error happened
                                  $timeout(function () {
                                      $scope.$emit('HidePreloader');
                                      $location.path('/connectionError');
                                  }, 1);
                                }
                            }, true);

                    forceUpdateForumProgress();
                }

                function getPostsDataCallback(data, key) {

                    postPager.from = (postPager.from < 0 && postPager.from < data.maxid) ? postPager.from : data.maxid;
                    postPager.to = postPager.to > data.sinceid ? postPager.to : data.sinceid;

                    var posts = data.posts;
                    $scope.morePendingPosts = posts.length === 10;
                    posts.forEach(initializeCommentsData);
                    $scope.posts.sort(function (a, b) {
                        return Number(b.post_id) - Number(a.post_id);
                    });

                    _pageLoaded = true;
                    if (_loadedResources && _pageLoaded) {
                        $scope.$emit('HidePreloader')
                    }
                }

                var initializeCommentsData = function (element, index, array) {
                    $scope.isCommentModalCollapsed[index] = false;
                    $scope.isReportedAbuseModalCollapsed["id" + element.post_id] = false;
                    $scope.isReportedAbuseSentModalCollapsed["id" + element.post_id] = false;

                    if ($scope.showAllCommentsByPost['id' + element.post_id] != 1000000) {
                        $scope.showAllCommentsByPost['id' + element.post_id] = 3;
                    }

                    var existingPost = false;

                    for (p = 0; p < $scope.posts.length; p++) {
                        if ($scope.posts[p].post_id === element.post_id) {
                            $scope.posts[p] = element;
                            existingPost = true;
                            break;
                        }
                    }

                    if (!existingPost) {
                        $scope.posts.push(element);
                    }
                };

                var refreshTopicData = function () {
                    moodleFactory.Services.GetAsyncDiscussionPosts(moodleFactory.Services.GetCacheJson("CurrentUser").token, $scope.discussion.id, $scope.discussion.discussion,
                        $scope.activity.forumid, postPager.from, postPager.to, 1, "default", getPostsDataCallback, function (obj) {
                                $scope.$emit('HidePreloader');
                                if (obj && obj.statusCode && obj.statusCode == 408) {//Request Timeout
                                  $timeout(function () {
                                    $location.path('/Offline'); //This behavior could change
                                  }, 1);
                                } else {//Another kind of Error happened
                                  $timeout(function () {
                                      $scope.$emit('HidePreloader');
                                      $location.path('/connectionError');
                                  }, 1);
                                }
                            }, true);
                };

                var refreshRepliesToPost = function (parentId) {
                    //moodleFactory.Services.GetAsyncDiscussionPosts(moodleFactory.Services.GetCacheJson("CurrentUser").token, $scope.discussion.id, $scope.discussion.discussion, $scope.activity.forumid, postPager.from, postPager.to, 1, "default", getPostsDataCallback, null, true);
                    moodleFactory.Services.GetAsyncDiscussionPosts(moodleFactory.Services.GetCacheJson("CurrentUser").token, $scope.discussion.id, $scope.discussion.discussion, $scope.activity.forumid, Number(parentId) + 1, postPager.to, 0, "default", getPostsDataCallback, null, true);
                };

                function getActivityInfoCallback(data) {
                    $scope.activity = JSON.parse(moodleFactory.Services.GetCacheObject("forum/" + $routeParams.moodleid));
                    $scope.discussion = _.find($scope.activity.discussions, function (d) {
                        return d.discussion == $routeParams.discussionId;
                    });

                    var postsKey = "discussion/" + $scope.discussion.id + $scope.discussion.discussion + $scope.activity.forumid + 0 + 0 + 1;
                    $scope.posts = moodleFactory.Services.GetCacheObject(postsKey) != null ? JSON.parse(moodleFactory.Services.GetCacheObject(postsKey)) : new Array();

                    posts.forEach(initializeCommentsData);
                    $scope.posts.sort(function (a, b) {
                        return Number(b.post_id) - Number(a.post_id);
                    });
                    $scope.isCommentModalCollapsed.push(false);
                    $scope.isCommentModalCollapsed.reverse();
                    $scope.$emit('HidePreloader');
                }

                var createModalReferences = function (element, index, array) {
                    $scope.isCommentModalCollapsed[element.post_id] = true;
                };

                getTopicData();

                function forceUpdateForumProgress() {
                    checkForumProgress(refreshTopicData);
                }

                $scope.showPreviousComments = function (postId) {
                    $scope.showAllCommentsByPost['id' + postId] = 1000000;
                };

                $scope.showMore = function () {
                    $scope.modelState.errorMessages = [];

                    $scope.validateConnection(function () {

                        showMoreCounter++;
                        $scope.$emit('ShowPreloader');
                        moodleFactory.Services.GetAsyncDiscussionPosts(moodleFactory.Services.GetCacheJson("CurrentUser").token, $scope.discussion.id, $scope.discussion.discussion,
                                $scope.activity.forumid, postPager.from, postPager.to, 0, "default", getPostsDataCallback, function (obj) {
                                $scope.$emit('HidePreloader');
                                if (obj && obj.statusCode && obj.statusCode == 408) {//Request Timeout
                                  $timeout(function () {
                                    $location.path('/Offline'); //This behavior could change
                                  }, 1);
                                } else {//Another kind of Error happened
                                  $timeout(function () {
                                      $scope.$emit('HidePreloader');
                                      $location.path('/connectionError');
                                  }, 1);
                                }
                            }, true);
                    }, offlineCallback);

                };

                $scope.back = function () {
                    var moodleId = getMoodleIdFromTreeActivity($routeParams.activityId);

                    switch (moodleId) {
                        case 64:
                            $location.path('ZonaDeVuelo/Conocete/PuntoDeEncuentro/Topicos/' + $routeParams.activityId);
                            break;
                        case 73:
                            $location.path("/ZonaDeVuelo/MisSuenos/PuntosDeEncuentro/Topicos/" + $routeParams.activityId);
                            break;
                        case 197:
                            $location.path("/ZonaDeVuelo/MisSuenos/PuntosDeEncuentro/Topicos/" + $routeParams.activityId);
                            break;
                        case 85:
                            $location.path("/ZonaDeNavegacion/ProyectaTuVida/PuntoDeEncuentro/Topicos/" + $routeParams.activityId);
                            break;
                        case 93:
                            $location.path("/ZonaDeAterrizaje/EducacionFinanciera/PuntoDeEncuentro/Topicos/" + $routeParams.activityId);
                            break;
                        case 179:
                            $location.path("/ZonaDeNavegacion/Transformate/PuntoDeEncuentro/Topicos/" + $routeParams.activityId);
                            break;
                        case 91:
                            $location.path("/ZonaDeAterrizaje/MapaDelEmprendedor/PuntoDeEncuentro/Topicos/" + $routeParams.activityId);
                            break;
                        default:
                            $location.path("/ZonaDeNavegacion/ProyectaTuVida/PuntoDeEncuentro/Topicos/" + $routeParams.activityId);
                            break;
                    }
                };

                $scope.goToGallery = function (post) {

                    var obj = {
                        post_autor_id: post.post_autor_id,
                        post_author: post.post_author,
                        created: post.created,
                        message: post.message,
                        attachment: post.attachment
                    };

                    localStorage.setItem("galleryDetail", JSON.stringify(obj));
                    $scope.navigateTo("/GalleryDetail");
                };


                function errorCallback(data) {
                    $scope.$emit('scrollTop');
                }

                function getContentResources(activityIdentifierId) {
                    drupalFactory.Services.GetContent(activityIdentifierId,
                        function (data, key) {
                            _loadedResources = true;
                            $scope.setToolbar($location.$$path, data.node.tool_bar_title);
                            $scope.backButtonText = data.node.back_button_text;
                            if (_loadedResources && _pageLoaded) {
                                $scope.$emit('HidePreloader');
                            }
                            getRobotMessageContent();
                        }, function () {
                            _loadedResources = true;
                            if (_loadedResources && _pageLoaded) {
                                $scope.$emit('HidePreloader');
                            }
                        }, false);
                }

                function getRobotMessageContent() {
                    drupalFactory.Services.GetContent("BadgeForumRobot", function (data, key) {
                        $scope.robotContentResources = data.node;
                    }, function () {
                    }, false);
                }

            }

        }]).controller('badgeForumRobotMessageModal', ['$scope', '$modalInstance', function ($scope, $modalInstance) {
    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };

    var robotMessage = JSON.parse(localStorage.getItem("badgeRobotMessage"));
    $scope.actualMessage = robotMessage;
}]).controller('timeOutForum', ['$scope', '$modalInstance', '$route', function ($scope, $modalInstance, $route) {//TimeOut Robot

    $scope.ToDashboard = function () {
        $scope.$emit('ShowPreloader');
        $modalInstance.dismiss('cancel');
        $route.reload();
    };
}]);


