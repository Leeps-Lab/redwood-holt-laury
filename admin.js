Redwood.controller("HLAdminController", ["Admin", "$scope", function(ra, $scope) {
    $scope.selectedPeriod = null;
    $scope.decisionIndices = [];

    ra.recv("payout_select_period", function(period) {
        $scope.selectedPeriod = period;
        $scope.decisionIndices = [];
        for (var i = 1; i <= ra.get_config(1, 0).rowOrder.length; ++i) {
            $scope.decisionIndices.push(i);
        }
    })
}]);