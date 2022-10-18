/*
27/09/2022
@author: Tony Quedeville
Zone01
Projet Groupie-Tracker
*/
/*------------------------------------------------------------------------------------------*/

// Première lettre d'un string en majuscule
function strUcFirst(str){
    return (str+'').charAt(0).toUpperCase()+str.substr(1)
}

// Affiche la liste des concerts pour un groupe
var tMarker = []
let idArtist = 0
idArtist = $(`.detail`).attr("id") - 1
var lnglat = Array()
let latmax = -90
let latmin = 90
let lngmax = -180
let lngmin = 180

// Affichage de la map
    mapboxgl.accessToken = 'pk.eyJ1IjoiemFrY2giLCJhIjoiY2w3ZWh6MGVhMDBraDNybzF5ODBpcTVzYSJ9.0GaannyFOoyoiDzGsD1CEQ' // clé
    var mapboxClient = mapboxSdk({ accessToken: mapboxgl.accessToken })
    var map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [-70.070159, 40.155872],
        zoom: 0
    })
    //*/

// Lecture du fichier json
    const requeteGet = fetch('./static/json/listArtist.json')
    requeteGet
        .then((reponse) => {
            const PromesseJson = reponse.json();
            
            PromesseJson.then((data) => {
                Object.entries(data[idArtist].Concerts).forEach((location,i) => {
                    const villePays = location[0].split("-")
                    let pays = villePays[1].toUpperCase() // Pays en Majuscule
                    let ville = strUcFirst(villePays[0]) // Première lettre de la ville en majuscule
                    
                    // Ajout des concerts sur la page
                    $(`#list-concerts`).append(`
                        <li class="horizontal">
                            <h4 class="center-map">${pays}</h4>
                            <h4 class="center-map">${ville}</h4>
                            <img id="${i}" class="center-map" src="../static/icn/google-maps-marker-icon-38.webp" width="25" height="25" alt="Lien de centrage sur la map"></img>
                            <ul id="${location[0]}"></ul>
                        </li>
                    `)  
                    
                    location[1].forEach((el) => {
                        $(`#${location[0]}`).append(`
                            <li>${el}</li>
                        `) 
                    })

                    tMarker.push(location[0]) 
                    //console.log(tMarker.length)
                })

                tMarker.forEach(myGeocoder) // Boucle sur les villes/pays

                // Geolocalisation: Coordonnées GPS en fonction de la ville et du pays
                function myGeocoder(item, index) {  
                    mapboxClient.geocoding
                    .forwardGeocode({
                        query: item,
                        autocomplete: false,
                        limit: 0
                    })
                    .send()
                    .then(function (response) {
                        if (response &&
                            response.body &&
                            response.body.features &&
                            response.body.features.length
                        ){
                            lnglat[index] = response.body.features[0].center // Longitude-Latitute centrage
                            new mapboxgl.Marker().setLngLat(lnglat[index]).addTo(map) // Ajout du marker
                            if(lnglat[index][0] >= lngmax) {lngmax = lnglat[index][0]}
                            if(lnglat[index][0] <= lngmin) {lngmin = lnglat[index][0]}
                            if(lnglat[index][1] > latmax) {latmax = lnglat[index][1]}
                            if(lnglat[index][1] < latmin) {latmin = lnglat[index][1]}
                        }
                    })
                }
            })
        })
        .catch((error) => {
            //console.error(error)
            alert( error );
        })
//*/

/* Initialisation de la page */
$(document).ready(function() {
    setTimeout(() => {       
        initMap()
    }, 1000);

    $(document).on('click','#zoom-init',function() {
        initMap()
    })

    $(document).on('click','.center-map',function() {
        const pos = {lng: lnglat[this.id][0], lat: lnglat[this.id][1]}
        const endZoom = 9       
        map.flyTo({zoom: endZoom, center: pos, duration: 3000})
    })
})
/*-*/

function initMap() {
    longitude = (lngmax + lngmin)/2
    latitude = (latmax + latmin)/2
    let endZoom = 0
    
    if ((lngmax - lngmin)/360 >= (latmax - latmin)/180){
        endZoom = (1-(lngmax - lngmin)/360)*5-1
    } else {
        endZoom = (1-(latmax - latmin)/180)*5-1
    }

    const pos = {lng: longitude, lat: latitude}
    map.flyTo({zoom: endZoom, center: pos, duration: 3000})
}