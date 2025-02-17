/* ************************************ */
/* Helper Functions                     */
/* ************************************ */

let socket = new WebSocket("ws://localhost:8765");
var connectionStablished = false;
socket.onopen = function (e) {
  socket.send("0");
  connectionStablished = true;
};


function sendTrigger(trigger) {
  if (connectionStablished) {
    socket.send(trigger);
  }
}

var getInstructFeedback = function () {
  return (
    "<div class = centerbox><p class = center-block-text>" +
    feedback_instruct_text +
    "</p></div>"
  );
};

function assessPerformance() {
  var experiment_data = jsPsych.data.getTrialsOfType("single-stim-button");
  var missed_count = 0;
  var trial_count = 0;
  var rt_array = [];
  var rt = 0;
  for (var i = 0; i < experiment_data.length; i++) {
    rt = experiment_data[i].rt;
    trial_count += 1;
    if (rt == -1) {
      missed_count += 1;
    } else {
      rt_array.push(rt);
    }
  }
  //calculate average rt
  var avg_rt = -1;
  if (rt_array.length !== 0) {
    avg_rt = math.median(rt_array);
  }
  var missed_percent = missed_count / experiment_data.length;
  credit_var = missed_percent < 0.4 && avg_rt > 200;
  jsPsych.data.addDataToLastTrial({
    credit_var: credit_var,
    performance_var: performance_var
  });
}

function deleteText(input, search_term) {

  index = input.indexOf(search_term);
  indexAfter = input.indexOf(search_term) + search_term.length;
  return input.slice(0, index) + input.slice(indexAfter);
}

function appendTextAfter(input, search_term, new_text) {

  var index = input.indexOf(search_term) + search_term.length;
  return input.slice(0, index) + new_text + input.slice(index);
}

function appendTextAfter2(input, search_term, new_text, deleted_text) {

  var index = input.indexOf(search_term) + search_term.length;
  var indexAfter = index + deleted_text.length;
  return input.slice(0, index) + new_text + input.slice(indexAfter);
}

var getBoard = function (board_type) {
  var board = "";
  if (board_type == 2) {
    board = "<div class = cardbox>";
    for (i = 1; i < 33; i++) {
      var estilo =
        "'top:" +
        cardPositions[i - 1][0] +
        "vw; left:" +
        cardPositions[i - 1][1] +
        "vw;'";

      board +=
        "<div class = square style =" +
        estilo +
        ">\
        <input type='image' id = " +
        i +
        " class = 'card_image' src='images/beforeChosen.png' onclick = instructCard(this.id)></div>";
    }

  } else if (board_type == -1) {
    board = "<div class = cardbox>";
    for (i = 1; i < 33; i++) {
      var estilo =
        "'top:" +
        cardPositions[i - 1][0] +
        "vw; left:" +
        cardPositions[i - 1][1] +
        "vw;'";
      board +=
        "<div  id = SQ" +
        i +
        " class ='square flipped' style = " +
        estilo +
        ">\
			<div class = 'flip-card'>\
			<input type='image' id = F" +
        i +
        " class = 'card_image' src='images/beforeChosen.png'>\
			<input type='image' id = " +
        i +
        " class = 'card_image select-button back' src='images/beforeChosen.png' onclick = chooseCard(this.id)>\
			</div>\
			</div>";
    }
  } else {
    board = "<div class = cardbox>";

    for (i = 1; i < 33; i++) {
      var estilo =
        "'top:" +
        cardPositions[i - 1][0] +
        "vw; left:" +
        cardPositions[i - 1][1] +
        "vw;'";

      board +=
        "<div class = square style =" +
        estilo +
        ">\
        <input type='image' id = " +
        i +
        " class = 'card_image select-button' src='images/beforeChosen.png' onclick = chooseCard(this.id)></div>";
    }
  }
  board += "</div>";
  return board;
};

var getText = function () {
  return (
    "<div class = centerbox><p class = block-text>Insgesamt haben Sie " +
    totalPoints +
    " Punkte erreicht. Die Punkte für Ihren Bonus aus drei zufällig ausgewählten Testläufen beträgt:  " +
    "<ul list-text><li>" +
    prize1 +
    "</li><li>" +
    prize2 +
    "</li><li>" +
    prize3 +
    "</li></ul>" +
    "</p><p class = block-text>Drücken Sie <strong>Enter</strong> um Fortzufragen.</p></div>"
  );
};

var appendPayoutData = function () {
  jsPsych.data.addDataToLastTrial({ reward: [prize1, prize2, prize3] });
};

var appendTestData = function () {
  jsPsych.data.addDataToLastTrial({
    which_round: whichRound,
    num_click_in_round: whichClickInRound,
    num_loss_cards: numLossCards,
    gain_amount: gainAmt,
    loss_amount: lossAmt,
    round_points: roundPoints,
    clicked_on_loss_card: lossClicked,
    round_type: round_type
  });
};

// Functions for "top" buttons during test (Keine Karte, end round, collect)
var collect = function () {
  for (var i = 0; i < CCT_timeouts.length; i++) {
    clearTimeout(CCT_timeouts[i]);
  }
  currID = "collectButton";
  whichClickInRound = whichClickInRound + 1;
  sendTrigger("6")
};

var noCard = function () {
  currID = "noCardButton";
  roundOver = 2;
  whichClickInRound = whichClickInRound + 1;
  sendTrigger("4")
};

var endRound = function () {
  currID = "endRoundButton";
  roundOver = 2;
  sendTrigger("5")
};

