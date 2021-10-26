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
const analyseTweets = require('./spellcheck')
var Sentiment = require('sentiment');
var sentiment = new Sentiment();

var T = new Twit({
    consumer_key:         'pXoX1DPcMooGje3jECA4ijHDR',
    consumer_secret:      'FlUJvouA1zrFuERX4ExTjMUFQ4Bfo1kmGpySMjMwoRyhpIK9Rq',
    access_token:         '1443764547085422597-LxGhqq0aQCkGQ3hf2IqUpeSH8dhTVA',
    access_token_secret:  'W2I4C9pBRw2MIHMAcJ8kGpN5btWEtB6SqpSibL8YR2w1E',
    timeout_ms:           60*1000,  // optional HTTP request timeout to apply to all requests.
  });


router.post('/', (req,res) => {
    url = 'http://ec2-54-252-146-192.ap-southeast-2.compute.amazonaws.com:3000/tweets'
    tweet_arr = []

    axios({
        method: 'post',
        url: url,
        data: {
            tweets: req.body.allTweets
        }
      })
    .then( (response) => {
        if (response.status == 200) {
            return response.data;
        }
        throw new Error("Network response was not ok.");
    })
    .then((response) =>{
        //find out where the data comes from in our twitter instance
        let searchTweets = req.body.searchTweets
        let responseLength = Object.getOwnPropertyNames(response).length - 1
        let sortedTweets = []
        //sort the tweets based off whether they match the search tweets in any way
        searchTweets.forEach(tweet=>{
            tempTweetArray = []
            for(let i = 0; i < responseLength;i++){
                if(response[i].includes(tweet)){
                    tempTweetArray.push(response[i])
                }
            }
            sortedTweets.push(tempTweetArray)
        })
        return sortedTweets
    })
    .then((sorted)=>{
        //now that the data has been sorted by tweets,
        //we need to do some processing on the data
        //first we will do a spellcheck on the data
        //and then next we will perform sentiment analysis
        let accuracies = []
        let sentiments = []
        sorted.forEach(tweets => {
            let accuracy = analyseTweets(tweets)
            accuracies.push(accuracy)

            var result = sentiment.analyze(tweets.toString());
            sentiments.push(result.score)
        })        
        //now that we've done our data processing, we can export
        //and send the data to be used on the front-end
        let tweetsArray = []
        let searchTweets = req.body.searchTweets
        for(let i = 0; i < searchTweets.length; i++){
            let tempObject = {
                "tweet":searchTweets[i],
                "accuracy":accuracies[i],
                "sentiment":sentiments[i]
            }
            tweetsArray.push(tempObject)
        }
        res.write(JSON.stringify(tweetsArray));
        res.end()
    })
    .catch((error) => {
        console.error(error.message);
    })
});

module.exports = router;