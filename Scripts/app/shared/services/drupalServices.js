(function () {
    namespace('drupalFactory');
    
    drupalFactory.NodesRelation = {
        "1101": 22
    };

    drupalFactory.Services = (function () {
        
        var _getContent = function (activityIdentifierId, sucessCallback, errorCallback, forceRefresh) {
            
            _getAsyncData("drupal/content/" + activityIdentifierId, DRUPAL_API_RESOURCE.format(activityIdentifierId), successCallback, errorCallback, forceRefresh);
        };
        
        var _getAsyncData = function (key, url, activityIdentifierId, successCallback, errorCallback, forceRefresh) {
            
            var returnValue = (forceRefresh) ? null : _getCacheJson(key);

            if (returnValue) {
                _timeout(function () { successCallback(returnValue, key) }, 1000);
                return returnValue;
            }

            _httpFactory({
                method: 'GET',
                url: url,
                headers: { 'Content-Type': 'application/json'}
            }).success(function (data, status, headers, config) {
                _setLocalStorageJsonItem(key, data);
                successCallback(data, key);
            }).error(function (data, status, headers, config) {
                errorCallback(data);
            });
        };
        
        var _getCacheJson = function (key) {
            var str = localStorage.getItem(key);
            if (str == null) {
                return null;
            } else {
                return JSON.parse(str);
            }
        };

        return {
            GetContent: _getContent,
        };
    })();
    
}).call(this);