// Clickable card function during test
var chooseCard = function (clicked_id) {

  currID = parseInt(clicked_id);
  whichClickInRound = whichClickInRound + 1;
  if (lossRounds.indexOf(whichRound) == -1) {
    if (cardArray.length - clickedGainCards.length == numLossCards) {
      clickedLossCards.push(currID);
      index = unclickedCards.indexOf(currID, 0); // Find in unclicked and then delete it in next line
      unclickedCards.splice(index, 1); //delete from unclicked
      roundPoints = roundPoints - lossAmt;
      lossClicked = true;
      sendTrigger("3")
      roundOver = 2;
    } else {
      // if you click on a gain card
      clickedGainCards.push(currID); //as a string
      index = unclickedCards.indexOf(currID, 0);
      unclickedCards.splice(index, 1);
      roundPoints = roundPoints + gainAmt;
      sendTrigger("2")
    }
  } else {
    if (clickedGainCards.length + 1 == whichLossCards) {
      clickedLossCards.push(currID);
      index = unclickedCards.indexOf(currID, 0);
      unclickedCards.splice(index, 1);
      roundPoints = roundPoints - lossAmt;
      lossClicked = true;
      sendTrigger("3")
      roundOver = 2;
    } else {
      // if you click on a gain card
      clickedGainCards.push(currID); //as a string
      index = unclickedCards.indexOf(currID, 0);
      unclickedCards.splice(index, 1);
      roundPoints = roundPoints + gainAmt;
      sendTrigger("2")
    }
  }
  console.log("CLICKED THIS SHEET: " + currID + " Loss?: " + lossClicked + " Round Points: " + roundPoints + " Verlustmenge: " + lossAmt + "Gewinnmenge: " + gainAmt);

};

var getRound = function () {
  var gameState = gameSetup;

  if (roundOver === 0) {
    //this is for the start of a round
    whichClickInRound = 0;
    unclickedCards = cardArray;
    cardArray = [
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21,
      22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32
    ];
    clickedGainCards = []; //num
    clickedLossCards = []; //num
    roundParams = shuffledParamsArray.shift();
    numLossCards = roundParams[0];
    gainAmt = roundParams[1];
    lossAmt = roundParams[2];

    gameState = appendTextAfter(gameState, "Spielrunde: ", whichRound);
    gameState = appendTextAfter(gameState, "Verlustmenge: ", lossAmt);
    gameState = appendTextAfter2(
      gameState,
      "Aktuelle Rundenpunktzahl: ",
      roundPoints,
      "0"
    );
    gameState = appendTextAfter(
      gameState,
      "Anzahl der Verlierkarten: ",
      numLossCards
    );
    gameState = appendTextAfter(gameState, "Gewinnmenge: ", gainAmt);
    gameState = appendTextAfter(gameState, "endRound()", " disabled");
    roundOver = 1;
    return gameState;
  } else if (roundOver == 1) {
    //this is for during the round
    gameState = appendTextAfter(gameState, "Spielrunde: ", whichRound);
    gameState = appendTextAfter(gameState, "Verlustmenge: ", lossAmt);
    gameState = appendTextAfter2(
      gameState,
      "Aktuelle Rundenpunktzahl: ",
      roundPoints,
      "0"
    );
    gameState = appendTextAfter(
      gameState,
      "Anzahl der Verlierkarten: ",
      numLossCards
    );
    gameState = appendTextAfter(gameState, "Gewinnmenge: ", gainAmt);
    gameState = appendTextAfter(gameState, "noCard()", " disabled");
    gameState = appendTextAfter2(
      gameState,
      "class = 'CCT-btn ",
      " ' disabled",
      "select-button' onclick = noCard()"
    );
    for (i = 0; i < clickedGainCards.length; i++) {
      gameState = appendTextAfter2(
        gameState,
        "id = " + "" + clickedGainCards[i] + "",
        " class = 'card_image' src='images/chosen.png'",
        " class = 'card_image select-button' src='images/beforeChosen.png' onclick = chooseCard(this.id)"
      );
    }
    return gameState;
  } else if (roundOver == 2) {
    //this is for end the round
    roundOver = 3;
    gameState = appendTextAfter(gameState, "Spielrunde: ", whichRound);
    gameState = appendTextAfter(gameState, "Verlustmenge: ", lossAmt);
    gameState = appendTextAfter2(
      gameState,
      "Aktuelle Rundenpunktzahl: ",
      roundPoints,
      "0"
    );
    gameState = appendTextAfter(
      gameState,
      "Anzahl der Verlierkarten: ",
      numLossCards
    );
    gameState = appendTextAfter(gameState, "Gewinnmenge: ", gainAmt);
    gameState = appendTextAfter2(
      gameState,
      "id = collectButton class = 'CCT-btn",
      " select-button' onclick = collect()",
      "'"
    );
    gameState = appendTextAfter(gameState, "endRound()", " disabled");
    gameState = appendTextAfter(gameState, "noCard()", " disabled");

    clickedCards = clickedGainCards.concat(clickedLossCards);
    var notClicked = cardArray.filter(function (x) {
      return jQuery.inArray(x, clickedCards) == -1;
    });
    notClicked = jsPsych.randomization.shuffle(notClicked);
    lossCardsToTurn = notClicked.slice(
      0,
      numLossCards - clickedLossCards.length
    );
    gainCardsToTurn = notClicked.slice(numLossCards - clickedLossCards.length);
    for (var i = 1; i < cardArray.length + 1; i++) {
      if (clickedGainCards.indexOf(i) != -1) {
        gameState = appendTextAfter2(
          gameState,
          "id = " + "" + i + "",
          " class = 'card_image' src='images/chosen.png'",
          " class = 'card_image select-button' src='images/beforeChosen.png' onclick = chooseCard(this.id)"
        );
      } else if (clickedLossCards.indexOf(i) != -1) {
        gameState = appendTextAfter2(
          gameState,
          "id = " + "" + i + "",
          " class = 'card_image' src='images/loss.png'",
          " class = 'card_image select-button' src='images/beforeChosen.png' onclick = chooseCard(this.id)"
        );
      } else {
        gameState = appendTextAfter2(
          gameState,
          "id = " + "" + i + "",
          " class = 'card_image' src='images/beforeChosen.png'",
          " class = 'card_image select-button' src='images/beforeChosen.png' onclick = chooseCard(this.id)"
        );
      }
    }

    setTimeout(function () {
      for (var k = 0; k < lossCardsToTurn.length; k++) {
        document.getElementById("" + lossCardsToTurn[k] + "").src =
          "images/loss.png";
      }
      for (var j = 0; j < gainCardsToTurn.length; j++) {
        document.getElementById("" + gainCardsToTurn[j] + "").src =
          "images/chosen.png";
      }
      $("#collectButton").prop("disabled", false);
    }, 1500);

    return gameState;
  }
};

