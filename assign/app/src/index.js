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
//grab news from news route and process into html elements for client application
function searchNews(tag){
    str = str.replace(/\s/g, '%20');
    url = "/news/" +tag;
    fetch(url)
        .then( (response) => {
            if (response.ok) {
                return response.json();
            }
            throw new Error("Network response was not ok.");
        })
        .then((rsp) =>{
            write_list_to_display_box(rsp.articles);
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


//functions to append data to the client side applicaiton and make them actionable by the user via embedded JS


function write_list_to_display_box(articles){
    let parent_pos = document.getElementById("article_displays_positive");
    let parent_neut = document.getElementById("article_displays_neutral");
    let parent_neg = document.getElementById("article_displays_negative");
    //reset cards
    parent_pos.innerHTML = "";
    parent_neut.innerHTML = "";
    parent_neg.innerHTML = "";

    //create cards from article information
    parent_pos.innerHTML+=`<h1 class="article_head">Positive Articles</h1>`;
    parent_neut.innerHTML+=`<h1 class="article_head">Neutral Articles</h1>`;
    parent_neg.innerHTML+=`<h1 class="article_head">Negative Articles</h1>`;

    for(let i=0; i < articles.length; i++) {
        str = "";
        str+= `<div class="card card_sized " style="width: 18rem;"><a href=`+articles[i].url+`>
        <img class="card-img-top" src="`+articles[i].urlToImage+`" alt="`+articles[i].title+`">
         <div class="card-body">
            <h5 class="card-title">`+articles[i].title+`</h5>
        </div></a>
    </div>`
    if(articles[i].sentiment.sentiment === "Positive"){parent_pos.innerHTML+=(str);}
    else if( articles[i].sentiment.sentiment === "Neutral"){parent_neut.innerHTML+=(str);}
    else if( articles[i].sentiment.sentiment === "Negative"){parent_neg.innerHTML+=(str);}
    }
    

}




function write_list_to_buttons(trends){
    var parent = document.getElementById("trend_selectors");
    parent.innerHTML = "";
    str=""
    for(let i=0; i < trends.length; i++) {
        str+=`<a href='javascript:searchNews("`+trends[i].value+`")' class="btn btn-primary btn-lg active col-xs-2 margin-top margin-left" role="button" aria-pressed="true">`
        +trends[i].value+
        `</a>`;
    }
    parent.innerHTML+=(str);
}




