let randomWords = require('random-words')
let natural = require('natural')

//this section will analyse the tweets and check for their spelling accuracy
function analyseTweets(tweets) {
    let tweetsCorpus = [];
    tweets.forEach(tweet => {
        let words = tweet.split(" ")
        words.forEach(word=>{
            tweetsCorpus.push(word)
        })
    });

    
    let bowCorpus = randomWords(tweetsCorpus.length * 100)

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


module.exports = analyseTweets