var getPreRound = function () {
  var gameState = PregameSetup;
  //*

  if (roundOver === 0) {
    //this is for the start of a round
    whichClickInRound = 0;
    unclickedCards = cardArray;
    cardArray = [
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21,
      22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32
    ];
    clickedGainCards = []; //num
    clickedLossCards = []; //num
    roundParams = shuffledParamsArray.shift();
    numLossCards = roundParams[0];
    gainAmt = roundParams[1];
    lossAmt = roundParams[2];

    gameState = appendTextAfter(gameState, "Spielrunde: ", whichRound + " of " + numRounds);
    gameState = appendTextAfter(gameState, "Verlustmenge: ", lossAmt);
    gameState = appendTextAfter2(
      gameState,
      "Aktuelle Rundenpunktzahl: ",
      roundPoints,
      "0"
    );
    gameState = appendTextAfter(
      gameState,
      "Anzahl der Verlierkarten: ",
      numLossCards
    );
    gameState = appendTextAfter(gameState, "Es sind noch ", " " + (numRounds - whichRound + 1) + " Runden übrig");
    gameState = appendTextAfter(gameState, "Gewinnmenge: ", gainAmt);
    gameState = appendTextAfter(gameState, "endRound()", " disabled");
    roundOver = 1;


  } else if (roundOver == 1) {
    //this is for during the round
    gameState = appendTextAfter(gameState, "Spielrunde: ", whichRound + " of " + numRounds);
    gameState = appendTextAfter(gameState, "Verlustmenge: ", lossAmt);
    gameState = appendTextAfter2(
      gameState,
      "Aktuelle Rundenpunktzahl: ",
      roundPoints,
      "0"
    );
    gameState = appendTextAfter(
      gameState,
      "Anzahl der Verlierkarten: ",
      numLossCards
    );

    gameState = appendTextAfter(gameState, "Es sind noch ", " " + (numRounds - whichRound + 1) + " Runden übrig");
    gameState = appendTextAfter(gameState, "Gewinnmenge: ", gainAmt);
    gameState = appendTextAfter(gameState, "noCard()", " disabled");
    gameState = appendTextAfter2(
      gameState,
      "class = 'CCT-btn ",
      " ' disabled",
      "select-button' onclick = noCard()"
    );

    for (i = 0; i < clickedGainCards.length; i++) {
      gameState = appendTextAfter2(
        gameState,
        "id = " + "" + clickedGainCards[i] + "",
        " class = 'card_image back' src='images/chosen.png'",
        " class = 'card_image select-button back' src='images/beforeChosen.png' onclick = chooseCard(this.id)"
      );
    }
    return gameState;
  } else if (roundOver == 2) {
    //this is for end the round
    roundOver = 3;
    gameState = appendTextAfter(gameState, "Spielrunde: ", whichRound + " of " + numRounds);
    gameState = appendTextAfter(gameState, "Verlustmenge: ", lossAmt);
    gameState = appendTextAfter2(
      gameState,
      "Aktuelle Rundenpunktzahl: ",
      roundPoints,
      "0"
    );
    gameState = appendTextAfter(
      gameState,
      "Anzahl der Verlierkarten: ",
      numLossCards
    );
    gameState = appendTextAfter(gameState, "Es sind noch ", " " + (numRounds - whichRound + 1) + " Runden übrig");
    gameState = appendTextAfter(gameState, "Gewinnmenge: ", gainAmt);
    gameState = appendTextAfter2(
      gameState,
      "id = collectButton class = 'CCT-btn",
      " select-button' onclick = collect()",
      "'"
    );
    gameState = appendTextAfter(gameState, "endRound()", " disabled");
    gameState = appendTextAfter(gameState, "noCard()", " disabled");

    clickedCards = clickedGainCards.concat(clickedLossCards);
    var notClicked = cardArray.filter(function (x) {
      return jQuery.inArray(x, clickedCards) == -1;
    });
    notClicked = jsPsych.randomization.shuffle(notClicked);
    lossCardsToTurn = notClicked.slice(
      0,
      numLossCards - clickedLossCards.length
    );
    gainCardsToTurn = notClicked.slice(numLossCards - clickedLossCards.length);
    for (var i = 1; i < cardArray.length + 1; i++) {
      if (clickedGainCards.indexOf(i) != -1) {
        gameState = appendTextAfter2(
          gameState,
          "id = " + "" + i + "",
          " class = 'card_image back' src='images/chosen.png'",
          " class = 'card_image select-button back' src='images/beforeChosen.png' onclick = chooseCard(this.id)"
        );
      } else if (clickedLossCards.indexOf(i) != -1) {
        gameState = appendTextAfter2(
          gameState,
          "id = " + "" + i + "",
          " class = 'card_image back' src='images/loss.png'",
          " class = 'card_image select-button back' src='images/beforeChosen.png' onclick = chooseCard(this.id)"
        );
      } else {
        gameState = appendTextAfter2(
          gameState,
          "id = " + "" + i + "",
          " class = 'card_image back' src='images/beforeChosen.png'",
          " class = 'card_image select-button back' src='images/beforeChosen.png' onclick = chooseCard(this.id)"
        );
      }
    }

    setTimeout(function () {
      for (var k = 0; k < lossCardsToTurn.length; k++) {
        document.getElementById("" + lossCardsToTurn[k] + "").src =
          "images/loss.png";
      }
      for (var j = 0; j < gainCardsToTurn.length; j++) {
        document.getElementById("" + gainCardsToTurn[j] + "").src =
          "images/chosen.png";
      }
      var colbut = document.getElementById("collectButton");
      colbut.disabled = false;

    }, 1500);

    return gameState;
  }
  //*/
  ///////////////////////////////////////////////////////////////////

  function randomInts(quantity, max) {
    const arr = [];
    while (arr.length < quantity) {
      var candidateInt = Math.floor(Math.random() * max) + 1;
      if (arr.indexOf(candidateInt) === -1) arr.push(candidateInt);
    }
    return arr;
  }

  setTimeout(function () {
    var lossflips = randomInts(numLossCards, 31);
    for (var i = 1; i < 33; i++) {
      var carta = document.getElementById("F" + i);
      if (lossflips.indexOf(i) != -1) {
        carta.src = "images/loss.png";
      } else {
        carta.src = "images/chosen.png";
      }

    }

    var items = document.getElementsByClassName("square");
    for (var i = 0; i < items.length; i++) {
      items[i].classList.remove("flipped");
      var cartain = document.getElementById("" + (i + 1) + "");
      cartain.disabled = true;
    }

    var load = document.getElementById("load");
    //load.classList.remove("hidden");
    if (c == "Augmentation") {
      load.src = "images/soundload2.gif"
    }
    else {
      load.src = "images/load.gif"
    }
    //  "

  }, 000);

  setTimeout(function () {
    var items = document.getElementsByClassName("square");
    for (var i = 0; i < items.length; i++) {
      items[i].classList.add("flipped");
    }

    for (var i = 1; i < 33; i++) {
      var carta = document.getElementById("F" + i);
      carta.src = "images/beforeChosen.png";
    }

  }, 1000);

  setTimeout(function () {
    var shuffled = cardPositions.slice();
    setIntervalX(
      function () {
        shuffleArray(shuffled);
        var cardcontainer = document.getElementsByClassName("cardbox")[0];

        for (var i = 0; i < cardcontainer.children.length; i++) {
          cardcontainer.children[i].style.top = shuffled[i][0] + "vw";
          cardcontainer.children[i].style.left = shuffled[i][1] + "vw";
        }
      },
      480,
      5
    );

    setTimeout(function () {
      var cardcontainer = document.getElementsByClassName("cardbox")[0];

      for (var i = 0; i < cardcontainer.children.length; i++) {
        cardcontainer.children[i].style.top = cardPositions[i][0] + "vw";
        cardcontainer.children[i].style.left = cardPositions[i][1] + "vw";
        var cartain = document.getElementById("" + (i + 1) + "");
        cartain.disabled = false;
      }


      var load = document.getElementById("load");
      load.classList.add("hidden");

    }, 3000);


  }, 1500);

  //////////////////////////////////////////////////////
  /* 

	

//*/
  return gameState;
};

