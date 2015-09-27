// http://weblogs.asp.net/dwahlin/archive/2013/09/18/building-an-angularjs-modal-service.aspx
angular
    .module('incluso.programa.profile', [])
    .controller('programaProfileController', [
        '$q',
        '$scope',
        '$location',
        '$routeParams',
        '$timeout',
        '$rootScope',
        '$http',
        '$filter',
        '$route',
        function ($q, $scope, $location, $routeParams, $timeout, $rootScope, $http, $filter, $route) {

            _httpFactory = $http;
            _timeout = $timeout;
            
            var _course = moodleFactory.Services.GetCacheJson("course");
            $scope.discussion = null;
            $scope.forumId = null;
            
            $scope.loggedUser = ($routeParams.id == moodleFactory.Services.GetCacheObject("userId"));
            $scope.userId = $routeParams.id != null ? $routeParams.id : moodleFactory.Services.GetCacheObject("userId");
            
            $scope.isMultipleChallengeActivityFinished = $scope.loggedUser && _course.isMultipleChallengeActivityFinished;
            $scope.myStrengths = new Array();
            $scope.myWindowOfOpportunities = new Array();
            
            $scope.setToolbar($location.$$path, "");
            $scope.currentPage = 1;
            $rootScope.showFooter = true;
            $rootScope.showFooterRocks = false;
            $rootScope.showStage1Footer = false;
            $rootScope.showStage2Footer = false;
            $rootScope.showStage3Footer = false;
            $scope.status = "";
            $scope.shareAchievementMessage = "";
            $scope.showShareAchievementMessage = false;
            $scope.showSharedAchievement = false;
            $scope.hasCommunityAccess = false;
            
            $scope.$emit('ShowPreloader');


            getDataAsync(function () {

                /////// privacy settings initial switches [boolean]/////////
                $scope.generalInfo = true;
                $scope.schoolarship = false;
                $scope.address = false;
                $scope.phone = true;
                $scope.socialNet = true;
                $scope.family = false;
                /////////////////////////////////////////////////////////////
                
                $scope.totalBadges = $scope.model.badges.length;  //Number of items in the 'badges' array
                $scope.totalBadgePages = Math.ceil($scope.totalBadges / 12);
                $scope.badgePage = 0;
                $scope.normalBadgePage = $scope.badgePage + 1;
                $scope.wholeBadgesPages = [];
                var copyBadges = $scope.model.badges.slice();  //Deep copy of the $scope.model.badges array
                
                for (var i = 0; i < $scope.totalBadgePages; i++) {
                    var top = Math.min(12, $scope.totalBadges - 12 * i);
                    $scope.wholeBadgesPages[i] = [];
                    for (var j = 0; j < top; j++) {
                        var elem = copyBadges.shift(); //extracts first element of remaining array

                        if (elem.status == "won") {
                            elem.filename = getFileName(elem.id);
                            elem.description = getDescription(elem.id);
                        } else {
                            elem.filename = "insignia-bloqueada.gif";
                        }

                        $scope.wholeBadgesPages[i].push(elem);
                    }
                }

                $scope.model.modelState = {
                    isValid: null,
                    errorMessages: []
                };

                $rootScope.pageName = "Mi perfil";
                $rootScope.navbarBlue = false;
                $rootScope.showToolbar = true;
                $rootScope.showFooter = true;
                $scope.genderItems = ['Masculino', 'Femenino'];
                $scope.countryItems = ['México', 'Guatemala', 'Costa Rica', 'Perú', 'Brasil'];
                $scope.cityItems = ['México D.F.', 'Guadalajara', 'Monterrey', 'Villa hermosa'];
                $scope.stateItems = ['Distrito Federal', 'Coahuila', 'Jalisco', 'México', 'Nuevo León'];
                $scope.maritalStatusItems = ['Soltero(a)', 'Casado(a)', 'Unión libre'];
                /*unir1*/ $scope.studiesList = ['Primaria', 'Secundaria', 'Preparatoria', 'Universidad'];
                $scope.educationStatusList = ['Terminada', 'En proceso', 'Inconclusa'];
                $scope.favoritSportsList = ['Ciclismo', 'Patinaje/skateboarding', 'Fútbol Soccer', 'Basquetbol', 'Artes Marciales', 'Yoga', 'Natación', 'Futbol Americano', 'Basebol', 'Carreras'];
                $scope.artisticActivitiesList = ['Pintura', 'Música', 'Danza', 'Fotografia', 'Graffiti', 'Diseño Gráfico', 'Artesanías', 'Teatro', 'Modelado', 'Dibujo'];
                $scope.hobbiesList = ['Ir a fiestas', 'Leer', 'Pasar tiempo con amigos', 'Cocinar', 'Jugar videojuegos', 'Visitar museos', 'Ver películas/series', 'Ver televisión', 'Modelado', 'Pasar tiempo en redes sociales'];
                $scope.talentsList = ['Cantar', 'Llevar ritmos', 'Bailar', 'Hablar frente a otros', 'Dibujar', 'Hacer amigos', 'Hacer operaciones matemáticas', 'Aprender cosas rápido', 'Ubicar lugares', 'Memorizar', 'Hacer manualidades'];
                $scope.valuesList = ['Tolerancia', 'Respeto', 'Honestidad', 'Responsabilidad', 'Confiabilidad', 'Solidaridad', 'Igualdad', 'Lealtad', 'Amistad', 'Generosidad', 'Esfuerzo'];
                $scope.habilitiesList = ['Empatía', 'Creatividad', 'Liderazgo', 'Comunicación', 'Negociación', 'Trabajo en equipo', 'Innovación', 'Iniciativa', 'Toma de decisiones', 'Planeación', 'Organización'];
                $scope.iLiveWithList = ['Ambos padres', 'Padre', 'Madre', 'Tíos', 'Esposo(a)', 'Abuelos', 'Amigos'];
                $scope.mainActivityList = ['Estudias', 'Trabajas', 'Ni estudias ni trabajas'];
                /*unir1*/$scope.levelList = ['Primaria', 'Secundaria', 'Preparatoria', 'Universidad'];
                $scope.gradeList = ['1er', '2do', '3ro', '4to', '5to', '6to'];
                $scope.periodList = ['Año', 'Semestre', 'Cuatrimestre', 'Trimestre', 'Bimestre'];
                $scope.yesNoList = ['Si', 'No'];
                $scope.moneyIncomeList = ['Padres', 'Trabajo'];
                $scope.medicalCoverageList = ['Sí', 'No', 'No sé'];
                $scope.medicalInsuranceList = ['IMSS', 'Privado', 'Seguro Popular'];
                $scope.knownDevicesList = ['Laptop', 'Tableta', 'Celular', 'Computadora'];
                $scope.phoneUsageList = ['Hacer llamadas', 'Mensajes', 'Música', 'Videos', 'Fotos', 'Descargas', 'Investigación', 'Juegos', 'Redes sociales', 'Tomar selfies', 'Grabar videos'];
                $scope.videoGamesFrecuencyList = ['Diario', '3 veces a la semana', '1 vez a la semana', '1 o 2 veces al mes', 'Nunca'];
                $scope.kindOfVideoGamesList = ['Acción', 'Deportes', 'Violencia', 'Aventura', 'Reto', 'Estrategia', 'Educativos', 'Peleas'];
                $scope.socialNetworksList = ['Facebook', 'Instagram', 'Twitter'];
                $scope.inspirationalCharactersList = ['Familiar', 'Artista', 'Deportista', 'Figura social', 'Figura política'];
                $scope.familiaCompartamosList = ['Madre', 'Padre', 'Tío(a)', 'Abuelo(a)', 'Primo(a)', 'Hermano(a)'];

                $scope.birthdate_Dateformat = formatDate($scope.model.birthday);
                getAge();
                $scope.showPlaceHolder = true;

            });

            function  loadStrengths() {
                
                var strengthArray = new Array();
                
                for(var s = 0; s < $scope.model.strengths.length; s++) {
                    
                    var strength = $scope.model.strengths[s];
                    var result = _.find(_course.multipleChallenges, function(mc) { return mc.name == strength.replace("\r", ""); });
                    
                     strengthArray.push(result);
                }
                
                $scope.myStrengths = strengthArray;
            }
            
            function loadWindowOfOpportunities() {
                
                var windowOfOpportunitiesArray = new Array();
                
                for(var s = 0; s < $scope.model.windowOfOpportunity.length; s++) {
                    
                    var windowOfOpportunities = $scope.model.windowOfOpportunity[s];
                    var result = _.find(_course.multipleChallenges, function(mc) { return mc.name == windowOfOpportunities.replace("\r", ""); });
                    
                     windowOfOpportunitiesArray.push(result);
                }
                
                $scope.myWindowOfOpportunities = windowOfOpportunitiesArray;
            }

            function getFileName(id) {
                var filename = "";

                switch (id) {
                    case 2:
                        filename = "insignias-combustible.gif";
                        break;
                    case 3:
                        filename = "insignias-turbina.gif";
                        break;
                    case 4:
                        filename = "insignias-ala.gif";
                        break;
                    case 5:
                        filename = "insignias-sist-navegacion.gif";
                        break;
                    case 6:
                        filename = "insignias-propulsor.gif";
                        break;
                    case 7:
                        filename = "insignias-misiles.gif";
                        break;
                    case 8:
                        filename = "insignias-campodefuerza.gif";
                        break;
                    case 9:
                        filename = "insignias-radar.gif";
                        break;
                    case 10:
                        filename = "insignias-tanqueoxigeno.gif";
                        break;
                    case 11:
                        filename = "insignias-sondaespacial.gif";
                        break;
                    case 12:
                        filename = "insignias-foro.gif";
                        break;
                    case 13:
                        filename = "insignias-id.gif";
                        break;
                    case 14:
                        filename = "insignias-participacion.gif";
                        break;
                    case 15:
                        filename = "insignias-corazon.gif";
                        break;
                    case 16:
                        filename = "insignias-casco.gif";
                        break;
                    case 17:
                        filename = "insignias-radio.gif";
                        break;
                    case 18:
                        filename = "insignias-turbo.gif";
                        break;
                    default:
                        filename = "insignia-bloqueada.gif";
                }

                return filename;
            }

            function getDescription(id) {
                var description = "";

                switch (id) {
                    case 2:
                        description = "Has ganado el suficiente 'combustible' para seguir la aventura. ¡Buen  viaje!";
                        break;
                    case 3:
                        description = "Has recuperado la 'Turbina C0N0-CT' ahora tienes un elemento más para lograr la misión";
                        break;
                    case 4:
                        description = "Has recuperado la 'Turbina Ala Ctu-3000' ¡Continua el viaje!";
                        break;
                    case 5:
                        description = "Has encontrado el 'Sistema de navegación' ¡No te detengas!";
                        break;
                    case 6:
                        description = "Has recuperado el 'Propulsor' ¡Ahora, ve por más!";
                        break;
                    case 7:
                        description = "Recuperaste los 'Misiles' ¡Bien hecho!";
                        break;
                    case 8:
                        description = "El 'Campo de fuerza' es tuyo. ¡Lograste un reto más!";
                        break;
                    case 9:
                        description = "Has obtenido el 'Radar' ¡Continúa la aventura!";
                        break;
                    case 10:
                        description = "Lograste obtener el 'Tanque de oxígeno' ¡No te rindas!";
                        break;
                    case 11:
                        description = "Es tuya la 'Sonda espacial' ¡Sigue así!";
                        break;
                    case 12:
                        description = "Por participar activamente, has ganado la insignia 'Foro interplanetario'";
                        break;
                    case 13:
                        description = "Por completar tu Perfil has ganado la insignia 'ID Intergaláctica'";
                        break;
                    case 14:
                        description = "Por aportar activamente en la comunidad Incluso has ganado la insignia 'Participación eléctrica'";
                        break;
                    case 15:
                        description = "Por obtener 30 likes en Foro o Comunidad has ganado la insignia 'Corazón digital'";
                        break;
                    case 16:
                        description = "Has ganado el 'Casco'. Ahora, ¡ve por más!";
                        break;
                    case 17:
                        description = "Has ganado el 'Radio de comunicación'. ¡Nunca te des por vencido!";
                        break;
                    case 18:
                        description = "Ya es tuyo el 'Turbo' ¡no te rindas!";
                        break;
                    default:
                        description = "";
                }

                return description;
            }


            $scope.changepage = function (delta) {
                $scope.badgePage += delta;
                $scope.normalBadgePage = $scope.badgePage + 1;

                if ($scope.badgePage < 0) {
                    $scope.badgePage = 0;
                    $scope.normalBadgePage = 1;
                }

                if ($scope.badgePage > $scope.totalBadgePages - 1) {
                    $scope.badgePage = $scope.totalBadgePages - 1;
                    $scope.normalBadgePage = $scope.badgePage + 1;
                }
            };



            function getDataAsync(callback) {

                moodleFactory.Services.GetAsyncProfile($scope.userId, function () {

                    $scope.model = moodleFactory.Services.GetCacheJson("profile/" + $scope.userId);
                    if ($scope.model.profileimageurl) {
                        $scope.model.profileimageurl = $scope.model.profileimageurl + "?rnd=" + new Date().getTime();
                    }
                    
                    $scope.hasCommunityAccess = _hasCommunityAccessLegacy($scope.model.communityAccess);
                    
                    console.log("Profile current stars:" + $scope.model.stars);
                    
                    callback();

                    moodleFactory.Services.GetAsyncAvatar($scope.userId, getAvatarInfoCallback, function () { }, true);

                    if (!$scope.model) {
                        $location.path('/');
                        return "";
                    }

                    initFields($scope.model);
                    loadStrengths();
                    loadWindowOfOpportunities();
                }, true);
            }

            function initFields(m) {
                if (m.address.street == null) { m.address.street = ""; }
                if (m.address.num_ext == null) { m.address.num_ext = ""; }
                if (m.address.num_int == null) { m.address.num_int = ""; }
                if (m.address.colony == null) { m.address.colony = ""; }
                if (m.address.city == null) { m.address.city = ""; }
                if (m.address.town == null) { m.address.town = ""; }
                if (m.address.state == null) { m.address.state = ""; }
                if (m.address.postalCode == null) { m.address.postalCode = ""; }
            }

            function getAvatarInfoCallback() {

                $scope.avatarInfo = moodleFactory.Services.GetCacheJson("avatarInfo");

                if ($scope.avatarInfo == null || $scope.avatarInfo.length == 0) {
                    setEmptyAvatar();
                }
                $scope.$emit('HidePreloader');
            }

            function formatDate(date) {

                var userBirthDate;
                if (date != "NaN/NaN/NaN" && date != "") {
                    var splitDate = date.split("/");

                    //             var userBirthDate = new Date(splitDate[2], splitDate[0], splitDate[1]); 
                    //             var userBirthDate = new Date(splitDate[2], splitDate[0]-1, splitDate[1]);

                    userBirthDate = new Date(splitDate[2], splitDate[0] - 1, splitDate[1]);
                }
                else {
                    userBirthDate = null;
                }

                return userBirthDate;
            }

            function getAge() {
                var splitDate = $scope.model.birthday.split("/");

                if (splitDate != "") {
                    var birthDate = new Date(splitDate[2], splitDate[0], splitDate[1]);
                    if (birthDate != null || birthDate != '') {
                        var cur = new Date();
                        var diff = cur - birthDate;
                        var age = Math.floor(diff / 31536000000);
                        $scope.model.age = age;
                    }
                }
                else {
                    $scope.model.age = null;
                }
            }

            $scope.birthdayChanged = function (dateValue) {
                var algo = dateValue;
                var d = new Date($scope.birthdate_Dateformat),
                    month = '' + (d.getMonth() + 1),
                    day = '' + d.getDate(),
                    year = d.getFullYear();

                if (month.length < 2) month = '0' + month;
                if (day.length < 2) day = '0' + day;
                var newBirthday = [month, day, year].join('/');
                $scope.model.birthday = newBirthday;
            };

            $scope.navigateToPage = function (pageNumber) {
                $scope.currentPage = pageNumber;
            };

            $scope.showDetailBadge = function (fileName, badgeName, badgeDateIssued, earnedTimes, description, status) {
                $scope.shareAchievementMessage = "";
                $scope.showShareAchievementMessage = false;
                
                $scope.currentPage = 10;
                $scope.fileName = fileName;
                $scope.badgeName = badgeName;
                $scope.badgeDateIssued = badgeDateIssued;
                $scope.earnedTimes = earnedTimes;
                $scope.description = description;
                $scope.status = status;
            };

            $scope.edit = function () {
                $location.path('/Perfil/Editar');
            };

            $scope.index = function () {
                $location.path("Profile/" + moodleFactory.Services.GetCacheObject("userId"));
            };

            $scope.navigateToDashboard = function () {
                $location.path('/ProgramaDashboard');
            };

            function calculate_age() {
                var dpValue = $scope.model.birthday;
                var birth_month = dpValue.substring(0, 2);
                var birth_day = dpValue.substring(3, 5);
                var birth_year = dpValue.substring(6, 10);
                today_date = new Date();
                today_year = today_date.getFullYear();
                today_month = today_date.getMonth();
                today_day = today_date.getDate();
                age = today_year - birth_year;

                if (today_month < (birth_month - 1)) {
                    age--;
                }
                if (((birth_month - 1) == today_month) && (today_day < birth_day)) {
                    age--;
                }
                return age;
            }

            
             $scope.showPlaceHolderBirthday = function(){                
                var bd = $("input[name='date']").val();                
                if(bd){
                    $scope.showPlaceHolder = false;                    
                }else{
                    $scope.showPlaceHolder = true;                    
                }
            };            

            function validateModel() {
                console.log('fetching editProfile errors list');
                var errors = [];

                validateEmptyItemsOnLists();

                var age = calculate_age();
                if (age < 13) { errors.push("Debes ser mayor de 13 años para poder registrarte."); }
                if (!$scope.editForm.firstname.$valid) { errors.push("Formato de nombre incorrecto."); }
                if (!$scope.editForm.lastname.$valid) { errors.push("Formato de apellido paterno incorrecto."); }
                if (!$scope.editForm.mothername.$valid) { errors.push("Formato de apellido materno incorrecto."); }
                // if (!$scope.editForm.alias.$valid) { errors.push("Formato de alias incorrecto."); }
                if (!$scope.editForm.date.$valid) { errors.push("Ingrese la fecha de nacimiento."); }

                //Validation of the $scope.model.familiaCompartamos array
                //  a) Avoiding two persons having the same "Número de Cliente Compartamos"
                var arrayForIdClients = [];

                $scope.model.familiaCompartamos.forEach(function (elem) {
                    arrayForIdClients.push(elem.idClient.toLowerCase());

                });

                var filteredIdClient = arrayForIdClients.filter(function (item, pos) {
                    return arrayForIdClients.indexOf(item) == pos;
                });

                if (arrayForIdClients.length != filteredIdClient.length) {
                    //Repeated idClients
                    errors.push("El número de cliente Compartamos debe ser único.");
                }

                //  b) Avoiding two persons having the same "Parentesco"
                var arrayForParentesco = [];

                $scope.model.familiaCompartamos.forEach(function (elem) {
                    arrayForParentesco.push(elem.relationship.toLowerCase());

                });

                var filteredArray = arrayForParentesco.filter(function (item, pos) {
                    return arrayForParentesco.indexOf(item) == pos;
                });

                if (arrayForParentesco.length != filteredArray.length) {
                    //Repeated idClients
                    errors.push("El parentesco está repetido.");
                }

                //Validation of the $scope.model.socialNetworks array
                var arrayForUsername = [];

                $scope.model.socialNetworks.forEach(function (elem) {
                    arrayForUsername.push(elem.socialNetwork.toLowerCase());
                });

                var filteredUsernames = arrayForUsername.filter(function (item, pos) {
                    return arrayForUsername.indexOf(item) == pos;
                });

                if (arrayForUsername.length != filteredUsernames.length) {
                    //Repeated names for Social network
                    console.log("Repeated Social NetWork");
                    errors.push("Nombre de Red social está repetido.");
                }


                //Validation of the $scope.model.studies array
                var arrayForLevel = [];

                $scope.model.studies.forEach(function (elem) {
                    arrayForLevel.push(elem.school.toLowerCase());
                });

                var filteredLevel = arrayForLevel.filter(function (item, pos) {
                    return arrayForLevel.indexOf(item) == pos;
                });

                if (arrayForLevel.length != filteredLevel.length) {
                    //Repeated names for Social network
                    console.log("Repeated Level of Studies");
                    errors.push("El nivel de estudios está repetido.");
                }

                $scope.model.modelState.errorMessages = errors;

                return (errors.length === 0);
            }

            var validateEmptyItemsOnLists = function () {
                //studies
                if ($scope.model.studies.length > 0) {
                    for (var i = 0; i < $scope.model.studies.length; i++) {
                        if (typeof $scope.model.studies[i].school === "undefined" ||
                            typeof $scope.model.studies[i].levelOfStudies === "undefined") {
                            $scope.model.studies.splice(i, 1);
                            i = i - 1;
                        }
                    }
                }
                
                //phones
                if ($scope.model.phones.length > 0) {
                    for (var i = 0; i < $scope.model.phones.length; i++) {
                        if (typeof $scope.model.phones[i] === "undefined" ||
                            $scope.model.phones[i].length === 0) {
                            $scope.model.phones.splice(i, 1);
                            i = i - 1;
                        }
                    }
                }
                
                //socialNetworks               
                if ($scope.model.socialNetworks.length > 0) {
                    for (var i = 0; i < $scope.model.socialNetworks.length; i++) {
                        if (typeof $scope.model.socialNetworks[i].socialNetwork === "undefined" ||
                            typeof $scope.model.socialNetworks[i].socialNetworkId === "undefined") {
                            $scope.model.socialNetworks.splice(i, 1);
                            i = i - 1;
                        }
                    }
                }
                
                //familiaCompartamos              
                if ($scope.model.familiaCompartamos.length > 0) {
                    for (var i = 0; i < $scope.model.familiaCompartamos.length; i++) {
                        if (typeof $scope.model.familiaCompartamos[i].idClient === "undefined" ||
                            typeof $scope.model.familiaCompartamos[i].relativeName === "undefined" ||
                            typeof $scope.model.familiaCompartamos[i].relationship === "undefined") {
                            $scope.model.familiaCompartamos.splice(i, 1);
                            i = i - 1;
                        }
                    }
                }
                
                
                //favoriteSports              
                if ($scope.model.favoriteSports.length > 0) {
                    for (var i = 0; i < $scope.model.favoriteSports.length; i++) {
                        if (typeof $scope.model.favoriteSports[i] === "undefined" ||
                            $scope.model.favoriteSports[i].length === 0) {
                            $scope.model.favoriteSports.splice(i, 1);
                            i = i - 1;
                        }
                    }
                }
                
                
                //artisticActivities              
                if ($scope.model.artisticActivities.length > 0) {
                    for (var i = 0; i < $scope.model.artisticActivities.length; i++) {
                        if (typeof $scope.model.artisticActivities[i] === "undefined" ||
                            $scope.model.artisticActivities[i].length === 0) {
                            $scope.model.artisticActivities.splice(i, 1);
                            i = i - 1;
                        }
                    }
                }
                
                //hobbies              
                if ($scope.model.hobbies.length > 0) {
                    for (var i = 0; i < $scope.model.hobbies.length; i++) {
                        if (typeof $scope.model.hobbies[i] === "undefined" ||
                            $scope.model.hobbies[i].length === 0) {
                            $scope.model.hobbies.splice(i, 1);
                            i = i - 1;
                        }
                    }
                }
                
                //talents              
                if ($scope.model.talents.length > 0) {
                    for (var i = 0; i < $scope.model.talents.length; i++) {
                        if (typeof $scope.model.talents[i] === "undefined" ||
                            $scope.model.talents[i].length === 0) {
                            $scope.model.talents.splice(i, 1);
                            i = i - 1;
                        }
                    }
                }
                
                
                //values              
                if ($scope.model.values.length > 0) {
                    for (var i = 0; i < $scope.model.values.length; i++) {
                        if (typeof $scope.model.values[i] === "undefined" ||
                            $scope.model.values[i].length === 0) {
                            $scope.model.values.splice(i, 1);
                            i = i - 1;
                        }
                    }
                }
                
                //Habilitie              
                if ($scope.model.habilities.length > 0) {
                    for (var i = 0; i < $scope.model.habilities.length; i++) {
                        if (typeof $scope.model.habilities[i] === "undefined" ||
                            $scope.model.habilities[i].length === 0) {
                            $scope.model.habilities.splice(i, 1);
                            i = i - 1;
                        }
                    }
                }
                
                //inspirationalCharacters              
                if ($scope.model.inspirationalCharacters.length > 0) {
                    for (var i = 0; i < $scope.model.inspirationalCharacters.length; i++) {
                        if (typeof $scope.model.inspirationalCharacters[i].characterName === "undefined" ||
                            typeof $scope.model.inspirationalCharacters[i].characterType === "undefined") {
                            $scope.model.inspirationalCharacters.splice(i, 1);
                            i = i - 1;
                        }
                    }
                }

                //Socioeconomicos

                //mainActivity              
                if ($scope.model.mainActivity.length > 0) {
                    for (var i = 0; i < $scope.model.mainActivity.length; i++) {
                        if (typeof $scope.model.mainActivity[i].characterName === "undefined" ||
                            typeof $scope.model.mainActivity[i].characterType === "undefined") {
                            $scope.model.mainActivity.splice(i, 1);
                            i = i - 1;
                        }
                    }
                }

                //moneyIncome              
                if ($scope.model.moneyIncome.length > 0) {
                    for (var i = 0; i < $scope.model.moneyIncome.length; i++) {
                        if (typeof $scope.model.moneyIncome[i].characterName === "undefined" ||
                            typeof $scope.model.moneyIncome[i].characterType === "undefined") {
                            $scope.model.moneyIncome.splice(i, 1);
                            i = i - 1;
                        }
                    }
                }

                //Uso de tecnologia

                //knownDevices              
                if ($scope.model.knownDevices.length > 0) {
                    for (var i = 0; i < $scope.model.knownDevices.length; i++) {
                        if (typeof $scope.model.knownDevices[i] === "undefined" ) {
                            $scope.model.knownDevices.splice(i, 1);
                            i = i - 1;
                        }
                    }
                }

                //ownDevices              
                if ($scope.model.ownDevices.length > 0) {
                    for (var i = 0; i < $scope.model.ownDevices.length; i++) {
                        if (typeof $scope.model.ownDevices[i] === "undefined") {
                            $scope.model.ownDevices.splice(i, 1);
                            i = i - 1;
                        }
                    }
                }

                //phoneUsage              
                if ($scope.model.phoneUsage.length > 0) {
                    for (var i = 0; i < $scope.model.phoneUsage.length; i++) {
                        if (typeof $scope.model.phoneUsage[i] === "undefined") {
                            $scope.model.phoneUsage.splice(i, 1);
                            i = i - 1;
                        }
                    }
                }
              

                //kindOfVideogames              
                if ($scope.model.kindOfVideogames.length > 0) {
                    for (var i = 0; i < $scope.model.kindOfVideogames.length; i++) {
                        if (typeof $scope.model.kindOfVideogames[i] === "undefined") {
                            $scope.model.kindOfVideogames.splice(i, 1);
                            i = i - 1;
                        }
                    }
                }

                //favoriteGames
                if ($scope.model.favoriteGames.length > 0) {
                    for (var i = 0; i < $scope.model.favoriteGames.length; i++) {
                        if (typeof $scope.model.favoriteGames[i] === "undefined") {
                            $scope.model.favoriteGames.splice(i, 1);
                            i = i - 1;
                        }
                    }
                }


            };

            var saveUser = function () {
                moodleFactory.Services.PutAsyncProfile($scope.userId, $scope.model,

                    function (data) {
                        ValidatePointsPolicy();
                        console.log('Save profile successful...');
                        $scope.index();
                    },
                    function (date) {
                        console.log('Save profile fail...');
                    });
            };

            $scope.save = function () {
                var validationResult = validateModel();  //Valid if validateModel() returns true

                deleteRepeatedValues();

                if (validationResult) {
                    $scope.$emit('ShowPreloader');
                    saveUser();
                } else {
                    $scope.$emit('scrollTop');
                }
            };

            $scope.clean = function () {
                deleteRepeatedValues();
            };

            function ValidatePointsPolicy() {

                var usercourse = JSON.parse(localStorage.getItem("usercourse"));
                //var profile = JSON.parse(localStorage.getItem("profile"));
                var currentUser = JSON.parse(localStorage.getItem("CurrentUser"));

                for (var activityIndex = 0; activityIndex < usercourse.activities.length; activityIndex++) {
                    var activity = usercourse.activities[activityIndex];

                    console.log("Activity Name: " + activity.activityname + " - Activity Points: " + activity.points + " - Activity Status: " + activity.status +
                        " - Current Stars: " + $scope.model.stars + " - Stars to add: " + activity.points);

                    if (activity.status == 0) {
                        var result;
                        switch (Number(activity.activity_identifier)) {
                            case 3000:
                                result = assignmentMiInformacion();
                                break;
                            case 3001:
                                result = assignmentMiPersonalidad();
                                break;
                            case 3002:
                                result = false;
                                break;
                            case 3003:
                                result = false;
                                break;
                            default:
                                break;
                        }

                        console.log("Field Validation: " + result);
                        if (result) {

                            $scope.model.stars += activity.points;

                            usercourse.activities[activityIndex].status = 1;

                            var profileBefore = JSON.parse(moodleFactory.Services.GetCacheObject("profile/" + $scope.userId));
                            console.log("profile.stars (before): " + profileBefore.stars);
                            
                            var newPoints = Number(profileBefore.stars) + Number(usercourse.activities[activityIndex].points);
                            profileBefore.stars =newPoints;                       
                            _setLocalStorageJsonItem("profile/" + $scope.userId,profileBefore);

                            updateUserStarsUsingExternalActivity(activity.activity_identifier);

                            var activityModel = {
                                "usercourse": usercourse,
                                "coursemoduleid": activity.coursemoduleid,
                                //"answersResult": "???",
                                "userId": currentUser.userId,
                                "startingTime": $scope.startingTime,
                                "endingTime": new Date(),

                                "token": currentUser.token
                                , "activityType": "Assign"
                            };

                            _endActivity(activityModel);

                            result = false;
                        }
                    }
                }
            }



            function assignmentMiInformacion() {
                var result = false;
                if ($scope.model.firstname) {
                    if ($scope.model.lastname) {
                        if ($scope.model.mothername) {
                            if ($scope.model.gender) {
                                if ($scope.model.age) {
                                    if ($scope.model.maritalStatus) {
                                        if ($scope.model.address.country) {
                                            if ($scope.model.address.state) {
                                                if ($scope.model.address.city) {
                                                    if ($scope.model.address.town) {
                                                        if ($scope.model.address.postalCode) {
                                                            if ($scope.model.address.street) {
                                                                if ($scope.model.address.num_ext) {
                                                                    if ($scope.model.address.num_int) {
                                                                        if ($scope.model.address.colony) {
                                                                            if ($scope.model.phones != 0) {
                                                                                if ($scope.model.socialNetworks.length != 0) {
                                                                                    if ($scope.model.familiaCompartamos.length != 0) {
                                                                                        result = true;
                                                                                    } else { }
                                                                                }
                                                                            }
                                                                        }
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                return result;
            }

            function assignmentMiPersonalidad() {
                var result = false;
                if ($scope.model.favoriteSports) {
                    if ($scope.model.favoriteSports) {
                        if ($scope.model.artisticActivities) {
                            if ($scope.model.hobbies) {
                                if ($scope.model.talents) {
                                    if ($scope.model.values) {
                                        if ($scope.model.habilities) {
                                            if ($scope.model.inspirationalCharacters.length != 0) {
                                                result = true;
                                            } else { }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                return result;
            }

            var deleteRepeatedValues = function () {

                $scope.model.phones = $scope.model.phones.filter(function (item, pos) {
                    return $scope.model.phones.indexOf(item) == pos;
                });

                $scope.model.favoriteSports = $scope.model.favoriteSports.filter(function (item, pos) {
                    return item.trim().length > 0 && $scope.model.favoriteSports.indexOf(item) == pos;
                });

                $scope.model.artisticActivities = $scope.model.artisticActivities.filter(function (item, pos) {
                    return item.trim().length > 0 && $scope.model.artisticActivities.indexOf(item) == pos;
                });

                $scope.model.hobbies = $scope.model.hobbies.filter(function (item, pos) {
                    return item.trim().length > 0 && $scope.model.hobbies.indexOf(item) == pos;
                });

                $scope.model.talents = $scope.model.talents.filter(function (item, pos) {
                    return item.trim().length > 0 && $scope.model.talents.indexOf(item) == pos;
                });

                $scope.model.values = $scope.model.values.filter(function (item, pos) {
                    return item.trim().length > 0 && $scope.model.values.indexOf(item) == pos;
                });

                $scope.model.habilities = $scope.model.habilities.filter(function (item, pos) {
                    return item.trim().length > 0 && $scope.model.habilities.indexOf(item) == pos;

                });

                //Uso de tecnologia
                $scope.model.knownDevices = $scope.model.knownDevices.filter(function (item, pos) {
                    return item.trim().length > 0 && $scope.model.knownDevices.indexOf(item) == pos;

                });

                $scope.model.ownDevices = $scope.model.ownDevices.filter(function (item, pos) {
                    return item.trim().length > 0 && $scope.model.ownDevices.indexOf(item) == pos;

                });

                $scope.model.phoneUsage = $scope.model.phoneUsage.filter(function (item, pos) {
                    return item.trim().length > 0 && $scope.model.phoneUsage.indexOf(item) == pos;

                });

                $scope.model.kindOfVideogames = $scope.model.kindOfVideogames.filter(function (item, pos) {
                    return item.trim().length > 0 && $scope.model.kindOfVideogames.indexOf(item) == pos;

                });

                $scope.model.favoriteGames = $scope.model.favoriteGames.filter(function (item, pos) {
                    return item.trim().length > 0 && $scope.model.favoriteGames.indexOf(item) == pos;

                });

                //Socio Econimicos
                $scope.model.mainActivity = $scope.model.mainActivity.filter(function (item, pos) {
                    return item.trim().length > 0 && $scope.model.mainActivity.indexOf(item) == pos;

                });

                $scope.model.moneyIncome = $scope.model.moneyIncome.filter(function (item, pos) {
                    return item.trim().length > 0 && $scope.model.moneyIncome.indexOf(item) == pos;

                });
            };

            $scope.addStudy = function () {
                $scope.model.studies.push({});
            };
            $scope.deleteStudy = function (index) {
                $scope.model.studies.splice(index, 1);
            };

            $scope.addPhone = function () {
                $scope.model.phones.push(new String());
            };

            // $scope.deletePhone = function (index) {
            //     $scope.model.phones.splice(index, 1);
            // };
            
            $scope.deletePhone = function (phone) {
                var index = $scope.model.phones.indexOf(phone);
                // var selectedPhone = $scope.model.phones[index];
                
                //$scope.model.phones.remove(phone)//Pailas
                // _.without($scope.model.phones, phone); //pailas
                $scope.model.phones.splice(index, 1);
                // $scope.model.phones.splice(index, 1);
                //SubTask.remove({ 'subtaskId': subtask.id });
            };

            $scope.addFavoriteSports = function (index) {
                $scope.model.favoriteSports.push(new String());
            };

            $scope.deleteFavoriteSports = function (index) {
                $scope.model.favoriteSports.splice(index, 1);
            };

            $scope.addArtisticActivities = function (index) {
                $scope.model.artisticActivities.push(new String());
            };

            $scope.deleteArtisticActivities = function (index) {
                $scope.model.artisticActivities.splice(index, 1);
            };

            $scope.addHobbies = function (index) {
                $scope.model.hobbies.push(new String());
            };

            $scope.deleteHobbies = function (index) {
                $scope.model.hobbies.splice(index, 1);
            };

            $scope.addTalents = function (index) {
                $scope.model.talents.push(new String());
            };

            $scope.deleteTalents = function (index) {
                $scope.model.talents.splice(index, 1);
            };

            $scope.addValue = function (index) {
                $scope.model.values.push(new String());
            };

            $scope.deleteValue = function (index) {
                $scope.model.values.splice(index, 1);
            };

            $scope.addHabilitie = function (index) {
                $scope.model.habilities.push(new String());
            };

            $scope.deleteHabilitie = function (index) {
                $scope.model.habilities.splice(index, 1);
            };

            $scope.addInspirationalCharacter = function (index) {
                $scope.model.inspirationalCharacters.push({});
            };

            $scope.deleteInspirationalCharacter = function (index) {
                $scope.model.inspirationalCharacters.splice(index, 1);
            };

            $scope.addMainActivity = function (index) {
                $scope.model.mainActivity.push(new String());
            };

            $scope.deleteMainActivity = function (index) {
                $scope.model.mainActivity.splice(index, 1);
            };

            $scope.addMoneyIncome = function (index) {
                $scope.model.moneyIncome.push(new String());
            };

            $scope.deleteMoneyIncome = function (index) {
                $scope.model.moneyIncome.splice(index, 1);
            };

            $scope.addKnownDevice = function (index) {
                $scope.model.knownDevices.push(new String());
            };

            $scope.deleteKnownDevice = function (knownDevice) {
                //$scope.model.knownDevices.splice(index, 1);
                var index = $scope.model.knownDevices.indexOf(knownDevice);
                $scope.model.knownDevices.splice(index, 1);
            };

            $scope.addOwnDevice = function (index) {
                $scope.model.ownDevices.push(new String());
            };

            $scope.deleteOwnDevice = function (ownDevices) {                
                var index = $scope.model.ownDevices.indexOf(ownDevices);
                $scope.model.ownDevices.splice(index, 1);
            };

            $scope.addPhoneUsage = function (index) {
                $scope.model.phoneUsage.push(new String());
            };

            $scope.deletePhoneUsage = function (phoneUsage) {                
                var index = $scope.model.phoneUsage.indexOf(phoneUsage);
                $scope.model.phoneUsage.splice(index, 1);
            };

            $scope.addKindOfVideoGame = function (index) {
                $scope.model.kindOfVideogames.push(new String());
            };

            $scope.deleteKindOfVideoGame = function (kindOfVideogames) {                
                var index = $scope.model.kindOfVideogames.indexOf(kindOfVideogames);
                $scope.model.kindOfVideogames.splice(index, 1);
            };
            
            $scope.deleteMainActivity = function (index) {
                $scope.model.mainActivity.splice(index, 1);
            };
            
            $scope.addMainActivity = function() {
                $scope.model.mainActivity.push(new String());
            };

            $scope.addFavoriteGame = function (index) {
                $scope.model.favoriteGames.push(new String());
            };

            $scope.deleteFavoriteGame = function (favoriteGames) {                
                var index = $scope.model.favoriteGames.indexOf(favoriteGames);
                $scope.model.favoriteGames.splice(index, 1);
            };

            $scope.addEmail = function () {
                var existingEmail = $scope.model.email;
                if (existingEmail) {
                    $scope.model.additionalEmails.push(new String());
                }
            };

            $scope.logout = function () {
                logout($http, $scope, $location);
            };

            $scope.deleteAdditionalEmails = function (index) {
                $scope.model.additionalEmails.splice(index, 1);
            };

            $scope.addSocialNetwork = function () {
                $scope.model.socialNetworks.push({});
            };
            $scope.deleteSocialNetwork = function (index) {
                $scope.model.socialNetworks.splice(index, 1);
            };

            $scope.addFamiliaCompartamos = function () {
                $scope.model.familiaCompartamos.push({});
            };
            $scope.deleteFamiliaCompartamos = function (index) {
                $scope.model.familiaCompartamos.splice(index, 1);
            };

            encodeImageUri = function (imageUri, callback) {
                var c = document.createElement('canvas');
                var ctx = c.getContext("2d");
                var img = new Image();
                img.onload = function () {
                    c.width = this.width;
                    c.height = this.height;
                    ctx.drawImage(img, 0, 0);

                    if (typeof callback === 'function') {
                        var dataURL = c.toDataURL("image/png");
                        callback(dataURL.slice(22, dataURL.length));
                    }
                };
                img.src = imageUri;
            };

            uploadAvatar = function (avatarInfo) {
                var pathimagen = "assets/avatar/" + avatarInfo[0].pathimagen + "?rnd=" + new Date().getTime();
                encodeImageUri(pathimagen, function (b64) {
                    avatarInfo[0]["filecontent"] = b64;
                    $http({
                        method: 'POST',
                        url: API_RESOURCE.format('avatar'),
                        data: avatarInfo[0]
                    })
                        .success(function () {
                            avatarUploaded("Éxito");
                        })
                        .error(function () {
                            avatarUploaded("Error");
                        });
                });
            }

            function avatarUploaded(message){
                console.log(message + " al subir la foto!");
                $location.path('/Profile/' + $scope.userId);
                $route.reload();
            }

            function setEmptyAvatar() {
                $scope.avatarInfo = [{
                    "userid": $scope.model.UserId,
                    "alias": $scope.model.username,
                    "aplicacion": "Mi Avatar",
                    "estrellas": $scope.model.stars,
                    "PathImagen": "",
                    "color_cabello": "",
                    "estilo_cabello": "",
                    "traje_color_principal": "",
                    "traje_color_secundario": "",
                    "rostro": "",
                    "color_de_piel": "",
                    "escudo:": "",
                    "imagen_recortada": "",
                }];
            }

            $scope.avatar = function () {
                //the next fields should match the integration document shared with the game app
                var avatarInfoForGameIntegration = {
                    "userid": $scope.model.id,
                    "alias": $scope.model.username,
                    "actividad": "Mi Avatar",
                    "estrellas": "100",
                    "pathimagen": "",
                    "genero": $scope.avatarInfo[0].imagen_recortada,
                    "rostro": $scope.avatarInfo[0].rostro,
                    "color_de_piel": $scope.avatarInfo[0].color_de_piel,
                    "estilo_cabello": $scope.avatarInfo[0].estilo_cabello,
                    "color_cabello": $scope.avatarInfo[0].color_cabello,
                    "traje_color_principal": $scope.avatarInfo[0].traje_color_principal,
                    "traje_color_secundario": $scope.avatarInfo[0].traje_color_secundario,
                    "escudo": ""
                };

                try {
                    $scope.$emit('ShowPreloader');
                    cordova.exec(SuccessAvatar, FailureAvatar, "CallToAndroid", "openApp", [JSON.stringify(avatarInfoForGameIntegration)]);
                } catch (e) {
                    SuccessAvatar(
                        { "userid": $scope.model.id, "actividad": "Mi Avatar", "alias": $scope.model.username, "genero": "Hombre", "rostro": "Preocupado", "color_de_piel": "E6C8B0", "estilo_cabello": "Cabello02", "color_cabello": "694027", "traje_color_principal": "00A0FF", "traje_color_secundario": "006192", "imagen_recortada": "app/initializr/media", "fecha_modificacion": "09/05/2015 08:32:04", "Te_gusto_la_actividad": null, "pathimagen": "default.png" }
                        );
                }
            };

            function SuccessAvatar(data) {
                //the next fields should match the database in moodle
    
                $scope.avatarInfo = [{
                    "userid": data.userid,
                    "aplicacion": data.actividad,
                    "genero": data.genero,
                    "rostro": data.rostro,
                    "color_de_piel": data.color_de_piel,
                    "estilo_cabello": data.estilo_cabello,
                    "color_cabello": data.color_cabello,
                    "traje_color_principal": data.traje_color_principal,
                    "traje_color_secundario": data.traje_color_secundario,
                    "imagen_recortada": data.genero,
                    "ultima_modificacion": data.fecha_modificacion,
                    "Te_gusto_la_actividad": data.Te_gusto_la_actividad,
                    "pathimagen": data.pathimagen,
                    "estrellas": "100",
                    "alias": $scope.model.username,
                    "escudo": $scope.model.shield
                }];
                uploadAvatar($scope.avatarInfo);
                _setLocalStorageJsonItem("avatarInfo", $scope.avatarInfo);
            }

            function FailureAvatar(data) {
                avatarUploaded("Error");
            }

            var $selects = $('select.form-control');
            $selects.change(function () {
                $elem = $(this);
                $elem.addClass('changed');
            });

            function getdate() {
                var currentdate = new Date();
                var datetime = currentdate.getFullYear() + ":"
                    + addZeroBefore((currentdate.getMonth() + 1)) + ":"
                    + addZeroBefore(currentdate.getDate()) + " "
                    + addZeroBefore(currentdate.getHours()) + ":"
                    + addZeroBefore(currentdate.getMinutes()) + ":"
                    + addZeroBefore(currentdate.getSeconds());
                return datetime;
            }

            function addZeroBefore(n) {
                return (n < 10 ? '0' : '') + n;
            }
            
            $scope.shareAchievement = function() {
                
                if ($scope.hasCommunityAccess) {
                    $scope.$emit('ShowPreloader');
                
                    if ($scope.discussion == null || $scope.forumId == null) {
                        
                        moodleFactory.Services.GetAsyncForumDiscussions(_course.community.coursemoduleid, function(data, key) {
                            $scope.discussion = data.discussions[0];
                            $scope.forumId = data.forumid;
                            
                            postAchievement();
                            
                            }, function(data){
                                $scope.shareAchievementMessage = "";
                                $scope.showShareAchievementMessage = false;
                                $scope.showSharedAchievement = true;
                                
                                $scope.$emit('HidePreloader'); }, true);
                    }else {
                        postAchievement();
                    }
                }

            };
            
            function postAchievement() {
                var customMessage = '<p> ' + $scope.shareAchievementMessage + '</p>';
                var msgOpenContainer = '<div class="achievement-badge"> ';
                var appendImg = '<figure> <img src="assets/images/badges/' + $scope.fileName + '" ng-src="assets/images/badges/' + $scope.fileName + '" alt="" /> </figure>';
                var msgCaption = '<figcaption> <p class="badgename">' + $scope.badgeName + '</p> </figcaption>';
                var msgCloseContainer = ' </div>';
                
                var fullMessage = customMessage + msgOpenContainer + appendImg + msgCaption + msgCloseContainer;
                
                var requestData = {
                    "userid": $scope.userId,
                    "discussionid": $scope.discussion.discussion,
                    "parentid": $scope.discussion.id,
                    "message": removeHtmlTag(fullMessage),
                    "createdtime": $filter("date")(new Date(), "MM/dd/yyyy"),
                    "modifiedtime": $filter("date")(new Date(), "MM/dd/yyyy"),
                    "posttype": 1,
                    "fileToUpload": null
                };
                
                moodleFactory.Services.PostAsyncForumPost ('new_post', requestData,
                    function() {
                        $scope.shareAchievementMessage = "";
                        $scope.showShareAchievementMessage = false;
                        $scope.showSharedAchievement = true;
                        
                        $scope.$emit('HidePreloader');
                    },
                    function(){
                        $scope.shareAchievementMessage = "";
                        $scope.showShareAchievementMessage = false;
                        $scope.showSharedAchievement = false;
                        
                        $scope.$emit('HidePreloader');
                    }
                );
            };
            
            $scope.scrollToTop();

        }]);