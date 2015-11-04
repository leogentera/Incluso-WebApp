(function () {
    namespace('moodleFactory');

    moodleFactory.Services = (function () {
        var _getAsyncProfile = function (userId, token, successCallback, errorCallback, forceRefresh) {
            _getAsyncData("profile/" + userId, API_RESOURCE.format('user/' + userId), token, successCallback, errorCallback, forceRefresh);
        };

        var _putAsyncProfile = function (userId, data, successCallback, errorCallback, forceRefresh) {
            _putAsyncData("profile/" + userId, data, API_RESOURCE.format('user/' + userId), successCallback, errorCallback);
        };

        var _putAsyncAcceptTermsAndConditions = function (userId, data, successCallback, errorCallback, forceRefresh){
            _putAsyncData("termsAndConditions/" + userId, data, API_RESOURCE.format('user/' + userId), successCallback, errorCallback);
        };

        var _getAsyncUserCourse = function (userId, successCallback, errorCallback, forceRefresh) {
            //the next needs to refactored.  usedid is being passed to the course resource. it should point to usercourse.
            _getCourseAsyncData("course", API_RESOURCE.format('course/' + userId), successCallback, errorCallback, forceRefresh);
        };

        var _getAsyncAvatarInfo = function (userId, token, successCallback, errorCallback, forceRefresh) {
            _getAsyncData("avatarInfo", API_RESOURCE.format('avatar/' + userId), token, successCallback, errorCallback, forceRefresh);
        };

        var _getAsyncActivityInfo = function (activityId, token, successCallback, errorCallback, forceRefresh) {
            _getAsyncData("activity/" + activityId, API_RESOURCE.format('activity/' + activityId), token, successCallback, errorCallback, forceRefresh);
        };

        var _getAsyncActivitiesEnergy = function (activityArray, successCallback, errorCallback, forceRefresh) {
            _getAsyncData("activity/" + activityArray, API_RESOURCE.format('activity?' + activityArray), null,  successCallback, errorCallback, forceRefresh);
        };

        var _getAsyncForumInfo = function (activityId, token, successCallback, errorCallback, forceRefresh) {
            _getForumAsyncData("activity/" + activityId, API_RESOURCE.format('activity/' + activityId), token, successCallback, errorCallback, forceRefresh);
        };
        
        var _getAsyncForumDiscussions = function (coursemoduleid, token, successCallback, errorCallback, forceRefresh) {
            _getAsyncData("forum/" + coursemoduleid, API_RESOURCE.format('forum/' + coursemoduleid), token, successCallback, errorCallback, forceRefresh);
        };
        
        var _getAsyncUserPostCounter = function(token, courseId, successCallback, errorCallback, forceRefresh) {
          var key = "postcounter/" + courseId;
          var url = API_RESOURCE.format("postcounter/" + courseId);
          
          _getAsyncPostCounter(token, key, url, successCallback, errorCallback, forceRefresh);
        };
        
        var _getAsyncDiscussionPosts = function(token, discussionId, discussion, forumId, sinceId, maxId, first, filter, successCallback, errorCallback, forceRefresh) {
            var key = "discussion/" + token + discussionId + discussion + forumId + sinceId + maxId + first + filter;
            var url = API_RESOURCE.format("discussion/" + discussionId + "?discussion=" + discussion + "&forumid=" + forumId + "&sinceid=" + sinceId + "&maxid=" + maxId + "&first=" + first + "&filter=" + filter);
            
            _getAsyncForumDiscussionsData(key, url, token, successCallback, errorCallback, forceRefresh);
        };

        var _putAsyncActivityInfo = function (activityId, successCallback, errorCallback, forceRefresh) {
            _putAsyncData("activity", API_RESOURCE.format('activityId' + activityId + '/user/' + userId), successCallback, errorCallback);
        };

        var _getAsyncActivitiesInfo = function (activityId, token, successCallback, errorCallback, forceRefresh) {
            _getAsyncData("activities/" + activityId, API_RESOURCE.format('activities/' + activityId), token, successCallback, errorCallback, forceRefresh);
        };

        var _getAsyncActivityQuizInfo = function (activityId, userId, token, successCallback, errorCallback, forceRefresh) {
            if (userId != -1) {
                _getAsyncData("activity/" + activityId, API_RESOURCE.format('activity/' + activityId + '?userid=' + userId), token, successCallback, errorCallback, forceRefresh);
            }
            else {
                _getAsyncData("activity/" + activityId, API_RESOURCE.format('activity/' + activityId), token, successCallback, errorCallback, forceRefresh);
            }
        };

        var _getAsyncActivityForumInfo = function (activityId, token, successCallback, errorCallback, forceRefresh) {
            _getAsyncData("activity/" + activityId, API_RESOURCE.format('activity/' + activityId), token, successCallback, errorCallback, forceRefresh);
        };

        var _getAsyncCourse = function (courseId, successCallback, errorCallback, forceRefresh) {
            successCallback();
        };

        var _getAsyncLeaderboard = function (courseId, token, successCallback, errorCallback, forceRefresh) {
            //successCallback();
            _getAsyncData("leaderboard", API_RESOURCE.format('leaderboard/' + courseId), token, successCallback, errorCallback, forceRefresh);
        };

        var _getAsyncHallOfFame = function (courseId,city,token,successCallback,errorCallback,forceRefresh){
            var url = 'leaderboard/{0}?type=1'.format(courseId);
            if(city != "Ver Todo")
                url = url + "&city=" + city;
            //else url = url + "&city=";
            _getAsyncData("halloffame", API_RESOURCE.format(url), token, successCallback, errorCallback,forceRefresh);
            //var url = 'comment/{0}?first={1}&since={2}&to={3}&count={4}'.format(activityId,first,since,to,count);
        }

        var _getAsyncCatalogs = function(data, succesCallback, errorCallback, forceRefresh) {
            _postAsyncData("catalogs", data, API_RESOURCE.format('catalog'), successCallback, errorCallback);
        };

        var _getAsyncCatalog = function (catalogname,token,successCallback,errorCallback,forceRefresh) {
            _getAsyncData(catalogname,API_RESOURCE.format('catalog?catalogname='+catalogname),token,successCallback,errorCallback,forceRefresh);
        }

        var _putAsyncQuiz = function (activityId, data, successCallback, errorCallback, forceRefresh) {
            _putAsyncData("activity/" + activityId, data, API_RESOURCE.format('activity/' + activityId), successCallback, errorCallback);
        };

        var _getUserNotifications = function (userId, token, successCallback, errorCallback, forceRefresh) {
            _getAsyncData("notifications", API_RESOURCE.format('notification/' + userId), token, successCallback, errorCallback, forceRefresh);
        };

        var _postUserNotifications = function (userId, data, successCallback, errorCallback, forceRefresh) {
            _postAsyncData(null, data, API_RESOURCE.format('notification'), successCallback, errorCallback);
        };

        var _postAsyncForumPost = function (key, data, successCallback, errorCallback, forceRefresh) {
            _postAsyncForumPostData(key, data, API_RESOURCE.format('forum'), successCallback, errorCallback);
        };
        
        var _postAsyncReportAbuse = function (key, data, successCallback, errorCallback, forceRefresh) {
            _postAsyncData(key, data, API_RESOURCE.format('reportabuse'), successCallback, errorCallback);
        };

        var _putUserNotificationRead = function (notificationId, data, successCallback, errorCallback, forceRefresh) {
            _putAsyncData(null, data, API_RESOURCE.format('notification/') + notificationId, successCallback, errorCallback);
        };

        var _getUserChat = function (userId, token, successCallback, errorCallback, forceRefresh) {
            _getAsyncData("userChat", API_RESOURCE.format('messaging/' + userId), token, successCallback, errorCallback, forceRefresh);
        };

        var _putUserChat = function (userId, data, successCallback, errorCallback) {
            _putAsyncData(null, data, API_RESOURCE.format('messaging/' + userId), successCallback, errorCallback);
        };

        var _assignStars = function (data, profile, token, successCallback, errorCallback, forceRefresh) {

            _putAsyncStars("profile/" + data.userId, data, profile, API_RESOURCE.format('stars/' + data.userId), token, successCallback, errorCallback);
        };

        var _putEndActivity = function (activityId, data, activityModel, token, successCallback, errorCallback) {
            _endActivity("activitiesCache/" + activityModel.activity_identifier, data, activityModel, API_RESOURCE.format('activity/' + activityId), token, successCallback, errorCallback);

        };

        var _putEndActivityQuizes = function (activityId, data, userCourseModel, token, successCallback, errorCallback, forceRefresh) {
            _endActivity("usercourse", data, userCourseModel, API_RESOURCE.format('activity/' + activityId), token, successCallback, errorCallback);

        };

        var _putForumPostLikeNoCache = function (postId, data, successCallback, errorCallback) {
            _putDataNoCache(data, API_RESOURCE.format('forum/' + postId), successCallback, errorCallback);
        };

        var _getAsyncAlbum = function (userId, token, successCallback, errorCallback, forceRefresh) {
            _getAsyncData("album", API_RESOURCE.format('albumincluso/' + userId), token, successCallback, errorCallback, forceRefresh);
        };
        
        var _postCommentActivity = function(activityId,data,successCallback,errorCallback){
            _postAsyncCommentToActivity('activityComment/' + activityId,data, API_RESOURCE.format('comment'), successCallback, errorCallback );
        };
        
        var _getCommentByActivity = function(activityId, first,since,to,count, token,successCallback, errorCallback){
            
            var url = 'comment/{0}?first={1}&since={2}&to={3}&count={4}'.format(activityId,first,since,to,count);
            _getAsyncData('comment', API_RESOURCE.format(url), token, successCallback, errorCallback,true);
        };

        var _getAsyncStars = function(userId, token, successCallback, errorCallback, forceRefresh){
            debugger;
            _getAsyncData("userStars", API_RESOURCE.format('stars/'+ userId), token, successCallback, errorCallback, forceRefresh);
        };
        
        var _getCacheObject = function (key) {
            return localStorage.getItem(key);
        };

        var _getCacheJson = function (key) {
            var str = localStorage.getItem(key);
            if (str == null) {
                return null;
            } else {
                return JSON.parse(str);
            }
        };

        var _getAsyncData = function (key, url, token, successCallback, errorCallback, forceRefresh) {
            _getDeviceVersionAsync();
            var returnValue = (forceRefresh) ? null : _getCacheJson(key);

            if (returnValue) {
                _timeout(function () { successCallback(returnValue, key) }, 1000);
                return returnValue;
            }

            if (token) {
                console.log("with authorization");
                _httpFactory({
                    method: 'GET',
                    url: url,
                    headers: { 'Content-Type': 'application/json' , 'Authorization': token}
                }).success(function (data, status, headers, config) {
                    _setLocalStorageJsonItem(key, data);
                    console.log("success getAsyncData using token authorization");
                    successCallback(data, key);
                }).error(function (data, status, headers, config) {
                    errorCallback(data);
                });            
            }else{
                console.log("without authorization");
                _httpFactory({
                    method: 'GET',
                    url: url,
                    headers: { 'Content-Type': 'application/json'}
                }).success(function (data, status, headers, config) {
                    _setLocalStorageJsonItem(key, data);
                    console.log("success getAsyncData using token authorization");
                    successCallback(data, key);
                }).error(function (data, status, headers, config) {
                    errorCallback(data);
                });                                 
            }                                    
        };
        
        var _getAsyncForumDiscussionsData = function (key, url, token, successCallback, errorCallback, forceRefresh) {
            _getDeviceVersionAsync();
            
            var returnValue = (forceRefresh) ? null : _getCacheJson(key);

            if (returnValue) {
                _timeout(function () { successCallback(returnValue, key) }, 1000);
                return returnValue;
            }
            
            _httpFactory({
                method: 'GET',
                url: url,
                headers: { 'Content-Type': 'application/json', 'Authorization': token }
            }).success(function (data, status, headers, config) {
                
                var posts = createPostsTree(data.posts);
                data.posts = posts;
                _setLocalStorageJsonItem(key, data);
                successCallback(data, key);
                
            }).error(function (data, status, headers, config) {
                errorCallback(data);
            });
            
        };

        var _getForumAsyncData = function (key, url, token, successCallback, errorCallback, forceRefresh) {
            _getDeviceVersionAsync();

            var returnValue = (forceRefresh) ? null : _getCacheJson(key);

            if (returnValue) {
                _timeout(function () { successCallback(returnValue, key) }, 1000);
                return returnValue;
            }

            _httpFactory({
                method: 'GET',
                url: url,
                headers: { 'Content-Type': 'application/json', 'Authorization': token },
            }).success(function (data, status, headers, config) {
                var forum = createForumTree(data);
                _setLocalStorageJsonItem(key,forum);
                successCallback(data);
            }).error(function (data, status, headers, config) {
                errorCallback(data);
            });
        };

        var _getCourseAsyncData = function (key, url, successCallback, errorCallback, forceRefresh) {
            _getDeviceVersionAsync();
            
            var returnValue = (forceRefresh) ? null : _getCacheJson(key);

            if (returnValue) {
                _timeout(function () { successCallback(returnValue, key) }, 1000);
                return returnValue;
            }

            _httpFactory({
                method: 'GET',
                url: url,
                headers: { 'Content-Type': 'application/json' },
            }).success(function (data, status, headers, config) {
                createTree(data);
                successCallback();
            }).error(function (data, status, headers, config) {
                errorCallback(data);
            });
        };

        var _postAsyncData = function (key, data, url, successCallback, errorCallback) {
            _getDeviceVersionAsync();
            
            _httpFactory({
                method: 'POST',
                url: url,
                data: data,
                headers: { 'Content-Type': 'application/json' },
            }).success(function (data, status, headers, config) {
                console.log('success');
                
                if (key != null) {
                    _setLocalStorageJsonItem(key,data);
                }
                
                successCallback(key, data);
            }).error(function (data, status, headers, config) {
                console.log(data);
                errorCallback();
            });
        };

        var _postAsyncCommentToActivity = function(key,data,url,successCallback,errorCallback){
          _httpFactory({
                method: 'POST',
                url: url,
                data: data,
                headers: {'Content-Type': 'application/json'}
          }).success(function(){                
                if (key != null) {
                    _setLocalStorageJsonItem(key,data);
                }
                successCallback();                
            }).error(function(){            
                console.log(data);
                errorCallback();                
            });
        };

	var _postAsyncForumPostData = function (key, data, url, successCallback, errorCallback) {
            _getDeviceVersionAsync();
            
            var discussionid = data.discussionid;
            
            _httpFactory({
                method: 'POST',
                url: url,
                data: data,
                headers: { 'Content-Type': 'application/json' },
            }).success(function (data, status, headers, config) {
                console.log('success');
                
                if (key != null) {
                    _setLocalStorageJsonItem(key,data);
                }
                
                updatePostCounter(discussionid);
                successCallback();
            }).error(function (data, status, headers, config) {
                console.log(data);
                _setLocalStorageJsonItem(key,data);
                errorCallback();
            });
        };
        
        var _putAsyncData = function (key, dataModel, url, successCallback, errorCallback) {
            _getDeviceVersionAsync();
            _httpFactory({
                method: 'PUT',
                url: url,
                data: dataModel,
                headers: { 'Content-Type': 'application/json' },
            }).success(function (data, status, headers, config) {
                _setLocalStorageJsonItem(key,dataModel);
                successCallback();
            }).error(function (data, status, headers, config) {
                _setLocalStorageJsonItem(key,dataModel);
                errorCallback();
            });
        };

        var _putDataNoCache = function (data, url, successCallback, errorCallback) {
            _getDeviceVersionAsync();
            
            _httpFactory({
                method: 'PUT',
                url: url,
                data: data,
                headers: { 'Content-Type': 'application/json' },
            }).success(function (data, status, headers, config) {
                //_setLocalStorageJsonItem(key,dataModel);
                successCallback();
            }).error(function (data, status, headers, config) {
                //_setLocalStorageJsonItem(key,dataModel);
                errorCallback();
            });
        };

        var _putAsyncStars = function (key, dataModel, profile, url, token, successCallback, errorCallback) {
            _getDeviceVersionAsync();

            //avoid sending null stars
            dataModel["stars"] = dataModel.stars ? dataModel.stars : 0;

            _httpFactory({
                method: 'PUT',
                url: url,
                data: dataModel,
                headers: { 'Content-Type': 'application/json', 'Authorization': token },
            }).success(function (data, status, headers, config) {
                _setLocalStorageJsonItem(key,profile);
                successCallback();
            }).error(function (data, status, headers, config) {
                _setLocalStorageJsonItem(key,profile);
                errorCallback();
            });
        };

        
        
        var _putAsyncFirstTimeInfo = function (userId, dataModel, successCallback, errorCallback) {
            _getDeviceVersionAsync();
            
            _httpFactory({
                method: 'PUT',
                url: API_RESOURCE.format('usercourse/' + userId),
                data: dataModel,
                headers: { 'Content-Type': 'application/json' },
            }).success(function (data, status, headers, config) {
                successCallback();
            }).error(function (data, status, headers, config) {
                errorCallback();
            });
        };
        
        var _endActivity = function (key, data, userCourseModel, url, token, successCallback, errorCallback) {
            _getDeviceVersionAsync();
            
            _httpFactory({
                method: 'PUT',
                url: url,
                data: data,
                headers: { 'Content-Type': 'application/json', 'Authorization': token }
            }).success(function (data, status, headers, config) {
                _setLocalStorageJsonItem(key,userCourseModel);
                successCallback(data);
            }).error(function (data, status, headers, config) {
                _setLocalStorageJsonItem(key,userCourseModel);
                errorCallback();
            });
        };

        var _startActivity = function (data, activityModel, token, successCallback, errorCallback) {
            _getDeviceVersionAsync();
            
            _httpFactory({
                method: 'PUT',
                url: API_RESOURCE.format('activity/' + activityModel.coursemoduleid),
                data: data,
                headers: { 'Content-Type': 'application/json', 'Authorization': token },
            }).success(function (data, status, headers, config) {
                successCallback();
            }).error(function (data, status, headers, config) {
                errorCallback();
            });
        };

        var createPostsTree = function(posts) {
            var postsTree = new Array();
            
            for(var p = 0; p < posts.length; p++) {
                var post = posts[p];
                
                if (isLegalPost(post, posts)) {
                    var comments = new Array();
                    
                    for(var np = 0; np < posts.length; np++) {
                        var nextPost = posts[np];
                        
                        if ((post["post_id"] != nextPost["post_id"]) && post["post_id"] === nextPost["post_parent"]) {
                            comments.push(nextPost);
                        }
                    }
                    post.replies = comments;
                    postsTree.push(post);
                }
            }
            
            return postsTree;
        };
        
        var isLegalPost = function(post, posts) {
            var isLegalPost = true;
            
            
            if (posts.length > 1) {
                
                for(var p = 0; p < posts.length; p++) {
                    var currentPost = posts[p];
                    
                    if (post["post_id"] != currentPost["post_id"]) {
                        isLegalPost = !(post["post_parent"] == currentPost["post_id"]);
                    
                        if (!isLegalPost) {
                            break;
                        }
                    }
                }
            }
            
            return isLegalPost;
        };
        
        var createForumTree = function (posts) {

            var forum = {
                activityType: "forum"
            };

            forum["discussions"] = _.filter(posts, function (p) { return p.post_parent == "0" });

            if (forum["discussions"]) {
                for (i = 0; i < forum["discussions"].length; i++) {
                    forum["discussions"][i]["posts"] = [];
                    forum["discussions"][i]["posts"].push({
                        replies: _.filter(posts, function (p) { return p.post_parent == forum.discussions[i].post_id }),
                    });

                    for (j = 0; j < forum["discussions"][i]["posts"][0].replies.length; j++) {
                        var reply = forum["discussions"][i]["posts"][0].replies[j];
                        if (reply && reply.has_attachment == "1") {
                            reply["attachments"] = [];
                            reply["attachments"].push({ filename: reply.filename, fileurl: reply.fileurl, mimetype: reply.mimetype });
                        }
                        reply["replies"] = _.filter(posts, function (p) {
                            return p.post_parent == reply.post_id;
                        });
                    }
                }
            }
            return forum;
        }

        var refreshProgress = function (usercourse, user) {
            var globalActivities = 0;
            var globalCompletedActivities = 0;
            var globalPointsAchieved = 0;
            var globalProgress = 0;

            if (usercourse.stages) {
                for (i = 0; i < usercourse.stages.length; i++) {
                    //stages
                    if(usercourse.stages[i].activityname != "General"){    
                        var stageActivities = 0;
                        var stageCompletedActivities = 0;

                        if (usercourse.stages[i].challenges) {
                            for (j = 0; j < usercourse.stages[i].challenges.length; j++) {
                                //challenges

                                if (usercourse.stages[i].challenges[j].activities) {
                                    for (k = 0; k < usercourse.stages[i].challenges[j].activities.length; k++) {
                                        //activities

                                        /*if (usercourse.stages[i].challenges[j].activities[k].activities) {
                                            for(l =0; l < usercourse.stages[i].challenges[j].activities[k].activities.length; l++) {
                                                if (usercourse.stages[i].challenges[j].activities[k].activities[l].activity_type != 'ActivityManager')
                                                {
                                                    globalActivities++;
                                                    stageActivities++;
                                                    if (usercourse.stages[i].challenges[j].activities[k].activities[l].status == 1) {
                                                        globalCompletedActivities++;
                                                        stageCompletedActivities++;
                                                        globalPointsAchieved += usercourse.stages[i].challenges[j].activities[k].activities[l].points;
                                                    }
                                                }
                                            }
                                        } 
                                        else
                                        {*/
                                        globalActivities++;
                                        stageActivities++;

                                        if (usercourse.stages[i].challenges[j].activities[k].status == 1) {
                                            globalCompletedActivities++;
                                            stageCompletedActivities++;
                                            globalPointsAchieved += usercourse.stages[i].challenges[j].activities[k].points;
                                        }
                                        //}

                                    }
                                }
                                if (usercourse.stages[i].challenges[j].status == 1) {
                                    globalPointsAchieved += usercourse.stages[i].challenges[j].points;
                                }
                            }
                        }
                        usercourse.stages[i].stageProgress = Math.floor(100.0 * stageCompletedActivities / stageActivities, 0);
                        if (usercourse.stages[i].status == 1 || usercourse.stages[i].stageProgress == 100) {
                            usercourse.stages[i].status = 1;
                            usercourse.stages[i].stageProgress = 100;
                            globalPointsAchieved += usercourse.stages[i].points;
                        }
                        
                        globalProgress = globalProgress + usercourse.stages[i].stageProgress; 
                    }
                }
            }
            //usercourse.globalProgress = Math.floor(100.0 * globalCompletedActivities / globalActivities, 0);
            usercourse.globalProgress = Math.floor(100*globalProgress/300);
            if (user) {
                user.stars = globalPointsAchieved;
            }
            return { course: usercourse, user: user };
        }

        var createTree = function (activities) {

            var activityManagers = [];

            if (activities.length > 0) {

                //course
                var course = {
                    coursename: activities[0].sectionname,
                    section: activities[0].section,
                    courseid: activities[0].courseid,
                    firsttime: activities[0].firsttime,
                    globalProgress: 0,
                    stages: _.filter(activities, function (a) {
                        return a.parentsection == activities[0].section && a.section != activities[0].section && a.activity_type == 'ActivityManager'
                    }),
                    activities: _.filter(activities, function (a) { return a.activity_type == 'assign' && a.parentsection == 0 })
                };

                var assign = null;

                //stages
                for (i = 0; i < course.stages.length; i++) {

                    course.stages[i].stageProgress = 0;
                    course.stages[i].stageStatus = course.stages[i].status;

                    course.stages[i]["challenges"] = _.filter(activities, function (a) {
                        return a.parentsection == course.stages[i].section && a.section != course.stages[i].section && a.activity_type == 'ActivityManager'
                    });

                    assign = _.find(activities, function (a) {
                        return a.parentsection == course.stages[i].parentsection &&
                            a.section == course.stages[i].section &&
                            a.activity_type == 'assign' && a.activityname != 'Chat'
                    });

                    if (assign) {
                        course.stages[i].coursemoduleid = assign.coursemoduleid;
                        course.stages[i].points = assign.points;
                        course.stages[i].status = assign.status;
                        course.stages[i].activityintro = assign.activityintro;
                        course.stages[i].activity_identifier = assign.activity_identifier;
                    }




                    //challenges
                    for (j = 0; j < course.stages[i].challenges.length; j++) {

                        assign = _.find(activities, function (a) {
                            return a.parentsection == course.stages[i].challenges[j].parentsection &&
                                a.section == course.stages[i].challenges[j].section &&
                                a.activity_type == 'assign' && a.activityname != 'Chat'
                        });

                        if (assign) {
                            course.stages[i].challenges[j].coursemoduleid = assign.coursemoduleid;
                            course.stages[i].challenges[j].points = assign.points;
                            course.stages[i].challenges[j].status = assign.status;
                            course.stages[i].challenges[j].activityintro = assign.activityintro;
                            course.stages[i].challenges[j].activity_identifier = assign.activity_identifier;
                        }

                        if (course.stages[i].challenges[j].activity_type == "ActivityManager") {
                            activityManagers.push(course.stages[i].challenges[j]);
                        }

                        course.stages[i].challenges[j]["activities"] = _.filter(activities, function (a) {
                            return a.parentsection == course.stages[i].challenges[j].section && a.section != course.stages[i].challenges[j].section && a.activity_type == 'ActivityManager'
                        });

                        var childrenActivities = _.filter(activities, function (a) {
                            return a.section == course.stages[i].challenges[j].section && a.activity_type != 'ActivityManager' && (a.activity_type != 'assign' || (a.activity_type == 'assign' && a.activityname == 'Chat'))
                        });

                        for (k = 0; k < childrenActivities.length; k++) {
                            course.stages[i].challenges[j]["activities"].push(childrenActivities[k]);
                        }

                        //activities
                        for (k = 0; k < course.stages[i].challenges[j].activities.length; k++) {


                            if (course.stages[i].challenges[j].activities[k].activity_type == 'ActivityManager') {

                                activityManagers.push(course.stages[i].challenges[j].activities[k]);

                                assign = _.find(activities, function (a) {
                                    return a.parentsection == course.stages[i].challenges[j].activities[k].parentsection &&
                                        a.section == course.stages[i].challenges[j].activities[k].section &&
                                        a.activity_type == 'assign' && a.activityname != 'Chat'
                                });

                                if (assign) {
                                    course.stages[i].challenges[j].activities[k].coursemoduleid = assign.coursemoduleid;
                                    course.stages[i].challenges[j].activities[k].activityintro = assign.activityintro;
                                    course.stages[i].challenges[j].activities[k].points = assign.points;
                                    course.stages[i].challenges[j].activities[k].activity_identifier = assign.activity_identifier;
                                    course.stages[i].challenges[j].activities[k].status = assign.status;
                                }

                                course.stages[i].challenges[j].activities[k]["activities"] = _.filter(activities, function (a) {
                                    return a.parentsection == course.stages[i].challenges[j].activities[k].section && a.section != course.stages[i].challenges[j].activities[k].section && a.activity_type == 'ActivityManager'
                                });

                                childrenActivities = _.filter(activities, function (a) {
                                    return a.section == course.stages[i].challenges[j].activities[k].section && a.activity_type != 'ActivityManager' && (a.activity_type != 'assign' || (a.activity_type == 'assign' && a.activityname == 'Chat'))
                                });

                                if (course.stages[i].challenges[j].activities[k]["activities"]) {
                                    for (l = 0; l < childrenActivities.length; l++) {
                                        course.stages[i].challenges[j].activities[k]["activities"].push(childrenActivities[l]);
                                    }
                                } else {
                                    course.stages[i].challenges[j].activities[k]["activities"] = childrenActivities;
                                }
                            }

                        }

                    }
                }

                /* Conocete - reto múltiple */ 
                var multipleChallengeActivityId = _.filter(_activityRoutes, function (ar){
                    return ar.name == "Reto Multiple";
                });
                
                var multipleChallengeActivity = _.filter(activities, function (a){
                    return a.activity_identifier == multipleChallengeActivityId[0].id;
                });
                
                var multipleChallenges = _.filter(activities, function (a){
                    return  a.section == multipleChallengeActivity[0].section;
                });
                
                var multipleChallengesArray = new Array();
                for(var mc = 0; mc < multipleChallenges.length; mc++) {
                    multipleChallengesArray.push({
                        "name": multipleChallenges[mc].activityname,
                        "description": multipleChallenges[mc].activityintro
                    });
                }
                
                /* General Community */
                var communityActivityId = _.filter(_activityRoutes, function (ar){
                    return ar.name == "Comunidad General";
                });
                
                var generalCommunity = _.filter(activities, function (a){
                    return a.activity_identifier == communityActivityId[0].id;
                })[0];
                
                var community = {
                    activity_identifier: generalCommunity.activity_identifier,
                    activity_type: generalCommunity.activity_type,
                    parentsection: generalCommunity.parentsection,
                    section: generalCommunity.section,
                    sectionname: generalCommunity.sectionname,
                    activityname: generalCommunity.activityname,
                    coursemoduleid: generalCommunity.coursemoduleid,
                    courseid: generalCommunity.courseid,
                    firsttime: generalCommunity.firsttime,
                    last_status_update: generalCommunity.last_status_update,
                    datestarted: generalCommunity.datestarted,
                    started: generalCommunity.started
                };

                var user = JSON.parse(localStorage.getItem("profile/" + moodleFactory.Services.GetCacheObject("userId")));
                var progress = refreshProgress(course, user);
                course = progress.course;
                course.community = community;
                course.multipleChallenges = multipleChallengesArray;
                course.isMultipleChallengeActivityFinished = (multipleChallengeActivity[0].status === 1);
                user = progress.user;
                _setLocalStorageJsonItem("profile/" + moodleFactory.Services.GetCacheObject("userId"),user);
                _setLocalStorageJsonItem("usercourse",course);
                //reload activty status dictionary
                _loadActivityStatus();
                //load activity accessibility flags
                _loadActivityBlockStatus();
                //set stages as completed in local storage, as this is not set by the back-end
                _setStagesStatus();
                _setLocalStorageJsonItem("course",course);
                _setLocalStorageJsonItem("activityManagers",activityManagers);

            }
        };
        var _loadActivityStatus = function () {
            var usercourse = JSON.parse(localStorage.getItem("usercourse"));
            var activityStatus = {};
            var stagesCount = usercourse.stages.length;
            var i, j, k;
            for (i = 0; i < stagesCount; i++) {
                var stage = usercourse.stages[i];
                var challengeCount = stage.challenges.length;
                for (j = 0; j < challengeCount; j++) {
                    var challenge = stage.challenges[j];
                    var challengeActivitiesCount = challenge.activities.length;
                    for (k = 0; k < challengeActivitiesCount; k++) {
                        var activity = challenge.activities[k];
                        if(activity.status) {
                            activityStatus[activity.activity_identifier] = activity.status;
                        }
                    }

                }
            }
            _setLocalStorageJsonItem("activityStatus",activityStatus);
            _activityStatus = activityStatus;
            console.log("Loaded activityStatus");
        };

        //This function updates the status of each stage in local status
        var _setStagesStatus = function () {

            var userCourse = JSON.parse(localStorage.getItem("usercourse"));
            if(!userCourse) return;
            for (var stageIndex = 0; stageIndex < userCourse.stages.length; stageIndex++) {
                var currentStage = userCourse.stages[stageIndex];
                if (currentStage.status == 0 && currentStage.sectionname != "General") {
                    var totalChallengesByStage = currentStage.challenges.length;
                    var totalChallengesCompleted = _.where(currentStage.challenges, {status: 1}).length;
                    if (totalChallengesByStage == totalChallengesCompleted) {
                        userCourse.stages[stageIndex].status = 1;
                    }
                }
            }
            _setLocalStorageJsonItem("usercourse", userCourse);

        };
        
        var _getAsyncPostCounter = function (token, key, url, successCallback, errorCallback, forceRefresh) {
            _getDeviceVersionAsync();
            
            var returnValue = (forceRefresh) ? null : _getCacheJson(key);

            if (returnValue) {
                _timeout(function () { successCallback(returnValue, key) }, 1000);
                return returnValue;
            }

            _httpFactory({
                method: 'GET',
                url: url,
                headers: { 'Content-Type': 'application/json', 'Authorization': token }
            }).success(function (data, status, headers, config) {
                
                var obj = {
                    forums: data,
                    totalExtraPoints: 0
                };
                
                _calculateForumExtraPoints(obj);
                _setLocalStorageJsonItem(key, obj);
                successCallback(data, key);
            }).error(function (data, status, headers, config) {
                errorCallback(data);
            });
        };
        
        var _calculateForumExtraPoints = function(data) {
            
            var totalExtraPoints = 0;
            
            for(var fo = 0; fo < data.forums.length; fo++) {
                
                var extraPoints = 0;
                
                if (data.forums[fo].status == "1") {
                    
                    _.each(data.forums[fo].discussion, function(element, index, list) {
                            extraPoints = extraPoints + (Number(element.total) - 2);
                        });
                }
                
                totalExtraPoints += extraPoints;
            }
            
            data.totalExtraPoints = totalExtraPoints;
        }

        return {
            GetAsyncProfile: _getAsyncProfile,
            PutAsyncProfile: _putAsyncProfile,
            PutAcceptTermsAndConditions: _putAsyncAcceptTermsAndConditions,
            GetAsyncUserCourse: _getAsyncUserCourse,
            GetAsyncAvatar: _getAsyncAvatarInfo,
            GetAsyncCourse: _getAsyncCourse,
            GetCacheObject: _getCacheObject,
            GetCacheJson: _getCacheJson,
            GetAsyncActivity: _getAsyncActivityInfo,
            GetAsyncActivitiesEnergy: _getAsyncActivitiesEnergy,
            GetAsyncActivities: _getAsyncActivitiesInfo,
            GetAsyncActivityQuizInfo: _getAsyncActivityQuizInfo,
            PutAsyncQuiz: _putAsyncQuiz,
            GetAsyncForumInfo: _getAsyncForumInfo,
            GetUserNotification: _getUserNotifications,
            PutUserNotificationRead: _putUserNotificationRead,
            PostUserNoitifications: _postUserNotifications,
            PostAsyncForumPost: _postAsyncForumPost,
            PutAsyncFirstTimeInfo: _putAsyncFirstTimeInfo,
            GetAsyncLeaderboard: _getAsyncLeaderboard,
            GetAsyncHallOfFame: _getAsyncHallOfFame,
            GetAsyncCatalog: _getAsyncCatalog,
            GetUserChat: _getUserChat,
            PutUserChat: _putUserChat,
            PutStars: _assignStars,
            GetAsyncStars: _getAsyncStars,
            PutStartActivity: _startActivity,
            PutEndActivity: _putEndActivity,
            PutEndActivityQuizes: _putEndActivityQuizes,
            PutForumPostLikeNoCache: _putForumPostLikeNoCache,
            GetAsyncDiscussionPosts: _getAsyncDiscussionPosts,
            GetAsyncForumDiscussions: _getAsyncForumDiscussions,
            PostAsyncReportAbuse: _postAsyncReportAbuse,
            GetAsyncAlbum: _getAsyncAlbum,
            RefreshProgress: refreshProgress,
            PostCommentActivity: _postCommentActivity,
            GetCommentByActivity: _getCommentByActivity,
            GetAsyncUserPostCounter: _getAsyncUserPostCounter,
            GetAsyncCatalogs: _getAsyncCatalogs
        };
    })();
}).call(this);