function shuffleArray(array) {
  for (var i = array.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
}

function setIntervalX(callback, delay, repetitions) {
  var x = 0;
  var intervalID = window.setInterval(function () {
    callback();

    if (++x === repetitions) {
      window.clearInterval(intervalID);
    }
  }, delay);
}

/*Functions below are for practice
 */
var turnCards = function (cards) {

  $("#collectButton").prop("disabled", false);
  $("#NoCardButton").prop("disabled", true);
  for (i = 0; i < 33; i++) {
    if (whichGainCards.indexOf(i) != -1) {
      document.getElementById("" + i + "").src = "images/chosen.png";
    } else if (whichLossCards.indexOf(i) != -1) {
      document.getElementById("" + i + "").src = "images/loss.png";
    }
  }
};

var turnOneCard = function (whichCard, win) {
  if (win === "loss") {
    document.getElementById("" + whichCard + "").src = "images/loss.png";
  } else {
    document.getElementById("" + whichCard + "").src = "images/chosen.png";
  }
};

function doSetTimeout(card_i, delay, points, win) {
  CCT_timeouts.push(
    setTimeout(function () {
      turnOneCard(card_i, win);
      document.getElementById("current_round").innerHTML =
        "Aktuelle Rundenpunktzahl: " + points;
    }, delay)
  );
}

var getPractice1 = function () {
  unclickedCards = cardArray;
  cardArray = [
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21,
    22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32
  ];
  clickedGainCards = [];
  clickedLossCards = [];
  numLossCards = 1;
  gainAmt = 30;
  lossAmt = 250;

  shuffledCardArray = jsPsych.randomization.repeat(cardArray, 1);
  whichLossCards = []; //this determines which are loss cards at the beginning of each round
  for (i = 0; i < numLossCards; i++) {
    whichLossCards.push(shuffledCardArray.pop());
  }
  whichGainCards = shuffledCardArray;
  gameState = practiceSetup;
  return gameState;
};

var getPractice2 = function () {
  unclickedCards = cardArray;
  cardArray = [
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21,
    22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32
  ];
  clickedGainCards = []; //num
  clickedLossCards = []; //num
  numLossCards = 3;
  gainAmt = 10;
  lossAmt = 750;

  shuffledCardArray = jsPsych.randomization.repeat(cardArray, 1);
  whichLossCards = []; //this determines which are loss cards at the beginning of each round
  for (i = 0; i < numLossCards; i++) {
    whichLossCards.push(shuffledCardArray.pop());
  }
  whichGainCards = shuffledCardArray;
  gameState = practiceSetup2;
  return gameState;
};

var url_string = window.location.href;
var url = new URL(url_string);
var c = url.searchParams.get("condition");

/*Functions below are for instruction
 */
var instructCard = function (clicked_id) {
  currID = parseInt(clicked_id);
  document.getElementById("NoCardButton").disabled = true;
  document.getElementById("turnButton").disabled = false;
  appendTextAfter(gameState, "turnButton", " onclick = turnCards()");
  if (whichLossCards.indexOf(currID) == -1) {
    instructPoints = instructPoints + gainAmt;
    document.getElementById("current_round").innerHTML =
      "Aktuelle Rundenpunktzahl: " + instructPoints;
    document.getElementById(clicked_id).disabled = true;

    document.getElementById(clicked_id).src = "images/chosen.png";
  } else if (whichLossCards.indexOf(currID) != -1) {
    instructPoints = instructPoints - lossAmt;
    document.getElementById(clicked_id).disabled = true;
    document.getElementById("current_round").innerHTML =
      "Aktuelle Rundenpunktzahl: " + instructPoints;
    document.getElementById(clicked_id).src = "images/loss.png";
    $("input.card_image").attr("disabled", true);
    CCT_timeouts.push(
      setTimeout(function () {
        turnCards();
      }, 2000)
    );
  }
};

var instructFunction = function () {
  $("#instructButton").prop("disabled", true);
  $("#jspsych-instructions-next").click(function () {
    for (var i = 0; i < CCT_timeouts.length; i++) {
      clearTimeout(CCT_timeouts[i]);
    }
  });

  $("#jspsych-instructions-back").click(function () {
    for (var i = 0; i < CCT_timeouts.length; i++) {
      clearTimeout(CCT_timeouts[i]);
    }
  });

  var cards_to_turn = [1, 17, 18, 15, 27, 31, 8];
  var total_points = 0;
  var points_per_card = 10;
  var delay = 0;
  for (var i = 0; i < cards_to_turn.length; i++) {
    var card_i = cards_to_turn[i];
    delay += 250;
    total_points += points_per_card;
    doSetTimeout(card_i, delay, total_points, "win");
  }
  CCT_timeouts.push(
    setTimeout(function () {
      document.getElementById("instruct1").innerHTML =
        '<font color = "red">Glücklicherweise war keine der sieben aufgedeckten Karten die Verlustkarte, so dass Sie für diese Runde 70 Punkte erhalten haben. Bitte klicken Sie auf die Schaltfläche "Next".</font>';
    }, delay)
  );
};

var instructFunction2 = function () {
  $("#instructButton").prop("disabled", true);
  var tempArray = [
    3, 5, 6, 7, 9, 10, 11, 12, 19, 14, 15, 16, 17, 18, 20, 21, 22, 23, 24, 25,
    26, 27, 28, 29, 31, 32
  ];
  var instructTurnCards = function () {
    document.getElementById("8").src = "images/loss.png";
    document.getElementById("2").src = "images/loss.png";

    for (i = 0; i < tempArray.length; i++) {
      document.getElementById("" + tempArray[i] + "").src = "images/chosen.png";
    }
  };

  $("#jspsych-instructions-next").click(function () {
    for (var i = 0; i < CCT_timeouts.length; i++) {
      clearTimeout(CCT_timeouts[i]);
    }
  });

  $("#jspsych-instructions-back").click(function () {
    for (var i = 0; i < CCT_timeouts.length; i++) {
      clearTimeout(CCT_timeouts[i]);
    }
  });
  var cards_to_turn = [1, 4, 30];
  var total_points = 0;
  var points_per_card = 30;
  var delay = 0;
  for (var i = 0; i < cards_to_turn.length; i++) {
    var card_i = cards_to_turn[i];
    delay += 250;
    total_points += points_per_card;
    doSetTimeout(card_i, delay, total_points, "win");
  }
  delay += 250;
  total_points -= 250;
  doSetTimeout(13, delay, total_points, "loss");
  CCT_timeouts.push(
    setTimeout(function () {
      document.getElementById("instruct2").innerHTML =
        '<font color = "red">Dieses Mal war die vierte aufgedeckte Karte eine Verlustkarte. Wie Sie gesehen haben, endet die Runde sofort, wenn Sie die Verlustkarte aufdecken. Sie hatten 90 Punkte mit den 3 Gewinnkarten erzielt, dann wurden 250 Punkte für die Verlustkarte abgezogen, so dass Ihr Ergebnis für diese Runde -160 ist. Nachdem die Verlustpunkte von der Gesamtsumme der Runde abgezogen wurden, zeigt Ihnen der Computer auch die Karten an, die Sie noch nicht aufgedeckt haben. Bitte klicken Sie auf die Schaltfläche "Next".</font>';
    }, (delay + 1000))
  );
  CCT_timeouts.push(setTimeout(instructTurnCards, delay + 1000));
};

var instructButton = function (clicked_id) {
  currID = parseInt(clicked_id);
  document.getElementById(clicked_id).src = "images/chosen.png";
};

/* ************************************ */
/* Experimental Variables               */
/* ************************************ */
// generic task variables
var sumInstructTime = 0; //ms
var instructTimeThresh = 0; ///in seconds
var credit_var = true;
var performance_var = 0;

// task specific variables
var currID = "";
var numLossCards = "";
var gainAmt = "";
var lossAmt = "";
var CCT_timeouts = [];
var numWinRounds = 13;
var numLossRounds = 7;
var numRounds = numWinRounds + numLossRounds;
var lossRounds = jsPsych.randomization.shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]).slice(0, numLossRounds);
lossRounds.sort(function (a, b) { return a - b; })


