(function () {
    namespace('moodleFactory');

    moodleFactory.Services = (function(){
        var _getAsyncProfile = function(userId, successCallback, errorCallback, forceRefresh){
            _getAsyncData("profile", API_RESOURCE.format('user/' + userId), successCallback, errorCallback, forceRefresh);
        };

        var _putAsyncProfile = function(userId, data, successCallback, errorCallback, forceRefresh){            
            _putAsyncData("profile", data, API_RESOURCE.format('user/' + userId), successCallback, errorCallback);
        };

        var _getAsyncUserCourse = function(userId, successCallback, errorCallback, forceRefresh){
            //the next needs to refactored.  usedid is being passed to the course resource. it should point to usercourse.
            _getCourseAsyncData("course", API_RESOURCE.format('course/' + userId), successCallback, errorCallback);
        };

        var _getAsyncAvatarInfo = function(userId, successCallback, errorCallback, forceRefresh){
            _getAsyncData("avatarInfo", API_RESOURCE.format('avatar/' + userId), successCallback, errorCallback, forceRefresh);
        };

        var _getAsyncActivityInfo = function(activityId, successCallback, errorCallback, forceRefresh){
            _getAsyncData("activity/" + activityId, API_RESOURCE.format('activity/' + activityId), successCallback, errorCallback, forceRefresh);
        };

        var _getAsyncForumInfo = function(activityId, token, successCallback, errorCallback, forceRefresh){
            _getForumAsyncData("activity/" + activityId, API_RESOURCE.format('activity/' + activityId), token, successCallback, errorCallback, forceRefresh);
        };

        var _putAsyncActivityInfo = function(activityId, successCallback,errorCallback, forceRefresh){
            _putAsyncData("activity", API_RESOURCE.format('activityId' + activityId + '/user/' + userId ), successCallback,errorCallback);
        };

        var _getAsyncActivitiesInfo = function(activityId, successCallback, errorCallback, forceRefresh){
            _getAsyncData("activities/" + activityId, API_RESOURCE.format('activities/' + activityId), successCallback, errorCallback, forceRefresh);
        };

        var _getAsyncActivityQuizInfo = function(activityId,userId, successCallback, errorCallback, forceRefresh){
            _getAsyncData("activity/" + activityId, API_RESOURCE.format('activity/' + activityId+'?userid='+userId), successCallback, errorCallback, forceRefresh);
        };

        var _getAsyncActivityForumInfo = function(activityId, successCallback, errorCallback, forceRefresh){
            _getAsyncData("activity/" + activityId, API_RESOURCE.format('activity/' + activityId), successCallback, errorCallback, forceRefresh);
        };

        var _getAsyncCourse = function(courseId, successCallback, errorCallback, forceRefresh){
            successCallback();
        };

        var _getAsyncLeaderboard = function(courseId, successCallback, errorCallback, forceRefresh){
            successCallback();
            _getAsyncData("leaderboard", API_RESOURCE.format('leaderboard/' + courseId), successCallback, errorCallback, forceRefresh);
        };

        var _putAsyncQuiz = function(activityId, data, successCallback, errorCallback, forceRefresh){            
            _putAsyncData("activity/" + activityId, data, API_RESOURCE.format('activity/' + activityId), successCallback, errorCallback);
        };

        var _getUserNotifications = function(userId,successCallback,errorCallback, forceRefresh){
            _getAsyncData("notifications", API_RESOURCE.format('notification/'+ userId),successCallback, errorCallback, forceRefresh);
        };

        var _postUserNotifications = function(userId, data, successCallback, errorCallback, forceRefresh){
            _postAsyncData("notifications/"+userId,data, API_RESOURCE.format('notification'), successCallback, errorCallback);
        };

        var _postAsyncForumPost = function(key, data, successCallback, errorCallback, forceRefresh){
            _postAsyncData(key,data, API_RESOURCE.format('forum'), successCallback, errorCallback);
        };

        var _putUserNotificationRead = function(notificationId, data, successCallback,errorCallback, forceRefresh){
            _putAsyncData("updateNotifications", data, API_RESOURCE.format('notification/')+ notificationId, successCallback, errorCallback);
        };

        var _getUserChat = function(userId, successCallback, errorCallback, forceRefresh){
            _getAsyncData("userChat", API_RESOURCE.format('messaging/' + userId),successCallback,errorCallback, forceRefresh);
        };

        var _putUserChat = function(userId, data, successCallback, errorCallback){
            _putAsyncData(null, data, API_RESOURCE.format('messaging/'+ userId),successCallback,errorCallback);
        };

        var _assignStars = function(data, profile, token, successCallback,errorCallback, forceRefresh){

            _putAsyncStars("profile", data, profile, API_RESOURCE.format('stars/' + data.userId), token, successCallback, errorCallback);
        };

         var _putEndActivity = function(activityId, data, activityModel, token, successCallback,errorCallback){
             _endActivity("activitiesCache/"+ activityId, data, activityModel, API_RESOURCE.format('activity/' + activityId), token, successCallback, errorCallback);

         };

        var _putEndActivityQuizes = function(activityId, data, userCourseModel, token, successCallback,errorCallback, forceRefresh){
            _endActivity("usercourse", data, userCourseModel, API_RESOURCE.format('activity/' + activityId), token, successCallback, errorCallback);

        };

        var _putForumPostLikeNoCache = function(postId, data, successCallback, errorCallback){
            _putDataNoCache(data, API_RESOURCE.format('forum/'+ postId),successCallback,errorCallback);
        };
                                    
        var _getCacheObject = function(key){
            return localStorage.getItem(key);
        };

        var _getCacheJson = function(key){
            var str = localStorage.getItem(key);
            if (str == null) {
                return null;
            } else {
                return JSON.parse(str);
            }
        };

        var _getAsyncData = function(key, url, successCallback, errorCallback, forceRefresh){
            var returnValue = (forceRefresh) ? null : _getCacheJson(key);
                
            if (returnValue) {
                _timeout(function() { successCallback(returnValue, key)}, 1000);                
                return returnValue;
            }
            
            _httpFactory({
                method: 'GET',
                url: url, 
                headers: {'Content-Type': 'application/json'},
                }).success(function(data, status, headers, config) {
                    localStorage.setItem(key, JSON.stringify(data));
                    successCallback(data, key);
                }).error(function(data, status, headers, config) {
                    errorCallback(data);
            });
        };


        var _getForumAsyncData = function(key, url, token, successCallback, errorCallback, forceRefresh){

            var returnValue = (forceRefresh) ? null : _getCacheJson(key);
                
            if (returnValue) {
                _timeout(function() { successCallback(returnValue, key)}, 1000);                
                return returnValue;
            }

            _httpFactory({
                method: 'GET',
                url: url, 
                headers: {'Content-Type': 'application/json', 'Authorization': token},
                }).success(function(data, status, headers, config) {
                  var forum = createForumTree(data);
                  localStorage.setItem(key, JSON.stringify(forum));
                  successCallback(data);
                }).error(function(data, status, headers, config) {
                    errorCallback(data);
            });
        };

        var _getCourseAsyncData = function(key, url, successCallback, errorCallback){
            _httpFactory({
                method: 'GET',
                url: url, 
                headers: {'Content-Type': 'application/json'},
                }).success(function(data, status, headers, config) {
                    createTree(data);
                    successCallback();
                }).error(function(data, status, headers, config) {
                    errorCallback(data);
            });
        };        

        var _postAsyncData = function(key, data, url, successCallback, errorCallback){
            _httpFactory({
                method: 'POST',
                url: url,
                data: data,
                headers: {'Content-Type': 'application/json'},
                }).success(function(data, status, headers, config) {
                console.log('success');
                    localStorage.setItem(key, JSON.stringify(data));
                    successCallback();
                }).error(function(data, status, headers, config) {
                console.log(data);
                    localStorage.setItem(key, JSON.stringify(data));
                    errorCallback();
            });
        };

        var _putAsyncData = function(key, dataModel, url, successCallback, errorCallback){
            _httpFactory({
                method: 'PUT',
                url: url,
                data: dataModel,
                headers: {'Content-Type': 'application/json'},
                }).success(function(data, status, headers, config) {
                    localStorage.setItem(key, JSON.stringify(dataModel));
                    successCallback();
                }).error(function(data, status, headers, config) {
                    localStorage.setItem(key, JSON.stringify(dataModel));
                    errorCallback();
            });
        };

        var _putDataNoCache = function(data, url, successCallback, errorCallback){
            _httpFactory({
                method: 'PUT',
                url: url,
                data: data,
                headers: {'Content-Type': 'application/json'},
            }).success(function(data, status, headers, config) {
                //localStorage.setItem(key, JSON.stringify(dataModel));
                successCallback();
            }).error(function(data, status, headers, config) {
                //localStorage.setItem(key, JSON.stringify(dataModel));
                errorCallback();
            });
        };

        var _putAsyncStars = function(key, dataModel, profile, url, token, successCallback, errorCallback){
            _httpFactory({
                method: 'PUT',
                url: url,
                data: dataModel,
                headers: {'Content-Type': 'application/json', 'Authorization': token},
                }).success(function(data, status, headers, config) {
                    localStorage.setItem(key, JSON.stringify(profile));
                    successCallback();
                }).error(function(data, status, headers, config) {
                    localStorage.setItem(key, JSON.stringify(profile));
                    errorCallback();
            });
        };

        var _putAsyncFirstTimeInfo = function(userId, dataModel, successCallback, errorCallback){            
            _httpFactory({
                method: 'PUT',
                url: API_RESOURCE.format('usercourse/' + userId),
                data: dataModel,
                headers: {'Content-Type': 'application/json'},
                }).success(function(data, status, headers, config) {
                    successCallback();
                }).error(function(data, status, headers, config) {
                    errorCallback();
            });
        };    

        // var _endActivity = function(key, data, activityModel, url, token, successCallback, errorCallback){
        //     _httpFactory({                
        //        method: 'PUT',
        //        url: url,        
        //        data: data,       
        //        headers: {'Content-Type': 'application/json', 'Authorization': token},
        //        }).success(function(data, status, headers, config) {
        //            localStorage.setItem(key, JSON.stringify(activityModel));
        //            successCallback();
        //        }).error(function(data, status, headers, config) {
        //            localStorage.setItem(key, JSON.stringify(activityModel));
        //            errorCallback();
        //    });
        // };
        
        var _endActivity = function(key, data, userCourseModel, url, token, successCallback, errorCallback){            
            _httpFactory({                
               method: 'PUT',
               url: url,        
               data: data,       
               headers: {'Content-Type': 'application/json', 'Authorization': token},
               }).success(function(data, status, headers, config) {
                   localStorage.setItem(key, JSON.stringify(userCourseModel));
                   successCallback(data);
               }).error(function(data, status, headers, config) {
                   localStorage.setItem(key, JSON.stringify(userCourseModel));
                   errorCallback();
           });
        };

        var _startActivity = function(data, activityModel, token, successCallback, errorCallback){
            _httpFactory({
               method: 'PUT',
               url: API_RESOURCE.format('activity/' + activityModel.coursemoduleid),        
               data: data,       
               headers: {'Content-Type': 'application/json', 'Authorization': token},
               }).success(function(data, status, headers, config) {
                   successCallback();
               }).error(function(data, status, headers, config) {
                   errorCallback();
            });
        };

        var createForumTree = function(posts) {

            var forum = {
                activityType: "forum"
            };

            forum["discussions"] = _.filter(posts, function(p) { return p.post_parent == "0"} );

            if (forum["discussions"]) {
                for(i = 0; i < forum["discussions"].length; i++) {
                    forum["discussions"][i]["posts"] = [];
                    forum["discussions"][i]["posts"].push({ 
                      replies: _.filter(posts, function(p) { return p.post_parent == forum.discussions[i].post_id } ),
                    });

                    for(j = 0; j < forum["discussions"][i]["posts"][0].replies.length; j++) {
                        var reply = forum["discussions"][i]["posts"][0].replies[j];
                        if (reply && reply.has_attachment == "1") {
                          reply["attachments"] = [];
                          reply["attachments"].push({ filename: reply.filename, fileurl: reply.fileurl, mimetype: reply.mimetype});
                        }
                        reply["replies"] = _.filter(posts, function (p) {
                                return p.post_parent == reply.post_id;
                            });
                    }
                }
            }
            return forum;
        }

        var refreshProgress = function(usercourse, user)  {
            var globalActivities = 0;
            var globalCompletedActivities = 0;
            var globalPointsAchieved = 0;

            if (usercourse.stages) {
                for(i =0; i < usercourse.stages.length; i++) {
                    //stages

                    var stageActivities = 0;
                    var stageCompletedActivities = 0;

                    if (usercourse.stages[i].challenges) {
                        for(j =0; j < usercourse.stages[i].challenges.length; j++) {
                            //challenges

                            if (usercourse.stages[i].challenges[j].activities) {
                                for(k =0; k < usercourse.stages[i].challenges[j].activities.length; k++) {
                                    //activities

                                    if (usercourse.stages[i].challenges[j].activities[k].activities) {
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
                                    {
                                        globalActivities++;
                                        stageActivities++;

                                        if (usercourse.stages[i].challenges[j].activities[k].status == 1) {
                                            globalCompletedActivities++;
                                            stageCompletedActivities++;
                                            globalPointsAchieved += usercourse.stages[i].challenges[j].activities[k].points;
                                        }
                                    }

                                }
                            }
                            if(usercourse.stages[i].challenges[j].status == 1){
                                globalPointsAchieved += usercourse.stages[i].challenges[j].points;
                            }
                        }
                    }
                    usercourse.stages[i].stageProgress = Math.round(100.0 * stageCompletedActivities / stageActivities, 0);
                    if (usercourse.stages[i].status == 1) {
                        globalPointsAchieved += usercourse.stages[i].points;
                    }
                }
            }
            usercourse.globalProgress = Math.round(100.0 * globalCompletedActivities / globalActivities,0);
            user.stars = globalPointsAchieved;
            return { course: usercourse, user: user };
        }
         
        var createTree = function(activities) {

            var activityManagers = [];

            if (activities.length > 0) {

                //course
                var course = {
                    coursename: activities[0].sectionname,
                    section: activities[0].section,
                    courseid: activities[0].courseid,
                    firsttime: activities[0].firsttime,
                    globalProgress: 0,
                    stages: _.filter(activities,function(a) { 
                        return a.parentsection == activities[0].section && a.section != activities[0].section && a.activity_type == 'ActivityManager' 
                    })
                };

                var assign = null;

                //stages
                for(i = 0; i < course.stages.length; i++) {

                    course.stages[i].stageProgress = 0;
                    course.stages[i].stageStatus = course.stages[i].status;

                    course.stages[i]["challenges"] = _.filter(activities,function(a) { 
                        return a.parentsection == course.stages[i].section && a.section != course.stages[i].section && a.activity_type == 'ActivityManager' 
                    });

                    assign = _.find(activities,function(a) { 
                        return a.parentsection == course.stages[i].parentsection && 
                            a.section == course.stages[i].section &&
                            a.activity_type == 'assign' && a.activityname != 'Cabina de soporte'
                    });

                    if (assign) {
                        course.stages[i].coursemoduleid = assign.coursemoduleid;
                        course.stages[i].points = assign.points;
                        course.stages[i].status = assign.status;
                        course.stages[i].activity_identifier = assign.activity_identifier;
                    }




                    //challenges
                    for(j = 0; j < course.stages[i].challenges.length; j++) {

                       assign = _.find(activities,function(a) { 
                            return a.parentsection == course.stages[i].challenges[j].parentsection && 
                                a.section == course.stages[i].challenges[j].section &&
                                a.activity_type == 'assign'  && a.activityname != 'Cabina de soporte'
                        });

                        if (assign) {
                            course.stages[i].challenges[j].coursemoduleid = assign.coursemoduleid;
                            course.stages[i].challenges[j].points = assign.points;
                            course.stages[i].challenges[j].status = assign.status;
                            course.stages[i].challenges[j].activity_identifier = assign.activity_identifier;
                        }

                        if (course.stages[i].challenges[j].activity_type == "ActivityManager") {
                            activityManagers.push(course.stages[i].challenges[j]);
                        }

                        course.stages[i].challenges[j]["activities"] = _.filter(activities,function(a) { 
                            return a.parentsection == course.stages[i].challenges[j].section && a.section != course.stages[i].challenges[j].section && a.activity_type == 'ActivityManager' 
                        });

                        var childrenActivities =  _.filter(activities,function(a) { 
                            return a.section == course.stages[i].challenges[j].section && a.activity_type != 'ActivityManager' && (a.activity_type != 'assign' || (a.activity_type == 'assign' && a.activityname == 'Cabina de soporte'))
                        });

                        for(k = 0; k < childrenActivities.length; k++) {
                            course.stages[i].challenges[j]["activities"].push(childrenActivities[k]);
                        }

                        //activities
                        for(k= 0; k< course.stages[i].challenges[j].activities.length; k++) {


                            if (course.stages[i].challenges[j].activities[k].activity_type == 'ActivityManager') {

                                activityManagers.push(course.stages[i].challenges[j].activities[k]);

                               assign = _.find(activities,function(a) { 
                                    return a.parentsection == course.stages[i].challenges[j].activities[k].parentsection && 
                                        a.section == course.stages[i].challenges[j].activities[k].section &&
                                        a.activity_type == 'assign'  && a.activityname != 'Cabina de soporte'
                                });

                                if (assign) {
                                    course.stages[i].challenges[j].activities[k].coursemoduleid = assign.coursemoduleid;
                                    course.stages[i].challenges[j].activities[k].points = assign.points;
                                    course.stages[i].challenges[j].activities[k].activity_identifier = assign.activity_identifier;
                                    course.stages[i].challenges[j].activities[k].status = assign.status;
                                }

                                course.stages[i].challenges[j].activities[k]["activities"] = _.filter(activities,function(a) { 
                                    return a.parentsection == course.stages[i].challenges[j].activities[k].section && a.section != course.stages[i].challenges[j].activities[k].section && a.activity_type == 'ActivityManager' 
                                });

                                childrenActivities =  _.filter(activities,function(a) { 
                                    return a.section ==  course.stages[i].challenges[j].activities[k].section && a.activity_type != 'ActivityManager'  && (a.activity_type != 'assign' || (a.activity_type == 'assign' && a.activityname == 'Cabina de soporte'))
                                });

                                if (course.stages[i].challenges[j].activities[k]["activities"]) {
                                    for(l = 0; l < childrenActivities.length; l++) {
                                        course.stages[i].challenges[j].activities[k]["activities"].push(childrenActivities[l]);
                                    }
                                } else {
                                    course.stages[i].challenges[j].activities[k]["activities"] = childrenActivities;
                                }
                            }

                        }

                    }
                }

                var user = JSON.parse(localStorage.getItem("profile"));
                var progress = refreshProgress(course, user);
                course = progress.course;
                user = progress.user;
                localStorage.setItem("profile", JSON.stringify(user));
                localStorage.setItem("usercourse", JSON.stringify(course));
                loadActivityStatus();
                localStorage.setItem("course", JSON.stringify(course));
                localStorage.setItem("activityManagers", JSON.stringify(activityManagers));
                
            }
        };
        var loadActivityStatus = function() {
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
                        activityStatus[activity.coursemoduleid] = activity.status;
                    }

                }
            }
            localStorage.setItem("activityStatus",JSON.stringify(activityStatus));
            _activityStatus = activityStatus;
            console.log("Loaded activityStatus");
        };
        
        return {
            GetAsyncProfile: _getAsyncProfile,
            PutAsyncProfile: _putAsyncProfile,
            GetAsyncUserCourse: _getAsyncUserCourse,
            GetAsyncAvatar: _getAsyncAvatarInfo,
            GetAsyncCourse: _getAsyncCourse,
            GetCacheObject: _getCacheObject,
            GetCacheJson: _getCacheJson,
            GetAsyncActivity: _getAsyncActivityInfo,
            GetAsyncActivities: _getAsyncActivitiesInfo,
            GetAsyncActivityQuizInfo: _getAsyncActivityQuizInfo,
            PutAsyncQuiz: _putAsyncQuiz,
            GetAsyncForumInfo: _getAsyncForumInfo,
            GetUserNotification: _getUserNotifications,
            PutUserNotificationRead: _putUserNotificationRead,
            PostUserNoitifications : _postUserNotifications,
            PostAsyncForumPost: _postAsyncForumPost,
            PutAsyncFirstTimeInfo: _putAsyncFirstTimeInfo,
            GetAsyncLeaderboard: _getAsyncLeaderboard,
            GetUserChat: _getUserChat,
            PutUserChat: _putUserChat,
            PutStars: _assignStars,
            PutStartActivity: _startActivity,
            PutEndActivity: _putEndActivity,
            PutEndActivityQuizes: _putEndActivityQuizes,
            PutForumPostLikeNoCache: _putForumPostLikeNoCache

        };
    })();
}).call(this);
