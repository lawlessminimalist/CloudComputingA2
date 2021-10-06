const express = require('express');
const logger = require('morgan');
const { parse } = require('rss-to-json');
const router = express.Router();
router.use(logger('tiny'));
router.get('/:query', (req, res) => {
    const options = createRSSOptions(req.params.query);
    const url = `https://${options.hostname}${options.path}`;
    
    parse(url)
       .then( (rsp) => {
          return parseTrendRsp(rsp);
      })
        .then((response) => {
            res.writeHead(200,{'content-type': 'application/json'});
            res.write(JSON.stringify(response, null, 3));
            res.end();
        })
        .catch((error) => {
            console.error(error);
        })
});

//'https://trends.google.com/trends/trendingsearches/daily/rss?geo=GB'

//build the query for Flikr API from route passed in/defined keys and options
function createRSSOptions(query) {
    const options = {
        hostname: 'trends.google.com',
        path: '/trends/trendingsearches/daily/rss?',
        }
    const str = 'geo=' + query;
    options.path += str;
    return options;
}

function parseTrendRsp(rsp) {
    let s = `{ "trends" : [`;

    for (let i=0; i < rsp.items.length-1; i++) {
        let trend = rsp.items[i].title;
        s+= `{ "value" : "` + trend + `" },`;

    }
    s+= `{ "value" : "` + rsp.items[rsp.items.length-1].title + `" }`;
    s += `]}`;

    const obj = JSON.parse(s); 
    return obj;
};



module.exports = router;