var riggedLossCards = [];
var lossClicked = false;
var whichClickInRound = 0;
var whichRound = 1;
var round_type = lossRounds.indexOf(whichRound) == -1 ? "rigged_win" : "rigged_loss";
var roundPoints = 0;
var totalPoints = 0;
var roundOver = 0; //0 at beginning of round, 1 during round, 2 at end of round
var instructPoints = 0;
var clickedGainCards = [];
var clickedLossCards = [];
var roundPointsArray = [];
var whichGainCards = [];
var whichLossCards = [];
var prize1 = 0;
var prize2 = 0;
var prize3 = 0;

// this params array is organized such that the 0 index = the Anzahl der Verlierkarten in round, the 1 index = the Gewinnmenge of each happy card, and the 2nd index = the Verlustmenge when you turn over a sad face
var paramsArray = [
  [1, 10, 250],
  [1, 10, 750],
  [1, 30, 250],
  [1, 30, 750],
  [3, 10, 250],
  [3, 10, 750],
  [3, 30, 250],
  [3, 30, 750]
];

var cardArray = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22,
  23, 24, 25, 26, 27, 28, 29, 30, 31, 32
];
var shuffledCardArray = jsPsych.randomization.repeat(cardArray, 1);

var shuffledParamsArray = jsPsych.randomization.repeat(
  paramsArray,
  numWinRounds / 8
);


