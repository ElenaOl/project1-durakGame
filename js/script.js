console.log("up and running")

var pile = [];
var playerCards = [];
var compCards = [];
var attackBoard = [];
var defenseBoard = [];
var trumpCard;
var trumpCardWasTaken;
var isUserAttack;

var playerScore = 0;
var compScore = 0;

if(localStorage["player"] === undefined){
  localStorage.player = 0;
}
if(localStorage["comp"] === undefined){
  localStorage.comp = 0;
}

function shuffle(a) {
  console.log("shuffling");
    var j, x, i;
    for (i = a.length; i; i--) 
    {
        j = Math.floor(Math.random() * i);
        x = a[i - 1];
        a[i - 1] = a[j];
        a[j] = x;
    }
}


//this function takes cards from the pile and trumpCard and pushes them to the received array
var addToSixCards = function(array){
  for (var i=array.length; i<6; i++){
    var dealingCard = pile.pop();
    if (dealingCard === undefined){
      if (!trumpCardWasTaken){
        array.push(trumpCard);
        trumpCardWasTaken = true;
      }
      return;   
    }else{
      array.push(dealingCard);
      sortCardsBySuit(array);
    }
  }
}  

var sortCardsBySuit = function(array){
    array.sort(function(card1,card2){
     return card1.suit < card2.suit;
  });
}


//desicion to start game
var doesPlayerStart = function(){
  var playerTrumpCards = playerCards.filter(function(card){
      return trumpCard.suit === card.suit;
    });

  var compTrumpCards = compCards.filter(function(card){
      return trumpCard.suit === card.suit;
    });

  sortCards(compTrumpCards);
  sortCards(playerTrumpCards);
  
  if (compTrumpCards.length !== 0 && playerTrumpCards.length !== 0){
    //both have trump cards
    return (playerTrumpCards[0].rank < compTrumpCards[0].rank);
  }
  if (compTrumpCards.length === 0 && playerTrumpCards === 0){
    //both don't have trump cards
    return Math.random() > 0.5;
  }
  if (compTrumpCards.length === 0 && playerTrumpCards !== 0){
    //only player has trump cards
    return true;
  }
  
  //only comp has trump cards
  return false; 
} 
  


// sorts the recieved array. returns nothing
var sortCards = function(array){
  array.sort(function(card1,card2){
    return card1.rank - card2.rank;
  });
}

//decision for computer to start with lowest card that is not a trump card
var chooseCardToStartAttack = function(){
  var nonTrumpCards = compCards.filter(function(card){
      return trumpCard.suit !== card.suit;
    });
  sortCards(nonTrumpCards);
  if (nonTrumpCards.length > 0){
    return nonTrumpCards[0];
  }
  
  // only trump cards if we got here
  sortCards(compCards);
  return compCards[0];
}


var doesSameRankExist = function(card, array){
  for (var i=0; i<array.length; i++){
    if (array[i].rank === card.rank){
      return true;
    }
  }
  return false;
}


// this function picks nonTrump compCard that is of the same rank as one of the cards on attack or defense boards
var chooseCardToContinueAttack = function(){
 //only rank of the cards on the board matters, looking for nonTrump Cards to add to the attack
  var nonTrumpCards = compCards.filter(function(card){
      return trumpCard.suit !== card.suit;
    });

  for(var i=0; i< nonTrumpCards.length; i++){
   if(doesSameRankExist(nonTrumpCards[i], attackBoard) === true 
    || doesSameRankExist(nonTrumpCards[i], defenseBoard) === true){
     return nonTrumpCards[i];
   }
  }
}


// this function checking if the card that player picked is of the same rank as cards on the board (attack or defence arrays)
var isPlayerAttackLegit = function(playerCard){
  if (attackBoard.length === 0){
    return true;
  }

  return (doesSameRankExist(playerCard, attackBoard) === true 
    || doesSameRankExist(playerCard, defenseBoard) === true);
}


//this function removes spesific card from array
var removeCard = function(array, cardToRemove){
  var index = array.indexOf(cardToRemove);
  array.splice(index, 1);
}


