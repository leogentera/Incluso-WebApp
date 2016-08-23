(function () {
    namespace('drupalFactory');
    
    drupalFactory.NodeRelation = {
        "tutorial": 95, /* General - Tutorial */
        "host":"http://definityincluso.cloudapp.net/incluso-drupal",
        "0000": 57, /* Programa - Dashboard */
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
        "1039Robot": 92, /*Zona de Vuelo - Con�cete - Reto M�ltiple Robot*/
        "3303": 80, /*Zona de Aterrizaje - Educaci�n Financiera - Multiplica tu dinero*/
        "TuEligesRobot": 93, /* Zona de Navegaci�n - T� eliges Reprobado */
        "MultiplicaTuDineroRobot": 94, /* Zona de Navegaci�n - T� eliges Reprobado */
        "3303results": 81, /*Zona de Aterrizaje - Educaci�n Financiera - Multiplica tu dinero - Resultados*/
        "3401": 35, /* Zona de Aterrizaje - Mapa del Emprendedor - Fuente de energ�a */
        "3404": 52, /* Zona de Aterrizaje - Mapa del Emprendedor - Punto de Encuentro */
        "MapaDelEmprendedor": 88, /* Zona de Aterrizaje - Mapa del Emprendedor - Mapa del emprendedor */
        "3501": 55, /* Zona de Aterrizaje - Cabina de Soporte - Chat */
        "7001": 70, /* Profile */
        "1000": 91, /* Zona de Aterrizaje - Dashboard*/
        "3000": 45, /* Zona de Vuelo - Dashboard */
        "2000": 69, /* Zona de Navegaci�n - Dashboard */
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
        "1049147": 102, /* Zona de Vuelo - Con�cete - Robot Foros */
        "HelpAndSupport": 82, /*General - Ayuda y soporte*/
        "tuEliges": 96, /* Zona de Navegación - Tu Eliges - Tu Eliges */
        "mapaVida": 97, /* Zona de Navegación - Proyecta tu vida - Mapa de vida */
        "systemRequirements": 98,
        "fuenteDeEnergiaRequirements": 99,
        "BadgePerfilRobot": 100, /*General - Robot al ganar el badge de perfil*/
        "BadgeForumRobot": 101, /*General - Robot al ganar el badge de foros*/
        "robot-inclubot" : 56, /*Dashboard Programa - Robot Inclubot*/
        "RetroalimentacionClosing" : 104,  /*Cierre de actividad Retroalimentación*/
        "chat_generic_message" : 103  /*Mensaje genérico de Chat*/
    };

    drupalFactory.Services = (function () {

        var globalTimeOut = 60000;
        var longTimeOut = 120000;
        
        var _getContent = function (activityIdentifierId, successCallback, errorCallback, forceRefresh) {
            
            _getAsyncData("drupal/content/" + activityIdentifierId, DRUPAL_API_RESOURCE.format(drupalFactory.NodeRelation[activityIdentifierId]), activityIdentifierId, successCallback, errorCallback, forceRefresh);
        };
        
        var _getAsyncData = function (key, url, activityIdentifierId, successCallback, errorCallback, forceRefresh) {
            
            var returnValue = (forceRefresh) ? null : _getCacheJson(key);

            if (returnValue) {
                _timeout(function () { successCallback(returnValue, key) }, 1000);
                return returnValue;
            }

            var currentTime = new Date().getTime();

            _httpFactory({
                method: 'GET',
                url: url,
                timeout: globalTimeOut,
                headers: { 'Content-Type': 'application/json'}
            }).success(function (data, status, headers, config) {
                _setLocalStorageJsonItem(key, data);
                successCallback(data, key);
            }).error(function (data, status, headers, config) {
                var finalTime = new Date().getTime();

                if (returnValue != null) {
                    successCallback(returnValue, key);
                } else {
                    var obj = {};

                    if (data) {
                        if (data.messageerror) {
                            obj.messageerror = data.messageerror;
                        } else {
                            obj.messageerror = "Undefined Server Error";
                        }

                    } else {
                        obj.messageerror = "Undefined Server Error";
                        obj.statusCode = 500;
                    }

                    if (finalTime - currentTime > globalTimeOut && globalTimeOut > 0) {
                        obj.statusCode = 408;
                        obj.messageerror = "Request Timeout";
                    }

                    errorCallback(obj);
                }
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

        var _getDrupalContent = function ( successCallback, errorCallback, forceRefresh, isLoginRequest) {

            _getAsyncDataDrupal(DRUPAL_CONTENT_RESOURCE, successCallback, errorCallback, forceRefresh, isLoginRequest);
        };
        
        var _getAsyncDataDrupal = function (url, successCallback, errorCallback, forceRefresh, isLoginRequest) {            

            if (!forceRefresh) {
                var returnValue = _getCacheJson(key);
                _timeout(function () {
                    successCallback(returnValue, key)
                }, 1000);
            }

            var currentTime = new Date().getTime();

            var timeOut = globalTimeOut;
            if (isLoginRequest) {//Calling from login/register
                timeOut = longTimeOut;
            }

            _httpFactory({
                method: 'POST',
                url: url ,
                timeout: timeOut,
                headers: { 'Content-Type': 'application/x-www-form-urlencoded'},
                data:  JSON.stringify( drupalFactory.NodeRelation)
            }).success(function (data, status, headers, config) {

                for (var key in data) {
                    if (data.hasOwnProperty(key)) {
                        //alert(key + " -> " + p[key]);
                        _setLocalStorageJsonItem("drupal/content/" + key, data[key]);
                    }
                }

                successCallback(data);
                //successCallback(data, key);
            }).error(errorCallback);
        };

        return {
            GetContent: _getContent,
            GetDrupalContent: _getDrupalContent,
        };
    })();
    
}).call(this);
