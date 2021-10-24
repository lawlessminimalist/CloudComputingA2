const express = require('express');
const logger = require('morgan');
const app = express();
const axios = require("axios");
const router = express.Router();
router.use(logger('tiny'));
var Twit = require('twit');
const server = require('http').Server(app);
var io = require('socket.io')(server);
var fs = require('fs');

var T = new Twit({
    consumer_key:         'pXoX1DPcMooGje3jECA4ijHDR',
    consumer_secret:      'FlUJvouA1zrFuERX4ExTjMUFQ4Bfo1kmGpySMjMwoRyhpIK9Rq',
    access_token:         '1443764547085422597-LxGhqq0aQCkGQ3hf2IqUpeSH8dhTVA',
    access_token_secret:  'W2I4C9pBRw2MIHMAcJ8kGpN5btWEtB6SqpSibL8YR2w1E',
    timeout_ms:           60*1000,  // optional HTTP request timeout to apply to all requests.
  });


router.get('/:number', (req,res) => {
    console.log("Fetching tweets")
    url = 'http://127.0.0.1:3006/tweets/100'
    console.log(url)
    tweet_arr = []

    axios.post(url, {
        tweets:['cats','dogs']
    })
    .then( (response) => {
        console.log(response.status)
        if (response.status == 200) {
            return response.data;
        }
        throw new Error("Network response was not ok.");
    })
    .then((response) =>{
        let tweets = {"tweets":response}
        res.write(JSON.stringify(tweets));
        res.end()
    })
    .catch((error) => {
        console.error(error.message);
    })


});

    
    


module.exports = router;