//this function checks if defense card can beat attack card
var isDefenseLegit = function(attackCard, defenseCard){
  if (attackCard.suit === defenseCard.suit){
    return defenseCard.rank > attackCard.rank;
  }else{
    // suit is different for attack and defense cards
    return defenseCard.suit === trumpCard.suit;
  }
}


// choosing card for computer defense
var chooseCardToDefend = function(attackCard){
  //should be of the same suit as attackCard but higher or trump card
  var compCardsOfTheSameSuitAsAttack = compCards.filter(function(compCard){
      return compCard.suit === attackCard.suit;
    });

  var higherThenAttackCard = compCardsOfTheSameSuitAsAttack.filter(function(compCard){
      return compCard.rank > attackCard.rank;
    });

  if (higherThenAttackCard.length >0){
    sortCards(higherThenAttackCard);
    return higherThenAttackCard[0];
  }

  // comp has no nonTrumpcards for defense, need to find trumpCard
  if(attackCard.suit === trumpCard.suit){
    return;
  }

  // choose lowest trumpcard to defense
  var compCardsOfTheSameSuitAsTrump = compCards.filter(function(compCard){
      return compCard.suit === trumpCard.suit;
    });

  sortCards(compCardsOfTheSameSuitAsTrump);
  return compCardsOfTheSameSuitAsTrump[0];
}


var attackOver = function(){
  attackBoard = [];
  defenseBoard = [];
  addToSixCards(compCards);
  addToSixCards(playerCards);
  isUserAttack = !isUserAttack;
}

var playerDefense = function(playerCard){
  var attackCard = attackBoard[attackBoard.length - 1];
  var isLegit = isDefenseLegit(attackCard, playerCard);
  
  if(isLegit === false){
    return;
  }

  defenseBoard.push(playerCard);
  removeCard(playerCards, playerCard);
  
  if (checkWin()){
    return;
  }

  if(attackBoard.length === 6){
    attackOver();
    return;
  }

  var compCardToAttack = chooseCardToContinueAttack();
  if (compCardToAttack === undefined){ //discarding cards
    attackOver();
    return;
  }

  // comp has card to add to attack
  attackBoard.push(compCardToAttack);
  removeCard(compCards, compCardToAttack);

  checkWin();
}

var playerAttack = function(playerCard){
  var isLegit = isPlayerAttackLegit(playerCard);
  if(isLegit === false){
    return;
  }

  attackBoard.push(playerCard);
  removeCard(playerCards, playerCard);
  
  if (checkWin()){
    return;
  }

  //comp defense
  var compDefense = chooseCardToDefend(playerCard);
  if (compDefense === undefined){
    compCards = compCards.concat(attackBoard, defenseBoard);
    attackOver(); 
    isUserAttack = true;
    return;
  }

  // comp has a card to defend
  defenseBoard.push(compDefense);
  removeCard(compCards, compDefense);
  
  if(attackBoard.length === 6){
    attackOver();
  }

  checkWin();
}

var playerClickedOnCard = function(){
  var cardImg = this.getAttribute('src');
  var playerCard = playerCards.filter(function(card){
   return card.cardImage === cardImg;
  })[0];

  if(isUserAttack === false){
    playerDefense(playerCard);
  }else{
    //player attacks
    playerAttack(playerCard);
  }  

  updateUi();
}

var discardOrPickUpCards = function(){
  if(isUserAttack){
    attackOver();
  }else{
    playerCards = playerCards.concat(attackBoard, defenseBoard);
    attackOver();
    isUserAttack = false;
  }

  var compAttackCard = chooseCardToStartAttack();
  removeCard(compCards, compAttackCard);
  attackBoard.push(compAttackCard);
  updateUi();
  checkWin();
}


var restart = function(){
  pile = getAllCards();
  playerCards = [];
  compCards = [];
  attackBoard = [];
  defenseBoard = [];

  console.log(pile);
  shuffle(pile);
  
  addToSixCards(playerCards);
  addToSixCards(compCards);
  trumpCard = pile.pop();
  trumpCardWasTaken = false;
  isUserAttack = doesPlayerStart();
  if (isUserAttack === false){
    var compAttackCard = chooseCardToStartAttack();
    removeCard(compCards, compAttackCard);
    attackBoard.push(compAttackCard);
  }
  
  updateUi();
}





