(function () {
    namespace('moodleFactory');

    moodleFactory.Services = (function(){

        var _getAsyncProfile = function(userId, successCallback, errorCallback){
            _getAsyncData("profile", API_RESOURCE.format('user/' + userId), successCallback, errorCallback);
        };

        var _putAsyncProfile = function(userId, data, successCallback, errorCallback){            
            _putAsyncData("profile", data, API_RESOURCE.format('user/' + userId), successCallback, errorCallback);
        };    
        

        var _getAsyncUserCourse = function(userId, successCallback, errorCallback){
            _getAsyncData("usercourse", API_RESOURCE.format('usercourse/' + userId), successCallback, errorCallback);
        };

        var _getAsyncAvatarInfo = function(userId, successCallback, errorCallback){
            _getAsyncData("avatarInfo", API_RESOURCE.format('avatar/' + userId), successCallback, errorCallback);
        };

        var _getAsyncActivityInfo = function(activityId, successCallback, errorCallback){
            _getAsyncData("activity/" + activityId, API_RESOURCE.format('activity/' + activityId), successCallback, errorCallback);
        };

        var _getAsyncForumInfo = function(activityId, topicId, successCallback, errorCallback){
            _getAsyncData("activity/" + activityId, API_RESOURCE.format('activity/' + activityId + '/' + topicId), successCallback, errorCallback);
        };

        var _putAsyncActivityInfo = function(activityId, successCallback,errorCallback){
            _putAsyncData("activity", API_RESOURCE.format('activityId' + activityId + '/user/' + userId ), successCallback,errorCallback);
        };
        
        var _getAsyncActivitiesInfo = function(activityId, successCallback, errorCallback){
            _getAsyncData("activities/" + activityId, API_RESOURCE.format('activities/' + activityId), successCallback, errorCallback);
        };
            
        var _getAsyncCourse = function(courseId, successCallback, errorCallback){
            _getCourseAsyncData("course", API_RESOURCE.format('course/' + courseId), successCallback, errorCallback);
        };

        var _putAsyncQuiz = function(activityId, data, successCallback, errorCallback){            
            _putAsyncData("activity/" + activityId, data, API_RESOURCE.format('activity/' + activityId), successCallback, errorCallback);
        };    

        var _getUserNotifications = function(userId,successCallback,errorCallback){
            _getAsyncData("notifications", API_RESOURCE.format('notification/'+ userId),successCallback, errorCallback);
        };
        
        var _putUserNotificationRead = function(notificationId, data, successCallback,errorCallback){
            _putAsyncData("notifications", data, API_RESOURCE.format('notification/' + notificationId), successCallback, errorCallback);
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

        var _getAsyncData = function(key, url, successCallback, errorCallback){
            _httpFactory({
                method: 'GET',
                url: url, 
                headers: {'Content-Type': 'application/json'},
                }).success(function(data, status, headers, config) {
                    localStorage.setItem(key, JSON.stringify(data));
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
                    localStorage.setItem(key, JSON.stringify(data));
                    successCallback();
                }).error(function(data, status, headers, config) {
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

        //var _endActivity = function(userId,activityId){            
        //     _httpFactory({
        //        method: 'PUT',
        //        url: "activity/" + activityId + "userId/" + userId,                
        //        headers: {'Content-Type': 'application/json'},
        //        }).success(function(data, status, headers, config) {
        //            localStorage.setItem(key, JSON.stringify(data));
        //            successCallback();
        //        }).error(function(data, status, headers, config) {
        //            localStorage.setItem(key, JSON.stringify(data));
        //            errorCallback();
        //    });
        //};
        
        
        
        
        var createTree = function(activities) {

            var activityManagers = [];

            if (activities.length > 0) {

                //course
                var course = {
                    coursename: activities[0].sectionname,
                    section: activities[0].section,
                    stages: _.filter(activities,function(a) { 
                        return a.parentsection == activities[0].section && a.section != activities[0].section && a.activity_type == 'ActivityManager' 
                    })
                };

                var assign = null;

                //stages
                for(i = 0; i < course.stages.length; i++) {
                    console.log('stage:' + course.stages[i].sectionname);
                    course.stages[i]["challenges"] = _.filter(activities,function(a) { 
                        return a.parentsection == course.stages[i].section && a.section != course.stages[i].section && a.activity_type == 'ActivityManager' 
                    });

                    assign = _.find(activities,function(a) { 
                        return a.parentsection == course.stages[i].parentsection && 
                            a.section == course.stages[i].section &&
                            a.activity_type == 'assign' 
                    });

                    if (assign) {
                        course.stages[i].coursemoduleid = assign.coursemoduleid;
                        course.stages[i].points = assign.points;
                        course.stages[i].activity_identifier = assign.activity_identifier;
                    }


                    //challenges
                    for(j = 0; j < course.stages[i].challenges.length; j++) {
                        console.log('challenge:' + course.stages[i].challenges[j].sectionname);

                       assign = _.find(activities,function(a) { 
                            return a.parentsection == course.stages[i].challenges[j].parentsection && 
                                a.section == course.stages[i].challenges[j].section &&
                                a.activity_type == 'assign' 
                        });

                        if (assign) {
                            course.stages[i].challenges[j].coursemoduleid = assign.coursemoduleid;
                            course.stages[i].challenges[j].points = assign.points;
                            course.stages[i].challenges[j].activity_identifier = assign.activity_identifier;
                        }

                        if (course.stages[i].challenges[j].activity_type == "ActivityManager") {
                            activityManagers.push(course.stages[i].challenges[j]);
                        }

                        course.stages[i].challenges[j]["activities"] = _.filter(activities,function(a) { 
                            return a.parentsection == course.stages[i].challenges[j].section && a.section != course.stages[i].challenges[j].section && a.activity_type == 'ActivityManager' 
                        });

                        var childrenActivities =  _.filter(activities,function(a) { 
                            return a.section == course.stages[i].challenges[j].section && a.activity_type != 'ActivityManager' && a.activity_type != 'assign'
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
                                        a.activity_type == 'assign' 
                                });

                                if (assign) {
                                    course.stages[i].challenges[j].activities[k].coursemoduleid = assign.coursemoduleid;
                                    course.stages[i].challenges[j].activities[k].points = assign.points;
                                    course.stages[i].challenges[j].activities[k].activity_identifier = assign.activity_identifier;
                                }

                                course.stages[i].challenges[j].activities[k]["activities"] = _.filter(activities,function(a) { 
                                    return a.parentsection == course.stages[i].challenges[j].activities[k].section && a.section != course.stages[i].challenges[j].activities[k].section && a.activity_type == 'ActivityManager' 
                                });

                                childrenActivities =  _.filter(activities,function(a) { 
                                    return a.section ==  course.stages[i].challenges[j].activities[k].section && a.activity_type != 'ActivityManager' 
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

            localStorage.setItem("course", JSON.stringify(course));
            localStorage.setItem("activityManagers", JSON.stringify(activityManagers));
                
            }
        }        
        
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
            PutAsyncActivity: _putAsyncActivityInfo,
            PutAsyncQuiz: _putAsyncQuiz,
            GetAsyncForumInfo: _getAsyncForumInfo,
            GetUserNotification: _getUserNotifications,
            PutUserNotificationRead: _putUserNotificationRead
        };
    })();
}).call(this);
