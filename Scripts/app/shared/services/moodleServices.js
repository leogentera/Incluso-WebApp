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

        var _getAsyncCourse = function(courseId, successCallback, errorCallback){
            _getAsyncData("course", API_RESOURCE.format('course/' + courseId), successCallback, errorCallback);
        };

        var _getCacheObject = function(key){
            return localStorage.getItem(key);
        };

        var _getAsyncData = function(key, url, successCallback, errorCallback){
            _httpFactory({
                method: 'GET',
                url: url, 
                headers: {'Content-Type': 'application/json'},
                }).success(function(data, status, headers, config) {
                    localStorage.setItem(key, JSON.stringify(data));
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

        return {
            GetAsyncProfile: _getAsyncProfile,
            PutAsyncProfile: _putAsyncProfile,
            GetAsyncUserCourse: _getAsyncUserCourse,
            GetAsyncCourse: _getAsyncCourse,
            GetCacheObject: _getCacheObject
        };
    })();
}).call(this);
