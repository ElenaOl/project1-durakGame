console.log("up and running")

var pile = [];
var playerCards = [];
var compCards = [];
var attackBoard = [];
var defenseBoard = [];
var trumpCard;
var trumpCardWasTaken;
var isUserAttack;



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
    }
  }
}  


//randomize desicion to start game
var doesPlayerStart = function(){
  return Math.random() < 0.5;
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
  return nonTrumpCards[0];

  // TODO what if all cards are trump
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
  if (checkWin()){
    return;
  }

  if(attackBoard.length === 6){
    attackOver();
  }
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

  checkWin();
  updateUi();
}

var discardCards = function(){
  attackOver();
  var compAttackCard = chooseCardToStartAttack();
  removeCard(compCards, compAttackCard);
  attackBoard.push(compAttackCard);
  updateUi();
}

var pickUpCards = function(){
  playerCards = playerCards.concat(attackBoard, defenseBoard);
  attackOver();
  isUserAttack = false;
  var compAttackCard = chooseCardToStartAttack();
  removeCard(compCards, compAttackCard);
  attackBoard.push(compAttackCard);
  updateUi();
}

var restart = function(){
  var jsonReq = $.getJSON('../json/data.json');
  jsonReq.success(function(data){
      pile = data;
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
        updateUi();
      }else{
        updateUi();
        alert("Please choose a card for attack");
      }
  });
}





var checkWin = function(){
  if(!trumpCardWasTaken){
    return;
  }

  if (playerCards.length === 0){
      alert("You Won");
  }else if(compCards.length === 0){
      alert("sorry, but you lost")
  }else{
    return;
  }

  restart();
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




var playerPickUpCards = $("#pick-up-btn").click(pickUpCards);
var playerDiscardCards = $("#discard-btn").click(discardCards);
var restartGame = $("#restart-btn").click(restart);

restart();

 
