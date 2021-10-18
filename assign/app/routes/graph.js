const express = require('express');
const logger = require('morgan');
const router = express.Router();
router.use(logger('tiny'));
const Chart = require('chartjs');

                                  

router.get('/:tweet/:tweet1/:tweet2/:accuracy/:accuracy1/:accuracy2', (req, res) => {
    //create options for calling news API
    let tweets = [req.params.tweet,req.params.tweet1,req.params.tweet2]
    let accuracy = [req.params.accuracy,req.params.accuracy1,req.params.accuracy2]
    var barColors = ["red", "green","blue","orange","brown"];

    var chart = new Chart("myChart", {
    type: "bar",
    data: {
        labels: tweets,
        datasets: [{
        backgroundColor: barColors,
        data: accuracy
        }]
    }
    });
    let test = document.getElementById("graphdiv")
    console.log(test)
    res.send(chart)
});

module.exports = router;
