angular
    .module('incluso.programa.comunidad', ['GlobalAppConstants'])
    .controller('programaComunidadController', [
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
            
            $scope.$emit('ShowPreloader');
            $scope.validateConnection(initController, offlineCallback);
            
            function offlineCallback() {
                $timeout(function() { $location.path("/Offline"); }, 1000);
            }
            
            $scope.mobilecheck = _comboboxCompat;
            $scope.selectClick = function (items, field) {
                 var selectItems = [];
                _.each(items, function(item){
                    selectItems.push(item.name);
                });
               
                selectItems.unshift(field);
                if (window.mobilecheck()) {
                    cordova.exec(function (data) {
                            $("select[name='"+field+"'] option").eq(data.which).prop('selected', true);
                            $timeout( function(){
                                $("select[name='"+field+"'] option").change();
                            }, 10);
                        }, function(){}, "CallToAndroid", "showCombobox", selectItems);
                }
                
            };
            $scope.items = [{
                            name: 'Ver Todo',
                            value: 'default'
                          },{
                            name: 'Relevancia',
                            value: 'relevant'
                          }];
            $scope.filter = "";
            
            function initController() {
                /* global variables */
                _httpFactory = $http;
                _timeout = $timeout;
                
                /* local view variables */
                var _userProfile;
                var _currentUser = moodleFactory.Services.GetCacheJson("CurrentUser");
                var _userId = moodleFactory.Services.GetCacheObject("userId");
                var _course = moodleFactory.Services.GetCacheJson("course");
                var _postPager = { from: 0, to: 0 };
                var _currentFilter = "default";
                $scope.hasCommunityAccess = false;
                $scope.currentDate = new Date().getTime();
                
                $scope.userToken = _currentUser.token;
                $scope.moodleId = $routeParams.moodleid;
                $scope.forumId = 0;
                $scope.discussion = null;
                $scope.communityModals = _initCommunityModals();
                $scope.morePendingPosts = true;
                $scope.posts = new Array();
                $scope.showedCommentsByPost = new Array();
                $scope.isCommentModalCollapsed = new Array();
                $scope.isReportedAbuseModalCollapsed = new Array();
                $scope.isReportedAbuseSentModalCollapsed = new Array();
                $scope.replyText = null;
                $scope.postTextValue = null;
                $scope.postLinkValue = null;
                $scope.postVideoValue = null;
                $scope.postAttachmentValue = null;
                
                $scope.urlify = function (text) {
                    var urlRegex = /(https?:\/\/[^\s]+)/g;
                    return text.replace(urlRegex, function(url) {
                        return '<a class="urlify" href="' + url + '">' + url + '</a>';
                    });
                };
                
                $scope.modelState = {
                    isValid: null,
                    errorMessages: []
                };
                /* Watchers */
                $scope.$watch("modelState.errorMessages", function (newValue, oldValue) {
                    $scope.modelState.isValid = (newValue.length === 0);
                });
                

                /* View settings */
                $rootScope.pageName = "Comunidad";
                $rootScope.navbarBlue = false;
                $rootScope.showToolbar = true;
                $rootScope.showFooter = true;
                $rootScope.showFooterRocks = false;
                $rootScope.showStage1Footer = false;
                $rootScope.showStage2Footer = false;
                $rootScope.showStage3Footer = false;
                $scope.setToolbar($location.$$path,"Comunidad");
                
                
                function _initCommunityModals() {
                    return {
                        "isTextCollapsed":true,
                        "isLinkCollapsed":true,
                        "isVideoCollapsed":true,
                        "isAttachmentCollapsed":true,
                        "isReportCollapsed":true
                    };
                };
                
                function _initCommunity() {

                    $scope.$emit('ShowPreloader');
                                                        
                    drupalFactory.Services.GetContent("BadgeForumRobot",function(data, key){
                        $scope.robotContentResources = data.node;
                        },function(){},false);
                    
                    moodleFactory.Services.GetAsyncForumDiscussions(_course.community.coursemoduleid, $scope.userToken, initCommunitySuccessCallback, function (obj) {
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
                    
                    function initCommunitySuccessCallback (data, key) {

                        var currentDiscussionIds = [];
                        for(var d = 0; d < data.discussions.length; d++) {
                            currentDiscussionIds.push(data.discussions[d].discussion);
                        }
                        localStorage.setItem("currentDiscussionIds", JSON.stringify(currentDiscussionIds));
                        
                        $scope.discussion = data.discussions[0];
                        $scope.forumId = data.forumid;
    
                        moodleFactory.Services.GetAsyncDiscussionPosts(_currentUser.token, $scope.discussion.id, $scope.discussion.discussion,
                            $scope.forumId, _postPager.from, _postPager.to, 1, _currentFilter, getAsyncDiscussionPostsCallback, function (obj) {
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
                }
                
                $scope.collapseCommunityButtomsTrigger = function(element, callFileBrowser) {
                    callFileBrowser ? clickPostAttachment(): '';
                    _uncollapse(element, $scope.communityModals);
                };
                
                $scope.showPreviousCommentsByPost = function(postId) {
                    $scope.showedCommentsByPost["id" + postId] = 1000000;
                };
                
                $scope.showMorePosts = function() {
                    
                    $scope.modelState.errorMessages = [];
                    
                    $scope.validateConnection(function(){
                        
                        $scope.$emit('ShowPreloader');
                        moodleFactory.Services.GetAsyncDiscussionPosts(_currentUser.token, $scope.discussion.id, $scope.discussion.discussion,
                            $scope.forumId, _postPager.from, _postPager.to, 0, _currentFilter, getAsyncDiscussionPostsCallback, function (obj) {
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
                
                var getAsyncDiscussionPostsCallback = function(data, key) {
                    
                    _postPager.from = (_postPager.from < 0 && _postPager.from < data.maxid) ? _postPager.from : data.maxid;
                    _postPager.to = _postPager.to > data.sinceid ? _postPager.to : data.sinceid;
    
                    var posts = data.posts;
                    $scope.morePendingPosts = posts.length === 10;
                    posts.forEach(initializeCommentsData);
                    $scope.posts.sort(function(a, b) { return Number(b.post_id) - Number(a.post_id); });
                    $scope.$emit('HidePreloader');
                };
                
                $scope.updateFilter = function() {
                    
                    if (_currentFilter != $scope.filter.value) {
                        
                        _currentFilter = $scope.filter.value;
                        _postPager.from = 0;
                        _postPager.to = 0;
                        
                        $scope.posts = new Array();
                        $scope.$emit('ShowPreloader');
                        moodleFactory.Services.GetAsyncDiscussionPosts(_currentUser.token, $scope.discussion.id, $scope.discussion.discussion,
                            $scope.forumId, _postPager.from, _postPager.to, 1, _currentFilter, getAsyncDiscussionPostsCallback, function (obj) {
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
                    }
                };
                
                var initializeCommentsData = function(element, index, array){
                    $scope.isCommentModalCollapsed["id" + element.post_id] = false;
                    $scope.isReportedAbuseModalCollapsed["id" + element.post_id] = false;
                    $scope.isReportedAbuseSentModalCollapsed["id" + element.post_id] = false;
                    
                    if ($scope.showedCommentsByPost['id' + element.post_id] != 1000000) {
                        $scope.showedCommentsByPost['id' + element.post_id] = 3;   
                    }
                    
                    var existingPost = false;
                    
                    for(p = 0; p < $scope.posts.length; p++){
                        if ($scope.posts[p].post_id === element.post_id) {
                            element.message = restoreHtmlTag(element.message);
                            $scope.posts[p] = element;
                            existingPost = true;
                            break;
                        }
                    }
                    
                    if (!existingPost) {
                        element.message = restoreHtmlTag(element.message);
                        $scope.posts.push(element);
                    }
                };
                
                var refreshTopicData = function() {
                    moodleFactory.Services.GetAsyncDiscussionPosts(_currentUser.token, $scope.discussion.id, $scope.discussion.discussion,
                        $scope.forumId, _postPager.from, _postPager.to, 1, _currentFilter, getAsyncDiscussionPostsCallback, function (obj) {
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
                
                $scope.reportPost = function(postId) {
                    
                    $scope.modelState.errorMessages = [];
                    
                    $scope.validateConnection(function() {
                    
                        if ($scope.hasCommunityAccess) {
                            var createdDate = (new Date().getTime() / 1000).toFixed(0);
                        
                            var requestData = {
                                "postid": postId,
                                "userid": _userId,
                                "create": createdDate,
                                "forumid": $scope.forumId,
                                "discussionid": $scope.discussion.discussion,
                            };
                        
                            $scope.$emit('ShowPreloader');
                            moodleFactory.Services.PostAsyncReportAbuse(null, requestData, function(){
                                
                                $scope.$emit('HidePreloader');
                                $scope.isReportedAbuseModalCollapsed["id" + postId] = false;
                                $scope.isReportedAbuseSentModalCollapsed["id" + postId] = true;
                                $scope.postToReport.reported = 1;
                                
                                }, function(obj){
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
                        }
                    
                    }, offlineCallback);
                };
                
                $scope.likePost = function(postId) {
                    
                    $scope.modelState.errorMessages = [];
                    
                    $scope.validateConnection(function() {
                    
                        if ($scope.hasCommunityAccess) {
                            var post = _.find($scope.posts, function(a){ return a.post_id == postId });
                        
                            var userLikes = JSON.parse(localStorage.getItem("likesByUser"));
                        
                            if(post.liked == 0) {
                                post.liked = 1;
                                post.likes = parseInt(post.likes) + 1;
                                userLikes.likes = parseInt(userLikes.likes) + 1 ;                                
                            } else {
                                post.liked = 0;
                                post.likes = parseInt(post.likes) - 1;
                                userLikes.likes = parseInt(userLikes.likes) - 1 ;
                            }
                            
                            localStorage.setItem("likesByUser",JSON.stringify(userLikes));
                            
                            var userIdObject = {
                                "userid": _userId
                            };                            
                            moodleFactory.Services.PutForumPostLikeNoCache(postId, userIdObject, countLikesByUser, function (obj) {
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
                    }, offlineCallback);
                };
                
                
                function countLikesByUser() {
                    var userLikes = JSON.parse(localStorage.getItem("likesByUser"));
                    if (userLikes && userLikes.likes == 30){
                            assignLikesBadge();
                    }
                }

                function assignLikesBadge() {
                    var badgeModel = {
                        badgeid: 15 //badge earned when a user likes 30 times.
                    };
    
                    var userProfile = JSON.parse(localStorage.getItem("Perfil/"+ _currentUser.userId));
                    for(var i = 0; i < userProfile.badges.length; i++)
                    {
                        if (userProfile.badges[i].id == badgeModel.badgeid && userProfile.badges[i].status == "pending") {
                            userProfile.badges[i].status = "won";
                            
                            localStorage.setItem("Perfil/" + _currentUser.userId, JSON.stringify(userProfile));
                            showRobotForum();
                            
                            moodleFactory.Services.PostBadgeToUser(_currentUser.userId, badgeModel, function () {
                                }, function (obj) {
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
                
                var communityBadgeReached = function(){
                                    
                    var profileBadges = _userProfile.badges;
                    var badgeForum = _.where(profileBadges, { name: "Participación eléctrica\n"});
                    if (badgeForum && badgeForum[0].status == "pending") {
                        var postCounter = 0;
                        var userCourse = JSON.parse(localStorage.getItem("usercourse"));
                        var courseId = userCourse.courseid;
                        var postCounterForums = JSON.parse(localStorage.getItem("postcounter/"+ courseId));
                        if (postCounterForums.forums) {
                            for(var i = 0; i < postCounterForums.forums.length; i++){                            
                                if (postCounterForums.forums[i].forumactivityid == "50000") {                                                        
                                    var discussions = postCounterForums.forums[i].discussion;
                                    for(var j=0; j < discussions.length; j++){
                                        var comments = discussions[j].total;
                                        postCounter = postCounter + parseInt(discussions[j].total);
                                    }
                                }
                            }
                        }
                        if (postCounter >= 30 && badgeForum[0].status == "pending") {
                            
                            var badgeModel = {
                                badgeid: badgeForum[0].id //badge earned when a user completes his profile.
                            };
                                                                                    
                            for(var i = 0; i < _userProfile.badges.length; i++){
                                if (_userProfile.badges[i].id == badgeModel.badgeid) {
                                    _userProfile.badges[i].status = "won";
                                }
                            }
                    
                            localStorage.setItem("Perfil/" + _currentUser.userId, JSON.stringify(_userProfile));
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
                
                
                function showRobotForum(){
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
                
                $scope.replyToPost = function(that, parentId, topicId, isCommentModalCollapsedIndex) {
                    
                    $scope.modelState.errorMessages = [];
                    
                    $scope.validateConnection(function() {
                    
                        if ($scope.hasCommunityAccess) {
                            var requestData = {
                                "userid": _userId,
                                "discussionid": $scope.discussion.discussion,
                                "parentid": parentId,
                                "message": that.replyText,
                                "createdtime": moment(Date.now()).unix(),
                                "modifiedtime": moment(Date.now()).unix(),
                                "posttype": 1,
                                "fileToUpload": "",
                                "iscountable":1
                            };
                            
                            $scope.$emit('ShowPreloader');
                            $scope.showPreviousCommentsByPost(parentId);
                            moodleFactory.Services.PostAsyncForumPost ('reply', requestData,
                                function(){
                                    updatePostCounter($scope.discussion.discussion);
                                    refreshTopicData();
                                    
                                    $scope.replyText = null;
                                    $scope.isCommentModalCollapsed["id" + parentId] = false;
                                    
                                    $scope.posts[isCommentModalCollapsedIndex].replies.push({
                                        "message": requestData.message,
                                        "post_autor_id": _currentUser.id,
                                        "post_author": _currentUser.alias,
                                        "picture_post_author": _currentUser.profileimageurl
                                    });
                                    
                                    communityBadgeReached();
                                    
                                    $scope.$emit('HidePreloader');
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
                            });
                        }
                    
                    }, offlineCallback);
                };
    
                $scope.postText = function() {
                    
                    $scope.modelState.errorMessages = [];
                    
                    $scope.validateConnection(function() {
                        
                        if ($scope.hasCommunityAccess) {
                            var requestData = {
                                "userid": _userId,
                                "discussionid": $scope.discussion.discussion,
                                "parentid": $scope.discussion.id,
                                "message": $scope.postTextValue,
                                "createdtime": moment(Date.now()).unix(),
                                "modifiedtime": moment(Date.now()).unix(),
                                "posttype": 1,
                                "fileToUpload": null,
                                "iscountable":1
                            };
                            
                            $scope.$emit('ShowPreloader');
                            moodleFactory.Services.PostAsyncForumPost ('new_post', requestData,
                                function() {

                                    refreshTopicData();
                                    updatePostCounter($scope.discussion.discussion);
                                    
                                    $scope.postTextValue = null;
                                    $scope.collapseCommunityButtomsTrigger('isTextCollapsed');
                                    communityBadgeReached();
                                    refreshTopicData();
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
                            });
                        }
                    
                    }, offlineCallback);
                    
                };
                
                $scope.postLink = function() {
                    
                    $scope.modelState.errorMessages = [];
                    
                    $scope.validateConnection(function() {
                    
                        if ($scope.hasCommunityAccess) {
                            var requestData = {
                                "userid": _userId,
                                "discussionid": $scope.discussion.discussion,
                                "parentid": $scope.discussion.id,
                                "message": $scope.postLinkValue,
                                "createdtime": moment(Date.now()).unix(),
                                "modifiedtime": moment(Date.now()).unix(),
                                "posttype": 2,
                                "fileToUpload": null,
                                "iscountable":1
                            };
                            
                            $scope.$emit('ShowPreloader');
                            moodleFactory.Services.PostAsyncForumPost ('new_post', requestData,
                                function() {
                                    
                                    refreshTopicData();
                                    updatePostCounter($scope.discussion.discussion);
                                    
                                    $scope.postLinkValue = null;
                                    $scope.collapseCommunityButtomsTrigger('isLinkCollapsed');
                                    communityBadgeReached();
                                    refreshTopicData();
                                },
                                function(obj) {
                                    $scope.postLinkValue = null;
                                    $scope.collapseCommunityButtomsTrigger('isLinkCollapsed');
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
                        }    
                    
                    }, offlineCallback);
                };
                
                $scope.postVideo = function() {
                    
                    $scope.modelState.errorMessages = [];
                    
                    $scope.validateConnection(function() {
                    
                        if ($scope.hasCommunityAccess) {
                            var requestData = {
                                "userid": _userId,
                                "discussionid": $scope.discussion.discussion,
                                "parentid": $scope.discussion.id,
                                "message": $scope.postVideoValue,
                                "createdtime": moment(Date.now()).unix(),
                                "modifiedtime": moment(Date.now()).unix(),
                                "posttype": 3,
                                "fileToUpload": null,
                                "iscountable":1
                            };
                            
                            moodleFactory.Services.PostAsyncForumPost ('new_post', requestData,
                                function() {
                                    
                                    refreshTopicData();
                                    updatePostCounter($scope.discussion.discussion);
                                    
                                    $scope.postVideoValue = null;
                                    $scope.collapseCommunityButtomsTrigger('isVideoCollapsed');
                                    communityBadgeReached();
                                    refreshTopicData();
                                },
                                function(obj) {
                                    $scope.postVideoValue = null;
                                    $scope.collapseCommunityButtomsTrigger('isVideoCollapsed');
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
                    
                    }, offlineCallback);
                };
                
                $scope.postAttachment = function() {
                    
                    $scope.modelState.errorMessages = [];
                    
                    $scope.validateConnection(function() {
                    
                        if ($scope.hasCommunityAccess) {
                            var requestData = {
                                "userid": _userId,
                                "discussionid": $scope.discussion.discussion,
                                "parentid": $scope.discussion.id,
                                "message": '',
                                "createdtime": moment(Date.now()).unix(),
                                "modifiedtime": moment(Date.now()).unix(),
                                "posttype": 4,
                                "filecontent":$scope.postAttachmentValue.image,
                                "filename": _userId + $scope.postAttachmentValue.fileName,
                                "picture_post_author": _userProfile.profileimageurlsmall,
                                "iscountable":1
                            };
            
                            $scope.$emit('ShowPreloader');
                            moodleFactory.Services.PostAsyncForumPost ('new_post', requestData,
                                function() {
                                    
                                    refreshTopicData();
                                    updatePostCounter($scope.discussion.discussion);
                                    
                                    $scope.postAttachmentValue = {};
                                    $scope.collapseCommunityButtomsTrigger('isAttachmentCollapsed');
                                    communityBadgeReached();
                                    refreshTopicData();
                                },
                                function(obj) {
                                    $scope.postAttachmentValue = {};
                                    $scope.collapseCommunityButtomsTrigger('isAttachmentCollapsed');
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
                    
                    }, offlineCallback);
                    
                };
                
                $scope.clickPostAttachment = function() {
                    
                    $scope.modelState.errorMessages = [];
                    
                    $scope.validateConnection(function() {
                    
                        if ($scope.hasCommunityAccess) {
                            clickPostAttachment();
                        }    
                    
                    }, offlineCallback);
                    
                };
                
                clickPostAttachment = function(){
                    if (window.mobilecheck()) {
                        cordova.exec(SuccessAttachment, FailureAttachment, "CallToAndroid", "AttachPicture", []);
                    }
                };
    
                var SuccessAttachment = function (data) {
                    $scope.$apply(function () {
                        $scope.postAttachmentValue = data;
                    });
                }
    
                var FailureAttachment = function(data) {
    
                }
                
                $scope.back = function () {
                    $location.path('/ProgramaDashboard');
                };
                
                var _uncollapse = function(element, elementsArray){
                    for(var key in elementsArray){
                        key==element? elementsArray[key] = !elementsArray[key] : elementsArray[key] = true;
                    };
                };
                
                $scope.commentModalClick = function(postId) {
                    $scope.isCommentModalCollapsed['id' + postId] = !$scope.isCommentModalCollapsed['id' + postId];
                    $scope.isReportedAbuseModalCollapsed['id' + postId] = false;
                };
                
                $scope.reportModalClick = function(post) {
                    $scope.postToReport = post;
                    $scope.isReportedAbuseModalCollapsed['id' + post.post_id] = !$scope.isReportedAbuseModalCollapsed['id' + post.post_id];
                    $scope.isCommentModalCollapsed['id' + post.post_id] = false;
                };
                
                $scope.goToGallery = function(post) {
                    
                    var obj = {
                        post_autor_id: post.post_autor_id,
                        post_author: post.post_author,
                        created: post.created,
                        message: post.message,
                        attachment: post.attachment
                    }
                    localStorage.setItem("galleryDetail", JSON.stringify(obj));
                    $scope.navigateTo("/GalleryDetail");
                };
                
                var waitForProfileLoaded = setInterval(waitForProfileLoadedTimer, 1500);
                
                function waitForProfileLoadedTimer() {
                    _userProfile = moodleFactory.Services.GetCacheJson("Perfil/" + moodleFactory.Services.GetCacheObject("userId"));
                    
                    if (_userProfile != null) {
                        $timeout(function() {
                            $scope.hasCommunityAccess = _hasCommunityAccessLegacy(_userProfile.communityAccess);
                        }, 1000);
                        clearInterval(waitForProfileLoaded);
                    }
                }
                
                $scope.scrollToTop();
                _initCommunity();
                
            }
            
        }]).controller('badgeForumRobotMessageModal', ['$scope', '$modalInstance', function ($scope, $modalInstance) {
                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };

                var robotMessage = JSON.parse(localStorage.getItem("badgeRobotMessage"));
                $scope.actualMessage = robotMessage;
        }]);