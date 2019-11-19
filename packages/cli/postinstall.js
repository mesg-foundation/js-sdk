var fs = require('fs');

try {  
    var data = fs.readFileSync('message.txt', 'utf8');
    console.log(data.toString());    
} catch(e) {
    console.log('Error:', e.stack);
}