//##############################   Controller for Profile   ##############################
//##############################        Version 2.2.1       ##############################
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
        '$modal',
        '$filter',
        '$route',
        function ($q, $scope, $location, $routeParams, $timeout, $rootScope, $http, $modal, $filter, $route) {
            var _loadedResources = false;
            var _pageLoaded = false;
            var showResultsPage = false;
            $scope.accessedSubsection = false;

            $scope.$emit('ShowPreloader');

            //var userId = moodleFactory.Services.GetCacheObject("userId");

            if ($routeParams.id != moodleFactory.Services.GetCacheObject("userId")) {
                $scope.validateConnection(initController, offlineCallback);
            } else {
                initController();
            }

            function offlineCallback() {
                $timeout(function () {
                    $location.path("/Offline");
                }, 1000);
            }

            function initController() {

                _httpFactory = $http;
                _timeout = $timeout;

                var _course = moodleFactory.Services.GetCacheJson("course");

                $scope.discussion = null;
                $scope.forumId = null;

                $scope.loggedUser = ($routeParams.id == moodleFactory.Services.GetCacheObject("userId"));
                $scope.userId = $routeParams.id != null ? $routeParams.id : moodleFactory.Services.GetCacheObject("userId");
                var currentUser = JSON.parse(localStorage.getItem("CurrentUser"));

                $scope.isMultipleChallengeActivityFinished = $scope.loggedUser && _course.isMultipleChallengeActivityFinished;
                $scope.myStrengths = [];
                $scope.myWindowOfOpportunities = [];

                $scope.setToolbar($location.$$path, "");

                $scope.currentPage = 1;
                if ($location.$$path == ('/Perfil/ConfigurarPrivacidad/' + $scope.userId)) {
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

                getDataAsync(function () {
                    
                    getContent();                                        

                    //privacy settings initial switches [boolean]
                    $scope.generalInfo = true;
                    $scope.schoolarship = false;
                    $scope.address = false;
                    $scope.phone = true;
                    $scope.socialNet = true;
                    $scope.family = false;

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
                    $scope.stateItems = _getCatalogValuesBy("citiesCatalog");
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
                    } else {
                        $scope.birthdate_Dateformat = null;
                    }

                    getAge();

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

                function deleteRepeatedEntries(arr) {
                    var mirrorUpper = [];
                    var n = arr.length;
                    var i;

                    for (i = 0; i < n; i++) {
                        mirrorUpper.push(arr[i].replace(/\r?\n|\r/g, " ").trim().toUpperCase());
                    }

                    arr = arr.filter(function (item, pos) {
                        return item.trim().length > 0 && arr.indexOf(item) == pos && mirrorUpper.indexOf(item.trim().toUpperCase()) == pos;
                    });

                    return orderCatalog(arr);
                }

                function orderCatalog(arr) {

                    var n = arr.length;
                    var i, j;
                    var finalArr = [];
                    var orderedArr = [];

                    for (i = 0; i < n; i++) {
                        orderedArr.push(arr[i].replace(/\r?\n|\r/g, " ").trim().toLowerCase());
                    }

                    orderedArr = orderedArr.sort();

                    for (i = 0; i < n; i++) {
                        for (j = 0; j < n; j++) {
                            if (arr[j].replace(/\r?\n|\r/g, " ").trim().toLowerCase() == orderedArr[i]) {
                                finalArr.push(arr[j].replace(/\r?\n|\r/g, " ").trim());
                            }
                        }
                    }

                    return finalArr;
                }

                function getDataAsync(callback) {

                    startingTime = moment().format('YYYY:MM:DD HH:mm:ss');

                    //Try to get user profile data from Local Storage.
                    $scope.model = moodleFactory.Services.GetCacheJson("Perfil/" + $scope.userId);

                    if ($scope.model !== null) {// If profile existes in Local Storage, then...
                        if ($scope.model.profileimageurl) {
                            $scope.model.profileimageurl = $scope.model.profileimageurl + "?rnd=" + new Date().getTime();
                        }

                        $scope.hasCommunityAccess = _hasCommunityAccessLegacy($scope.model.communityAccess);

                        callback();
                        //Get avatar info from Local Storage.
                        $scope.avatarInfo = moodleFactory.Services.GetCacheJson("avatarInfo");
                        $timeout(function(){
                            $scope.validateConnection(function(){}, function(){
                                
                                getImageOrDefault("assets/avatar/avatar_" + _getItem("userId") + ".png", $scope.model.profileimageurl, function(niceImageUrl) { 
                                    $scope.model.profileimageurl = niceImageUrl;
                                });
                                
                            });
                        }, 500);

                        $scope.model = initFields($scope.model);
                        loadStrengths();
                        loadWindowOfOpportunities();

                        $scope.model.level = $scope.model.currentStudies["level"];
                        $scope.model.grade = $scope.model.currentStudies["grade"];
                        $scope.model.period = $scope.model.currentStudies["period"];
                       
                        $scope.model.talents = orderCatalog($scope.model.talents);
                        $scope.model.values = orderCatalog($scope.model.values);
                        $scope.model.habilities = orderCatalog($scope.model.habilities);
                        $scope.model.favoriteSports = orderCatalog($scope.model.favoriteSports);
                        $scope.model.artisticActivities = orderCatalog($scope.model.artisticActivities);
                        $scope.model.hobbies = orderCatalog($scope.model.hobbies);
                        $scope.model.knownDevices = orderCatalog($scope.model.knownDevices);

                        $scope.favoritSportsList = $scope.favoritSportsList.concat($scope.model.favoriteSports);
                        $scope.artisticActivitiesList = $scope.artisticActivitiesList.concat($scope.model.artisticActivities);
                        $scope.hobbiesList = $scope.hobbiesList.concat($scope.model.hobbies);
                        $scope.talentsList = $scope.talentsList.concat($scope.model.talents);
                        $scope.valuesList = $scope.valuesList.concat($scope.model.values);
                        $scope.habilitiesList = $scope.habilitiesList.concat($scope.model.habilities);

                        $scope.favoritSportsList = deleteRepeatedEntries($scope.favoritSportsList);
                        $scope.artisticActivitiesList = deleteRepeatedEntries($scope.artisticActivitiesList);
                        $scope.hobbiesList = deleteRepeatedEntries($scope.hobbiesList);
                        $scope.talentsList = deleteRepeatedEntries($scope.talentsList);
                        $scope.valuesList = deleteRepeatedEntries($scope.valuesList);
                        $scope.habilitiesList = deleteRepeatedEntries($scope.habilitiesList);

                        $timeout(function () {
                            $scope.$emit('HidePreloader');
                        }, 2000);

                    } else {//Try to get user profile data from Service.

                        moodleFactory.Services.GetAsyncProfile($scope.userId, currentUser.token, function () {

                            $scope.model = moodleFactory.Services.GetCacheJson("Perfil/" + $scope.userId);

                            if ($scope.model.profileimageurl) {
                                $scope.model.profileimageurl = $scope.model.profileimageurl + "?rnd=" + new Date().getTime();
                            }
                            _forceUpdateConnectionStatus(function(){
                                $scope.model.profileimageurl = (_isDeviceOnline ? $scope.model.profileimageurl : 'assets/avatar/default-2.png');
                            }, function(){});
                            
                            $scope.hasCommunityAccess = _hasCommunityAccessLegacy($scope.model.communityAccess);

                            callback();

                            moodleFactory.Services.GetAsyncAvatar($scope.userId, currentUser.token, getAvatarInfoCallback, function () {
                                _pageLoaded = true;
                                if (_loadedResources && _pageLoaded) {
                                    $scope.$emit('HidePreloader');
                                }
                            }, true);

                            if (!$scope.model) {
                                $location.path('/');
                                return "";
                            }

                            $scope.model = initFields($scope.model);
                            loadStrengths();
                            loadWindowOfOpportunities();

                            $scope.model.level = $scope.model.currentStudies["level"];
                            $scope.model.grade = $scope.model.currentStudies["grade"];
                            $scope.model.period = $scope.model.currentStudies["period"];

                            $scope.model.talents = orderCatalog($scope.model.talents);
                            $scope.model.values = orderCatalog($scope.model.values);
                            $scope.model.habilities = orderCatalog($scope.model.habilities);
                            $scope.model.favoriteSports = orderCatalog($scope.model.favoriteSports);
                            $scope.model.artisticActivities = orderCatalog($scope.model.artisticActivities);
                            $scope.model.hobbies = orderCatalog($scope.model.hobbies);
                            $scope.model.knownDevices = orderCatalog($scope.model.knownDevices);

                            $scope.favoritSportsList = $scope.favoritSportsList.concat($scope.model.favoriteSports);
                            $scope.artisticActivitiesList = $scope.artisticActivitiesList.concat($scope.model.artisticActivities);
                            $scope.hobbiesList = $scope.hobbiesList.concat($scope.model.hobbies);
                            $scope.talentsList = $scope.talentsList.concat($scope.model.talents);
                            $scope.valuesList = $scope.valuesList.concat($scope.model.values);
                            $scope.habilitiesList = $scope.habilitiesList.concat($scope.model.habilities);

                            $scope.favoritSportsList = deleteRepeatedEntries($scope.favoritSportsList);
                            $scope.artisticActivitiesList = deleteRepeatedEntries($scope.artisticActivitiesList);
                            $scope.hobbiesList = deleteRepeatedEntries($scope.hobbiesList);
                            $scope.talentsList = deleteRepeatedEntries($scope.talentsList);
                            $scope.valuesList = deleteRepeatedEntries($scope.valuesList);
                            $scope.habilitiesList = deleteRepeatedEntries($scope.habilitiesList);

                        }, function () {
                        }, true);
                    }

                    $timeout(function () {
                        $scope.$emit('HidePreloader');
                    }, 2000);
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

                    return m;
                }

                function getAvatarInfoCallback() {
                    $scope.avatarInfo = moodleFactory.Services.GetCacheJson("avatarInfo");

                    if ($scope.avatarInfo == null || $scope.avatarInfo.length == 0) {
                        setEmptyAvatar();
                    }

                    _pageLoaded = true;
                    if (_loadedResources && _pageLoaded) {
                        $scope.$emit('HidePreloader');
                    }
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

                        var birthDate = new Date(splitDate[2], splitDate[1] - 1, splitDate[0]);
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
                    $scope.$emit('ShowPreloader');
                    $location.path("/Perfil/Editar/" + $scope.userId);
                };

                $scope.privacySettings = function () {
                    $scope.navigateTo('/Perfil/ConfigurarPrivacidad/' + moodleFactory.Services.GetCacheObject("userId"), null, null, null);
                };

                $scope.navigateToDashboard = function () {
                    $location.path('/ProgramaDashboard');
                };

                function calculate_age() {
                    var dpValue = $scope.model.birthday;
                    var birth_day = dpValue.substring(0, 2);
                    var birth_month = dpValue.substring(3, 5);
                    var birth_year = dpValue.substring(6, 10);
                    var today_date = new Date();
                    var today_year = today_date.getFullYear();
                    var today_month = today_date.getMonth();
                    var today_day = today_date.getDate();

                    var age = today_year - birth_year;

                    if (today_month < (parseInt(birth_month, 10) - 1)) {
                        age--;
                    }

                    if ( ((parseInt(birth_month, 10) - 1) == today_month) && (today_day < parseInt(birth_day, 10))) {
                        age--;
                    }

                    return age;
                }

                $scope.datePickerClick = function () {
                    if (window.mobilecheck()) {
                        cordova.exec(SuccessDatePicker, FailureDatePicker, "CallToAndroid", "datepicker", [$("input[name='date']").val()]);
                    }
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
                    var m = matches[2] - 1;
                    var d = matches[1];
                    var y = matches[3];
                    var composedDate = new Date(y, m, d);

                    return composedDate.getDate() == d && composedDate.getMonth() == m && composedDate.getFullYear() == y;
                }

                function validateRestrictions() {//This validates for the required fields
                    var errors = [];

                    validateEmptyItemsOnLists();

                    // ************************ The following are required fields. ****************************

                    var age = calculate_age();

                    if (age < 13) {
                        errors.push("Debes ser mayor de 13 años para poder registrarte.");
                    }

                    if ($scope.model.firstname == '') {
                        errors.push("Formato de nombre incorrecto.");
                    }

                    if ($scope.model.lastname == '') {
                        errors.push("Formato de apellido paterno incorrecto.");
                    }

                    if ($scope.model.mothername == '') {
                        errors.push("Formato de apellido materno incorrecto.");
                    }

                    if (!$scope.model.gender) {
                        errors.push("Debe indicar su género.");
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
                        errors.push("Nombre de Red social está repetido.");
                    }

                    //Validation of the $scope.model.familiaCompartamos array
                    //  a) Avoiding two persons having the same "Número de Cliente Compartamos"
                    var arrayForIdClients = [];

                    $scope.model.familiaCompartamos.forEach(function (elem) {
                        arrayForIdClients.push(elem.idClient.toLowerCase());
                    });

                    var filteredIdClient = arrayForIdClients.filter(function (item, pos) {
                        return arrayForIdClients.indexOf(item) == pos;
                    });

                    //  Repeated idClients
                    if (arrayForIdClients.length != filteredIdClient.length) {
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

                    if (arrayForParentesco.length != filteredArray.length) { //Repeated idClients
                        errors.push("El parentesco está repetido.");
                    }

                    //Validation of the $scope.model.studies array
                    var arrayForLevel = [];

                    $scope.model.studies.forEach(function (elem) {
                        arrayForLevel.push(elem.school.toLowerCase());
                    });

                    var filteredLevel = arrayForLevel.filter(function (item, pos) {
                        return arrayForLevel.indexOf(item) == pos;
                    });

                    if (arrayForLevel.length != filteredLevel.length) { //Repeated names for Social network
                        errors.push("El nivel de estudios está repetido.");
                    }

                    $scope.model.modelState.errorMessages = errors;

                    return (errors.length === 0);
                }

                var validateEmptyItemsOnLists = function () {

                    var i;

                    // Mi Información -------------------------------------------------------------------------------------

                    //studies
                    if ($scope.model.studies && $scope.model.studies.length > 0) {
                        for (i = 0; i < $scope.model.studies.length; i++) {
                            if (typeof $scope.model.studies[i].school === "undefined" || typeof $scope.model.studies[i].levelOfStudies === "undefined") {
                                $scope.model.studies.splice(i, 1);
                                i = i - 1;
                            }
                        }
                    }

                    //phones
                    if ($scope.model.phones && $scope.model.phones.length > 0) {
                        for (i = 0; i < $scope.model.phones.length; i++) {
                            if (typeof $scope.model.phones[i] === "undefined" || $scope.model.phones[i].length === 0) {
                                $scope.model.phones.splice(i, 1);
                                i = i - 1;
                            }
                        }
                    }

                    //socialNetworks
                    if ($scope.model.socialNetworks && $scope.model.socialNetworks.length > 0) {
                        for (i = 0; i < $scope.model.socialNetworks.length; i++) {
                            if (typeof $scope.model.socialNetworks[i].socialNetwork === "undefined") {
                                $scope.model.socialNetworks.splice(i, 1);
                                i = i - 1;
                            }
                        }
                    }

                    //familiaCompartamos
                    if ($scope.model.familiaCompartamos && $scope.model.familiaCompartamos.length > 0) {
                        for (i = 0; i < $scope.model.familiaCompartamos.length; i++) {
                            if (typeof $scope.model.familiaCompartamos[i].relationship === "undefined") {
                                $scope.model.familiaCompartamos.splice(i, 1);
                                i = i - 1;
                            }
                        }
                    }

                    // Mi Personalidad -------------------------------------------------------------------------------------

                    //favoriteSports
                    if ($scope.model.favoriteSports && $scope.model.favoriteSports.length > 0) {
                        for (i = 0; i < $scope.model.favoriteSports.length; i++) {
                            if (typeof $scope.model.favoriteSports[i] === "undefined" || $scope.model.favoriteSports[i].length === 0) {
                                $scope.model.favoriteSports.splice(i, 1);
                                i = i - 1;
                            }
                        }
                    }


                    //artisticActivities
                    if ($scope.model.artisticActivities && $scope.model.artisticActivities.length > 0) {
                        for (i = 0; i < $scope.model.artisticActivities.length; i++) {
                            if (typeof $scope.model.artisticActivities[i] === "undefined" || $scope.model.artisticActivities[i].length === 0) {
                                $scope.model.artisticActivities.splice(i, 1);
                                i = i - 1;
                            }
                        }
                    }

                    //hobbies
                    if ($scope.model.hobbies && $scope.model.hobbies.length > 0) {
                        for (i = 0; i < $scope.model.hobbies.length; i++) {
                            if (typeof $scope.model.hobbies[i] === "undefined" || $scope.model.hobbies[i].length === 0) {
                                $scope.model.hobbies.splice(i, 1);
                                i = i - 1;
                            }
                        }
                    }

                    //talents
                    if ($scope.model.talents && $scope.model.talents.length > 0) {
                        for (i = 0; i < $scope.model.talents.length; i++) {
                            if (typeof $scope.model.talents[i] === "undefined" || $scope.model.talents[i].length === 0) {
                                $scope.model.talents.splice(i, 1);
                                i = i - 1;
                            }
                        }
                    }

                    //values
                    if ($scope.model.values && $scope.model.values.length > 0) {
                        for (i = 0; i < $scope.model.values.length; i++) {
                            if (typeof $scope.model.values[i] === "undefined" || $scope.model.values[i].length === 0) {
                                $scope.model.values.splice(i, 1);
                                i = i - 1;
                            }
                        }
                    }

                    //Habilities
                    if ($scope.model.habilities && $scope.model.habilities.length > 0) {
                        for (i = 0; i < $scope.model.habilities.length; i++) {
                            if (typeof $scope.model.habilities[i] === "undefined" || $scope.model.habilities[i].length === 0) {
                                $scope.model.habilities.splice(i, 1);
                                i = i - 1;
                            }
                        }
                    }

                    //inspirationalCharacters
                    if ($scope.model.inspirationalCharacters && $scope.model.inspirationalCharacters.length > 0) {
                        for (i = 0; i < $scope.model.inspirationalCharacters.length; i++) {
                            if (typeof $scope.model.inspirationalCharacters[i].characterType === "undefined") {
                                $scope.model.inspirationalCharacters.splice(i, 1);
                                i = i - 1;
                            }
                        }
                    }

                    // Socioeconómicos --------------------------------------------------------------------------------------

                    //mainActivity
                    if ($scope.model.mainActivity && $scope.model.mainActivity.length > 0) {
                        for (i = 0; i < $scope.model.mainActivity.length; i++) {
                            if (typeof $scope.model.mainActivity[i] === "undefined") {
                                $scope.model.mainActivity.splice(i, 1);
                                i = i - 1;
                            }
                        }
                    }

                    //moneyIncome
                    if ($scope.model.moneyIncome && $scope.model.moneyIncome.length > 0) {
                        for (i = 0; i < $scope.model.moneyIncome.length; i++) {
                            if (typeof $scope.model.moneyIncome[i] === "undefined") {
                                $scope.model.moneyIncome.splice(i, 1);
                                i = i - 1;
                            }
                        }
                    }

                    // Uso de tecnologia -------------------------------------------------------------------------------------

                    //knownDevices
                    if ($scope.model.knownDevices && $scope.model.knownDevices.length > 0) {
                        for (i = 0; i < $scope.model.knownDevices.length; i++) {
                            if (typeof $scope.model.knownDevices[i] === "undefined") {
                                $scope.model.knownDevices.splice(i, 1);
                                i = i - 1;
                            }
                        }
                    }

                    //ownDevices
                    if ($scope.model.ownDevices && $scope.model.ownDevices.length > 0) {
                        for (i = 0; i < $scope.model.ownDevices.length; i++) {
                            if (typeof $scope.model.ownDevices[i] === "undefined") {
                                $scope.model.ownDevices.splice(i, 1);
                                i = i - 1;
                            }
                        }
                    }

                    //phoneUsage
                    if ($scope.model.phoneUsage && $scope.model.phoneUsage.length > 0) {
                        for (i = 0; i < $scope.model.phoneUsage.length; i++) {
                            if (typeof $scope.model.phoneUsage[i] === "undefined") {
                                $scope.model.phoneUsage.splice(i, 1);
                                i = i - 1;
                            }
                        }
                    }

                    //kindOfVideogames
                    if ($scope.model.kindOfVideogames && $scope.model.kindOfVideogames.length > 0) {
                        for (i = 0; i < $scope.model.kindOfVideogames.length; i++) {
                            if (typeof $scope.model.kindOfVideogames[i] === "undefined") {
                                $scope.model.kindOfVideogames.splice(i, 1);
                                i = i - 1;
                            }
                        }
                    }

                    //favoriteGames
                    if ($scope.model.favoriteGames && $scope.model.favoriteGames.length > 0) {
                        for (i = 0; i < $scope.model.favoriteGames.length; i++) {
                            if (typeof $scope.model.favoriteGames[i] === "undefined") {
                                $scope.model.favoriteGames.splice(i, 1);
                                i = i - 1;
                            }
                        }
                    }

                };

                $scope.navigateToSection = function (pageNumber) {
                    $scope.currentPage = pageNumber;
                    $scope.accessedSubsection = true;

                    $scope.origin = "";

                    switch (pageNumber) {
                        case 2:  // "Llenar mi informacion"; points to assign: 400
                            $scope.origin = "3000";
                            break;
                        case 5:  // "Llenar Mi Personalidad"; points to assign: 400
                            $scope.origin = "3001";
                            break;
                        case 8:  // "Llenar Llenar Socioeconomicos"; points to assign: 400
                            $scope.origin = "3002";
                            break;
                        case 10:  // "Llenar Uso de la tecnologia"; points to assign: 400
                            $scope.origin = "3003";
                            break;
                        default:
                            result = false;
                            break;
                    }
                };

                $scope.navigateToPage = function (pageNumber) {
                    $scope.currentPage = pageNumber;
                };

                $scope.returnToProfile = function () {//After pressing "Terminar" button.

                    $scope.$emit('ShowPreloader');
                    $timeout(function () {
                        $scope.$emit('ShowPreloader');
                        $location.path("Perfil/" + $scope.userId);
                    }, 1);
                };

                $scope.index = function () {//Redirect to editing profile again.
                    if ($location.$$path != '/Perfil/ConfigurarPrivacidad' && showResultsPage) {
                        //Make the title.
                        /*
                        var i;
                        $scope.title = "";

                        for (i = 0; i < $scope.completedSections.length; i++) {
                            $scope.title += $scope.completedSections[i].name + ", ";
                        }

                        $scope.title = $scope.title.trim();

                        //Trim leading comma, if present.
                        if ($scope.title[$scope.title.length - 1] === ",") {
                            $scope.title = $scope.title.substring(0, $scope.title.length - 1);
                        }
                        */

                        //Make up the total points earned.
                        $scope.sum = 0;

                        for (i = 0; i < $scope.completedSections.length; i++) {
                            $scope.sum += $scope.completedSections[i].points;
                        }

                        $scope.currentPage = 12; //Show results page
                    }

                    if ($location.$$path != '/Perfil/ConfigurarPrivacidad' && !showResultsPage) {
                        $location.path("Perfil/" + $scope.userId);   //Return to Profile.
                    }

                    if ($location.$$path == '/Perfil/ConfigurarPrivacidad') {
                        $location.path("Perfil/" + $scope.userId);
                    }

                    $scope.accessedSubsection = false;
                    showResultsPage = false;
                };

                $scope.save = function () {

                    var fromPath = $location.$$path;
                    var fromPrivacy = fromPath == "/Perfil/ConfigurarPrivacidad/" + $scope.userId;
                    if (!$scope.accessedSubsection && !fromPrivacy) {
                        $location.path("Perfil/" + $scope.userId);
                        return;
                    }

                    $scope.model.currentStudies = {};
                    $scope.model.currentStudies.level = $scope.model.level;
                    $scope.model.currentStudies.grade = $scope.model.grade;
                    $scope.model.currentStudies.period = $scope.model.period;
                    $scope.model.birthday = $scope.birthdate_Dateformat;  //Take date from UI.

                    if ($location.$$path == ('/Perfil/ConfigurarPrivacidad/' + $scope.userId)) {
                        saveUser();
                    } else {
                        var validationResult = validateRestrictions();  //Valid if validateModel() returns true

                        deleteRepeatedValues();   //Validates for required restrictions.

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
                            $scope.$emit('HidePreloader');   //Save profile successful...
                            $scope.index();
                        },
                        function (data) {
                            //Save profile fail...
                        });
                }

                function updateStarsForCompletedSections() {
                    //Here we look for completed profile sections;
                    //completed sections will be given their corresponding points.

                    var sectionIndex;
                    var usercourse = JSON.parse(localStorage.getItem("usercourse"));
                    var currentUser = JSON.parse(localStorage.getItem("CurrentUser"));

                    $scope.userCourse = usercourse;

                    for (sectionIndex = 0; sectionIndex < usercourse.activities.length; sectionIndex++) {
                        var activity = usercourse.activities[sectionIndex];

                        if (activity.status == 0) {//The section has not been filled.

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
                                var sectionObject = {};

                                switch (activity.activity_identifier) {//Make up the message strings.
                                    case "3000":  // "Llenar mi informacion"; points to assign: 400
                                        sectionObject.name = "Mi información";
                                        break;
                                    case "3001":  // "Llenar Mi Personalidad"; points to assign: 400
                                        sectionObject.name = "Mi personalidad";
                                        break;
                                    case "3002":  // "Llenar Llenar Socioeconomicos"; points to assign: 400
                                        sectionObject.name = "Socioeconómicos";
                                        break;
                                    case "3003":  // "Llenar Uso de la tecnologia"; points to assign: 400
                                        sectionObject.name = "Uso de la tecnología";
                                        break;
                                }

                                sectionObject.points = activity.points;
                                $scope.completedSections.push(sectionObject);

                                showResultsPage = true; //Show page 12

                                $scope.model.stars = parseInt($scope.model.stars) + activity.points; // Add the activity points.
                                activity.status = 1;   //Update activity status.
                                activity.last_status_update = moment(Date.now()).unix();
                                
                                var profile = JSON.parse(moodleFactory.Services.GetCacheObject("Perfil/" + $scope.userId));
                                var newPoints = parseInt(profile.stars) + parseInt(activity.points); //Update points
                                profile.stars = newPoints;  //Update the 'stars' key.
                                
                                _setLocalStorageJsonItem("Perfil/" + $scope.userId, profile); //Save updated profile to Local Storage.
                                updateUserStarsUsingExternalActivity(activity.activity_identifier); //Update profile in Moodle.
                                
                                endingTime = moment().format('YYYY-MM-DD HH:mm:ss');

                                var activityModel = {
                                    "usercourse": usercourse,
                                    "coursemoduleid": activity.coursemoduleid,
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
                        } else { //The subsection has been previously completed.
                            if (!showResultsPage && activity.activity_identifier == $scope.origin) {
                                showResultsPage = true;
                            }
                        }
                    }
                }            
                
                
                function validateAllFieldsCompleted(){
                    if ($scope.userCourse && $scope.userCourse.activities) {

                        var activitiesCompleted = _.where($scope.userCourse.activities, {status: 1});

                        if (activitiesCompleted && activitiesCompleted.length == $scope.userCourse.activities.length) {

                            var badgeModel = {//create badge.
                                badgeid: 13 //badge earned when a user completes his profile.
                            };

                            var userProfile = JSON.parse(localStorage.getItem("Perfil/"+ currentUser.userId));
                            for(var i = 0; i < userProfile.badges.length; i++){
                                if (userProfile.badges[i].id == badgeModel.badgeid) {
                                    userProfile.badges[i].status = "won";
                                }
                            }
                            
                            localStorage.setItem("Perfil/" + currentUser.userId, JSON.stringify(userProfile));
                            showRobotProfile();
                            moodleFactory.Services.PostBadgeToUser($scope.userId, badgeModel, function () {}, function () {});
                            
                        }
                    }
                }

                function showRobotProfile() {
                    $scope.badgeRobotMessages = {
                        title: $scope.robotContentResources.titulo,
                        message: $scope.robotContentResources.mensaje
                    };
                            
                    _setLocalStorageItem("badgeRobotMessage", JSON.stringify($scope.badgeRobotMessages));
                    $scope.openModal_badgeRobotMessage();                                    
                }
                
                $scope.openModal_badgeRobotMessage = function (size) {
                    var modalInstance = $modal.open({
                        animation: $scope.animationsEnabled,
                        templateUrl: 'badgeRobotMessageModal.html',
                        controller: 'badgeRobotMessageModal',
                        size: size,
                        windowClass: 'closing-stage-modal user-help-modal'
                    });
                };
                
                function phonesAreValid(phones) {

                    var validInfo = true;
                    var i;
                    var itemWithoutPhone = false;

                    if (phones.length > 0) {//There is at least one phone item.

                        for (i = 0; i < phones.length; i++) {
                            //For all items, if phone then something in phoneId too.

                            if (phones[i].phone == "No tengo teléfono") {
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

                    } else {
                        validInfo = false;
                    }
                    //console.log("info from phone: " + validInfo);
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

                    } else {
                        validInfo = false;
                    }
                    //console.log("info from Social Nets: " + validInfo);
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
                    } else {
                        validInfo = false;
                    }
                    //console.log("info from Compartamos: " + validInfo);
                    return validInfo;
                }

                function assignmentMiInformacion() {//Asign 400 points if all fields are full.
                    var result = false;

                    if ($scope.model.firstname && $scope.model.lastname && $scope.model.mothername && $scope.model.gender && $scope.model.address.country
                            && $scope.birthdate_Dateformat && $scope.model.age && $scope.model.maritalStatus && $scope.model.studies.length > 0 && $scope.model.address.city
                                && $scope.model.address.town && $scope.model.address.postalCode && $scope.model.address.street && $scope.model.address.num_ext
                                    && $scope.model.address.colony && phonesAreValid($scope.model.phones) && socialNetsAreValid($scope.model.socialNetworks) 
                                        && compartamosIsValid($scope.model.familiaCompartamos)){
                                            result = true;
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

                    } else { //The user has not entered characters.
                        validInfo = false;
                    }

                    return validInfo;
                }

                function assignmentMiPersonalidad() {
                    var result = false;
                    if ($scope.model.favoriteSports.length > 0 && $scope.model.artisticActivities.length > 0 && $scope.model.hobbies.length > 0
                        && $scope.model.talents.length > 0 && $scope.model.values.length > 0 && $scope.model.habilities.length > 0
                            && charactersIsValid($scope.model.inspirationalCharacters)){
                                                result = true;
                    }
                    return result;                
                }

                function checkMedicalServices() {
                    var validInfo = true;

                    if ($scope.model.medicalCoverage == "Sí") {
                        if ($scope.model.medicalInsurance == "" || $scope.model.medicalInsurance == "No tengo seguro") {
                            validInfo = false;
                        }
                    }

                    if ($scope.model.medicalCoverage == "No") {
                        if ($scope.model.medicalInsurance != "No tengo seguro") {
                            validInfo = false;
                        }
                    }

                    if ($scope.model.medicalCoverage == "" && $scope.model.medicalInsurance != "No tengo seguro") {
                        validInfo = false;
                    }
                    //console.log(validInfo);
                    return validInfo;
                }

                function assignmentSocioeconomicos() {
                    var result = false;
                    if ($scope.model.iLiveWith && $scope.model.mainActivity.length > 0 && $scope.model.level && $scope.model.grade && $scope.model.period
                            && $scope.model.children && $scope.model.gotMoneyIncome && $scope.model.moneyIncome.length > 0 && checkMedicalServices()){
                                result = true;
                    }
                    return result;
                }

                function assignmentTecnologia() {
                    var result = false;
                    if ($scope.model.knownDevices.length > 0 && $scope.model.ownDevices.length > 0 && $scope.model.phoneUsage.length > 0
                        && $scope.model.playVideogames && $scope.model.videogamesFrecuency && $scope.model.videogamesHours
                            && $scope.model.kindOfVideogames.length > 0 && $scope.model.favoriteGames.length > 0){
                                result = true;
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

                    // MODELS for "Socioeconómicos"  --> Some of them should be validated within validateModel()
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

                $scope.addFavoriteSports = function () {
                    $scope.model.favoriteSports.push("");
                };

                $scope.deleteFavoriteSports = function (index) {
                    $scope.model.favoriteSports.splice(index, 1);
                };

                $scope.addArtisticActivities = function () {
                    $scope.model.artisticActivities.push(new String());
                };

                $scope.deleteArtisticActivities = function (index) {
                    $scope.model.artisticActivities.splice(index, 1);
                };

                $scope.addHobbies = function () {
                    $scope.model.hobbies.push(new String());
                };

                $scope.deleteHobbies = function (index) {
                    $scope.model.hobbies.splice(index, 1);
                };

                $scope.addTalents = function () {
                    $scope.model.talents.push(new String());
                };

                $scope.deleteTalents = function (index) {
                    $scope.model.talents.splice(index, 1);
                };

                $scope.addValue = function () {
                    $scope.model.values.push(new String());
                };

                $scope.deleteValue = function (index) {
                    $scope.model.values.splice(index, 1);
                };

                $scope.addHabilitie = function () {
                    $scope.model.habilities.push(new String());
                };

                $scope.deleteHabilitie = function (index) {
                    $scope.model.habilities.splice(index, 1);
                };

                $scope.addInspirationalCharacter = function () {
                    $scope.model.inspirationalCharacters.push({});
                };

                $scope.deleteInspirationalCharacter = function (index) {
                    $scope.model.inspirationalCharacters.splice(index, 1);
                };

                $scope.addMainActivity = function () {
                    $scope.model.mainActivity.push(new String());
                };

                $scope.deleteMainActivity = function (index) {
                    $scope.model.mainActivity.splice(index, 1);
                };

                $scope.addMoneyIncome = function () {
                    $scope.model.moneyIncome.push(new String());
                };

                $scope.deleteMoneyIncome = function (index) {
                    $scope.model.moneyIncome.splice(index, 1);
                };

                $scope.addKnownDevice = function () {
                    $scope.model.knownDevices.push(new String());
                };

                $scope.deleteKnownDevice = function (index) {
                    $scope.model.knownDevices.splice(index, 1);
                };

                $scope.addOwnDevice = function () {
                    $scope.model.ownDevices.push(new String());
                };

                $scope.deleteOwnDevice = function (index) {
                    $scope.model.ownDevices.splice(index, 1);
                };

                $scope.addPhoneUsage = function () {
                    $scope.model.phoneUsage.push(new String());
                };

                $scope.deletePhoneUsage = function (index) {
                    $scope.model.phoneUsage.splice(index, 1);
                };

                $scope.addKindOfVideoGame = function () {
                    $scope.model.kindOfVideogames.push(new String());
                };

                $scope.deleteKindOfVideoGame = function (index) {
                    $scope.model.kindOfVideogames.splice(index, 1);
                };

                $scope.deleteMainActivity = function (index) {
                    $scope.model.mainActivity.splice(index, 1);
                };

                $scope.addMainActivity = function () {
                    $scope.model.mainActivity.push(new String());
                };

                $scope.addFavoriteGame = function () {
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
                        moodleFactory.Services.PostAsyncAvatar(avatarInfo[0], function(){avatarUploaded("Éxito")}, function(){avatarUploaded("Error")});
                    });
                };

                function avatarUploaded(message) {
                    $timeout(function(){ 
                        $location.path('/Perfil/' + $scope.userId);
                        $route.reload();
                    }, 1000);
                }

                function setEmptyAvatar() {
                    $scope.avatarInfo = [{
                        "userid": $scope.model.UserId,
                        "alias": $scope.model.username,
                        "aplicacion": "Mi Avatar",
                        "estrellas": $scope.model.stars,
                        "pathimagen": "",
                        "color_cabello": "",
                        "estilo_cabello": "",
                        "traje_color_principal": "",
                        "traje_color_secundario": "",
                        "rostro": "",
                        "color_de_piel": "",
                        "escudo:": "",
                        "imagen_recortada": ""
                    }];
                }

                $scope.avatar = function () {
                    //the next fields should match the integration document shared with the game app
                    if (!$scope.avatarInfo[0]) {
                        setEmptyAvatar();
                    }
                    var shield = ( $scope.model.shield.toLowerCase().indexOf('matem') > -1 ? 'Matemática' : ( $scope.model.shield.toLowerCase().indexOf('ling') > -1 ? 'Ling��stica' : $scope.model.shield ));
                    var avatarInfoForGameIntegration = {
                        "userId": "" + $scope.model.id,
                        "alias": $scope.model.username,
                        "actividad": "Mi Avatar",
                        "estrellas": "100",
                        "pathImagen": "",
                        "genero": ($scope.model.gender.toLowerCase().indexOf('femenino') >= 0 ? 'Mujer' : 'Hombre'),
                        "rostro": $scope.avatarInfo[0].rostro,
                        "colorPiel": $scope.avatarInfo[0].color_de_piel,
                        "estiloCabello": $scope.avatarInfo[0].estilo_cabello,
                        "colorCabello": $scope.avatarInfo[0].color_cabello,
                        "trajeColorPrincipal": $scope.avatarInfo[0].traje_color_principal,
                        "trajeColorSecundario": $scope.avatarInfo[0].traje_color_secundario,
                        "escudo": shield,
                        "avatarType":"Profile"
                    };

                    try {
                        $scope.$emit('ShowPreloader');
                        cordova.exec(SuccessAvatar, FailureAvatar, "CallToAndroid", "openApp", [JSON.stringify(avatarInfoForGameIntegration)]);
                    } catch (e) {
                        SuccessAvatar({"userId": $scope.userId, "actividad":"Mi Avatar","alias":$scope.model.alias,"genero":"Mujer","rostro":"Preocupado","colorPiel":"E6C8B0","estiloCabello":"Cabello02","colorCabello":"694027","trajeColorPrincipal":"00A0FF","trajeColorSecundario":"006192","imagenRecortada":"app/initializr/media","fechaModificación":"09/05/2015 09:32:04","gustaActividad":"Si","pathImagen":"avatar_196.png"})

                    }
                };

                function SuccessAvatar(data) {
                    //the next fields should match the database in moodle
                    $scope.avatarInfo = [{
                        "userid": data.userId,
                        "aplicacion": data.actividad,
                        "genero": data.genero,
                        "rostro": data.rostro,
                        "color_de_piel": data.colorPiel,
                        "estilo_cabello": data.estiloCabello,
                        "color_cabello": data.colorCabello,
                        "traje_color_principal": data.trajeColorPrincipal,
                        "traje_color_secundario": data.trajeColorSecundario,
                        "imagen_recortada": data.genero,
                        "ultima_modificacion": data["fechaModificación"],
                        "Te_gusto_la_actividad": data.gustaActividad,
                        "pathimagen": data.pathImagen,
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
                        updateUserForumStars("50000", 50, false, function () {
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
                        "createdtime": moment(Date.now()).unix(),
                        "modifiedtime": moment(Date.now()).unix(),
                        "posttype": 1,
                        "fileToUpload": null,
                        "iscountable":0
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
                }

                function getRobotMessageContent() {
                    drupalFactory.Services.GetContent("BadgePerfilRobot",function(data, key){
                        $scope.robotContentResources = data.node;
                        },function(){},false);
                }
                
                function getContent() {
                    drupalFactory.Services.GetContent("7001", function (data, key) {
                        _loadedResources = true;
                        $scope.contentResources = data.node;
                        if (_loadedResources && _pageLoaded) {
                            $scope.$emit('HidePreloader');
                        }
                        getRobotMessageContent();
                        
                    }, function () {
                        _loadedResources = true;
                        if (_loadedResources && _pageLoaded) {
                            $scope.$emit('HidePreloader');
                        }
                        
                    }, false);
                }

                $scope.scrollToTop();


                if ($routeParams.retry){
                    _loadedDrupalResources = true;
                    try {
                        document.addEventListener("deviceready",  function() { cordova.exec(SuccessAvatar, FailureAvatar, "CallToAndroid", "setMiAvatarIntentCallback", [])}, false);
                    }
                    catch (e) {
                        SuccessAvatar(
                            {"userId": $scope.userId, "actividad":"Mi Avatar","alias":$scope.model.alias,"genero":"Mujer","rostro":"Preocupado","colorPiel":"E6C8B0","estiloCabello":"Cabello02","colorCabello":"694027","trajeColorPrincipal":"00A0FF","trajeColorSecundario":"006192","imagenRecortada":"app/initializr/media","fechaModificación":"09/05/2015 09:32:04","gustaActividad":"Si", "pathImagen":"avatar_196.png"}
                        );
                    }
                }

            }
        }]).controller('badgeRobotMessageModal', function ($scope, $modalInstance) {
            $scope.cancel = function () {
                $modalInstance.dismiss('cancel');
            };
            
            var robotMessage = JSON.parse(localStorage.getItem("badgeRobotMessage"));            
            $scope.actualMessage = robotMessage;
    });
