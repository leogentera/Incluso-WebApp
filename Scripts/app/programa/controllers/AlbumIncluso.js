angular
    .module('incluso.programa.album', [])
    .controller('AlbumInclusoController', [
        '$q',
        '$scope',
        '$location',
        '$routeParams',
        '$timeout',
        '$rootScope',
        '$http',
        '$modal',
        '$filter',
        function ($q, $scope, $location, $routeParams, $timeout, $rootScope, $http, $modal, $filter) {
            var _loadedResources = false;
            var _pageLoaded = false;

            $scope.setToolbar($location.$$path, "Album Incluso");
            $rootScope.showFooter = false;
            $rootScope.showFooterRocks = false;
            $rootScope.showStage1Footer = false;
            $rootScope.showStage2Footer = false;
            $rootScope.showStage3Footer = false;
            $scope.isShareCollapsed = false;
            $scope.showSharedAlbum = false;
            $scope.sharedAlbumMessage = null;

            var _course = moodleFactory.Services.GetCacheJson("course");
            var _userId = moodleFactory.Services.GetCacheObject("userId");
            var _userProfile = moodleFactory.Services.GetCacheJson("Perfil/" + _userId);
            var currentUser = JSON.parse(moodleFactory.Services.GetCacheObject("CurrentUser"));
            $scope.hasCommunityAccess = _hasCommunityAccessLegacy(_userProfile.communityAccess);
            var albumSrc = null;
            $scope.avatarSrc = null;
            $scope.discussion = null;
            $scope.forumId = null;

            var canvas = document.createElement('canvas');
            var ctx = canvas.getContext("2d");
            canvas.width = 1280;
            canvas.height = 1329;

            $scope.navigateToBadges = function () {
                localStorage.setItem("profile_page", 6);
                $location.path('Perfil/' + _userId);
            };

            $scope.album = {
                'profileimageurl': null,
                'shield': null,
                'myStrengths': [],
                'myLikes': [],
                'myAttributes': [],
                'myIdeas': [],
                'myDreams': [],
                'myPlans': {
                    'oneYear': null,
                    'threeYear': null,
                    'fiveYear': null
                },
                'myGoals': [],
                'iKnowWhatIs': ["Ahorro", "Préstamo", "Inversión"],
                'amountOfCommunityPosts': 0,
                'amountOfForumPosts': 0,
                'badges': [],
                'starsEarned': 0,
                'project': []
            };

            var prevCurrentDiscussionIds;

            $scope.$emit('ShowPreloader');

            drupalFactory.Services.GetContent("Album", function (data, key) {
                $scope.contentResources = data.node;
                _loadedResources = true;
                if (_loadedResources && _pageLoaded) {
                    $scope.$emit('HidePreloader');
                }
            }, function () {
                _loadedResources = true;
                if (_loadedResources && _pageLoaded) {
                    $scope.$emit('HidePreloader');
                }
            }, false);

            function offlineCallback() {
                $timeout(function () {
                    $location.path("/Offline");
                }, 1000);
            }

            $timeout(function () {
                //apply carousel to album layout
                var owlAlbum = $("#owlAlbum");

                owlAlbum.owlCarousel({
                    navigation: false,
                    pagination: false,
                    goToFirstSpeed: 2000,
                    singleItem: true,
                    autoHeight: true,
                    touchDrag: false,
                    mouseDrag: false,
                    transitionStyle: "fade",
                    afterInit: function (el) {
                    }
                });

                $(".next").click(function (ev) {
                    $scope.scrollToTop();
                    owlAlbum.trigger('owl.next');
                    ev.preventDefault();

                });

                $(".back").click(function (ev) {
                    $scope.scrollToTop();
                    owlAlbum.trigger('owl.prev');
                    ev.preventDefault();
                });
            }, 1000);

            $scope.message = "Todos los logros en un solo lugar. <br/> Recuerda lo vivido en esta misi&#243;n y no te olvides de continuar con tus prop&#243;sitos.";

            $scope.postTextToCommunity = function () {

                $scope.validateConnection(function () {

                    $scope.$emit('ShowPreloader');

                    if ($scope.discussion == null || $scope.forumId == null) {

                        moodleFactory.Services.GetAsyncForumDiscussions(_course.community.coursemoduleid, currentUser.token, function (data, key) {

                            var currentDiscussionIds = [];
                            for (var d = 0; d < data.discussions.length; d++) {
                                currentDiscussionIds.push(data.discussions[d].discussion);
                            }

                            //Save previous value of "currentDiscussionIds" object.
                            prevCurrentDiscussionIds = localStorage.getItem("currentDiscussionIds");

                            localStorage.setItem("currentDiscussionIds", JSON.stringify(currentDiscussionIds));
                            $scope.discussion = data.discussions[0];
                            $scope.forumId = data.forumid;
                            generateAlbumImgSrc(postAlbumToCommunity);

                        }, function (obj) {
                            $scope.sharedAlbumMessage = null;
                            $scope.isShareCollapsed = false;
                            $scope.showSharedAlbum = false;
                            
                            $scope.$emit('HidePreloader');
                            if (obj && obj.statusCode && obj.statusCode == 408) {//Request Timeout
                              $timeout(function () {
                                $location.path('/Offline'); //This behavior could change
                              }, 1);
                            } else {//Another kind of Error happened
                              $timeout(function () {
                                 $scope.$emit('HidePreloader');
                                 $location.path('/connectionError');
                                }, 1);
                            }
                            
                        }, true);
                    } else {
                        postAlbumToCommunity();
                    }

                }, offlineCallback);

            };

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

            function getAlt(id) {
                var alt = "";

                switch (id) {
                    case 2:
                        alt = "combustible";
                        break;
                    case 3:
                        alt = "turbina";
                        break;
                    case 4:
                        alt = "ala";
                        break;
                    case 5:
                        alt = "sist-navegacion";
                        break;
                    case 6:
                        alt = "propulsor";
                        break;
                    case 7:
                        alt = "misiles";
                        break;
                    case 8:
                        alt = "campodefuerza";
                        break;
                    case 9:
                        alt = "radar";
                        break;
                    case 10:
                        alt = "tanqueoxigeno";
                        break;
                    case 11:
                        alt = "sondaespacial";
                        break;
                    case 12:
                        alt = "foro";
                        break;
                    case 13:
                        alt = "id";
                        break;
                    case 14:
                        alt = "participacion";
                        break;
                    case 15:
                        alt = "corazon";
                        break;
                    case 16:
                        alt = "casco";
                        break;
                    case 17:
                        alt = "radio";
                        break;
                    case 18:
                        alt = "turbo";
                        break;
                    default:
                        alt = "bloqueada";
                }

                return alt;
            }

            controllerInit();

            function controllerInit() {

                loadProfileDataToAlbum();
                loadPostDataToAlbum();
                loadQuizData();

                _pageLoaded = true;
                if (_loadedResources && _pageLoaded) {
                    $scope.$emit('HidePreloader');
                }
            }

            function loadProfileDataToAlbum() {

                /* My likes */
                var myLikes = _userProfile.hobbies.concat(_userProfile.favoriteSports).concat(_userProfile.artisticActivities);
                var myLikesLength = myLikes.length > 3 ? 3 : myLikes.length;
                var myLikesResult = [];
                var myLikesExcludedIndexes = [];

                for (var i = 0; i < myLikesLength; i++) {

                    var index = getRandomIndex(myLikes.length, myLikesExcludedIndexes);
                    myLikesResult[i] = myLikes[index];

                    myLikesExcludedIndexes.push(index);
                }

                /* My attributes */
                var myAttributes = _userProfile.habilities.concat(_userProfile.talents).concat(_userProfile.values);
                var myAttributesLength = myAttributes.length > 3 ? 3 : myAttributes.length;
                var myAttributesResult = [];
                var myAttributesExcludedIndexes = [];

                for (var i = 0; i < myAttributesLength; i++) {

                    var index = getRandomIndex(myAttributes.length, myAttributesExcludedIndexes);
                    myAttributesResult[i] = myAttributes[index];

                    myAttributesExcludedIndexes.push(index);
                }

                /* Badges */
                var badgesWon = [];
                for (var i = 0; i < _userProfile.badges.length; i++) {

                    if (_userProfile.badges[i].status === "won") {

                        _userProfile.badges[i].filename = getFileName(_userProfile.badges[i].id);
                        _userProfile.badges[i].alt = getAlt(_userProfile.badges[i].id);

                        badgesWon.push(_userProfile.badges[i]);
                    }

                }

                if (currentUser.base64Image) {
                    $scope.album.profileimageurl = currentUser.base64Image;
                }else {
                    //Download profile Images                                
                    var imageProf = [{ 'path': "assets/avatar", 'name': "avatar_" + _getItem("userId") + ".png", 'downloadLink': $scope.album.profileimageurl }];
                    saveLocalImages(imageProf);
                };
                

                $scope.album.shield = _userProfile.shield;
                $scope.album.myStrengths = _userProfile.strengths;
                $scope.album.myLikes = myLikesResult;
                $scope.album.myAttributes = myAttributesResult;
                $scope.album.starsEarned = Number(_userProfile.stars);
                $scope.album.badges = badgesWon;
            }

            function saveLocalImages(images) {
                _forceUpdateConnectionStatus(function() {
                    cordova.exec(function(data) {                        
                        if (data.files[0] && data.files[0].imageB64) {
                            $scope.album.profileimageurl = 'data:image/png;base64,' + data.files[0].imageB64;
                            currentUser.base64Image = 'data:image/png;base64,'  + data.files[0].imageB64;
                            localStorage.setItem("CurrentUser", JSON.stringify(currentUser));
                        };
                      }, function(){}, "CallToAndroid", "downloadPictures", [JSON.stringify(images)]);
                }, function() {});
                
            }
            
            function loadPostDataToAlbum() {
                var postCounter = moodleFactory.Services.GetCacheJson("postcounter/" + _userProfile.course);
                var communityPosts = 0;
                var forumPosts = 0;


                for (var i = 0; i < postCounter.forums.length; i++) {

                    var forum = postCounter.forums[i];

                    if (forum.forumactivityid != "50000") {

                        for (var d = 0; d < forum.discussion.length; d++) {
                            forumPosts += Number(forum.discussion[d].total);
                        }

                    } else {
                        for (var d = 0; d < forum.discussion.length; d++) {
                            communityPosts += Number(forum.discussion[d].total);
                        }
                    }
                }

                $scope.album.amountOfCommunityPosts = communityPosts;
                $scope.album.amountOfForumPosts = forumPosts;
            }

            function loadQuizData() {

                /* My ideas */
                var myIdeaQuiz = moodleFactory.Services.GetCacheJson("activity/" + getActivityQuizModuleId("2009"));
                var myIdeaAnswers = [];
                var myIdeaAnswersResult = [];

                if (myIdeaQuiz && myIdeaQuiz.questions && myIdeaQuiz.questions.length >= 2) {
                    var question = myIdeaQuiz.questions[1];

                    if (question.userAnswer != "") {

                        if (question.userAnswer.indexOf(";") != -1) {
                            myIdeaAnswers = myIdeaAnswers.concat(question.userAnswer.split(";"));
                        } else {
                            myIdeaAnswers.push(question.userAnswer);
                        }
                    }

                    var myIdeaAnswersLength = myIdeaAnswers.length > 3 ? 3 : myIdeaAnswers.length;
                    var myIdeaAnswersExcludedIndexes = [];

                    for (var i = 0; i < myIdeaAnswersLength; i++) {

                        var index = getRandomIndex(myIdeaAnswers.length, myIdeaAnswersExcludedIndexes);
                        myIdeaAnswersResult[i] = myIdeaAnswers[index];

                        myIdeaAnswersExcludedIndexes.push(index);
                    }
                }

                /* My dreams */
                var myDreamsQuiz = moodleFactory.Services.GetCacheJson("activity/" + getActivityQuizModuleId("1007"));
                var myDreamsAnswers = [];
                var myDreamsAnswersResult = [];

                if (myDreamsQuiz && myDreamsQuiz.questions) {
                    for (var i = 0; i < myDreamsQuiz.questions.length; i++) {
                        var question = myDreamsQuiz.questions[i];

                        if (question.userAnswer != "") {

                            if (question.userAnswer.indexOf(";") != -1) {
                                myDreamsAnswers = myDreamsAnswers.concat(question.userAnswer.split(";"));
                            } else {
                                myDreamsAnswers.push(question.userAnswer);
                            }
                        }
                    }

                    var myDreamsAnswersLength = myDreamsAnswers.length > 3 ? 3 : myDreamsAnswers.length;
                    var myDreamsAnswersExcludedIndexes = [];

                    for (var i = 0; i < myDreamsAnswersLength; i++) {

                        var index = getRandomIndex(myDreamsAnswers.length, myDreamsAnswersExcludedIndexes);
                        myDreamsAnswersResult[i] = myDreamsAnswers[index];

                        myDreamsAnswersExcludedIndexes.push(index);
                    }
                }

                /* My plans */
                var myPlansQuiz = moodleFactory.Services.GetCacheJson("activity/" + getActivityQuizModuleId("2025"));
                var myPlansOneYearAnswers = [];
                var myPlansThreeYearsAnswers = [];
                var myPlansFiveYearsAnswers = [];

                if (myPlansQuiz && myPlansQuiz.questions) {
                    var questionOneYear = myPlansQuiz.questions[0];
                    if (questionOneYear && questionOneYear.userAnswer != "") {
                        if (questionOneYear.userAnswer.indexOf(";") != -1) {
                            myPlansOneYearAnswers = myPlansOneYearAnswers.concat(questionOneYear.userAnswer.split(";"));
                        } else {
                            myPlansOneYearAnswers.push(questionOneYear.userAnswer);
                        }
                    }

                    var questionThreeYears = myPlansQuiz.questions[1];
                    if (questionThreeYears && questionThreeYears.userAnswer != "") {
                        if (questionThreeYears.userAnswer.indexOf(";") != -1) {
                            myPlansThreeYearsAnswers = myPlansThreeYearsAnswers.concat(questionThreeYears.userAnswer.split(";"));
                        } else {
                            myPlansThreeYearsAnswers.push(questionThreeYears.userAnswer);
                        }
                    }

                    var questionFiveYears = myPlansQuiz.questions[2];
                    if (questionFiveYears && questionFiveYears.userAnswer != "") {
                        if (questionFiveYears.userAnswer.indexOf(";") != -1) {
                            myPlansFiveYearsAnswers = myPlansFiveYearsAnswers.concat(questionFiveYears.userAnswer.split(";"));
                        } else {
                            myPlansFiveYearsAnswers.push(questionFiveYears.userAnswer);
                        }
                    }
                }

                /* My goals */
                var myGoals1Quiz = moodleFactory.Services.GetCacheJson("activity/" + getActivityQuizModuleId("20171"));
                var myGoals2Quiz = moodleFactory.Services.GetCacheJson("activity/" + getActivityQuizModuleId("20172"));
                var myGoals3Quiz = moodleFactory.Services.GetCacheJson("activity/" + getActivityQuizModuleId("20173"));
                var myGoals4Quiz = moodleFactory.Services.GetCacheJson("activity/" + getActivityQuizModuleId("20174"));
                var myGoals5Quiz = moodleFactory.Services.GetCacheJson("activity/" + getActivityQuizModuleId("20175"));

                var myGoals1QuizAnswers = [];
                var myGoals2QuizAnswers = [];
                var myGoals3QuizAnswers = [];
                var myGoals4QuizAnswers = [];
                var myGoals5QuizAnswers = [];

                var myGoalsQuizAnswers = [];

                var myGoals1Question = myGoals1Quiz && myGoals1Quiz.questions ? myGoals1Quiz.questions[0] : null;
                var myGoals2Question = myGoals2Quiz && myGoals2Quiz.questions ? myGoals2Quiz.questions[0] : null;
                var myGoals3Question = myGoals3Quiz && myGoals3Quiz.questions ? myGoals3Quiz.questions[0] : null;
                var myGoals4Question = myGoals4Quiz && myGoals4Quiz.questions ? myGoals4Quiz.questions[0] : null;
                var myGoals5Question = myGoals5Quiz && myGoals5Quiz.questions ? myGoals5Quiz.questions[0] : null;

                if (myGoals1Question && myGoals1Question.userAnswer != "") {
                    if (myGoals1Question.userAnswer.indexOf(";") != -1) {
                        myGoals1QuizAnswers = myGoals1QuizAnswers.concat(myGoals1Question.userAnswer.split(";"));
                    } else {
                        myGoals1QuizAnswers.push(myGoals1Question.userAnswer);
                    }
                }
                if (myGoals2Question && myGoals2Question.userAnswer != "") {
                    if (myGoals2Question.userAnswer.indexOf(";") != -1) {
                        myGoals2QuizAnswers = myGoals2QuizAnswers.concat(myGoals2Question.userAnswer.split(";"));
                    } else {
                        myGoals2QuizAnswers.push(myGoals2Question.userAnswer);
                    }
                }
                if (myGoals3Question && myGoals3Question.userAnswer != "") {
                    if (myGoals3Question.userAnswer.indexOf(";") != -1) {
                        myGoals3QuizAnswers = myGoals3QuizAnswers.concat(myGoals3Question.userAnswer.split(";"));
                    } else {
                        myGoals3QuizAnswers.push(myGoals3Question.userAnswer);
                    }
                }
                if (myGoals4Question && myGoals4Question.userAnswer != "") {
                    if (myGoals4Question.userAnswer.indexOf(";") != -1) {
                        myGoals4QuizAnswers = myGoals4QuizAnswers.concat(myGoals4Question.userAnswer.split(";"));
                    } else {
                        myGoals4QuizAnswers.push(myGoals4Question.userAnswer);
                    }
                }
                if (myGoals5Question && myGoals5Question.userAnswer != "") {
                    if (myGoals5Question.userAnswer.indexOf(";") != -1) {
                        myGoals5QuizAnswers = myGoals5QuizAnswers.concat(myGoals5Question.userAnswer.split(";"));
                    } else {
                        myGoals5QuizAnswers.push(myGoals5Question.userAnswer);
                    }
                }

                if (myGoals1QuizAnswers.length > 0) {
                    myGoalsQuizAnswers.push(myGoals1QuizAnswers[getRandomIndex(myGoals1QuizAnswers.length, [])]);
                }
                if (myGoals2QuizAnswers.length > 0) {
                    myGoalsQuizAnswers.push(myGoals2QuizAnswers[getRandomIndex(myGoals2QuizAnswers.length, [])]);
                }
                if (myGoals3QuizAnswers.length > 0) {
                    myGoalsQuizAnswers.push(myGoals3QuizAnswers[getRandomIndex(myGoals3QuizAnswers.length, [])]);
                }
                if (myGoals4QuizAnswers.length > 0) {
                    myGoalsQuizAnswers.push(myGoals4QuizAnswers[getRandomIndex(myGoals4QuizAnswers.length, [])]);
                }
                if (myGoals5QuizAnswers.length > 0) {
                    myGoalsQuizAnswers.push(myGoals5QuizAnswers[getRandomIndex(myGoals5QuizAnswers.length, [])]);
                }

                /* My project */
                var myProjectQuiz = moodleFactory.Services.GetCacheJson("activity/" + getActivityQuizModuleId("34021"));
                var myProjectAnswers = [];
                var myProjectQuestion = myProjectQuiz && myProjectQuiz.questions ? myProjectQuiz.questions[0] : null;

                if (myProjectQuestion && myProjectQuestion.userAnswer != "") {
                    if (myProjectQuestion.userAnswer.indexOf(";") != -1) {
                        myProjectAnswers = myProjectAnswers.concat(myProjectQuestion.userAnswer.split(";"));
                    } else {
                        myProjectAnswers.push(myProjectQuestion.userAnswer);
                    }
                }

                $scope.album.myIdeas = myIdeaAnswersResult;
                $scope.album.myDreams = myDreamsAnswersResult;
                $scope.album.myPlans.oneYear = myPlansOneYearAnswers.length > 0 ? myPlansOneYearAnswers[getRandomIndex(myPlansOneYearAnswers.length, [])] : "";
                $scope.album.myPlans.threeYear = myPlansThreeYearsAnswers.length > 0 ? myPlansThreeYearsAnswers[getRandomIndex(myPlansThreeYearsAnswers.length, [])] : "";
                $scope.album.myPlans.fiveYear = myPlansFiveYearsAnswers.length > 0 ? myPlansFiveYearsAnswers[getRandomIndex(myPlansFiveYearsAnswers.length, [])] : "";
                $scope.album.myGoals = myGoalsQuizAnswers;
                $scope.album.project = myProjectAnswers.length > 0 ? [myProjectAnswers[getRandomIndex(myProjectAnswers.length, [])]] : [];
            }

            function getRandomIndex(maxNumber, excludedIndexes) {

                var selectedIndex = null;

                while (selectedIndex == null || excludedIndexes.indexOf(selectedIndex) != -1) {
                    selectedIndex = Math.floor((Math.random() * maxNumber));
                }

                return selectedIndex;
            }

            function successfullCallBack(albumData) {
                _pageLoaded = true;
                if (albumData != null) {
                    _setLocalStorageJsonItem("album", albumData);
                    //get names for badges
                    for (var i = 0; i < albumData.badges.length; i++) {
                        albumData.badges[i].filename = getFileName(albumData.badges[i].id);
                        albumData.badges[i].alt = getAlt(albumData.badges[i].id);
                    }

                    $scope.album = albumData;
                    if (_loadedResources && _pageLoaded) {
                        $scope.$emit('HidePreloader');
                    }
                }
                else {
                    //Albun no reachable
                }
            }

            function generateAlbumImgSrc(callback) {

                if (albumSrc == null) {
                    var imgBackground = new Image(),
                        imgAvatar = new Image();

                    imgBackground.onload = function () {
                        ctx.drawImage(imgBackground, 0, 0, 1280, 1329);
                        ctx.restore();

                        imgAvatar.onload = function () {
                            /* Avatar */
                            ctx.drawImage(imgAvatar, 170, 240, 210, 210);
                            ctx.restore();

                            /* Shield */
                            ctx.font = '14px Play,sans-serif,Arial';
                            ctx.fillStyle = '#FFF';
                            ctx.textAlign = "center";
                            wrapText(ctx, "El escudo que me distingue es:", 270, 515, 200, 15);
                            ctx.restore();

                            ctx.font = '14px Play,sans-serif,Arial';
                            ctx.fillStyle = '#BCD431';
                            ctx.textAlign = "center";
                            var shield = $scope.album.shield;
                            wrapText(ctx, shield.toUpperCase(), 270, 535, 200, 15);
                            ctx.restore();

                            /* Strengths */
                            var strengthsTemp = $scope.album.myStrengths;
                            var strengthsTempYPosition = 670;

                            ctx.font = 'bold 17px Play,sans-serif,Arial';
                            ctx.fillStyle = '#FFF';
                            ctx.textAlign = "center";
                            for (var st = 0; st < strengthsTemp.length; st++) {
                                wrapText(ctx, strengthsTemp[st], 270, strengthsTempYPosition, 200, 15);
                                strengthsTempYPosition += 34;
                            }
                            ctx.restore();

                            /* What I like */
                            var whatILikeTemp = $scope.album.myLikes;
                            var whatILikeTempYPosition = 905;

                            ctx.font = 'bold 17px Play,sans-serif,Arial';
                            ctx.fillStyle = '#FFF';
                            ctx.textAlign = "center";
                            for (var wil = 0; wil < whatILikeTemp.length; wil++) {
                                wrapText(ctx, whatILikeTemp[wil], 270, whatILikeTempYPosition, 200, 15);
                                whatILikeTempYPosition += 34;
                            }
                            ctx.restore();

                            /* Qualities */
                            var qualitiesTemp = $scope.album.myAttributes;
                            var qualitiesYPosition = 1130;

                            ctx.font = 'bold 17px Play,sans-serif,Arial';
                            ctx.fillStyle = '#FFF';
                            ctx.textAlign = "center";
                            for (var qt = 0; qt < qualitiesTemp.length; qt++) {
                                wrapText(ctx, qualitiesTemp[qt], 270, qualitiesYPosition, 200, 15);
                                qualitiesYPosition += 34;
                            }
                            ctx.restore();

                            /* What pushes me */
                            var whatPushesMeTemp = $scope.album.myIdeas;
                            var whatPushesMeYPosition = 260;

                            ctx.font = 'bold 17px Play,sans-serif,Arial';
                            ctx.fillStyle = '#FFF';
                            ctx.textAlign = "center";
                            for (var wpm = 0; wpm < whatPushesMeTemp.length; wpm++) {
                                wrapText(ctx, whatPushesMeTemp[wpm], 650, whatPushesMeYPosition, 200, 15);
                                whatPushesMeYPosition += 34;
                            }
                            ctx.restore();

                            /* My Dreams */
                            var myDreamsMeTemp = $scope.album.myDreams;
                            var myDreamsYPosition = 457;

                            ctx.font = 'bold 17px Play,sans-serif,Arial';
                            ctx.fillStyle = '#FFF';
                            ctx.textAlign = "center";
                            for (var my = 0; my < myDreamsMeTemp.length; my++) {
                                wrapText(ctx, myDreamsMeTemp[my], 650, myDreamsYPosition, 200, 15);
                                myDreamsYPosition += 34;
                            }
                            ctx.restore();

                            /* My Plans */
                            var myPlansTemp = $scope.album.myPlans;
                            var myPlansProps = ["oneYear", "threeYear", "fiveYear"];
                            var myPlansYears = ["1 año.", "2 años.", "5 años."];
                            var myPlansYPosition = 670;


                            ctx.font = 'bold 17px Play,sans-serif,Arial';
                            ctx.textAlign = "center";
                            for (var mp = 0; mp < myPlansYears.length; mp++) {
                                ctx.fillStyle = '#08B290';
                                wrapText(ctx, myPlansYears[mp], 550, myPlansYPosition, 200, 15);
                                ctx.fillStyle = '#FFF';
                                wrapText(ctx, myPlansTemp[myPlansProps[mp]], 670, myPlansYPosition, 200, 15);
                                myPlansYPosition += 34;
                            }
                            ctx.restore();

                            /* My Goals */
                            var myGoalsTemp = $scope.album.myGoals;
                            var myGoalsYPosition = 867;

                            ctx.font = 'bold 17px Play,sans-serif,Arial';
                            ctx.fillStyle = '#FFF';
                            ctx.textAlign = "center";
                            for (var mg = 0; mg < myGoalsTemp.length; mg++) {
                                wrapText(ctx, myGoalsTemp[mg], 650, myGoalsYPosition, 270, 15);
                                myGoalsYPosition += 34;
                            }
                            ctx.restore();

                            /* Now I Know */
                            var nowIKnowTemp = $scope.album.iKnowWhatIs;
                            var nowIKnowYPosition = 1135;

                            ctx.font = 'bold 17px Play,sans-serif,Arial';
                            ctx.fillStyle = '#FFF';
                            ctx.textAlign = "center";
                            for (var nik = 0; nik < nowIKnowTemp.length; nik++) {
                                wrapText(ctx, nowIKnowTemp[nik], 650, nowIKnowYPosition, 200, 15);
                                nowIKnowYPosition += 34;
                            }
                            ctx.restore();

                            /* One of my projects */
                            ctx.font = '14px Play,sans-serif,Arial';
                            ctx.fillStyle = '#FFF';
                            ctx.textAlign = "center";
                            wrapText(ctx, $scope.album.project != null && $scope.album.project.length > 0 ? $scope.album.project[0] : "", 1020, 280, 240, 15);
                            ctx.restore();

                            /* My participation */
                            ctx.font = 'bold 14px Play,sans-serif,Arial';
                            ctx.fillStyle = '#FFF';
                            ctx.textAlign = "center";

                            ctx.fillStyle = '#8098A0';
                            wrapText(ctx, "Comunidad.", 970, 455, 240, 15);

                            ctx.fillStyle = '#FFF';
                            ctx.textAlign = "right";
                            wrapText(ctx, $scope.album.amountOfCommunityPosts + " entradas", 1095, 455, 240, 15);

                            ctx.fillStyle = '#8098A0';
                            ctx.textAlign = "center";
                            wrapText(ctx, "Foros.", 970, 490, 240, 15);

                            ctx.fillStyle = '#FFF';
                            ctx.textAlign = "right";
                            wrapText(ctx, $scope.album.amountOfForumPosts + " entradas", 1075, 490, 240, 15);

                            ctx.fillStyle = '#8098A0';
                            ctx.textAlign = "center";
                            wrapText(ctx, "Estrellas Ganadas", 1020, 540, 240, 15);

                            ctx.font = 'bold 23px Play,sans-serif,Arial';
                            ctx.fillStyle = '#BCD431';
                            var numberOfStars = $scope.album.starsEarned.toString();
                            wrapText(ctx, numberOfStars.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"), 1015, 583, 210, 15);

                            ctx.font = 'bold 14px Play,sans-serif,Arial';
                            ctx.fillStyle = '#8098A0';
                            wrapText(ctx, "Insignias Obtenidas", 1020, 620, 240, 15);
                            ctx.restore();

                            printBadge(1, 1, 1, callback);
                        };

                        getImageOrDefault("assets/avatar/avatar_" + _getItem("userId") + ".png", _userProfile.profileimageurl, function (niceImageUrl) {
                            imgAvatar.src = niceImageUrl;
                        });
                    };

                    imgBackground.src = "assets/images/bg-share-album.jpg";


                } else {
                    callback();
                }
            }

            //Time Out Message modal
            $scope.openModal = function (size) {
                var modalInstance = $modal.open({
                    animation: $scope.animationsEnabled,
                    templateUrl: 'timeOutModal.html',
                    controller: 'timeOutAlbumIncluso',
                    size: size,
                    windowClass: 'user-help-modal dashboard-programa'
                });
            };

            function postAlbumToCommunity() {

                var requestData = {
                    "userid": _userId,
                    "discussionid": $scope.discussion.discussion,
                    "parentid": $scope.discussion.id,
                    "message": $scope.sharedAlbumMessage,
                    "createdtime": moment(Date.now()).unix(),
                    "modifiedtime": moment(Date.now()).unix(),
                    "posttype": 4,
                    "filecontent": albumSrc.replace("data:image/png;base64", ""),
                    "filename": 'album.png',
                    "picture_post_author": _userProfile.profileimageurlsmall,
                    "iscountable": 1
                };

                moodleFactory.Services.PostAsyncForumPost('new_post', requestData,
                    function () {//Success
                        $scope.sharedAlbumMessage = null;
                        $scope.isShareCollapsed = false;
                        $scope.showSharedAlbum = true;
                        $scope.$emit('HidePreloader');
                    },
                    function (obj) {//Error
                        $scope.sharedAlbumMessage = null;
                        $scope.isShareCollapsed = false;
                        $scope.showSharedAlbum = false;
                        $scope.$emit('HidePreloader');

                        if (obj.statusCode == 408) {//Request Timeout
                            $scope.openModal();
                        }

                        //Revert previous request action.
                        if (prevCurrentDiscussionIds === null) {
                            localStorage.removeItem("currentDiscussionIds");
                        } else {
                            localStorage.setItem("currentDiscussionIds", prevCurrentDiscussionIds);
                        }
                    }, null, true
                );
            }

            $scope.shareAlbumClick = function () {

                $timeout(function () {
                    $scope.validateConnection(function () {

                        $scope.$apply(function () {
                            $scope.isShareCollapsed = !$scope.isShareCollapsed;
                            $scope.showSharedAlbum = false;
                        });

                    }, offlineCallback);
                }, 500);

            };

            function printBadge(position, column, row, callback) {
                var myBadges = $scope.album.badges;

                if (myBadges.length >= position) {

                    var imgBadge = new Image();
                    imgBadge.onload = function () {

                        var positionX = 0;
                        var positionY = 560 + (80 * row) + (10 * row);

                        switch (column) {
                            case 1:
                                positionX = 885;
                                break;
                            case 2:
                                positionX = 980;
                                break;
                            case 3:
                                positionX = 1075;
                                break;
                        }

                        ctx.drawImage(imgBadge, positionX, positionY, 80, 80);

                        if (myBadges.length == position) {
                            albumSrc = canvas.toDataURL("image/png");
                            callback();
                        } else {

                            var newColumn = 1;
                            switch (column) {
                                case 1:
                                    newColumn = 2;
                                    break;
                                case 2:
                                    newColumn = 3;
                                    break;
                                case 3:
                                    newColumn = 1;
                                    row += 1;
                                    break;
                            }

                            printBadge(position + 1, newColumn, row, callback);
                        }
                    };

                    imgBadge.src = "assets/images/badges/" + getFileName(myBadges[position - 1].id);
                }
            }

            function wrapText(context, text, x, y, maxWidth, lineHeight) {
                var words = text.split(' ');
                var line = '';

                for (var n = 0; n < words.length; n++) {
                    var testLine = line + words[n] + ' ';
                    var metrics = context.measureText(testLine);
                    var testWidth = metrics.width;
                    if (testWidth > maxWidth && n > 0) {
                        context.fillText(line, x, y);
                        line = words[n] + ' ';
                        y += lineHeight;
                    }
                    else {
                        line = testLine;
                    }
                }
                context.fillText(line, x, y);
            }
        }]).controller('timeOutAlbumIncluso', [ '$scope', '$modalInstance',function ($scope, $modalInstance) {//TimeOut Robot

    $scope.ToDashboard = function () {
        $scope.$emit('HidePreloader');
        $modalInstance.dismiss('cancel');
    };

}]);