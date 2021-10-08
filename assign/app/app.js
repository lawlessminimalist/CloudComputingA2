const express = require('express');
const flickrRouter = require('./routes/trends');
const app = express();
const path = require('path');
const trendSearch = require('./routes/trends.js');
const newsSearch = require('./routes/news_api.js');
const twitterSearch = require('./routes/twitter.js');

const hostname = '127.0.0.1';
const port = 3005;


//load views and static sources for use in app
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));
app.use('/static',express.static('./src'))
//define home route
app.get('/', (req, res) => {
 res.render("index")
});
//define routes to hit for API searches
app.use('/search',trendSearch); 
app.use('/news',newsSearch);
app.use('/twitter',twitterSearch)

app.listen(port, function () {
 console.log(`Express app listening at http://${hostname}:${port}/`);
});