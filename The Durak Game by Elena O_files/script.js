console.log("up and running")

var pile = [];
var playerCards = [];
var compCards = [];
var attackBoard = [];
var defenceBoard = [];
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



var jsonReq = $.getJSON('../json/data.json');
jsonReq.success(function(data){
    pile = data;
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
      //playerAttack();
    }
    



});



var addToSixCards = function(array){
  for (var i=array.length; i<6; i++){
    var dealingCard = pile.pop();
    array.push(dealingCard);
  }
}  

var doesPlayerStart = function(){
  return Math.random() < 0.5;
}


// sorts the recieved array. returns nothing
var sortCards = function(array){
 array.sort(function(card1,card2){
  return card1.rank-card2.rank;
 });

}
//decision for computer to start with lowest card that is not a trump card
var chooseCardToStartAttack = function(){
  var nonTrumpCards = compCards.filter(function(card){
   return trumpCard.suit !== card.suit;
  });
  sortCards(nonTrumpCards);
  return nonTrumpCards[0];
}

//this function removes spesific card from array
var removeCard = function(array, cardToRemove){
  var index = array.indexOf(cardToRemove);
  array.splice(index, 1);
}

var test = function(){
  attackBoard.push(pile.pop());
  defenceBoard.push(pile.pop());
  attackBoard.push(pile.pop());
  defenceBoard.push(pile.pop());
  attackBoard.push(pile.pop());
  defenceBoard.push(pile.pop());
  attackBoard.push(pile.pop());
  defenceBoard.push(pile.pop());
  attackBoard.push(pile.pop());
  defenceBoard.push(pile.pop());
}
//this function checks if defence card can beet attack card
var isDefenceLegit = function(attackCard, defenceCard){
  if (attackCard.suit === defenceCard.suit){
    return defenceCard.rank > attackCard.rank;
  }else{
    // suit is different for attack and defence cards
    return defenceCard.suit === trumpCard.suit;
  }
}

var playerClickedOnCard = function(){
  var cardImg = this.getAttribute('src');
  var playerCard = playerCards.filter(function(card){
   return card.cardImage === cardImg;
  })[0];

  if(isUserAttack === false){
    var attackCard = attackBoard[attackBoard.length - 1];
    var isLegit = isDefenceLegit(attackCard, playerCard);
    if(isLegit === false){
      return;
    }
    defenceBoard.push(playerCard);
    removeCard(playerCards, playerCard);
  }
  updateUi();
}


/////////////////////////////////////////////////////////////////////////////
//////////////////////////////// UI /////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////


var updateUi = function(){
 setPlayerCardsUi();
 setCompCardsUi();
 setPileUi();
 setTrumpCardUi();
 // test();
 setAttackBoardUi();
 setDefenceBoardUi();
 //playerAttack();
 
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
    addCardToElement(trumpCard.cardImage, "trupmCard", "card");
  }
}


var setAttackBoardUi = function(){
  $("#attackBoard").empty();
  for(var i=0; i<attackBoard.length; i++){
   addCardToElement(attackBoard[i].cardImage, "attackBoard", "card");
  }
}
var setDefenceBoardUi = function(){
  $("#defenceBoard").empty();
  for(var i=0; i<defenceBoard.length; i++){
   addCardToElement(defenceBoard[i].cardImage, "defenceBoard", "card");
  }
}  
