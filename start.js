/*
  Holt-Laury Experiment Start Page Controller
*/

Redwood.controller("HoltLauryController", [
  "$rootScope",
  "$scope",
  "RedwoodSubject",
  "ConfigManager", 
  function($rootScope, $scope, rs, configManager) {

  $scope.allDecisions = [
    {
      text: "1/10 of $2.00, 9/10 of $1.60 or 1/10 of $3.85, 9/10 of $0.10?",
      choice1: [{chance: 0.1, payoff: 2.00}, {chance: 0.9, payoff: 1.60}],
      choice2: [{chance: 0.1, payoff: 3.85}, {chance: 0.9, payoff: 0.10}]
    },
    {
      text: "2/10 of $2.00, 8/10 of $1.60 or 2/10 of $3.85, 8/10 of $0.10?",
      choice1: [{chance: 0.2, payoff: 2.00}, {chance: 0.8, payoff: 1.60}],
      choice2: [{chance: 0.2, payoff: 3.85}, {chance: 0.8, payoff: 0.10}]
    },
    {
      text: "3/10 of $2.00, 7/10 of $1.60 or 3/10 of $3.85, 7/10 of $0.10?",
      choice1: [{chance: 0.3, payoff: 2.00}, {chance: 0.7, payoff: 1.60}],
      choice2: [{chance: 0.3, payoff: 3.85}, {chance: 0.7, payoff: 0.10}]
    },
    {
      text: "4/10 of $2.00, 6/10 of $1.60 or 4/10 of $3.85, 6/10 of $0.10?",
      choice1: [{chance: 0.4, payoff: 2.00}, {chance: 0.6, payoff: 1.60}],
      choice2: [{chance: 0.4, payoff: 3.85}, {chance: 0.6, payoff: 0.10}]
    },
    {
      text: "5/10 of $2.00, 5/10 of $1.60 or 5/10 of $3.85, 5/10 of $0.10?",
      choice1: [{chance: 0.5, payoff: 2.00}, {chance: 0.5, payoff: 1.60}],
      choice2: [{chance: 0.5, payoff: 3.85}, {chance: 0.5, payoff: 0.10}]
    },
    {
      text: "6/10 of $2.00, 4/10 of $1.60 or 6/10 of $3.85, 4/10 of $0.10?",
      choice1: [{chance: 0.6, payoff: 2.00}, {chance: 0.4, payoff: 1.60}],
      choice2: [{chance: 0.6, payoff: 3.85}, {chance: 0.4, payoff: 0.10}]
    },
    {
      text: "7/10 of $2.00, 3/10 of $1.60 or 7/10 of $3.85, 3/10 of $0.10?",
      choice1: [{chance: 0.7, payoff: 2.00}, {chance: 0.3, payoff: 1.60}],
      choice2: [{chance: 0.7, payoff: 3.85}, {chance: 0.3, payoff: 0.10}]
    },
    {
      text: "8/10 of $2.00, 2/10 of $1.60 or 8/10 of $3.85, 2/10 of $0.10?",
      choice1: [{chance: 0.8, payoff: 2.00}, {chance: 0.2, payoff: 1.60}],
      choice2: [{chance: 0.8, payoff: 3.85}, {chance: 0.2, payoff: 0.10}]
    },
    {
      text: "9/10 of $2.00, 1/10 of $1.60 or 9/10 of $3.85, 1/10 of $0.10",
      choice1: [{chance: 0.9, payoff: 2.00}, {chance: 0.1, payoff: 1.60}],
      choice2: [{chance: 0.9, payoff: 3.85}, {chance: 0.1, payoff: 0.10}]
    },
    {
      text: "10/10 of $2.00, 0/10 of $1.60 or 10/10 of $3.85, 0/10 of $0.10",
      choice1: [{chance: 1.0, payoff: 2.00}, {chance: 0.0, payoff: 1.60}],
      choice2: [{chance: 1.0, payoff: 3.85}, {chance: 0.0, payoff: 0.10}]
    }
  ];

  $scope.riskAversionText = [
    "highly risk loving",
    "highly risk loving",
    "very risk loving",
    "risk loving",
    "risk neutral",
    "slightly risk averse",
    "risk averse",
    "very risk averse",
    "highly risk averse",
    "stay in bed",
    "stay in bed"
  ];
  
  // bound to the users radio button selections
  $scope.subjectDecisions = [];
  $scope.maxQuestions = 10;
  $scope.unansweredQuestions = $scope.maxQuestions;
  $scope.periodOver = false;
  $scope.redwoodLoaded = false;

  $scope.finishPeriod = function() {
    var score = $scope.subjectDecisions.reduce(function(prev, curr, index, array) {
      return prev + (curr === "lessRisk" ? 1 : 0);
    }, 0);

    rs.trigger("hl.finished_questions", {
      "view": $scope.config.treatment,
      "result": score,
      "result-text": $scope.riskAversionText[score]
    });

    // save data for payouts
    var comprehensiveDecisions = $scope.subjectDecisions.map(function(decision, index) {
      return {
        "decision": decision,
        "choices": [ $scope.decisions[index].choice1, $scope.decisions[index].choice2 ]
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
      "question-text": $scope.decisions[decisionId].text,
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
      "tintColor2": "#0B75D4"
    });

    // generate array of decisions specified by rowOrder
    $scope.decisions = $scope.config.rowOrder.map(function(row) {
      var index = row - 1;
      return $scope.allDecisions[index];
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

// Rendering
Redwood.directive("choiceView", ["RedwoodSubject", "$filter", function(rs, $filter) {
  return {
    scope: {
      choice: "=",
      treatment: "=",
      showProbability: "=?",
      showPayoff: "=?",
      primaryColor1: "=",
      secondaryColor1: "=",
      primaryColor2: "=",
      secondaryColor2: "="
    },
    templateUrl: "/static/experiments/redwood-holt-laury/choiceView.html",
    link: function postLink($scope, $element, attrs) {

      $scope.viewWidth = 410;
      $scope.viewHeight = 80;

      var prepareFunctions = {
        "text": function($scope, choice) {
          $scope.dollar0 = choice[0].payoff;
          $scope.dollar1 = choice[1].payoff;
        },
        "bar": function($scope, choice) {
          $scope.width0 = choice[0].chance * $scope.viewWidth;
          $scope.width1 = choice[1].chance * $scope.viewWidth;
          $scope.textPosition1 = Math.max($scope.width0 / 2, 50);
          $scope.textPosition2 = $scope.width0 + $scope.width1 / 2;
        },
        "bar-height": function($scope, choice) {
          $scope.width0 = choice[0].chance * $scope.viewWidth;
          $scope.width1 = choice[1].chance * $scope.viewWidth;
          $scope.maxHeight = $scope.viewHeight/2;
          $scope.height0 = choice[0].payoff/4.0 * $scope.maxHeight;
          $scope.height1 = choice[1].payoff/4.0 * $scope.maxHeight;
          $scope.textPosition1 = Math.max($scope.width0 / 2, 50);
          $scope.textPosition2 = $scope.width0 + $scope.width1 / 2;

          $scope.payoffText0Position = [
            -20,
            $scope.maxHeight - $scope.height0
          ];

          $scope.probText0Position = [
              $scope.width0 / 2,
              $scope.maxHeight + 20
          ];

          $scope.payoffText1Position = [
            $scope.viewWidth + 20,
            $scope.maxHeight - $scope.height1
          ];

          $scope.probText1Position = [
              $scope.width0 + $scope.width1 / 2,
              $scope.maxHeight + 20
          ];
        },
        "bar-inverted": function($scope, choice) {
          $scope.width0 = choice[0].chance * $scope.viewWidth;
          $scope.width1 = choice[1].chance * $scope.viewWidth;
          $scope.textX0 = $scope.width0 < 150 ? $scope.width0 + 10 : $scope.width0 - 10;
          $scope.textX1 = $scope.width1 < 150 ? $scope.width1 + 10 : $scope.width1 - 10;
          $scope.textAnchor0 = $scope.width0 < 150 ? "start" : "end";
          $scope.textAnchor1 = $scope.width1 < 150 ? "start" : "end";
        },
        "pie": function($scope, choice) {},
        "pie-height": function($scope, choice) {}
      }

      var drawLegend = function(context, colors, choice) {
        context.fillStyle = colors[0];
        context.fillRect(120, 10, 20, 20);

        context.fillStyle = colors[1];
        context.fillRect(120, 50, 20, 20);

        context.fillStyle = "#000000";
        context.font = "14px sans-serif";
        context.textBaseline = "middle";

        var choiceText0 = "";
        var choiceText1 = "";

        if ($scope.showProbability) {
          choiceText0 += $filter("fraction")(choice[0].chance, 10);
          choiceText1 += $filter("fraction")(choice[1].chance, 10);
        }

        if ($scope.showProbability && $scope.showPayoff) {
          choiceText0 += " of ";
          choiceText1 += " of ";
        }

        if ($scope.showPayoff) {
          choiceText0 += "$"+choice[0].payoff.toFixed(2);
          choiceText1 += "$"+choice[1].payoff.toFixed(2);
        }

        context.fillText(choiceText0, 150, 20);
        context.fillText(choiceText1, 150, 60);
      }

      prepareFunctions[$scope.treatment]($scope, $scope.choice);

      $scope.drawPie = function() {
        var colors = [$scope.primaryColor1, $scope.primaryColor2];
        var context = $element[0].getElementsByTagName("canvas")[0].getContext("2d");
        
        context.clearRect(0, 0, $scope.viewWidth, $scope.viewHeight);
        draw_pie(context, 50, 40, 40, $scope.choice, colors);
        drawLegend(context, colors, $scope.choice)
      }

      // hack to make sure that the completely filled pies display correctly
      $scope.angleOffset = 0.0001;
      $scope.doRotate = function($event) {
        $scope.angleOffset = ($scope.viewWidth - $event.offsetX) / $scope.viewWidth * Math.PI * 2;
      }

      $scope.drawPieHeight = function() {
        var colors = [[$scope.primaryColor1, $scope.secondaryColor1], [$scope.primaryColor2, $scope.secondaryColor2]];
        var elem = $element[0].getElementsByTagName("canvas");
        var context = elem[0].getContext("2d");
        
        context.clearRect(0, 0, $scope.viewWidth, $scope.viewHeight);
        draw_pie_3d(context, 50, 0, 110, 50, 15, $scope.angleOffset, $scope.choice, colors);
        drawLegend(context, [$scope.primaryColor1, $scope.primaryColor2], $scope.choice);
      }
    }
  };
}]);
