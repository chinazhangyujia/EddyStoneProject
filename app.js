var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({extended: false});
var path = require('path');
var mqtt = require('mqtt');
var mongoose = require('mongoose');
mongoose.connect('localhost:27017/Gainesville');
var socket = require('socket.io');
var client = mqtt.connect('tcp://broker.hivemq.com:1883');
//var client = mqtt.connect('mqtt://test.mosca.io');
//var client = mqtt.connect('192.168.0.103:1883');
var router = require('./router/index');
var PORT = 8080;
var Schema = mongoose.Schema;

var UserDataSchema = new Schema({
  user_id: String,
  missing_people_id: String
});

exports.UserData = UserData = mongoose.model('UserData', UserDataSchema);

var server = app.listen(PORT, function(){
  console.log('listening ' + PORT);
});


app.use(urlencodedParser);
app.use('/', router);
app.use('/static', express.static('./static'));

var io = socket(server);

app.get('/', function(req, res){
  res.sendFile(path.join(__dirname, './view', 'user.html'));
});

client.on('connect', function(){
  client.subscribe('Gainesville');
  console.log('subscribe to Gainesville');
});


client.on('message', function(topic, message){
  if (topic === 'Gainesville'){
      //var message_string = message.toString();
      console.log(message.toString());
      var temp = message.toString().split(",");
      var user_id = temp[0];
      var missing_people_id = temp[1];
      var status = temp[2];
      console.log(status);
      if (status === 'create'){
        var newUser = {user_id: user_id, missing_people_id: missing_people_id};
        var newUserData = new UserData(newUser);
        newUserData.save();
        console.log(newUserData + ' is in missing list');
      }
      else if (status === 'delete'){
        console.log('ready to delete');
        UserData.findOneAndRemove({missing_people_id: missing_people_id}, function(err){
          if (err)
            return console.log(err);
          else {
            console.log(missing_people_id + ' is deleted');
          }
        });
      }
  }
});

io.on('connection', function(socket){
  console.log(socket.id + " is connected");
  socket.on('update_location', function(data){
    io.sockets.emit(data.id, {location: data.location});
  });

  // socket.on('test', (data) => {
  //   io.emit('test', {});
  // });
});
