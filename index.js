var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');

var yoUI = require('./lib/yeoman-ui');

io.on('connection', function(socket) {
  yoUI.init(socket);
});

app.use('/', express.static('client'));
app.get('/dist/:distId/:distName', function(req, res) {
  /* * /
  res.set({
    'Content-Type': 'text/plain',
    'Content-disposition': 'attachment; filename=' + req.params.distId + '.txt'
  });
  return res.sendFile(path.join(__dirname, 'dist/', req.params.distId + '.zip'));
  /**/
  return res.download(path.join(__dirname, 'dist/', req.params.distId, req.params.distName + '.zip'));
});

http.listen(3000);
console.log('Application Started on http://localhost:3000/');