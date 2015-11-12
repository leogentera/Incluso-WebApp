(function () {
    namespace('drupalFactory');
    
    drupalFactory.NodeRelation = {
        "1002": 53, /* Zona de Vuelo - Cabina de Soporte - Chat */
        "1010": 46, /* Zona de Vuelo - Con�cete - Punto de Encuentro */
        "1008": 48, /* Zona de Vuelo - Mis Sue�os - Punto de Encuentro */
        "1049": 47, /* Zona de Vuelo - Con�cete - Zona de Contacto */
        "1101": 22, /* Zona de Vuelo - Cuarto de recursos - Fuente de energ�a */
        "1020": 19, /* Zona de Vuelo - Con�cete - Fuente de energ�a  */
        "1021": 20, /* Zona de Vuelo - Mis Sue�os - Fuente de energ�a */
        "2004": 31, /* Zona de Navegaci�n - Cuarto de recursos - Fuente de energ�a  */
        "2006": 32, /* Zona de Navegaci�n - Transf�rmate - Fuente de energ�a  */
        "2011": 30, /* Zona de Navegaci�n - T� eliges - Fuente de energ�a */
        "2015": 29, /* Zona de Navegaci�n - Proyecta tu vida - Fuente de energ�a  */
        "2022": 54, /* Zona de Navegaci�n - Cabina de Soporte - Chat  */
        "2026": 50, /* Zona de Navegaci�n - Proyecta tu Vida- Punto de Encuentro */
        "2030": 49, /* Zona de Navegaci�n - Transf�rmate - Punto de Encuentro  */
        "3201": 33, /* Zona de Aterrizaje - Cuarto de recursos - Fuente de energ�a */
        "3301": 34, /* Zona de Aterrizaje - Educaci�n Financiera - Fuente de energ�a */
        "3304": 51, /* Zona de Aterrizaje - Mapa del Emprendedor - Punto de Encuentro */
        "1039": 78, /*Zona de Vuelo - Con�cete - Reto M�ltiple*/
        "1039results": 79, /*Zona de Vuelo - Con�cete - Reto M�ltiple Resultados*/
        "3303": 80, /*Zona de Aterrizaje - Educaci�n Financiera - Multiplica tu dinero*/
        "3303results": 81, /*Zona de Aterrizaje - Educaci�n Financiera - Multiplica tu dinero - Resultados*/
        "3401": 35, /* Zona de Aterrizaje - Mapa del Emprendedor - Fuente de energ�a */
        "3404": 52, /* Zona de Aterrizaje - Mapa del Emprendedor - Punto de Encuentro */
        "MapaDelEmprendedor": 88, /* Zona de Aterrizaje - Mapa del Emprendedor - Mapa del emprendedor */
        "3501": 55, /* Zona de Aterrizaje - Cabina de Soporte - Chat */
        "7001": 70, /* Profile */
        "3000": 45, /* Zona de Vuelo - Dashboard */
        "2000": 69, /* Zona de Navegaci�n - Dashboard */
        "0000": 57, /* Programa - Dashboard */
        "ZonaDeVueloClosing":85,    /*Zona de Vuelo - Cierra de Actividad*/
        "ZonaDeNavegacionClosing":86,   /*Zona de Navegaci�n - Cierre de Actividad*/
        "ZonaDeAterrizajeClosing":87,   /*Zona de Aterrizaje - Cierre de Actividad*/
        "PrivacyNotice": 37, /* No tiene activity identifier */
        "AlertsDetail": 23, /* General - Detalle Notificaci�n */
        "Alerts": 24, /* General - Notificaciones*/
        "compartir-experiencia": 68, /* General - Compartir experiencia */
        "TermsAndConditions": 44, /*General - T�rminos y condiciones*/
        "Recognition": 73, /*General - Reconocimiento*/
        "Album": 72, /*General - Album*/
        "MyStars": 71, /*General - Mis Estrellas*/
        //"Profile": 70, /*General - Perfil*/
        "HallOfFame": 42,  /*General - Sal�n de la Fama*/
        "FAQS":41, /*General - FAQS*/
        "1001": 58, /* Zona de Vuelo - Exploraci�n inicial */   
        "1005": 83, /* Zona de Vuelo - Mis Sue�os - Mis Cualidades */     
        "1006": 60, /* Zona de Vuelo - Mis Sue�os - Mis Gustos */
        "1007": 59, /* Zona de Vuelo - Mis Sue�os - Mis Gustos - Sue�a */
        "1009": 61, /* Zona de Vuelo - Exploraci�n Final */
        "2001": 62, /* Zona de Navegaci�n - Exploraci�n inicial */
        "2007": 63, /* Zona de Navegaci�n - Transf�rmate - Tus Ideas */
        "2016": 67, /* Zona de Navegaci�n - Proyecta tu Vida - 1, 3 y 5 */
        "2023": 64, /* Zona de Navegaci�n - Exploraci�n Final */
        "3601": 66, /* Zona de Aterrizaje - Exploraci�n Final */
        "3101": 65, /* Zona de Aterrizaje - Exploraci�n Inicial */
        "HelpAndSupport": 82 /*General - Ayuda y soporte*/
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
