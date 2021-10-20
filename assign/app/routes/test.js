var Twit = require('twit');
const express = require('express');
const app = express();
const server = require('http').Server(app);
var io = require('socket.io')(server);
var fs = require('fs');



// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

io.on('connection', function(socket) {

    T.get('search/tweets', { q: 'daniel craig', count: 100 }, function(err, data, response) {
      var tweetArray=[];
        for (let index = 0; index < data.statuses.length; index++) {
            const tweet = data.statuses[index];
            var tweetbody = {
              'text': tweet.text
            }
            tweetArray.push(tweetbody);
        }     
        io.emit('allTweet',tweetArray)
    })
});

var T = new Twit({
  consumer_key:         'pXoX1DPcMooGje3jECA4ijHDR',
  consumer_secret:      'FlUJvouA1zrFuERX4ExTjMUFQ4Bfo1kmGpySMjMwoRyhpIK9Rq',
  access_token:         '1443764547085422597-LxGhqq0aQCkGQ3hf2IqUpeSH8dhTVA',
  access_token_secret:  'W2I4C9pBRw2MIHMAcJ8kGpN5btWEtB6SqpSibL8YR2w1E',
  timeout_ms:           60*1000,  // optional HTTP request timeout to apply to all requests.
});

// listen for requests :)
const listener = server.listen(process.env.PORT, function() {
  console.log('Your app is listening on port ' + listener.address().port);
});
