/*
  Holt-Laury Experiment Start Page Controller
*/

Redwood.controller("HoltLauryController", [
  "$rootScope",
  "$scope",
  "RedwoodSubject",
  "ConfigManager",
  "$q",
  "$http",
  function($rootScope, $scope, rs, configManager, $q, $http) {

  $scope.defaultDecisions = [
    [
      [{chance: 0.1, payoff: 2.00}, {chance: 0.9, payoff: 1.60}],
      [{chance: 0.1, payoff: 5.50}, {chance: 0.9, payoff: 0.10}]
    ],
    [
      [{chance: 0.2, payoff: 2.00}, {chance: 0.8, payoff: 1.60}],
      [{chance: 0.2, payoff: 4.85}, {chance: 0.8, payoff: 0.10}]
    ],
    [
      [{chance: 0.3, payoff: 2.00}, {chance: 0.7, payoff: 1.60}],
      [{chance: 0.3, payoff: 2.85}, {chance: 0.7, payoff: 0.10}]
    ],
    [
      [{chance: 0.4, payoff: 2.00}, {chance: 0.6, payoff: 1.60}],
      [{chance: 0.4, payoff: 1.85}, {chance: 0.6, payoff: 0.10}]
    ],
    [
      [{chance: 0.5, payoff: 2.00}, {chance: 0.5, payoff: 1.60}],
      [{chance: 0.5, payoff: 2.85}, {chance: 0.5, payoff: 0.10}]
    ],
    [
      [{chance: 0.6, payoff: 2.00}, {chance: 0.4, payoff: 1.60}],
      [{chance: 0.6, payoff: 3.85}, {chance: 0.4, payoff: 0.10}]
    ],
    [
      [{chance: 0.7, payoff: 2.00}, {chance: 0.3, payoff: 1.60}],
      [{chance: 0.7, payoff: 3.85}, {chance: 0.3, payoff: 0.10}]
    ],
    [
      [{chance: 0.8, payoff: 2.00}, {chance: 0.2, payoff: 1.60}],
      [{chance: 0.8, payoff: 14.00}, {chance: 0.2, payoff: 0.10}]
    ],
    [
      [{chance: 0.9, payoff: 2.00}, {chance: 0.1, payoff: 1.60}],
      [{chance: 0.9, payoff: 6.00}, {chance: 0.1, payoff: 0.10}]
    ],
    [
      [{chance: 1.0, payoff: 2.00}, {chance: 0.0, payoff: 1.60}],
      [{chance: 1.0, payoff: 4.00}, {chance: 0.0, payoff: 0.10}]
    ]
  ];

  // bound to the users radio button selections
  $scope.subjectDecisions = [];
  $scope.maxQuestions = 10;
  $scope.unansweredQuestions = $scope.maxQuestions;
  $scope.periodOver = false;
  $scope.redwoodLoaded = false;

  $scope.finishPeriod = function() {
    // save data for payouts
    var comprehensiveDecisions = $scope.subjectDecisions.map(function(decision, index) {
      return {
        "decision": decision,
        "choices": [ $scope.decisions[index][0], $scope.decisions[index][1] ]
      }
    });

    rs.set("hl.results", {
      "period": rs.period,
      "view": $scope.config.treatment,
      "subject": parseInt(rs.user_id),
      "decisions": comprehensiveDecisions // EH - the scope for this 'decision' is just rs - not the same decisions as used elsewhere
    });

    $scope.periodOver = true;
    rs.next_period();
  };

  $scope.recomputeUnansweredQuestions = function() {
    var answerCount = $scope.subjectDecisions.reduce(function(prev, curr, index, array) {
      return prev + (typeof curr !== "undefined" ? 1 : 0);
    }, 0);

    $scope.unansweredQuestions = $scope.maxQuestions - answerCount;
  };

  //$scope.$watch("maxQuestions", $scope.recomputeUnansweredQuestions);

  // Called when one of the radio buttons is selected
  $scope.selectOption = function(decisionId, selection) {
    $scope.subjectDecisions[decisionId] = selection;
    $scope.recomputeUnansweredQuestions();
  };
  $scope.recomputeUnansweredQuestions();

  rs.on_load(function() { //called once the page has loaded for a new sub period
    $scope.config = configManager.loadPerSubject(rs, {
      "treatment": "text",
      "rowOrder": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      "showProbability": true,
      "showPayoff": true,
      "keyColor1": "#2382D7",
      "tintColor1": "#4594DB",
      "keyColor2": "#0659A3",
      "tintColor2": "#0B75D4",
      "lotteryFile": null
    });

    var findScale = function(decisions) {
      //Find maximum possible payoff value
      var maxPayoff = 0;
      for (var i = 0; i < $scope.decisions.length; i++) {
        for (var j = 0; j < $scope.decisions[i].length; j++) {
          for (var k = 0; k < $scope.decisions[i][j].length; k++) {
            if ($scope.decisions[i][j][k].payoff > maxPayoff)
              maxPayoff = $scope.decisions[i][j][k].payoff;
          }
        }
      }
      //Set the height scale based off of the current max payoff
      var heightScale = 14; //default - if maxPayoff <= 4
      if (maxPayoff > 4) {
        if (maxPayoff < 7)
          heightScale = 8;
        else if (maxPayoff < 12)
          heightScale = 5;
        else // this scale is fine for payoff vaues up to $15
          heightScale = 4;
      }
      return heightScale;
    }

    var buildDecisionArray = function(allDecisions) {
      // generate array of decisions specified by rowOrder
      $scope.decisions = $scope.config.rowOrder.map(function(row) {
        var index = row - 1;
        return allDecisions[index];
      });

      $scope.maxQuestions = $scope.decisions.length;
      $scope.redwoodLoaded = true;
      $scope.heightScale = findScale($scope.decisions);
    }

    if ($scope.config.lotteryFile) {
      $http.get($scope.config.lotteryFile).then(function(response) {
        buildDecisionArray(response.data);
      });
    }
    else {
      buildDecisionArray($scope.defaultDecisions);
    }
  });
}]);

// Filter to convert numbers to fractional strings
Redwood.filter("fraction", function() {
  return function(input, base) {
    input = input || 0;
    base = base || 1;
    return (input * base).toString() + "/" + base;
  }
})
