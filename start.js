/*
  Holt-Laury Experiment Start Page Controller
*/

Redwood.controller("HoltLauryController", ["$rootScope", "$scope", "RedwoodSubject", function($rootScope, $scope, rs) {

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
      "view": $scope.treatment,
      "result": score,
      "result-text": $scope.riskAversionText[score]
    });

    // save data for payouts
    var comprehensiveDecisions = $scope.subjectDecisions.map(function(decision, index) {
      return {
        "decision": decision,
        "choices": [ $scope.decisions[index].choice1, $scope.decisions[index].choice2]
      }
    });
    
    rs.set("hl.results", {
      "period": rs.period,
      "view": $scope.treatment,
      "decisions": comprehensiveDecisions
    });
    
    $scope.periodOver = true;
    rs.next_period();
  };

  $scope.selectOption = function(decisionId, selection) {
    rs.trigger("hl.selected_option", {
      "treatment": $scope.treatment,
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
    $scope.treatment = rs.config.treatment;
    $scope.rowOrder = rs.config.rowOrder || [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    $scope.keyColor1 = rs.config.keyColor1 || "#2382D7" || "#229fd9";
    $scope.tintColor1 = rs.config.tintColor1 || "#4594DB" || "#1571a5";
    $scope.keyColor2 = rs.config.keyColor2 || "#0659A3" || "#db2e1b";
    $scope.tintColor2 = rs.config.tintColor2 || "#0B75D4" || "#b02113";

    // generate array of decisions specified by rowOrder
    $scope.decisions = $scope.rowOrder.map(function(row) {
      var index = row - 1;
      return $scope.allDecisions[index];
    });

    $scope.maxQuestions = $scope.decisions.length;

    $scope.redwoodLoaded = true;
  });
}]);

// Rendering
Redwood.directive("choiceView", ["RedwoodSubject", function(rs) {
  return {
    scope: {
      choice: "=",
      treatment: "=",
      primaryColor1: "=",
      secondaryColor1: "=",
      primaryColor2: "=",
      secondaryColor2: "="
    },
    templateUrl: "/static/experiments/redwood-holt-laury/choiceView.html",
    link: function postLink($scope, $element, attrs) {

      var prepareFunctions = {
        "text": function($scope, choice) {
          $scope.fraction0 = (choice[0].chance * 10).toString() + "/10";
          $scope.fraction1 = (choice[1].chance * 10).toString() + "/10";
          $scope.dollar0 = choice[0].payoff;
          $scope.dollar1 = choice[1].payoff;
        },
        "bar": function($scope, choice) {
          $scope.width0 = choice[0].chance * 410;
          $scope.width1 = choice[1].chance * 410;
        },
        "bar-height": function($scope, choice) {
          $scope.width0 = choice[0].chance * 410;
          $scope.width1 = choice[1].chance * 410;
          $scope.maxHeight = 40;
          $scope.height0 = choice[0].payoff/4.0 * $scope.maxHeight;
          $scope.height1 = choice[1].payoff/4.0 * $scope.maxHeight;
        },
        "bar-inverted": function($scope, choice) {
          $scope.width0 = choice[0].chance * 410;
          $scope.width1 = choice[1].chance * 410;
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
        context.fillText(choice[0].chance * 100 + "% chance of $" + choice[0].payoff.toFixed(2), 150, 20);
        context.fillText(choice[1].chance * 100 + "% chance of $" + choice[1].payoff.toFixed(2), 150, 60);
      }

      prepareFunctions[$scope.treatment]($scope, $scope.choice);

      $scope.drawPie = function() {
        var colors = [$scope.primaryColor1, $scope.primaryColor2];
        var context = $element[0].getElementsByTagName("canvas")[0].getContext("2d");
        
        context.clearRect(0, 0, 410, 80);
        draw_pie(context, 50, 40, 40, $scope.choice, colors);
        drawLegend(context, colors, $scope.choice)
      }

      $scope.drawPieHeight = function() {
        var colors = [[$scope.primaryColor1, $scope.secondaryColor1], [$scope.primaryColor2, $scope.secondaryColor2]];
        var context = $element[0].getElementsByTagName("canvas")[0].getContext("2d");
        
        context.clearRect(0, 0, 410, 80);
        draw_pie_3d(context, 50, 0, 50, $scope.choice, colors);
        drawLegend(context, [$scope.primaryColor1, $scope.primaryColor2], $scope.choice)
      }
    }
  };
}]);