for (var i = 0; i < numLossRounds; i++) {
  riggedLossCards.push(Math.floor(Math.random() * 10) + 2);

  var before = shuffledParamsArray.slice(0, lossRounds[i] - 1);
  var after = shuffledParamsArray.slice(lossRounds[i] - 1);
  //var insert = [[0,0,0]];
  var insert = [paramsArray[Math.floor(Math.random() * 8)]];
  shuffledParamsArray = before.concat(insert, after);

  //shuffledParamsArray.splice
}




cardPositions = Array();
for (i = 1; i < 33; i++) {
  var columns = 8;
  var row = Math.floor((i - 1) / 8);
  var col = i - 1 - row * columns;
  var hspace = 7.0;
  var vspace = 9;
  cardPositions[i - 1] = Array(row * vspace, col * hspace);
}

var gameSetup =
  "<div class = cct-box>" +
  "<div class = titleBigBox>   <div class = titleboxLeft><div class = center-text id = game_round>Spielrunde: </div></div>   <div class = titleboxLeft1><div class = center-text id = loss_amount>Verlustmenge: </div></div>    <div class = titleboxMiddle1><div class = center-text id = gain_amount>Gewinnmenge: </div></div>    <div class = titlebox><div class = center-text>Wie viele Karten möchten Sie aufdecken? </div></div>     <div class = titleboxRight1><div class = center-text id = num_loss_cards>Anzahl der Verlierkarten: </div></div>   <div class = titleboxRight><div class = center-text id = current_round>Aktuelle Rundenpunktzahl: 0</div></div>" +
  "<div class = buttonbox><button type='button' id = NoCardButton class = 'CCT-btn select-button' onclick = noCard()>Keine Karte</button><button type='button' id = turnButton class = 'CCT-btn select-button' onclick = endRound()>STOP/Umdrehen</button><button type='button' id = collectButton class = 'CCT-btn' disabled>Nächste Runde</button></div></div>" +
  getBoard();

var PregameSetup =
  "<div class = cct-box>" +
  "<div class = titleBigBox>   <div class = titleboxLeft><div class = center-text id = game_round>Spielrunde: </div></div>   <div class = titleboxRight><img src = 'images/loss.png' class = cardpicture><div class = center-text id = loss_amount>Verlustmenge: </div></div>    <div class = titleboxRight1><img src = 'images/chosen.png' class = cardpicture><div class = center-text id = gain_amount>Gewinnmenge: </div></div>    <div class = titlebox><div class = center-text>Wie viele Karten möchten Sie aufdecken? </div></div>     <div class = titleboxMiddle1><div class = center-text id = num_loss_cards>Anzahl der Verlierkarten: </div></div>   <div class = titleboxLeft1><div class = center-text id = current_round>Aktuelle Rundenpunktzahl: 0</div></div>" +
  "<div class = buttonbox><button type='button' id = NoCardButton class = 'CCT-btn select-button' onclick = noCard()>Keine Karte</button><button type='button' id = turnButton class = 'CCT-btn select-button' onclick = endRound()>STOP/Umdrehen</button><button type='button' id = collectButton class = 'CCT-btn' disabled>Nächste Runde</button></div></div>" + "<img class='loading hidden' id=load src=images/soundload.gif>" + "<div id=taskWarning>Es sind noch </div>" +
  getBoard(-1);

var practiceSetup =
  "<div class = cct-box2>" +
  "<div class = titleBigBox>   <div class = titleboxLeft><div class = center-text id = game_round>Spielrunde: 1</div></div>   <div class = titleboxRight><img src = 'images/loss.png' class = cardpicture><div class = center-text id = loss_amount>Verlustmenge: 250</div></div>    <div class = titleboxRight1><img src = 'images/chosen.png' class = cardpicture><div class = center-text id = gain_amount>Gewinnmenge: 30</div></div>    <div class = titlebox><div class = center-text>Wie viele Karten möchten Sie aufdecken? </div></div>     <div class = titleboxMiddle1><div class = center-text id = num_loss_cards>Anzahl der Verlierkarten: 1</div></div>   <div class = titleboxLeft1><div class = center-text id = current_round>Aktuelle Rundenpunktzahl: 0</div></div>" +
  "<div class = buttonbox><button type='button' class = CCT-btn id = NoCardButton onclick = turnCards()>Keine Karte</button><button type='button' class = CCT-btn id = turnButton onclick = turnCards() disabled>STOP/Umdrehen</button></div></div>" +
  getBoard(2);

var practiceSetup2 =
  "<div class = cct-box2>" +
  "<div class = titleBigBox>   <div class = titleboxLeft><div class = center-text id = game_round>Spielrunde: 1</div></div>   <div class = titleboxRight><img src = 'images/loss.png' class = cardpicture><div class = center-text id = loss_amount>Verlustmenge: 750</div></div>    <div class = titleboxRight1><img src = 'images/chosen.png' class = cardpicture><div class = center-text id = gain_amount>Gewinnmenge: 10</div></div>    <div class = titlebox><div class = center-text>Wie viele Karten möchten Sie aufdecken? </div></div>     <div class = titleboxMiddle1><div class = center-text id = num_loss_cards>Anzahl der Verlierkarten: 3</div></div>   <div class = titleboxLeft1><div class = center-text id = current_round>Aktuelle Rundenpunktzahl: 0</div></div>" +
  "<div class = buttonbox><button type='button' class = CCT-btn id = NoCardButton onclick = turnCards()>Keine Karte</button><button type='button' class = CCT-btn id = turnButton onclick = turnCards() disabled>STOP/Umdrehen</button></div></div>" +
  getBoard(2);

/* ************************************ */
/* Set up jsPsych blocks */
/* ************************************ */
//Set up post task questionnaire
var post_task_block = {
  type: "survey-text",
  data: {
    trial_id: "post task questions"
  },
  questions: [
    "<p class = center-block-text >Fassen Sie bitte zusammen was Ihre Aufgabe war.</p>",
    "<p class = center-block-text >Haben Sie zusätzliche Kommentare zur Aufgabe??</p>"
  ],
  rows: [15, 15],
  columns: [60, 60],
  on_finish: assessPerformance
};

