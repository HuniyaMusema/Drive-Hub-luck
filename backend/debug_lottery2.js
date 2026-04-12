const http = require('http');

['current', 'taken'].forEach(path => {
  http.get(`http://127.0.0.1:5000/api/lottery/${path}`, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => console.log(`/${path} : ${res.statusCode} : ${data.substring(0, 100)}`));
  }).on('error', err => console.log('Error:', err.message));
});
