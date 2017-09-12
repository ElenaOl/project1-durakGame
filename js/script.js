console.log("up and running")

var pile = [];
var playerCards = [];
var compCards = [];
var attackBoard = [];
var defendBoard = [];
var trumpCard;
var isUserAttack;
var backImage = url(images/back.jpg);

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
//
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




var updateUi = function(){
 setPlayerCardsUi();
}


var addCardToElement = function(img, elementId, elementClass){
  var elementImg = document.createElement('img');
  elementImg.setAttribute('src', img);
  elementImg.setAttribute('class', elementClass);
  $("#" + elementId).append(elementImg);
}

var setPlayerCardsUi = function(){
  $("#playerHand").innerText = "";
  for(var i = 0; i< playerCards.length; i++){
    addCardToElement(playerCards[i].cardImage, "playerHand", "playerCards");
  }
}