var pre_task_block = {
  type: "survey-text",
  data: {
    trial_id: "pre task questions"
  },
  questions: [
    '<p class = center-block-text>Bitte geben Sie Ihre Identifikationsnummer an</p>'
  ],
  rows: [15, 15],
  columns: [60, 60]
};

/* define static blocks */

var feedback_instruct_text =
  "Welcome to the experiment. This task will take around 25 minutes. Press <strong>enter</strong> to begin.";
var feedback_instruct_block = {
  type: "poldrack-text",
  cont_key: [13],
  data: {
    trial_id: "instruction"
  },
  text: getInstructFeedback,
  timing_post_trial: 0,
  timing_response: 180000
};
/// This ensures that the subject does not read through the instructions too quickly.  If they do it too quickly, then we will go over the loop again.


var instructions_block_1 = {
  type: "poldrack-instructions",
  data: { trial_id: "instruction" },
  pages: ["<div class = practiceText><div class = block-text2 id = instruct1></div></div>" +
    "<div class = cct-box2>"
    + "<div class = titleBigBox>   <div class = titleboxLeft><div class = center-text id = game_round>Spielrunde: 1</div></div>   <div class = titleboxRight><img src = 'images/loss.png' class = cardpicture><div class = center-text id = loss_amount>Verlustmenge: 750</div></div>    <div class = titleboxRight1><img src = 'images/chosen.png' class = cardpicture><div class = center-text id = gain_amount>Gewinnmenge: 10</div></div>    <div class = titlebox><div class = center-text>Wie viele Karten möchten Sie nehmen? </div></div>     <div class = titleboxMiddle1><div class = center-text id = num_loss_cards>Anzahl der Verlierkarten: 1</div></div>   <div class = titleboxLeft1><div class = center-text id = current_round>Aktuelle Rundenpunktzahl: 0</div></div>" +
    "<div class = buttonbox><button type='button' class = 'CCT-btn select-button' id = NoCardButton disabled>Keine Karte</button><button type='button' class = 'CCT-btn select-button' class = 'CCT-btn select-button' id = turnButton disabled>STOP/Umdrehen</button><button type='button' class = 'CCT-btn select-button' id = collectButton  disabled>Nächste Runde</button></div>" +
    "</div>" +
    getBoard(2) + "<div class = buttonbox2><button type='button' class = CCT-btn id = instructButton onclick= instructFunction()>Ergebnis sehen</button></div><div class = botoncillo ></div>"]
  ,
  allow_keys: false,
  show_clickable_nav: true,
  timing_post_trial: 1000
};


var instructions_block_2 = {
  type: "poldrack-instructions",
  data: { trial_id: "instruction" },
  pages: ["<div class = practiceText id=practice2><div class = block-text2 id = instruct2></div></div>" +
    "<div class = cct-box2>" +
    "<div class = titleBigBox>   <div class = titleboxLeft><div class = center-text id = game_round>Spielrunde: 1</div></div>   <div class = titleboxRight><img src = 'images/loss.png' class = cardpicture><div class = center-text id = loss_amount>Verlustmenge: 250</div></div>    <div class = titleboxRight1><img src = 'images/chosen.png' class = cardpicture><div class = center-text id = gain_amount>Gewinnmenge: 30</div></div>    <div class = titlebox><div class = center-text>Wie viele Karten möchten Sie nehmen? </div></div>     <div class = titleboxMiddle1><div class = center-text id = num_loss_cards>Anzahl der Verlierkarten: 3</div></div>   <div class = titleboxLeft1><div class = center-text id = current_round>Aktuelle Rundenpunktzahl: 0</div></div>" +
    "<div class = buttonbox><button type='button' class = 'CCT-btn select-button' id = NoCardButton disabled>Keine Karte</button><button type='button' class = 'CCT-btn select-button' class = 'CCT-btn select-button' id = turnButton disabled>STOP/Umdrehen</button><button type='button' class = 'CCT-btn select-button' id = collectButton  disabled>Nächste Runde</button></div>" +
    "</div>" +
    getBoard(2) + "<div class = buttonbox2><button type='button' class = CCT-btn id = instructButton onclick= instructFunction2()>Ergebnis sehen</button></div><div class = botoncillo ></div>"]
  ,
  allow_keys: false,
  show_clickable_nav: true,
  timing_post_trial: 1000
};

/*
var instruction_node = {
  timeline: [feedback_instruct_block, instructions_block],

  loop_function: function (data) {
    for (i = 0; i < data.length; i++) {
      if (data[i].trial_type == "poldrack-instructions" && data[i].rt != -1) {
        rt = data[i].rt;
        sumInstructTime = sumInstructTime + rt;
      }
    }
    if (sumInstructTime <= instructTimeThresh * 1000) {
      feedback_instruct_text =
        "Read through instructions too quickly.  Please take your time and make sure you understand the instructions.  Press <strong>enter</strong> to continue.";
      return true;
    } else if (sumInstructTime > instructTimeThresh * 1000) {
      feedback_instruct_text =
        "Done with instructions. Press <strong>enter</strong> to continue.";
      return false;
    }
  }
};
*/
var instruction_node_1 = {
  timeline: [instructions_block_1],
  /* This function defines stopping criteria */
  loop_function: function (data) {
    for (i = 0; i < data.length; i++) {
      if (data[i].trial_type == "poldrack-instructions" && data[i].rt != -1) {
        rt = data[i].rt;
        sumInstructTime = sumInstructTime + rt;
      }
    }
    if (sumInstructTime <= instructTimeThresh * 1000) {
      feedback_instruct_text =
        "Read through instructions too quickly.  Please take your time and make sure you understand the instructions.  Press <strong>enter</strong> to continue.";
      return true;
    } else if (sumInstructTime > instructTimeThresh * 1000) {
      feedback_instruct_text =
        "Done with instructions. Press <strong>enter</strong> to continue.";
      return false;
    }
  }
};

