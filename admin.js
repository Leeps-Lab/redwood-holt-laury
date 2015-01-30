Redwood.controller("HLAdminController", ["Admin", "$scope", function(ra, $scope) {
    $scope.selectedPeriod = null;
    $scope.decisionIndices = [];

    ra.recv("payout_select_period", function(period) {
        $scope.selectedPeriod = period;
        $scope.decisionIndices = [];
        var rowOrder = ra.get_config(period, 0).rowOrder;
        var indexCount = rowOrder ? rowOrder.length : 10;
        for (var i = 1; i <= indexCount; ++i) {
            $scope.decisionIndices.push(i);
        }
    })
}]);