angular
    .module('incluso.stage.dashboardcontroller', [])
    .controller('stageDashboardController', [
        '$q',
        '$scope',
        '$location',
        '$routeParams',
        '$timeout',
        '$rootScope',
        '$http',
        '$anchorScroll',
        '$modal',
        function ($q, $scope, $location, $routeParams, $timeout, $rootScope, $http, $anchorScroll, $modal) {

            $rootScope.pageName = "Estación: Conócete"
            $rootScope.navbarBlue = true;
            $rootScope.showToolbar = true;
            $rootScope.showFooter = true; 
            $rootScope.showFooterRocks = false; 
             
            $scope.scrollToTop();
            $scope.$emit('HidePreloader'); //hide preloader

            getDataAsyncCallback();
            showMessageNotification();
           
            function getDataAsyncCallback(){
                $scope.usercourse = JSON.parse(localStorage.getItem("usercourse"));            
            }
                                            
            function showMessageNotification(){
                var currentStage = 1; 
                for(var i = 0; i < $scope.usercourse.stages.length; i++){
                    var uc = $scope.usercourse.stages[i];
                    
                    localStorage.setItem("stage", JSON.stringify(uc));
                    $scope.stage = uc;
                    var firstTimeStage = localStorage.getItem("firstTimeStage");                    
                    if (firstTimeStage == 0) {
                        $scope.stage.firstTime = 0;
                    }                        
                    
                    if(uc.stageStatus === 0){
                        break;
                    }

                    currentStage++;
                }
                
                var totalActivitiesInCurrentStageCompleted = _.where($scope.usercourse.stages[currentStage].challenges.activities, {status:''}).length;
                
                //pending add flag shownMessageRobot
                if (totalActivitiesInCurrentStageCompleted /*and message not shown before*/) {
                    $scope.openCloseActivityModal();
                }
            }
            
             $scope.back = function () {
                $location.path('/ProgramaDashboard');
            }
            
             $scope.openCloseActivityModal = function (size) {
                setTimeout(function(){
                    var modalInstance = $modal.open({
                        animation: $scope.animationsEnabled,
                        templateUrl: 'tutorialModal.html',
                        controller: 'tutorialController',
                        size: size,
                        windowClass: 'user-help-modal'
                    });
                    console.log("modal open");
                }, 1000);
            };

        }]).controller('tutorialController', function ($scope, $modalInstance) {
            $scope.cancel = function () {
                $modalInstance.dismiss('cancel');
            };
        });
