angular
    .module('incluso.stage.chatcontroller', [])
    .controller('stageChatController', [
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
            $scope.setToolbar($location.$$path,"");
            $rootScope.showFooter = false; 
            $rootScope.showFooterRocks = false; 
            $scope.model = JSON.parse(localStorage.getItem("usercourse"));
            $scope.idEtapa = 0;
            $scope.scrollToTop();
            $scope.$emit('HidePreloader'); //hide preloader        
            var index = 0;
            var parentIndex = 4;
            var activity = $scope.model.stages[$scope.idEtapa].challenges[parentIndex].activities[index];

            var cabinaDeSoporte = JSON.parse(localStorage.getItem("startedActivityCabinaDeSoporte"));

             var startedActivityCabinaDeSoporte = ($scope.model.stages[$scope.idEtapa].challenges[parentIndex].activities[index].started || $scope.model.stages[$scope.idEtapa].challenges[parentIndex].activities[index].status) && cabinaDeSoporte;
            // Start activity of 'cabina de soporte'                    
            if (!startedActivityCabinaDeSoporte) {
                var currentUser = JSON.parse(localStorage.getItem("CurrentUser"));
                var data = {
                    userid: currentUser.userId,
                    datestarted: getdate(),
                    moduleid: activity.coursemoduleid,
                    updatetype: 0
                };
                
                $scope.model.stages[$scope.idEtapa].challenges[parentIndex].activities[index].started = 1;
                $scope.model.stages[$scope.idEtapa].challenges[parentIndex].activities[index].datestarted = data.datestarted; 
                localStorage.setItem('startedActivityCabinaDeSoporte', JSON.stringify({$stage: $scope.idEtapa, $index: index, $parentIndex: parentIndex, $data: data}));                    
                localStorage.setItem('usercourse', JSON.stringify($scope.model));

                moodleFactory.Services.PutStartActivity(data, activity, currentUser.token, function (size) {                                            

                    //trigger activity type 1 is sent when the activity starts.
                    var triggerActivity = 1;
                    _createNotification(activity.coursemoduleid, triggerActivity);
                    
                },function(){
                    console.log('Error callback');    
                });
            }
                
            $scope.goChat = function () {                                
            $location.path('/Chat');
            }
        
            
        }]);