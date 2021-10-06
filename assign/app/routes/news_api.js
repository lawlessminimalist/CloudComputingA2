const express = require('express');
const logger = require('morgan');
const axios = require("axios");
const router = express.Router();
var Sentiment = require('sentiment');
var sentiment = new Sentiment();
router.use(logger('tiny'));
router.get('/:query', (req, res) => {
    //create options for calling news API
    const options = createNewsOptions(req.params.query,req.params.country);
    const url = `https://${options.hostname}${options.path}`;
    //fetch data from API, given the options generatred
        axios.get(url)
            .then( (response) => {
                if (response.status === 200) {
                    res.writeHead(200,{'content-type': 'application/json'});
                    return response.data;

                }
                throw new Error("Network response was not ok.");
            })
            //given a correct response, execute sentiment analysis, append to json and send back
            .then((data) => {
                data = sentimentAppend(data)
                res.write(JSON.stringify(data));
                res.end();
            })
            .catch((error) => {
                console.error(error);
            })
});

//define API + search params 
const newsAPI = {
    api_key: "67124a4caae14644882d2d2a0d422fcf",
    sortBy:"publishedAt",
    language:"en"
};
//utilise the sentiment module to sort the articles based on the sentiment score of their description
function sentimentAppend(jsonfile){
    target = jsonfile.articles
    for(let i=0; i < target.length; i++) {
        if(target[i].description === null){
            delete jsonfile.articles[i];
        }
        else{
            var result = sentiment.analyze(target[i].description);
            if(result.score > 1){
                jsonfile.articles[i].sentiment =  { sentiment: "Positive"}; 
            }
            else if(result.score < 1){
                jsonfile.articles[i].sentiment  =  { sentiment: "Negative"}; 
            }
            else{
                jsonfile.articles[i].sentiment  =  { sentiment: "Neutral"}; 
            }
        }

    }
    return jsonfile;
}

//build the query for News API from route passed in/defined keys and options
function createNewsOptions(query,country) {
    const options = {
        hostname: 'newsapi.org/',
        path: 'v2/everything?',
        }
    const str = 'q=' + query
    +'&sortBy=' + newsAPI.sortBy
    +'&language=' + newsAPI.language
    +'&apiKey='+newsAPI.api_key;
    options.path += str;
    return options;
}



module.exports = router;