var instruction_node_2 = {
  timeline: [instructions_block_2],
  /* This function defines stopping criteria */
  loop_function: function (data) {
    for (i = 0; i < data.length; i++) {
      if (data[i].trial_type == "poldrack-instructions" && data[i].rt != -1) {
        rt = data[i].rt;
        sumInstructTime = sumInstructTime + rt;
      }
    }
    if (sumInstructTime <= instructTimeThresh * 1000) {
      feedback_instruct_text =
        "Read through instructions too quickly.  Please take your time and make sure you understand the instructions.  Press <strong>enter</strong> to continue.";
      return true;
    } else if (sumInstructTime > instructTimeThresh * 1000) {
      feedback_instruct_text =
        "Done with instructions. Press <strong>enter</strong> to continue.";
      return false;
    }
  }
};

var end_block = {
  type: "poldrack-text",
  //data: {
  //  trial_id: "end",
  // exp_id: "columbia_card_task_hot"
  //},
  text: "<div class = centerbox><p class = center-block-text>Finished with this task.</p></div>",
  //cont_key: [13],
  response_ends_trial: true,
  timing_post_trial: 1000,
  //on_finish: assessPerformance
};

var start_test_block = {
  type: "poldrack-text",
  data: {
    trial_id: "test_intro"
  },
  text: "<div class = centerbox><p class = center-block-text>We will now start the test. Press <strong>enter</strong> to begin.</p></div>",
  cont_key: [13],
  timing_post_trial: 1000,
  on_finish: function () {
    whichClickInRound = 0;
    whichLossCards = [riggedLossCards.shift()];
  }
};

var practice_block1 = {
  type: "single-stim-button",
  button_class: "select-button",
  stimulus: getPractice1,
  is_html: true,
  data: {
    trial_id: "stim",
    exp_stage: "practice"
  },
  timing_post_trial: 0,
  response_ends_trial: true,
  on_finish: function () {
    jsPsych.data.addDataToLastTrial({
      num_loss_cards: numLossCards,
      gain_amount: gainAmt,
      loss_amount: lossAmt,
      instruct_points: instructPoints
    });
    instructPoints = 0;
  }
};

var practice_block2 = {
  type: "single-stim-button",
  button_class: "select-button",
  stimulus: getPractice2,
  is_html: true,
  data: {
    trial_id: "stim",
    exp_stage: "practice"
  },
  timing_post_trial: 0,
  response_ends_trial: true,
  on_finish: function () {
    jsPsych.data.addDataToLastTrial({
      num_loss_cards: numLossCards,
      gain_amount: gainAmt,
      loss_amount: lossAmt,
      instruct_points: instructPoints
    });
    instructPoints = 0;
  }
};

var test_block = {
  type: "single-stim-button",
  button_class: "select-button",
  stimulus: getRound,
  is_html: true,
  data: {
    trial_id: "stim",
    exp_stage: "test"
  },
  timing_post_trial: 0,
  on_finish: appendTestData,
  response_ends_trial: true
};

var pre_test_block = {
  type: "single-stim-button",
  button_class: "select-button",
  stimulus: getPreRound,
  is_html: true,
  data: {
    trial_id: "pre_stim",
    exp_stage: "test"
  },
  timing_post_trial: 0,
  // timing_response: 0,
  on_finish: appendTestData,
  response_ends_trial: true
};

var test_node = {
  timeline: [test_block],
  loop_function: function (data) {
    if (currID == "collectButton") {
      roundPointsArray.push(roundPoints);
      roundOver = 0;
      roundPoints = 0;
      whichClickInRound = 0;
      whichRound = whichRound + 1;
      round_type =
        lossRounds.indexOf(whichRound) == -1 ? "rigged_win" : "rigged_loss";
      if (round_type == "rigged_loss") {
        whichLossCards = [riggedLossCards.shift()];
      }
      lossClicked = false;
      return false;
    } else {
      return true;
    }
  }
};

var pre_test_node = {
  timeline: [pre_test_block],
  loop_function: function (data) {
    if (currID == "collectButton") {
      roundPointsArray.push(roundPoints);
      roundOver = 0;
      roundPoints = 0;
      whichClickInRound = 0;
      whichRound = whichRound + 1;
      round_type =
        lossRounds.indexOf(whichRound) == -1 ? "rigged_win" : "rigged_loss";
      if (round_type == "rigged_loss") {
        whichLossCards = [riggedLossCards.shift()];
      }
      lossClicked = false;
      return false;
    } else {
      return true;
    }
  }
};

var payout_text = {
  type: "poldrack-text",
  text: getText,
  data: {
    trial_id: "reward"
  },
  cont_key: [13],
  timing_post_trial: 1000,
  on_finish: appendPayoutData
};

var payoutTrial = {
  type: "call-function",
  data: {
    trial_id: "calculate reward"
  },
  func: function () {
    totalPoints = math.sum(roundPointsArray);
    randomRoundPointsArray = jsPsych.randomization.repeat(roundPointsArray, 1);
    prize1 = randomRoundPointsArray.pop();
    prize2 = randomRoundPointsArray.pop();
    prize3 = randomRoundPointsArray.pop();
    performance_var = prize1 + prize2 + prize3;
  }
};

/* create experiment definition array */

var columbia_card_task_hot_experiment_i = [instruction_node_1];
var columbia_card_task_hot_experiment_i2 = [instruction_node_2];
var columbia_card_task_hot_experiment_p = [practice_block1];
var columbia_card_task_hot_experiment_p2 = [practice_block2];
var columbia_card_task_hot_experiment = [];

//columbia_card_task_hot_experiment.push(instruction_node);
//columbia_card_task_hot_experiment.push(practice_block1);
//columbia_card_task_hot_experiment.push(practice_block2);

//columbia_card_task_hot_experiment.push(start_test_block);
columbia_card_task_hot_experiment.push(pre_task_block);
for (i = 0; i < numRounds; i++) {
  columbia_card_task_hot_experiment.push(pre_test_node);
  //columbia_card_task_hot_experiment.push(test_node);
}

//columbia_card_task_hot_experiment.push(payoutTrial);
//columbia_card_task_hot_experiment.push(payout_text); // <-- This is to summarize the poins of the user
columbia_card_task_hot_experiment.push(post_task_block); // <-- This is the input fields etc
columbia_card_task_hot_experiment.push(end_block); // <-- This downloads the csv file
