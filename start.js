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
      [{chance: 0.1, payoff: 3.85}, {chance: 0.9, payoff: 0.10}]
    ],
    [
      [{chance: 0.2, payoff: 2.00}, {chance: 0.8, payoff: 1.60}],
      [{chance: 0.2, payoff: 3.85}, {chance: 0.8, payoff: 0.10}]
    ],
    [
      [{chance: 0.3, payoff: 2.00}, {chance: 0.7, payoff: 1.60}],
      [{chance: 0.3, payoff: 3.85}, {chance: 0.7, payoff: 0.10}]
    ],
    [
      [{chance: 0.4, payoff: 2.00}, {chance: 0.6, payoff: 1.60}],
      [{chance: 0.4, payoff: 3.85}, {chance: 0.6, payoff: 0.10}]
    ],
    [
      [{chance: 0.5, payoff: 2.00}, {chance: 0.5, payoff: 1.60}],
      [{chance: 0.5, payoff: 3.85}, {chance: 0.5, payoff: 0.10}]
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
      [{chance: 0.8, payoff: 3.85}, {chance: 0.2, payoff: 0.10}]
    ],
    [
      [{chance: 0.9, payoff: 2.00}, {chance: 0.1, payoff: 1.60}],
      [{chance: 0.9, payoff: 3.85}, {chance: 0.1, payoff: 0.10}]
    ],
    [
      [{chance: 1.0, payoff: 2.00}, {chance: 0.0, payoff: 1.60}],
      [{chance: 1.0, payoff: 3.85}, {chance: 0.0, payoff: 0.10}]
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
      "decisions": comprehensiveDecisions
    });
    
    $scope.periodOver = true;
    rs.next_period();
  };

  $scope.selectOption = function(decisionId, selection) {
    rs.trigger("hl.selected_option", {
      "treatment": $scope.config.treatment,
      "question": decisionId+1,
      "selection": selection 
    });
  };

  $scope.recomputeUnansweredQuestions = function() {
    var answerCount = $scope.subjectDecisions.reduce(function(prev, curr, index, array) {
      return prev + (typeof curr !== "undefined" ? 1 : 0);
    }, 0);

    $scope.unansweredQuestions = $scope.maxQuestions - answerCount;
  };

  $scope.$watch("maxQuestions", $scope.recomputeUnansweredQuestions);

  rs.on("hl.selected_option", function(value) {
    // seems redundant, but necessary for restoring when the page is refreshed
    $scope.subjectDecisions[value.question-1] = value.selection;
    $scope.recomputeUnansweredQuestions();
  });
  
  rs.on_load(function() { //called once the page has loaded for a new sub period
    $scope.user_id = rs.user_id;
    $scope.config = configManager.loadPerSubject(rs, {
      "treatment": "text",
      "rowOrder": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      "showProbability": true,
      "showPayoff": true,
      "keyColor1": "#2382D7",
      "tintColor1": "#4594DB",
      "keyColor2": "#0659A3",
      "tintColor2": "#0B75D4",
      "lotteries": null
    });

    // generate array of decisions specified by rowOrder
    $scope.decisions = $scope.config.rowOrder.map(function(row) {
      var index = row - 1;
      return $scope.defaultDecisions[index];
    });

    $scope.maxQuestions = $scope.decisions.length;

    $scope.redwoodLoaded = true;
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
