const express = require('express');
const logger = require('morgan');
const axios = require("axios");
const router = express.Router();
var Sentiment = require('sentiment');
let randomWords = require('random-words')
let natural = require('natural')
var sentiment = new Sentiment();
router.use(logger('tiny'));


                                  

router.get('/:query/:number', (req, res) => {
    //create options for calling news API
    const options = createTwitterOptions(req.params.query,req.params.number);
    const url = `https://${options.hostname}${options.path}`;
    //fetch data from API, given the options generatred
        axios.get(url, {
            headers: {
              'Authorization': twitterAPI.Authorization,
              'Cookie': twitterAPI.Cookie
            }
          })
            .then( (response) => {
                if (response.status === 200) {
                    res.writeHead(200,{'content-type': 'application/json'});
                    return response.data.data;

                }
                throw new Error("Network response was not ok.");
            })
            .then((data) => {
                let accuracyRate = analyseTweets(data)
                //console.log(sentiment_data)
                res.write(JSON.stringify(accuracyRate));
                res.end();
            })
            .catch((error) => {
                console.error(error);
            })
});

//define API + search params 
const twitterAPI = {
    Authorization: "Bearer AAAAAAAAAAAAAAAAAAAAANYMUQEAAAAAfB%2Fdi%2BQEcUPTqNfv24uzZoixN8I%3DNyYq9GuTSseIlJng7OXKiFlamsWQgvYAgiquRz1ncXfvVeiyBU",
    Cookie:`guest_id=v1%3A163314707693767808; personalization_id="v1_YREv88AzxYYiFc7YJrKwUw=="'`
};

//build the query for News API from route passed in/defined keys and options
function createTwitterOptions(query,number) {
    const options = {
        hostname: 'api.twitter.com',
        path: '/2/tweets/search/recent',
        }
    const str = '?query=' + query
    +'&max_results=' + number;
    options.path += str;
    return options;
}

//this section will analyse the tweets and check for their spelling accuracy
function analyseTweets(tweets) {
    let tweetsCorpus = [];
    tweets.forEach(tweet => {
        let words = tweet.text.split(" ")
        words.forEach(word=>{
            tweetsCorpus.push(word)
        })
    });

    
    let bowCorpus = randomWords(tweetsCorpus.length * 2)

    let spellcheck = new natural.Spellcheck(bowCorpus)
    let correctionCount = 0;
    tweetsCorpus.forEach(tweet=>{
        let temp = spellcheck.getCorrections(tweet,1)
        if(temp.length > 0) {
            correctionCount++
        }
    })
    let accuracyRate = (correctionCount/tweetsCorpus.length) * 100
    return accuracyRate
}

module.exports = router;

