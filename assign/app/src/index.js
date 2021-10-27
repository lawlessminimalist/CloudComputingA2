function createGraph(tweets,accuracy) {
    var ctx = document.getElementById('myChart').getContext('2d');
    var myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: tweets,
            datasets: [{
                data: accuracy,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(255, 159, 64, 0.2)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

//initilize map tile + deafult display of London
var mymap = L.map('mapid').setView([51.505, -0.09], 13);
L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: 'pk.eyJ1IjoiZGFubGF3bGVzcyIsImEiOiJja3Q4MGYyeGMweHZiMnBxbnptaW9pZmc5In0.d0JcWkmcG3tFuMlalviNxw'
}).addTo(mymap);

//handle submit of desired location
var form = document.getElementById("lookup");
form.addEventListener('submit', handleForm);
mymap.addEventListener('click', onMapClick);

//handle submit of desired location and 
function handleForm(event) { 
    event.preventDefault();
    var query = document.getElementById("location_lookup").value;
    searchLocation(query);
    document.getElementById("location_lookup").value = "";
 } 

//reverse geocode from api response latt-long => country code
//function to generate trend buttons on location selection event
async function onMapClick(e) {
    let lattlng = e.latlng.lng + ',' + e.latlng.lat;
    var circle = L.circle(e.latlng, {
        color: 'red',
        fillColor: '#f03',
        fillOpacity: 0.5,
        radius: 500
    }).addTo(mymap);
    //wait for fufilled promise before processing trends
    await reverseGeoCode(lattlng)
    .then((res) =>{
        trends(res);
    })


}

//grab trends from trend route and process into html elements for client application
function trends(location){
    url = "/search/" + location
    fetch(url)
        .then( (response) => {
            if (response.ok) {
                return response.json();
            }
            throw new Error("Network response was not ok.");
        })
        .then((rsp) =>{
            write_list_to_buttons(rsp.trends);
        })
        .catch((error) => {
            console.error(error);
        })
    
}
    
//given a location, forward geo-code a location into coordinates and set the map view to that locaiton
function searchLocation(query){
    const options = createMapOptions(query);
    const url = `https://${options.hostname}${options.path}`;
    fetch(url) 
        .then( (response) => {
            if (response.ok) {
                return response.json();
            }
            throw new Error("Network response was not ok.");
        })
        .then((res) => {
            var long = res.features[0].center[0];
            var latt = res.features[0].center[1];
            mymap.setView([latt,long], 13);
        })
        .catch(function(error) {
            console.log("There has been a problem with your fetch operation: ",error.message);
        });
}
//given coordinates, transform them into country codes using the mapbox api
function reverseGeoCode(lattlng){
    const options = createReverseGeoReq(lattlng);
    const url = `https://${options.hostname}${options.path}`;
    let locale = ""
    return fetch(url) 
        .then( (response) => {
            if (response.ok) {
                return response.json();
            }
            throw new Error("Network response was not ok.");
        })
        .then((res) => {
            let country = res.features[1].properties.short_code;
            let location = String(country).toUpperCase();
            return location;
        })
        .catch(function(error) {
            console.log("There has been a problem with your fetch operation: ",error.message);
        });

}

function updateSentiment(tweets){
    console.log(tweets)
    target = tweets.data;
    let consensus = 0;
    for(let i=0; i < target.length; i++) {
        consensus = consensus + target[i].sentiment;
    }
    consensus = consensus/target.length;
    return consensus;

}

//define keys and params
const mapObj = {
    api_key: "pk.eyJ1IjoiZGFubGF3bGVzcyIsImEiOiJja3Q4MGYyeGMweHZiMnBxbnptaW9pZmc5In0.d0JcWkmcG3tFuMlalviNxw",
    autocomplete: "true",
    fuzzyMatch: "true"

};

const geocode = {
    api_key: "pk.eyJ1IjoiZGFubGF3bGVzcyIsImEiOiJja3Q4MGYyeGMweHZiMnBxbnptaW9pZmc5In0.d0JcWkmcG3tFuMlalviNxw",
    types: "country,place"

};

//create options to hit Mapbox API for both searching and reverse geocoding

function createMapOptions(query) {
    const options = {
        hostname: 'api.mapbox.com',
        port: 443,
        path: '/geocoding/v5/mapbox.places/',
        method: 'GET'
        }
    const str =  query + '.json?'+
    '&autocomplete=' + mapObj.autocomplete +
    '&fuzzyMatch=' + mapObj.fuzzyMatch +
    '&access_token=' + mapObj.api_key
    options.path += str;
    return options;
}


function createReverseGeoReq(lattlng) {
    const options = {
        hostname: 'api.mapbox.com',
        port: 443,
        path: '/geocoding/v5/mapbox.places/',
        method: 'GET'
        }
    const str =  lattlng+'.json?'+
    '&types=' + geocode.types +
    '&access_token=' + geocode.api_key
    options.path += str;
    return options;
}

//given a score write an appropriate emoji to the html with the valency underneath
function emoji_writer(score){
    string = "";
    //neutral emoji
    if(score === 0 ){
        string = "&#128529"
    }
    //positive emoji
    else if(score > 0 ){
        string = "&#128525"
    }
    //negative emoji
    else if(score < 0){
        string = "&#128545"
    }
    writeSentiment(string,score);
    return string
}

function fetchTweets() {
    let checkButtons = document.getElementsByClassName("checkbutton")
    let allTweets = []
    let searchTweets = []
    for(let i = 0; i < checkButtons.length; i++){
        allTweets.push(checkButtons[i].value)
        if(checkButtons[i].checked){
            searchTweets.push(checkButtons[i].value)
        }
    }
    fetch("/twitter",
    {
        headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
        },
        method: "POST",
        body: JSON.stringify({allTweets: allTweets, searchTweets: searchTweets})
    })
    .then( (response) => {
        if (response.ok) {
            return response.json();
        }
        throw new Error("Network response was not ok.");
    })
    .then((res) => {
        console.log(res)
        //we now have our data in the front end, we now need to feed it into the graph functionality
        let accuracies = []
        let tweets = []
        res.forEach(item => {
            accuracies.push(item.accuracy)
            let test = emoji_writer(item.sentiment)
            tweets.push(item.tweet + " " + test)
        })
        createGraph(tweets,accuracies)
    })
    .catch(function(error) {
        console.log("There has been a problem with your fetch operation: ",error.message);
    });
}

function write_list_to_buttons(trends){
    var parent = document.getElementById("trend_selectors");
    parent.innerHTML = "";
    str=""
    for(let i=0; i < trends.length; i++) {
        str+=`<input type="checkbox" class="checkbutton" value="`+ trends[i].value +`">`+trends[i].value+`</checkbutton><br />`;
    }
    str += `<button onclick ='fetchTweets()' class="btn btn-primary btn-lg active col-xs-2 margin-top margin-left">Analyse Trends</button>`
    parent.innerHTML+=(str);
}

function writeSentiment(string,score){
    var parent = document.getElementById("emoji");
    str=`<h1>`+string+`</h1><h1>`+Math.round(score*20)+`%</h1>`;
    parent.innerHTML=(str);
}
