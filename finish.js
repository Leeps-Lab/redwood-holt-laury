Redwood.controller("HLFinishController", ["$scope", "RedwoodSubject", function($scope, rs) {
  
    $scope.results = []
    $scope.selectedPeriod = null;
    $scope.selectedResult = null;
    $scope.randomNumber = null;

    $scope.payoutFunction = function(entry) {
        if (entry.selected && entry.decision) {
            var subjectChoice = entry.decision.decision;
            var lottery = entry.decision.choices[subjectChoice];

            // perform the random lottery
            var index = $scope.randomNumber < lottery[0].chance ? 0 : 1;

            var payout = lottery[index].payoff;
            return payout;
        } else {
            return 0;
        }
    }

    rs.on_load(function() {
        var results = rs.subject[rs.user_id].data["hl.results"];
        
        if (!results) {
            return;
        }

        $scope.results = [];
        for (var i = 0; i < results.length; i++) {
            var result = results[i];
            result.selected = false;
            result.decision = null;
            result.decisionText = null;
            $scope.results.push(result);
        }

        rs.send("__set_show_up_fee__", {show_up_fee: 7.0});
        rs.send("__set_conversion_rate__", {conversion_rate: 1/140});
    });

    rs.on("hl.payout_random_number", function(number) {
        $scope.randomNumber = number;
    })

    rs.on("payout_select_period", function(period) {
        var result = $scope.results.filter(function(result) {
            return result.period === period;
        })[0];
        if (result) {
            result.selected = !result.selected;
            $scope.selectedPeriod = period;
            $scope.selectedResult = result;
        }
    });

    rs.on("hl.payout_select_decision", function(decisionID) {
        var index = decisionID - 1;
        var decision = $scope.selectedResult.decisions[index];
        var subjectChoice = decision.decision;
        var lottery = decision.choices[subjectChoice];

        $scope.selectedResult.decision = decision;
        $scope.selectedResult.decisionText = lottery[0].chance + " chance of $" + lottery[0].payoff.toFixed(2)
                                  + " or " + lottery[1].chance + " chance of $" + lottery[1].payoff.toFixed(2);

        rs.send("__set_points__", {
            period: $scope.selectedPeriod,
            points: $scope.payoutFunction($scope.selectedResult)
        });
        rs.send("__mark_paid__", {
            period: $scope.selectedPeriod,
            paid: $scope.payoutFunction($scope.selectedResult)
        })
    });
}]);
