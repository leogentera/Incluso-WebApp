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
            var currentUser = JSON.parse(localStorage.getItem("CurrentUser"));

            $scope.isMultipleChallengeActivityFinished = $scope.loggedUser && _course.isMultipleChallengeActivityFinished;
            $scope.myStrengths = new Array();
            $scope.myWindowOfOpportunities = [];

            $scope.setToolbar($location.$$path, "");

            console.log($location + '- ' + $location.$$path);

            $scope.currentPage = 1;
            if ($location.$$path == '/Perfil/ConfigurarPrivacidad') {
                $scope.currentPage = 2;
            }

            $rootScope.showFooter = false;
            $rootScope.showFooterRocks = false;
            $rootScope.showStage1Footer = false;
            $rootScope.showStage2Footer = false;
            $rootScope.showStage3Footer = false;
            $rootScope.showProfileFooter = false;
            $scope.status = "";
            $scope.shareAchievementMessage = "";
            $scope.showShareAchievementMessage = false;
            $scope.showSharedAchievement = false;
            $scope.hasCommunityAccess = false;
            var startingTime;
            var endingTime;

            $scope.completedSections = [];

            $scope.$emit('ShowPreloader');


            getDataAsync(function () {

                getContent();

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
                $scope.genderItems = _getCatalogValuesBy("gender");
                $scope.countryItems = _getCatalogValuesBy("country");
                $scope.cityItems = [];
                $scope.stateItems = _getCatalogValuesBy("citiesCatalog")
                $scope.maritalStatusItems = _getCatalogValuesBy("maritalStatus");
                $scope.studiesList = _getCatalogValuesBy("studiesLevel");
                $scope.educationStatusList = _getCatalogValuesBy("educationStatus");
                $scope.favoritSportsList = _getCatalogValuesBy("sports");
                $scope.artisticActivitiesList = _getCatalogValuesBy("arts");
                $scope.hobbiesList = _getCatalogValuesBy("hobbiescatalog");
                $scope.talentsList = _getCatalogValuesBy("talentscatalog");
                $scope.valuesList = _getCatalogValuesBy("valuescatalog");
                $scope.habilitiesList = _getCatalogValuesBy("habilitiescatalog");
                $scope.iLiveWithList = _getCatalogValuesBy("relativeOrTutor");
                $scope.mainActivityList = _getCatalogValuesBy("activity");
                $scope.levelList = _getCatalogValuesBy("studiesLevel");
                $scope.gradeList = _getCatalogValuesBy("studiesGrade");
                $scope.periodList = _getCatalogValuesBy("periodOfStudies");
                $scope.playVideoGamesList = _getCatalogValuesBy("playVideogames");
                $scope.medicalCoverageList = _getCatalogValuesBy("medicalCoverage");
                $scope.gotMoneyIncomeList = _getCatalogValuesBy("gotMoneyIncome");
                $scope.childrenList = _getCatalogValuesBy("children");
                $scope.moneyIncomeList = _getCatalogValuesBy("moneyInComecatalog");
                $scope.medicalCoverageList = _getCatalogValuesBy("medicalCoverage");
                $scope.medicalInsuranceList = _getCatalogValuesBy("medicalInsurancecatalog");
                $scope.knownDevicesList = _getCatalogValuesBy("devices");
                $scope.phoneUsageList = _getCatalogValuesBy("phoneActivity");
                $scope.videoGamesFrecuencyList = _getCatalogValuesBy("videogamesFrecuencycatalog");
                $scope.videogamesHoursList = _getCatalogValuesBy("videogamesHourscatalog");
                $scope.kindOfVideoGamesList = _getCatalogValuesBy("kindOfVideogamescatalog");
                $scope.socialNetworksList = _getCatalogValuesBy("socialNetworkType");
                $scope.inspirationalCharactersList = _getCatalogValuesBy("kindOfCharacter");
                $scope.familiaCompartamosList = _getCatalogValuesBy("relationship");
                $scope.phoneTypeList = _getCatalogValuesBy("phoneType");
                $scope.yesNoList = ['Si', 'No'];

                $scope.birthdate_Dateformat = formatDate($scope.model.birthday);
                if ($scope.birthdate_Dateformat instanceof Date) {
                    $scope.birthdate_Dateformat = moment($scope.birthdate_Dateformat).format("DD/MM/YYYY");
                }
                else {
                    $scope.birthdate_Dateformat = null;
                }

                getAge();
                console.log("Age loaded");
                $scope.showPlaceHolder = true;

            });


            function loadStrengths() {

                var strengthArray = [];

                for (var s = 0; s < $scope.model.strengths.length; s++) {

                    var strength = $scope.model.strengths[s];
                    var result = _.find(_course.multipleChallenges, function (mc) {
                        return mc.name == strength.replace("\r", "");
                    });

                    strengthArray.push(result);
                }

                $scope.myStrengths = strengthArray;
            }


            function loadWindowOfOpportunities() {

                var windowOfOpportunitiesArray = [];

                for (var s = 0; s < $scope.model.windowOfOpportunity.length; s++) {

                    var windowOfOpportunities = $scope.model.windowOfOpportunity[s];
                    var result = _.find(_course.multipleChallenges, function (mc) {
                        return mc.name == windowOfOpportunities.replace("\r", "");
                    });

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
                        description = "Has ganado el suficiente 'combustible' para seguir la aventura. �Buen  viaje!";
                        break;
                    case 3:
                        description = "Has recuperado la 'Turbina C0N0-CT' ahora tienes un elemento m�s para lograr la misi�n";
                        break;
                    case 4:
                        description = "Has recuperado la 'Turbina Ala Ctu-3000' �Continua el viaje!";
                        break;
                    case 5:
                        description = "Has encontrado el 'Sistema de navegaci�n' �No te detengas!";
                        break;
                    case 6:
                        description = "Has recuperado el 'Propulsor' �Ahora, ve por m�s!";
                        break;
                    case 7:
                        description = "Recuperaste los 'Misiles' �Bien hecho!";
                        break;
                    case 8:
                        description = "El 'Campo de fuerza' es tuyo. �Lograste un reto m�s!";
                        break;
                    case 9:
                        description = "Has obtenido el 'Radar' �Contin�a la aventura!";
                        break;
                    case 10:
                        description = "Lograste obtener el 'Tanque de ox�geno' �No te rindas!";
                        break;
                    case 11:
                        description = "Es tuya la 'Sonda espacial' �Sigue as�!";
                        break;
                    case 12:
                        description = "Por participar activamente, has ganado la insignia 'Foro interplanetario'";
                        break;
                    case 13:
                        description = "Por completar tu Perfil has ganado la insignia 'ID Intergal�ctica'";
                        break;
                    case 14:
                        description = "Por aportar activamente en la comunidad Incluso has ganado la insignia 'Participaci�n el�ctrica'";
                        break;
                    case 15:
                        description = "Por obtener 30 likes en Foro o Comunidad has ganado la insignia 'Coraz�n digital'";
                        break;
                    case 16:
                        description = "Has ganado el 'Casco'. Ahora, �ve por m�s!";
                        break;
                    case 17:
                        description = "Has ganado el 'Radio de comunicaci�n'. �Nunca te des por vencido!";
                        break;
                    case 18:
                        description = "Ya es tuyo el 'Turbo' �no te rindas!";
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

                startingTime = moment().format('YYYY:MM:DD HH:mm:ss');
                console.log("Request...");
                moodleFactory.Services.GetAsyncProfile($scope.userId, currentUser.token, function () {

                    $scope.model = moodleFactory.Services.GetCacheJson("profile/" + $scope.userId);

                    if ($scope.model.profileimageurl) {
                        $scope.model.profileimageurl = $scope.model.profileimageurl + "?rnd=" + new Date().getTime();
                    }

                    $scope.hasCommunityAccess = _hasCommunityAccessLegacy($scope.model.communityAccess);
                    //console.log("Profile current stars:" + $scope.model.stars);

                    callback();

                    moodleFactory.Services.GetAsyncAvatar($scope.userId, null, getAvatarInfoCallback, function () {
                    }, true);

                    if (!$scope.model) {
                        $location.path('/');
                        return "";
                    }

                    initFields($scope.model);
                    loadStrengths();
                    loadWindowOfOpportunities();

                    $scope.model.level = $scope.model.currentStudies["level"];
                    $scope.model.grade = $scope.model.currentStudies["grade"];
                    $scope.model.period = $scope.model.currentStudies["period"];
                    console.log($scope.model.level);
                    console.log($scope.model.grade);
                    console.log($scope.model.period);


                }, true);
            }

            function initFields(m) {
                if (m.address.street == null) {
                    m.address.street = "";
                }
                if (m.address.num_ext == null) {
                    m.address.num_ext = "";
                }
                if (m.address.num_int == null) {
                    m.address.num_int = "";
                }
                if (m.address.colony == null) {
                    m.address.colony = "";
                }
                if (m.address.city == null) {
                    m.address.city = "";
                }
                if (m.address.town == null) {
                    m.address.town = "";
                }
                if (m.address.state == null) {
                    m.address.state = "";
                }
                if (m.address.postalCode == null) {
                    m.address.postalCode = "";
                }
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
                    //WARNING: Date must ALWAYS be in dd/mm/yyyy format.
                    userBirthDate = new Date(splitDate[2], splitDate[1] - 1, splitDate[0]);
                }
                else {
                    userBirthDate = null;
                }

                return userBirthDate;
            }

            function getAge() {
                var splitDate = $scope.model.birthday.split("/");

                if (splitDate != "" || splitDate.length > 2) {

                    var birthDate = new Date(splitDate[2], splitDate[0] - 1, splitDate[1]);
                    if (birthDate != null || birthDate != '') {
                        var cur = new Date();
                        var diff = cur - birthDate;
                        var age = Math.floor(diff / 31536000000);
                        $scope.model.age = age;
                    }

                } else {
                    $scope.model.age = null;
                }
            }

            // $scope.birthdayChanged = function (dateValue) {
            //     var algo = dateValue;
            //     var d = new Date(formatDate($scope.birthdate_Dateformat)),
            //         month = '' + (d.getMonth() + 1),
            //         day = '' + d.getDate(),
            //         year = d.getFullYear();

            //     if (month.length < 2) month = '0' + month;
            //     if (day.length < 2) day = '0' + day;
            //     var newBirthday = [month, day, year].join('/');
            //     $scope.model.birthday = newBirthday;
            // };

            $scope.navigateToSection = function (pageNumber) {
                $scope.currentPage = pageNumber;
            };

            $scope.navigateToPage = function (pageNumber) {
                $scope.currentPage = pageNumber;
            }

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


            //  $scope.showPlaceHolderBirthday = function(){
            //     var bd = $("input[name='date']").val();
            //     if(bd){
            //         $scope.showPlaceHolder = false;
            //     }else{
            //         $scope.showPlaceHolder = true;
            //     }
            // };

            $scope.datePickerClick = function () {
                cordova.exec(SuccessDatePicker, FailureDatePicker, "CallToAndroid", "datepicker", [$("input[name='date']").val()]);
            };

            function SuccessDatePicker(data) {
                $("input[name='date']").val(data);
                var splitDate = data.split("/");
                var birthday = new Date(splitDate[2], splitDate[1] - 1, splitDate[0]);
                $scope.model.birthday = moment(birthday).format("MM/DD/YYYY");
            }

            function FailureDatePicker(data) {

            }

            function isValidDate(date) {
                var matches = /^(\d{2})[-\/](\d{2})[-\/](\d{4})$/.exec(date);
                if (matches == null) return false;
                var m = matches[1] - 1;
                var d = matches[2];
                var y = matches[3];
                var composedDate = new Date(y, m, d);
                return composedDate.getDate() == d &&
                    composedDate.getMonth() == m &&
                    composedDate.getFullYear() == y;
            }

            function validateRestrictions() {//This validates for the required fields
                //console.log('fetching editProfile errors list');
                var errors = [];

                validateEmptyItemsOnLists();

                // ************************ The following are required fields. ****************************
                var age = calculate_age();
                if (age < 13) {
                    errors.push("Debes ser mayor de 13 a�os para poder registrarte.");
                }
                if (!$scope.editForm.firstname.$valid) {
                    errors.push("Formato de nombre incorrecto.");
                }
                if (!$scope.editForm.lastname.$valid) {
                    errors.push("Formato de apellido paterno incorrecto.");
                }
                if (!$scope.editForm.mothername.$valid) {
                    errors.push("Formato de apellido materno incorrecto.");
                }
                if (!$scope.model.gender) {
                    errors.push("Debe indicar su g�nero.");
                }
                if (!isValidDate($scope.model.birthday)) {
                    errors.push("Ingrese la fecha de nacimiento.");
                }

                // ************************ The following are not required fields. ****************************
                //Here we validate only for consistency.
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
                    errors.push("Nombre de Red social est� repetido.");
                }

                //Validation of the $scope.model.familiaCompartamos array
                //  a) Avoiding two persons having the same "N�mero de Cliente Compartamos"
                var arrayForIdClients = [];

                $scope.model.familiaCompartamos.forEach(function (elem) {
                    arrayForIdClients.push(elem.idClient.toLowerCase());

                });

                var filteredIdClient = arrayForIdClients.filter(function (item, pos) {
                    return arrayForIdClients.indexOf(item) == pos;
                });

                //  Repeated idClients
                if (arrayForIdClients.length != filteredIdClient.length) {
                    errors.push("El n�mero de cliente Compartamos debe ser �nico.");
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
                    errors.push("El parentesco est� repetido.");
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
                    errors.push("El nivel de estudios est� repetido.");
                }

                $scope.model.modelState.errorMessages = errors;

                return (errors.length === 0);
            }


            var validateEmptyItemsOnLists = function () {

                // Mi Informaci�n -------------------------------------------------------------------------------------

                //studies
                if ($scope.model.studies.length > 0) {
                    for (var i = 0; i < $scope.model.studies.length; i++) {
                        if (typeof $scope.model.studies[i].school === "undefined" || typeof $scope.model.studies[i].levelOfStudies === "undefined") {
                            $scope.model.studies.splice(i, 1);
                            i = i - 1;
                        }
                    }
                }

                //phones
                if ($scope.model.phones.length > 0) {
                    for (var i = 0; i < $scope.model.phones.length; i++) {
                        if (typeof $scope.model.phones[i] === "undefined" || $scope.model.phones[i].length === 0) {
                            $scope.model.phones.splice(i, 1);
                            i = i - 1;
                        }
                    }
                }

                //socialNetworks
                if ($scope.model.socialNetworks.length > 0) {
                    for (var i = 0; i < $scope.model.socialNetworks.length; i++) {
                        if (typeof $scope.model.socialNetworks[i].socialNetwork === "undefined") {
                            $scope.model.socialNetworks.splice(i, 1);
                            i = i - 1;
                        }
                    }
                }

                //familiaCompartamos
                if ($scope.model.familiaCompartamos.length > 0) {
                    for (var i = 0; i < $scope.model.familiaCompartamos.length; i++) {
                        if (typeof $scope.model.familiaCompartamos[i].relationship === "undefined") {
                            $scope.model.familiaCompartamos.splice(i, 1);
                            i = i - 1;
                        }
                    }
                }

                // Mi Personalidad -------------------------------------------------------------------------------------

                //favoriteSports
                if ($scope.model.favoriteSports.length > 0) {
                    for (var i = 0; i < $scope.model.favoriteSports.length; i++) {
                        if (typeof $scope.model.favoriteSports[i] === "undefined" || $scope.model.favoriteSports[i].length === 0) {
                            $scope.model.favoriteSports.splice(i, 1);
                            i = i - 1;
                        }
                    }
                }


                //artisticActivities
                if ($scope.model.artisticActivities.length > 0) {
                    for (var i = 0; i < $scope.model.artisticActivities.length; i++) {
                        if (typeof $scope.model.artisticActivities[i] === "undefined" || $scope.model.artisticActivities[i].length === 0) {
                            $scope.model.artisticActivities.splice(i, 1);
                            i = i - 1;
                        }
                    }
                }

                //hobbies
                if ($scope.model.hobbies.length > 0) {
                    for (var i = 0; i < $scope.model.hobbies.length; i++) {
                        if (typeof $scope.model.hobbies[i] === "undefined" || $scope.model.hobbies[i].length === 0) {
                            $scope.model.hobbies.splice(i, 1);
                            i = i - 1;
                        }
                    }
                }

                //talents
                if ($scope.model.talents.length > 0) {
                    for (var i = 0; i < $scope.model.talents.length; i++) {
                        if (typeof $scope.model.talents[i] === "undefined" || $scope.model.talents[i].length === 0) {
                            $scope.model.talents.splice(i, 1);
                            i = i - 1;
                        }
                    }
                }


                //values
                if ($scope.model.values.length > 0) {
                    for (var i = 0; i < $scope.model.values.length; i++) {
                        if (typeof $scope.model.values[i] === "undefined" || $scope.model.values[i].length === 0) {
                            $scope.model.values.splice(i, 1);
                            i = i - 1;
                        }
                    }
                }

                //Habilities
                if ($scope.model.habilities.length > 0) {
                    for (var i = 0; i < $scope.model.habilities.length; i++) {
                        if (typeof $scope.model.habilities[i] === "undefined" || $scope.model.habilities[i].length === 0) {
                            $scope.model.habilities.splice(i, 1);
                            i = i - 1;
                        }
                    }
                }

                //inspirationalCharacters
                if ($scope.model.inspirationalCharacters.length > 0) {
                    for (var i = 0; i < $scope.model.inspirationalCharacters.length; i++) {
                        if (typeof $scope.model.inspirationalCharacters[i].characterType === "undefined") {
                            $scope.model.inspirationalCharacters.splice(i, 1);
                            i = i - 1;
                        }
                    }
                }

                // Socioecon�micos --------------------------------------------------------------------------------------

                //mainActivity
                if ($scope.model.mainActivity.length > 0) {
                    for (var i = 0; i < $scope.model.mainActivity.length; i++) {
                        if (typeof $scope.model.mainActivity[i] === "undefined") {
                            $scope.model.mainActivity.splice(i, 1);
                            i = i - 1;
                        }
                    }
                }

                //moneyIncome
                if ($scope.model.moneyIncome.length > 0) {
                    for (var i = 0; i < $scope.model.moneyIncome.length; i++) {
                        if (typeof $scope.model.moneyIncome[i] === "undefined") {
                            $scope.model.moneyIncome.splice(i, 1);
                            i = i - 1;
                        }
                    }
                }

                // Uso de tecnologia -------------------------------------------------------------------------------------

                //knownDevices
                if ($scope.model.knownDevices.length > 0) {
                    for (var i = 0; i < $scope.model.knownDevices.length; i++) {
                        if (typeof $scope.model.knownDevices[i] === "undefined") {
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

            $scope.returnToProfile = function () {//After pressing "Terminar" button.
                $scope.$emit('ShowPreloader');
                $timeout(function () {
                    $scope.$emit('ShowPreloader');
                    $location.path("Profile/" + moodleFactory.Services.GetCacheObject("userId"));
                }, 1);
            }


            $scope.index = function () {//Redirect to editing profile again.
                $scope.currentPage = 12;
                //$location.path("Profile/" + moodleFactory.Services.GetCacheObject("userId"));
                $location.path("Perfil/Editar");

            };


            $scope.save = function () {

                $scope.model.currentStudies = {};
                $scope.model.currentStudies.level = $scope.model.level;
                $scope.model.currentStudies.grade = $scope.model.grade;
                $scope.model.currentStudies.period = $scope.model.period;

                if ($location.$$path == '/Perfil/ConfigurarPrivacidad') {
                    saveUser();
                } else {
                    var validationResult = validateRestrictions();  //Validates for required restrictions.

                    deleteRepeatedValues();  //Removes empty entries.

                    if (validationResult) {
                        $scope.$emit('ShowPreloader');
                        saveUser();
                    } else {
                        $scope.$emit('scrollTop');
                    }
                }
            };


            function saveUser() { //Save the current state of profile variables.
                moodleFactory.Services.PutAsyncProfile($scope.userId, $scope.model,
                    function (data) {
                        updateStarsForCompletedSections();
                        console.log('Save profile successful...');
                        $scope.$emit('HidePreloader');
                        $scope.index();
                    },
                    function (data) {
                        console.log('Save profile fail...');
                    });
            }

            function assignBadge() {
                //function to asign badge to a user
            }


            function updateStarsForCompletedSections() {
                //Here we look for completed profile sections;
                //completed sections will be given their corresponding points.

                var sectionIndex;
                var usercourse = JSON.parse(localStorage.getItem("usercourse"));
                var currentUser = JSON.parse(localStorage.getItem("CurrentUser"));

                for (sectionIndex = 0; sectionIndex < usercourse.activities.length; sectionIndex++) {
                    var activity = usercourse.activities[sectionIndex];
                    /*
                     console.log("Activity Name: " + activity.activityname);
                     console.log("Activity Points: " + activity.points);
                     console.log("Activity Status: " + activity.status);
                     console.log("Current Stars: " + $scope.model.stars);
                     console.log("Stars to add: " + activity.points);
                     */

                    if (activity.status == 0) {//Only for profile sections not previously fulfilled.
                        var result;

                        switch (activity.activity_identifier) {
                            case "3000":  // "Llenar mi informacion"; points to assign: 400
                                result = assignmentMiInformacion();
                                break;
                            case "3001":  // "Llenar Mi Personalidad"; points to assign: 400
                                result = assignmentMiPersonalidad();
                                break;
                            case "3002":  // "Llenar Llenar Socioeconomicos"; points to assign: 400
                                result = assignmentSocioeconomicos();
                                break;
                            case "3003":  // "Llenar Uso de la tecnologia"; points to assign: 400
                                result = assignmentTecnologia();
                                break;
                            default:
                                result = false;
                                break;
                        }


                        if (result) {//The user has successfully completed a profile's section.
                            //Show closing view for the given section
                            console.log(activity.activityname);

                            var sectionObject = {};

                            sectionObject.name = activity.activityname.substring(7);
                            sectionObject.points = activity.points;

                            $scope.completedSections.push(sectionObject);

                            $scope.model.stars = parseInt($scope.model.stars) + activity.points; // Add the activity points.
                            activity.status = 1;   //Update activity status.

                            //Get local user profile.
                            var profile = JSON.parse(moodleFactory.Services.GetCacheObject("profile/" + $scope.userId));
                            var newPoints = parseInt(profile.stars) + parseInt(activity.points); //Update points
                            profile.stars = newPoints;  //Update the 'stars' key.

                            _setLocalStorageJsonItem("profile/" + $scope.userId, profile); //Save updated profile to Local Storage.
                            updateUserStarsUsingExternalActivity(activity.activity_identifier); //Update profile in Moodle.

                            endingTime = moment().format('YYYY-MM-DD HH:mm:ss');

                            var activityModel = {
                                "usercourse": usercourse,
                                "coursemoduleid": activity.coursemoduleid,
                                //"answersResult": "???",
                                "userId": currentUser.userId,
                                "startingTime": startingTime,
                                "endingTime": endingTime,
                                "token": currentUser.token,
                                "activityType": "Assign"
                            };

                            //Finish Activity.
                            _endActivity(activityModel, function () {
                                validateAllFieldsCompleted();
                            });

                            result = false;  //Restore 'result' value
                        }
                    } //End of: if (activity.status == 0) ...
                } // End of: for (sectionIndex = 0; ...
            }


            function validateAllFieldsCompleted() {
                var usercourse = JSON.parse(localStorage.getItem("usercourse"));
                if (usercourse && usercourse.activities) {
                    var activitiesCompleted = _.where(usercourse.activities, {status: 1});
                    console.log(activitiesCompleted);
                    if (activitiesCompleted && activitiesCompleted.length == usercourse.activities.length) {
                        console.log("create badge");
                        var badgeModel = {
                            badgeid: 13 //badge earned when a user completes his profile.
                        };
                        moodleFactory.Services.PostBadgeToUser($scope.userId, badgeModel, function () {
                            console.log("created badge successfully");
                        }, function () {
                        });
                    }
                }

                return true;
            }


            function phonesAreValid(phones) {

                var validInfo = true;
                var i;
                var itemWithoutPhone = false;

                if (phones.length > 0) {//There is at least one phone item.

                    for (i = 0; i < phones.length; i++) {//For all items, if phone then something in phoneId too.

                        if (phones[i].phone == "No tengo tel�fono") {
                            itemWithoutPhone = true;
                        } else {
                            if (phones[i].phoneId == "") {//The value must be nonempty numeric string of size 10.
                                validInfo = false;
                            }
                        }
                    }

                    if (validInfo) {

                        if (itemWithoutPhone && phones.length > 1) {
                            validInfo = false;
                        }

                    }

                } else { //The user has not entered phone numbers.
                    validInfo = false;
                }

                return validInfo;
            }


            function socialNetsAreValid(nets) {

                var validInfo = true;
                var i;
                var itemWithoutNet = false;

                if (nets.length > 0) {//There is at least one social network item.

                    for (i = 0; i < nets.length; i++) {//For all items, if phone then something in phoneId too.

                        if (nets[i].socialNetwork == "No tengo redes sociales") {
                            itemWithoutNet = true;
                        } else {
                            if (nets[i].socialNetworkId == "") {//The value must be a nonempty string.
                                validInfo = false;
                            }
                        }
                    }

                    if (validInfo) {

                        if (itemWithoutNet && nets.length > 1) {
                            validInfo = false;
                        }

                    }

                } else { //The user has not entered social networks.
                    validInfo = false;
                }

                return validInfo;
            }


            function compartamosIsValid(data) {
                var validInfo = true;
                var i;
                var itemWithoutCompartamos = false;

                if (data.length > 0) {//There is at least one Compartamos relative item.
                    for (i = 0; i < data.length; i++) {//For all items, if Compartamos relative then something in idClient and relativeName too.
                        if (data[i].relationship == "No tengo") {
                            itemWithoutCompartamos = true;
                        } else {
                            if (data[i].idClient == "" || data[i].relativeName == "") {//The values must be nonempty strings.
                                validInfo = false;
                            }
                        }
                    }
                    if (validInfo) {
                        if (itemWithoutCompartamos && data.length > 1) {
                            validInfo = false;
                        }
                    }
                }
                return validInfo;
            }

            function assignmentMiInformacion() {//Asign 400 points if all fields are full.
                var result = false;

                if ($scope.model.firstname) { //Requerido
                    if ($scope.model.lastname) { //Requerido
                        if ($scope.model.mothername) { //Requerido
                            if ($scope.model.gender) { //Requerido
                                if ($scope.model.address.country) {
                                    if ($scope.birthdate_Dateformat) { //Requerido
                                        if ($scope.model.age) {
                                            if ($scope.model.maritalStatus) {
                                                if ($scope.model.studies.length > 0) { // array of objects
                                                    if ($scope.model.address.state) {
                                                        if ($scope.model.address.town) {
                                                            if ($scope.model.address.postalCode) {
                                                                if ($scope.model.address.street) {
                                                                    if ($scope.model.address.num_ext) {

                                                                        if ($scope.model.address.colony) {
                                                                            if (phonesAreValid($scope.model.phones)) {//array of objects
                                                                                if (socialNetsAreValid($scope.model.socialNetworks)) { //array of objects
                                                                                    if (compartamosIsValid($scope.model.familiaCompartamos)) { //array of objects
                                                                                        result = true;
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
                }

                return result;
            }

            function charactersIsValid(data) {
                var validInfo = true;
                var i;
                var itemWithoutCharacter = false;

                if (data.length > 0) {//There is at least one character item.

                    for (i = 0; i < data.length; i++) {//For all items, if characterType then something in characterName too.

                        if (data[i].characterType == "No tengo") {
                            itemWithoutCharacter = true;
                        } else {
                            if (data[i].characterName == "") {//The value must be a nonempty string.
                                validInfo = false;
                            }
                        }
                    }

                    if (validInfo) {

                        if (itemWithoutCharacter && data.length > 1) {
                            validInfo = false;
                        }

                    }

                } else { //The user has not entered social networks.
                    validInfo = false;
                }

                return validInfo;
            }


            function assignmentMiPersonalidad() {
                var result = false;
                if ($scope.model.favoriteSports.length > 0) {   //array
                    if ($scope.model.artisticActivities.length > 0) {  //array
                        if ($scope.model.hobbies.length > 0) {  //array
                            if ($scope.model.talents.length > 0) {  //array
                                if ($scope.model.values.length > 0) { //array
                                    if ($scope.model.habilities.length > 0) {  //array
                                        if (charactersIsValid($scope.model.inspirationalCharacters)) {  //array of objects
                                            result = true;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }

                return result;
            }

            function checkMedicalServices() {
                var validInfo = true;

                if (($scope.model.medicalCoverage) == "S�") {
                    if ($scope.model.medicalInsurance == "No tengo") {
                        validInfo = false;
                    }
                }

                return validInfo;
            }

            function assignmentSocioeconomicos() {
                var result = false;
                if ($scope.model.iLiveWith) {
                    if ($scope.model.mainActivity.length > 0) {//array
                        if ($scope.model.level) {
                            if ($scope.model.grade) {
                                if ($scope.model.period) {
                                    if ($scope.model.children) {
                                        if ($scope.model.gotMoneyIncome) {
                                            if ($scope.model.moneyIncome.length > 0) {  //array
                                                if (checkMedicalServices()) {
                                                    result = true;
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


            function assignmentTecnologia() {
                var result = false;
                if ($scope.model.knownDevices.length > 0) { //array
                    if ($scope.model.ownDevices.length > 0) {  //array
                        if ($scope.model.phoneUsage.length > 0) {  //array
                            if ($scope.model.playVideogames) {
                                if ($scope.model.videogamesFrecuency) {
                                    if ($scope.model.videogamesHours) {
                                        if ($scope.model.kindOfVideogames.length > 0) {  //array
                                            if ($scope.model.favoriteGames.length > 0) {  //array
                                                result = true;
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


            var deleteRepeatedValues = function () {

                // MODELS for "Mi Personalidad"
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


                // The model $scope.model.inspirationalCharacters must be validated in validateModel()

                // MODELS for "Socioecon�micos"  --> Some of them should be validated within validateModel()
                $scope.model.mainActivity = $scope.model.mainActivity.filter(function (item, pos) {
                    return item.trim().length > 0 && $scope.model.mainActivity.indexOf(item) == pos;
                });

                $scope.model.moneyIncome = $scope.model.moneyIncome.filter(function (item, pos) {
                    return item.trim().length > 0 && $scope.model.moneyIncome.indexOf(item) == pos;
                });


                // MODELS for "Uso de tecnologia"
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

            };


            // ######################  Methods to add / delete data  ############################
            $scope.addStudy = function () {
                $scope.model.studies.push({});
            };

            $scope.deleteStudy = function (index) {
                $scope.model.studies.splice(index, 1);
            };

            $scope.addPhone = function () {
                $scope.model.phones.push({});
            };

            $scope.deletePhone = function (index) {
                $scope.model.phones.splice(index, 1);
            };

            $scope.addSocialNetwork = function () {
                $scope.model.socialNetworks.push({});
            };

            $scope.deleteSocialNetwork = function (index) {
                $scope.model.socialNetworks.splice(index, 1);
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

            $scope.deleteMoneyIncome = function (moneyIncome) {
                //$scope.model.moneyIncome.splice(index, 1);
                var index = $scope.model.moneyIncome.indexOf(moneyIncome);
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

            $scope.deleteMainActivity = function (mainActivity) {
                //$scope.model.mainActivity.splice(index, 1);
                var index = $scope.model.mainActivity.indexOf(mainActivity);
                $scope.model.mainActivity.splice(index, 1);
            };

            $scope.addMainActivity = function () {
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

            $scope.addFamiliaCompartamos = function () {
                $scope.model.familiaCompartamos.push({});
            };

            $scope.deleteFamiliaCompartamos = function (index) {
                $scope.model.familiaCompartamos.splice(index, 1);
            };

            //  ###########################################################################

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
                            avatarUploaded("�xito");
                        })
                        .error(function () {
                            avatarUploaded("Error");
                        });
                });
            }

            function avatarUploaded(message) {
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
                var shield = ( $scope.model.shield.toLowerCase().indexOf('matem') > -1 ? 'Matem�tica' : ( $scope.model.shield.toLowerCase().indexOf('ling') > -1 ? 'Ling��stica' : $scope.model.shield ));
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
                    "escudo": shield
                };

                try {
                    $scope.$emit('ShowPreloader');
                    cordova.exec(SuccessAvatar, FailureAvatar, "CallToAndroid", "openApp", [JSON.stringify(avatarInfoForGameIntegration)]);
                } catch (e) {
                    SuccessAvatar(
                        {
                            "userid": $scope.model.id,
                            "actividad": "Mi Avatar",
                            "alias": $scope.model.username,
                            "genero": "Hombre",
                            "rostro": "Preocupado",
                            "color_de_piel": "E6C8B0",
                            "estilo_cabello": "Cabello02",
                            "color_cabello": "694027",
                            "traje_color_principal": "00A0FF",
                            "traje_color_secundario": "006192",
                            "imagen_recortada": "app/initializr/media",
                            "fecha_modificacion": "09/05/2015 08:32:04",
                            "Te_gusto_la_actividad": null,
                            "pathimagen": "default.png"
                        }
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

            $scope.shareAchievement = function () {

                if ($scope.hasCommunityAccess) {
                    $scope.$emit('ShowPreloader');

                    if ($scope.discussion == null || $scope.forumId == null) {

                        moodleFactory.Services.GetAsyncForumDiscussions(_course.community.coursemoduleid, currentUser.token, function (data, key) {

                            var currentDiscussionIds = [];
                            for (var d = 0; d < data.discussions.length; d++) {
                                currentDiscussionIds.push(data.discussions[d].discussion);
                            }
                            localStorage.setItem("currentDiscussionIds", JSON.stringify(currentDiscussionIds));
                            $scope.discussion = data.discussions[0];
                            $scope.forumId = data.forumid;

                            postAchievement();

                        }, function (data) {
                            $scope.shareAchievementMessage = "";
                            $scope.showShareAchievementMessage = false;
                            $scope.showSharedAchievement = true;

                            $scope.$emit('HidePreloader');
                        }, true);
                    } else {
                        postAchievement();
                    }
                }

            };

            var checkForumExtraPoints = function () {

                /* check over extra points */
                var course = moodleFactory.Services.GetCacheJson("course");
                var forumData = moodleFactory.Services.GetCacheJson("postcounter/" + course.courseid);
                var forum = _.find(forumData.forums, function (elem) {
                    return elem.forumactivityid == "50000";
                });

                if (Number(forum.discussion[0].total) <= 15) {
                    updateUserForumStars("50000", 50, function () {
                        successPutStarsCallback();
                    });
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
                    function () {
                        $scope.shareAchievementMessage = "";
                        $scope.showShareAchievementMessage = false;
                        $scope.showSharedAchievement = true;

                        $scope.$emit('HidePreloader');
                        checkForumExtraPoints();
                    },
                    function () {
                        $scope.shareAchievementMessage = "";
                        $scope.showShareAchievementMessage = false;
                        $scope.showSharedAchievement = false;

                        $scope.$emit('HidePreloader');
                    }
                );
            };

            function getContent() {
                drupalFactory.Services.GetContent("7001", function (data, key) {
                    $scope.contentResources = data.node;
                }, function () {
                }, true);
            }

            $scope.scrollToTop();

        }]);
