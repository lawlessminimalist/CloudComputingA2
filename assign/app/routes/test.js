const express = require('express');
const logger = require('morgan');
const axios = require("axios");
const router = express.Router();
var Twit = require('twit');
var io = require('socket.io');
var fs = require('fs');

router.post('/:number',(req,res)=>{
    //keep the tweets array as a public item so we can apppend all tweets at to it
    let tweetArray=[];
    let tweets = req.body
    tweets.forEach(tweet => {
        io.on('connection', function(socket) {
            T.get('search/tweets', { q: tweet, count: req.params.number }, function(err, data, response) {
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
    });
    res.send(tweetArray)
    res.end()
    
    var T = new Twit({
      consumer_key:         'pXoX1DPcMooGje3jECA4ijHDR',
      consumer_secret:      'FlUJvouA1zrFuERX4ExTjMUFQ4Bfo1kmGpySMjMwoRyhpIK9Rq',
      access_token:         '1443764547085422597-LxGhqq0aQCkGQ3hf2IqUpeSH8dhTVA',
      access_token_secret:  'W2I4C9pBRw2MIHMAcJ8kGpN5btWEtB6SqpSibL8YR2w1E',
      timeout_ms:           60*1000,  // optional HTTP request timeout to apply to all requests.
    });
})

module.exports = router;
