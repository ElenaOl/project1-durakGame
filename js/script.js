$.getJSON('data.json', function(data){
   console.log(data);
   $("#thing").text(data.object.nested);
})

// console.log(JSON.stringify({a:1,b:2}));
// console.log(JSON.parse('{"a":1,"b":2}'));


