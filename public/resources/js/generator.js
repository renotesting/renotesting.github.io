function generateRadomNumber(){
  var uniqueRandoms = [];
  var numRandoms = 1000;
  if (!uniqueRandoms.length) {
      for (var i = 0; i < numRandoms; i++) {
          uniqueRandoms.push(i);
      }
  }
  var index = Math.floor(Math.random() * uniqueRandoms.length);
  var val = uniqueRandoms[index];
  uniqueRandoms.splice(index, 1);
    
  var d = new Date();
  var date = d.getDate();
  var month = d.getMonth() +1
  var year = d.getFullYear()
  document.write("Today is: " + year + '-' + month + '-' + date + ".<br>")
  let current = Date.now()
  random = parseInt(val.toString() + current.toString(), 10)
  document.write('Loyalty ID: ' + random)
}