var checkWin = function(){
  if(!trumpCardWasTaken){
    return false;
  }

  if (playerCards.length === 0){
      alert("You Won");
      playerScore +=1;
      localStorage.player = parseInt(localStorage.player) + 1;
  }else if(compCards.length === 0){
      alert("sorry, but you lost")
      compScore +=1;
      localStorage.comp = parseInt(localStorage.comp) + 1;
  }else{
    // both have cards
    return false;
  }

  restart();
  return true;
}



/////////////////////////////////////////////////////////////////////////////
//////////////////////////////// UI /////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////


var updateUi = function(){
 setPlayerCardsUi();
 setCompCardsUi();
 setPileUi();
 setTrumpCardUi();
 setAttackBoardUi();
 setDefenseBoardUi();
 updateScoreUi();
 updateWhoAttackUi();
 updateTotalScoreUi();
}


var addCardToElement = function(img, elementId, elementClass){
  var elementImg = document.createElement('img');
  elementImg.setAttribute('src', img);
  elementImg.setAttribute('class', elementClass);
  console.log(elementImg);
  $("#" + elementId).append(elementImg);
  return elementImg;
}

var setPlayerCardsUi = function(){
  $("#playerHand").empty();
  for(var i = 0; i< playerCards.length; i++){
    var cardElement = addCardToElement(playerCards[i].cardImage, "playerHand", "card");
    cardElement.addEventListener("click", playerClickedOnCard);

  }
}

var setCompCardsUi = function(){
  $("#compHand").empty();
  for(var i = 0; i< compCards.length; i++){
    addCardToElement("images/back.jpg", "compHand", "card");
  }
}


var setPileUi = function(){
  $("#pile").empty();
  if(pile.length > 0){
    addCardToElement("images/back.jpg", "pile", "card");
  }
}

var setTrumpCardUi = function(){
  $("#trumpCard").empty();
  if(trumpCardWasTaken === false){
    addCardToElement(trumpCard.cardImage, "trumpCard", "card");
  }else if (trumpCardWasTaken === true){
   addCardToElement(trumpCard.cardImage, "trumpCard", "smallCard");
  }
}


var setAttackBoardUi = function(){
  $("#attackBoard").empty();
  for(var i=0; i<attackBoard.length; i++){
   addCardToElement(attackBoard[i].cardImage, "attackBoard", "card");
  }
}

var setDefenseBoardUi = function(){
  $("#defenseBoard").empty();
  for(var i=0; i<defenseBoard.length; i++){
   addCardToElement(defenseBoard[i].cardImage, "defenseBoard", "card");
  }
}  


var playerDiscardCards = $("#discard-pick-up-btn").click(discardOrPickUpCards);
var restartGame = $("#restart-btn").click(restart);

var updateScoreUi = function(){
  $("#playerScore").empty();
  $("#compScore").empty();
  $("#playerScore").append("<h3>Your score</br>" + playerScore + "</h3>");
  $("#compScore").append("<h3>Computer score</br>" + compScore + "</h3>");
}

var updateWhoAttackUi = function(){
  $("#who-attack").empty();
  if(isUserAttack){
    $("#who-attack").append("<h3>Player attack</h3>").css("color", "#FF4500");
  }else{
    $("#who-attack").append("<h3>Computer attack</h3>").css("color", "#2E8B57");
  }
}

function updateTotalScoreUi(){
  $("#playerHighScore").empty();
  $("#compHighScore").empty();
  $("#playerHighScore").append("<h3>Your total wins</br>" + localStorage.player + "</h3>");
  $("#compHighScore").append("<h3>Comp total wins</br>" + localStorage.comp + "</h3>");
}  

// Get the modal
var modal = document.getElementById('myModal');

// Get the button that opens the modal
var btn = document.getElementById("myBtn");

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

// When the user clicks the button, open the modal 
btn.onclick = function() {
    modal.style.display = "block";
}

// When the user clicks on <span> (x), close the modal
span.onclick = function() {
    modal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
    if (event.target === modal) {
        modal.style.display = "none";
    }
}

restart();

 
