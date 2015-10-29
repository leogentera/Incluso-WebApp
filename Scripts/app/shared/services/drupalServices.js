(function () {
    namespace('drupalFactory');
    
    drupalFactory.NodeRelation = {        
        "1101": 22, /* Zona de Vuelo - Cuarto de recursos - Fuente de energ�a */
        "1020": 19, /* Zona de Vuelo - Con�cete - Fuente de energ�a  */
        "1021": 20, /* Zona de Vuelo - Mis Sue�os - Fuente de energ�a */
        "2004": 31, /* Zona de Navegaci�n - Cuarto de recursos - Fuente de energ�a  */
        "2006": 32, /* Zona de Navegaci�n - Transf�rmate - Fuente de energ�a  */
        "2011": 30, /* Zona de Navegaci�n - T� eliges - Fuente de energ�a */
        "2015": 29, /* Zona de Navegaci�n - Proyecta tu vida - Fuente de energ�a  */
        "3201": 33, /* Zona de Aterrizaje - Cuarto de recursos - Fuente de energ�a */
        "3301": 34, /* Zona de Aterrizaje - Educaci�n Financiera - Fuente de energ�a */
        "1039": 78, /*Zona de Vuelo - Con�cete - Reto M�ltiple*/
        "1039results": 79, /*Zona de Vuelo - Con�cete - Reto M�ltiple Resultados*/
        "3303": 80, /*Zona de Aterrizaje - Educaci�n Financiera - Multiplica tu dinero*/
        "3303results": 81, /*Zona de Aterrizaje - Educaci�n Financiera - Multiplica tu dinero - Resultados*/
        "3401": 35, /* Zona de Aterrizaje - Mapa del Emprendedor - Fuente de energ�a */
        "7001": 26, /* Profile */
        "3000": 45, /* Zona de Vuelo - Dashboard */
        "2000": 69, /* Zona de Navegaci�n - Dashboard */
        "0000": 57, /* Programa - Dashboard */
        "PrivacyNotice": 37, /* No tiene activity identifier */
        "AlertsDetail": 23, /* General - Detalle Notificaci�n */
        "Alerts": 24, /* General - Notificaciones*/
        "compartir-experiencia": 68, /* General - Compartir experiencia */
        "TermsAndConditions": 44, /*General - T�rminos y condiciones*/
        "Recognition": 73, /*General - Reconocimiento*/
        "Album": 72, /*General - Album*/
        "MyStars": 72, /*General - Mis Estrellas*/
        "Profile": 70, /*General - Perfil*/
        "HallOfFame": 42,  /*General - Sal�n de la Fama*/
        "FAQS":41 /*General - FAQS*/

    };

    drupalFactory.Services = (function () {
        
        var _getContent = function (activityIdentifierId, successCallback, errorCallback, forceRefresh) {
            
            _getAsyncData("drupal/content/" + activityIdentifierId, DRUPAL_API_RESOURCE.format(drupalFactory.NodeRelation[activityIdentifierId]), activityIdentifierId, successCallback, errorCallback, forceRefresh);
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
