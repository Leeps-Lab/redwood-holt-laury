/*
  Holt-Laury Experiment Start Page Controller
*/

Redwood.controller("HoltLauryController", ["$rootScope", "$scope", "RedwoodSubject", function($rootScope, $scope, rs) {

  $scope.decisions = [
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
  $scope.redwoodLoaded = false;
  $scope.unansweredQuestions = 10;
  $scope.periodOver = false;

  $scope.finishPeriod = function() {
    var score = $scope.subjectDecisions.reduce(function(prev, curr, index, array) {
      return prev + (curr === "lessRisk" ? 1 : 0);
    }, 0);

    rs.trigger("hl.finished_questions", {
      "view": $scope.treatment,
      "result": score,
      "result-text": $scope.riskAversionText[score]
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

  rs.on("hl.selected_option", function(value) {
    // seems redundant, but necessary for restoring when the page is refreshed
    $scope.subjectDecisions[value.question-1] = value.selection;

    var answerCount = $scope.subjectDecisions.reduce(function(prev, curr, index, array) {
      return prev + (typeof curr !== "undefined" ? 1 : 0);
    }, 0);

    $scope.unansweredQuestions = 10 - answerCount;
  });
  
  rs.on_load(function() { //called once the page has loaded for a new sub period
    $scope.user_id = rs.user_id;
    $scope.treatment = rs.config.treatment;
    $scope.redwoodLoaded = true;
  });
}]);

// Rendering
Redwood.directive("choiceView", ["RedwoodSubject", function(rs) {
  
  var primary_color_1 = "#229fd9";
  var primary_color_2 = "#db2e1b";
  var secondary_color_1 = "#1571a5";
  var secondary_color_2 = "#b02113";

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
  
  return {
    scope: {
      choice: "=",
      treatment: "="
    },
    templateUrl: "/static/experiments/redwood-holt-laury/choiceView.html",
    link: function postLink($scope, $element, attrs) {

      prepareFunctions[$scope.treatment]($scope, $scope.choice);
      $scope.primary_color_1 = primary_color_1;
      $scope.primary_color_2 = primary_color_2;
      
      $scope.drawPie = function() {
        var colors = [primary_color_1, primary_color_2];
        var context = $element[0].getElementsByTagName("canvas")[0].getContext("2d");
        
        context.clearRect(0, 0, 410, 80);
        draw_pie(context, 50, 40, 40, $scope.choice, colors);
        drawLegend(context, colors, $scope.choice)
      }

      $scope.drawPieHeight = function() {
        var colors = [[primary_color_1, secondary_color_1], [primary_color_2, secondary_color_2]];
        var context = $element[0].getElementsByTagName("canvas")[0].getContext("2d");
        
        context.clearRect(0, 0, 410, 80);
        draw_pie_3d(context, 50, 0, 50, $scope.choice, colors);
        drawLegend(context, [primary_color_1, primary_color_2], $scope.choice)
      }
    }
  };
}]);
