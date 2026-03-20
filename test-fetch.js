const http = require('http');

fetch('http://localhost:8000/api/books?ids=1', {
  method: 'GET',
  headers: {
    'Accept': 'application/json'
  }
})
.then(res => res.json())
.then(data => console.log(JSON.stringify(data, null, 2)))
.catch(err => console.error(err));
