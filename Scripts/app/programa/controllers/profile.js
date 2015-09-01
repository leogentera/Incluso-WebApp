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
        function ($q, $scope, $location, $routeParams, $timeout, $rootScope, $http) {

            _timeout = $timeout;
            _httpFactory = $http;
            $scope.$emit('ShowPreloader');
            console.log("cargando usuario");
            $scope.currentPage = 1;
            $scope.setToolbar($location.$$path,"Mi perfil");
            $rootScope.showFooter = true;
            $rootScope.showFooterRocks = false;
            $scope.model = getDataAsync();

            
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
                    $scope.wholeBadgesPages[i].push(elem);
                }
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

            $scope.model.modelState = {
                isValid: null,
                errorMessages: []
            };

            $rootScope.pageName = "Mi perfil"
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
            $scope.favoritSportsList = ['Ciclismo', 'Patinaje/skateboarding', 'FutbolSoccer', 'Basquetbol', 'ArtesMarciales', 'Yoga', 'Natación', 'FutbolAmericano', 'Basebol', 'Carreras'];
            $scope.artisticActivitiesList = ['Pintura', 'Música', 'Danza', 'Fotografia', 'Graffiti', 'Diseño Digital', 'Artesanias', 'Teatro', 'Modelado', 'Dibujo'];
            $scope.hobbiesList = ['Ir a fiestas', 'Leer', 'Pasar tiempo con amigos', 'Cocinar', 'Jugar videojuegos', 'Visitar museos', 'Ver películas/series', 'Ver televisión', 'Modelado', 'Pasar tiempo en redes sociales'];
            $scope.talentsList = ['Cantar', 'Llevar ritmos', 'Bailar', 'Hablar frente a otros', 'Dibujar', 'Hacer amigos', 'Hacer operaciones matemáticas', 'Aprender cosas rápido', 'Ubicar lugares', 'Memorizar', 'Hacer manualidades'];
            $scope.valuesList = ['Tolerancia', 'Respeto', 'Honestidad', 'Responsabilidad', 'Confiabilidad', 'Solidaridad', 'Igualdad', 'Lealtad', 'Amistad', 'Generosidad', 'Esfuerzo'];
            $scope.habilitiesList = ['Empatía', 'Creatividad', 'Liderazgo', 'Comunicación', 'Negociación', 'Trabajo en equipo', 'Innovación', 'Iniciativa', 'Toma de decisiones', 'Planeación', 'Organización'];
            $scope.iLiveWithList = ['Ambo padres', 'Padre', 'Madre', 'Tíos', 'Esposo(a)', 'Abuelos', 'Amigos'];
            $scope.mainActivityList = ['Estudias', 'Trabajas', 'Ni estudias ni trabajas'];
            /*unir1*/$scope.levelList = ['Primaria', 'Secundaria', 'Preparatoria', 'Universidad'];
            $scope.gradeList = ['1er', '2do', '3ro', '4to', '5to', '6to'];
            $scope.periodList = ['Año', 'Semestre', 'Cuatrimestre', 'Trimestre', 'Bimestre'];
            $scope.yesNoList = ['Si', 'No'];
            $scope.moneyIncomeList = ['Padres', 'Trabajo'];
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

            function getDataAsync() {
                
                moodleFactory.Services.GetAsyncAvatar(_getItem("userId"), getAvatarInfoCallback);
                var m = JSON.parse(moodleFactory.Services.GetCacheObject("profile"));

                if (!m) {
                    $location.path('/');
                    return "";
                }
                initFields(m);
                $scope.$emit('HidePreloader');
                console.log("usuario completo");

                return m;
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
                    $scope.avatarInfo = [{
                        "userid": $scope.model.UserId,
                        "alias": $scope.model.username,
                        "aplicacion": "Mi Avatar",
                        "estrellas": $scope.model.stars,
                        "PathImagen": "Android/data/<app-id>/images",
                        "color_cabello": "amarillo",
                        "estilo_cabello": "",
                        "traje_color_principal": "",
                        "traje_color_secundario": "",
                        "rostro": "",
                        "color_de_piel": "",
                        "escudo:": "",
                        "imagen_recortada": "",
                    }];
                }
            }

            function formatDate(date) {
                if (date != "NaN/NaN/NaN" && date != "") {
                    var splitDate = date.split("/");

                    //             var userBirthDate = new Date(splitDate[2], splitDate[0], splitDate[1]); 
                    //             var userBirthDate = new Date(splitDate[2], splitDate[0]-1, splitDate[1]);

                    var userBirthDate = new Date(splitDate[2], splitDate[0] - 1, splitDate[1]);
                }
                else {
                    var userBirthDate = null;
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

            $scope.showDetailBadge = function (badgeId, badgeName, badgeDateIssued, earnedTimes, status) {
                $scope.currentPage = 10;
                $scope.badgeId = badgeId;
                $scope.badgeName = badgeName;
                $scope.badgeDateIssued = badgeDateIssued;
                $scope.earnedTimes = earnedTimes;
                $scope.status = status;
            };

            $scope.edit = function () {
                $location.path('/Perfil/Editar');
            };

            $scope.index = function () {
                $scope.navigateTo('Profile', 'null');
                //$location.path('/Perfil/Editar');
            };

            $scope.navigateToDashboard = function () {
                $location.path('/ProgramaDashboard');
            };

            function validateModel() {
                console.log('fetching editProfile errors list');
                var errors = [];

                validateEmptyItemsOnLists();

                if (!$scope.editForm.firstname.$valid) { errors.push("Formato de nombre incorrecto."); }
                if (!$scope.editForm.lastname.$valid) { errors.push("Formato de apellido paterno incorrecto."); }
                if (!$scope.editForm.mothername.$valid) { errors.push("Formato de apellido materno incorrecto."); }
                // if (!$scope.editForm.alias.$valid) { errors.push("Formato de alias incorrecto."); }
                if (!$scope.editForm.date.$valid) { errors.push("Ingrese la fecha de nacimiento."); }

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
            };

            var saveUser = function () {
                moodleFactory.Services.PutAsyncProfile(_getItem("userId"), $scope.model,

                    function (data) {
                        console.log('Save profile successful...');
                        $scope.index();
                    },
                    function (date) {
                        console.log('Save profile fail...');
                    });
            };

            $scope.save = function () {
                var validationResult = validateModel();
                //validationResult = true;
                if (validationResult) {
                    $scope.$emit('ShowPreloader');
                    saveUser();
                } else {
                    $scope.$emit('scrollTop');
                }
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

            $scope.deletePhone = function (index) {
                $scope.model.phones.splice(index, 1);
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

            $scope.deleteKnownDevice = function (index) {
                $scope.model.knownDevices.splice(index, 1);
            };

            $scope.addKnOwnDevice = function (index) {
                $scope.model.ownDevices.push(new String());
            };

            $scope.deleteOwnDevice = function (index) {
                $scope.model.ownDevices.splice(index, 1);
            };

            $scope.addPhoneUsage = function (index) {
                $scope.model.phoneUsage.push(new String());
            };

            $scope.deletePhoneUsage = function (index) {
                $scope.model.phoneUsage.splice(index, 1);
            };

            $scope.addKindOfVideoGame = function (index) {
                $scope.model.kindOfVideoGames.push(new String());
            };

            $scope.deleteKindOfVideoGame = function (index) {
                $scope.model.kindOfVideoGames.splice(index, 1);
            };

            $scope.addFavoriteGame = function (index) {
                $scope.model.favoriteGames.push(new String());
            };

            $scope.deleteFavoriteGame = function (index) {
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

            $scope.avatar = function () {
                $scope.avatarInfo[0].UserId = $scope.model.UserId;
                $scope.avatarInfo[0].Alias = $scope.model.username;
                $scope.avatarInfo[0].Estrellas = $scope.model.stars;
                localStorage.setItem("avatarInfo", JSON.stringify($scope.avatarInfo));

                $scope.scrollToTop();
                $location.path('/Juegos/Avatar');
            };

            var $selects = $('select.form-control');
            $selects.change(function () {
                $elem = $(this);
                $elem.addClass('changed');
            });

        }]);
