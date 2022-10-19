/*
27/09/2022
@author: Tony Quedeville
Zone01
Projet Groupie-Tracker
*/
/*------------------------------------------------------------------------------------------*/

/* Date du jour par défaut */
const date = new Date()
// formatage de la date 01-02-2022
let jour = date.getDate()
let mois = date.getMonth()+1
let annee = date.getFullYear()
if (mois < 10) mois = "0" + mois
if (jour < 10) jour = "0" + jour
let aujourdhui = annee + "-" + mois + "-" + jour

const paysVille = new Set()
const pays = new Set()
const ville = new Set()
let listId = new Set()
let listIdfcd = new Set()
let listIdffd = new Set()
let listIdfnm = new Set()
let listIdfllp = new Set()
let listIdfllv = new Set()
let listIdfld= new Set()

let fcd = false
let ffd = false
/*-*/

/* Initialisation de la page */
$(document).ready(function(){
    // initialisation des filtres
    // Nombre de membre
    for (i=1; i<=8; i++) {
        $(`#number-member`).append(`
            <div class="checkbox">
                <input type="checkbox" name="number-member-${i}" id="number-member-${i}" class="number-member"/>
                <label for="number-member-${i}">${i}</label>
            </div>
        `)
    }

    // Localisation
    apiLocation()
    setTimeout(() => {
        for (const country of pays) {
            let ct = country.toUpperCase() // Pays en majuscule
            $(`#live-country`).append(`
                <option>${ct}</option>
            `)
        }

        for (const countryCity of paysVille) {
            let country = countryCity[1] //.toUpperCase() // Pays en majuscule
            let city = strUcFirst(countryCity[0]) // Première lettre de la ville en majuscule
            $(`#live-city`).append(`
                <optgroup class="option-city" label="${country}">
                <option class="option-city">${city}</option>
            `)
        }
    }, 500)
    

    // Alignement gauche/droite alterné
    pair = false
    for(i=0; i<52; i++){
        if(pair == false) {
            $(`#group${i}`).css({"justify-content": "flex-start"})
            pair = true
        } else {
            $(`#group${i}`).css({"justify-content": "flex-end"})
            pair = false
        }
    }

    filters()
})
/*-*/

// Filters
function filters() {
    let yearCreateMin = $(`#create-min`).val()
    let yearCreateMax = $(`#create-max`).val()
    let yearfirstMin = $(`#first-min`).val()
    let yearfirstMax = $(`#first-max`).val()
    let liveStart = $(`#live-start`).val()
    let liveEnd = $(`#live-end`).val()
    let liveCountry = $(`#live-country`).val()

    // Date de creation
    $(`#create-min`).change(() => {
        $(`#fcd`).prop("checked", true)
        yearCreateMin = $(`#create-min`).val()
        if (yearCreateMin > yearCreateMax) {
            yearCreateMax = yearCreateMin
            $(`#create-max`).val(yearCreateMin)
        }
        listFilter()
    })    

    $(`#create-max`).change(() => {
        yearCreateMax = $(`#create-max`).val()
        $(`#fcd`).prop("checked", true)
        if (yearCreateMax < yearCreateMin || (yearCreateMin == 0 && yearCreateMax > 0)) {
            yearCreateMin = yearCreateMax
            $(`#create-min`).val(yearCreateMax)
        }
        listFilter()
    })  

    $(`#fcd`).change(() => {
        listFilter()
    })
    
    
    // First album
    $(`#first-min`).change(() => {
        yearfirstMin = $(`#first-min`).val()
        $(`#ffd`).prop("checked", true)
        if (yearfirstMin > yearfirstMax) {
            yearfirstMax = yearfirstMin
            $(`#first-max`).val(yearfirstMin)
        }
        listFilter()
    })

    $(`#first-max`).change(() => {
        yearfirstMax = $(`#first-max`).val()
        $(`#ffd`).prop("checked", true)
        if (yearfirstMax < yearfirstMin || (yearfirstMin == 0 && yearfirstMax > 0)) {
            yearfirstMin = yearfirstMax
            $(`#first-min`).val(yearfirstMax)
        }
        listFilter()
    })

    $(`#ffd`).change(() => {
        listFilter()
    })

    // Nombre de membre
    $(`.number-member`).change(function() {
        $(`#fnm`).prop("checked", true)
        listFilter()
    })
    
    $(`#fnm`).change(() => {
        listFilter()
    })

    // Lieu de concert
    $(`#live-country`).change(() => {
        $(`#fll`).prop("checked", true)
        liveCountry = $(`#live-country`).val()

        $(`.option-city`).remove()
        $(`#live-city`).append(`
            <option value="" class="option-city" disabled="disabled" selected="selected">Choose a city</option>
        `)

        const city = new Set()
        for (const countryCity of paysVille) {
            let pays = countryCity[1].toUpperCase() // Pays en majuscule
            if (pays == liveCountry) {
                city.add(strUcFirst(countryCity[0])) // Supprime les doublons
            }
        }

        for (const ct of city) {
            $(`#live-city`).append(`
                <option class="option-city">${ct}</option>
            `)
        }
        listFilter() 
    })
    
    $(`#live-city`).change(() => {
        $(`#fll`).prop("checked", true)
        listFilter() 
    })

    $(`#fll`).change(() => {
        listFilter()
    })

    // Date de concert
    $(`#live-start`).change(() => {
        $(`#fld`).prop("checked", true)
        liveStart = $(`#live-start`).val()
        if (liveStart > liveEnd) {
            $(`#live-end`).val(liveStart)
        }
        listFilter() 
    })

    $(`#live-end`).change(() => {
        $(`#fld`).prop("checked", true)
        liveEnd = $(`#live-end`).val()
        if (liveStart > liveEnd || (liveStart == 0 && liveEnd != 0)) {
            $(`#live-start`).val(liveEnd)
        }
        listFilter() 
    })

    $(`#fld`).change(() => {
        listFilter()
    })

    // Init filtres
    $(`#init-filter`).click(() => {
        window.location.replace("./allArtists")
    })
}

// Search Bar
function searchBar() {
    listFilter("sch")

    let textSearch = $(`#search`).val().split(':')
    let idGroup = parseInt(textSearch[1])+1
    $(`#group${idGroup}`).show()
}

// Première lettre d'un string en majuscule
function strUcFirst(str){
    return (str+'').charAt(0).toUpperCase()+str.substr(1)
}

/* liste des resultats filtres */
function listFilter(typeFilter = "") {
    let createMinFilter = $(`#create-min`).val()
    let createMaxFilter = $(`#create-max`).val()
    let firstMinFilter = $(`#first-min`).val()
    let firstMaxFilter = $(`#first-max`).val()
    let liveCountry = $(`#live-country`).val()
    let liveCity = $(`#live-city`).val()
    let liveStart = $(`#live-start`).val()
    let liveEnd = $(`#live-end`).val()
    let searchFilter = $(`#search`).val().toUpperCase()

    listId = new Set()
    listIdfcd = new Set()
    listIdffd = new Set()
    listIdfnm = new Set()
    listIdfllp = new Set()
    listIdfllv = new Set()
    listIdfld= new Set()

    // Masque tous les groupes
    for(i=1; i<=52; i++){
        $(`#group${i}`).hide()
    }
    
    if (typeFilter == "sch" || 
        $(`#fcd`).prop("checked") == true || 
        $(`#ffd`).prop("checked") == true || 
        $(`#fnm`).prop("checked") == true || 
        $(`#fll`).prop("checked") == true || 
        $(`#fld`).prop("checked") == true
    ) {
        const requeteGet = fetch('./static/json/listArtist.json')
        requeteGet
        .then((reponse) => {
            const PromesseJson = reponse.json();
            
            PromesseJson.then((data) => {
                $('.results').remove() // Efface les resultats

                for(idArtist=0; idArtist<52; idArtist++){
                    // Group name
                    let nameGroup = data[idArtist].Name
                    if (typeFilter == "sch" && nameGroup.toUpperCase().indexOf(searchFilter) > -1) {
                        $(`#result-search`).append(`
                            <option id="name${idArtist}" class="results">Group:${idArtist}: ${data[idArtist].Name}</option>
                        `)
                        $(`#group${idArtist+1}`).show()
                    }
                    //*/    

                    // Creation date 
                    let creationDate = data[idArtist].CreationDate
                    if ($(`#fcd`).prop("checked") == true && creationDate >= createMinFilter && creationDate <= createMaxFilter) {
                        listIdfcd.add(idArtist)
                        listId.add(idArtist)
                    }
                    if (typeFilter == "sch" && creationDate.toString().indexOf(searchFilter) > -1) {
                        $(`#result-search`).append(`
                            <option id="creationDate${idArtist}" class="results">CreationDate:${idArtist}: ${data[idArtist].Name} : ${data[idArtist].CreationDate}</option>
                        `)
                        $(`#group${idArtist+1}`).show()
                    }
                    //*/

                    // Fisrt album
                    let firstAlbum = data[idArtist].FirstAlbum
                    let yearFirstAlbum = firstAlbum.split('-')[2]
                    if ($(`#ffd`).prop("checked") == true && yearFirstAlbum >= firstMinFilter && yearFirstAlbum <= firstMaxFilter) {
                        listIdffd.add(idArtist)
                        listId.add(idArtist)
                    }

                    if (typeFilter == "sch" && firstAlbum.toString().indexOf(searchFilter) > -1) {
                        $(`#result-search`).append(`
                            <option id="firstAlbum${idArtist}" class="results">FirstAlbum:${idArtist}: ${data[idArtist].Name} : ${data[idArtist].FirstAlbum}</option>
                        `)
                        $(`#group${idArtist+1}`).show()
                    }
                    //*/

                    // Members
                    if ($(`#fnm`).prop("checked") == true) {
                        let nbMember = data[idArtist].Members.length
                        for (inm=1; inm<=8; inm++) {
                            if ($(`#number-member-${inm}`).prop("checked") && inm == nbMember) {
                                listIdfnm.add(idArtist)
                                listId.add(idArtist)
                            } 
                        }
                    }

                    Object.entries(data[idArtist].Members).forEach((member,i) => {
                        if (typeFilter == "sch") {
                            if (member[1].toUpperCase().indexOf(searchFilter) > -1) {
                                $(`#result-search`).append(`
                                    <option id="member${idArtist}-${i}" class="results" >Member:${idArtist}: ${data[idArtist].Name} : ${member[1]}</option>
                                `)
                                $(`#group${idArtist+1}`).show()
                            }
                        }
                    })
                    //*/ 

                    // Concerts                    
                    Object.entries(data[idArtist].Concerts).forEach((location,i) => {
                        // Localisation
                        const villePays = location[0].split("-")
                        let pays = villePays[1].toUpperCase() // Pays en majuscule
                        let ville = strUcFirst(villePays[0]) // Première lettre de la ville en majuscule

                        if ($(`#fll`).prop("checked") == true && liveCountry != null && liveCountry.toUpperCase() == pays) {
                            listIdfllp.add(idArtist)
                            listId.add(idArtist)
                        }
                        
                        if ($(`#fll`).prop("checked") == true && liveCity != null && strUcFirst(liveCity) == ville) {
                            listIdfllv.add(idArtist)
                            listId.add(idArtist)
                        }

                        if (typeFilter == "sch") {
                            if (location[0].toUpperCase().indexOf(searchFilter) > -1) {
                                $(`#result-search`).append(`
                                    <option id="location${idArtist}-${i}" class="results">Concert:${idArtist}: ${data[idArtist].Name} : ${pays} - ${ville}</option>
                                `)
                                $(`#group${idArtist+1}`).show()
                            }
                        }
                        
                        // Dates de concerts
                        location[1].forEach((dateConcert,j) => {
                            var dc = dateConcert.split('-')
                            var ls = liveStart.split('-')
                            var le = liveEnd.split('-')
                            var dateC = new Date(dc[2], dc[1]-1, dc[0])
                            var liveS = new Date(ls[0], ls[1]-1, ls[2])
                            var liveE = new Date(le[0], le[1]-1, le[2])

                            if ($(`#fld`).prop("checked") == true && liveS.getTime() <= dateC.getTime() && liveE.getTime() >= dateC.getTime()) {
                                listIdfld.add(idArtist)
                                listId.add(idArtist)
                            }

                            if (typeFilter == "sch") {
                                if (dateConcert.toString().indexOf(searchFilter) > -1) {
                                    $(`#result-search`).append(`
                                        <option id="dateConcert${idArtist}-${i}-${j}" class="results">Concert date:${idArtist}: ${data[idArtist].Name} : ${dateConcert}</option>
                                    `)
                                    $(`#group${idArtist+1}`).show()
                                }
                            }
                        })
                    })
                    //*/
                }

                // Recherche des id communs                
                // Initialisation du tableau 
                let tabId = []  
                if (listId.size > 0) {
                    for (const idArtist of listId) {  
                        tabId.push(idArtist)
                    }
                    listId = new Set()

                    // Date de creation
                    if (listIdfcd.size > 0) {
                        for (const idArtist of listIdfcd) {  
                            if (tabId.includes(idArtist)) {
                                listId.add(idArtist)
                            }
                        }
                        tabId = []                
                        for (const idArtist of listId) { 
                            tabId.push(idArtist)
                        }
                        listId = new Set()
                    }
                    //*/

                    // Date de premier album
                    if (listIdffd.size > 0) {
                        for (const idArtist of listIdffd) {  
                            if (tabId.includes(idArtist)) {
                                listId.add(idArtist)
                            }
                        }
                        tabId = []                
                        for (const idArtist of listId) { 
                            tabId.push(idArtist)
                        }
                        listId = new Set()
                    }
                    //*/

                    // Nombre de membre
                    if (listIdfnm.size > 0) {
                        for (const idArtist of listIdfnm) { 
                            if (tabId.includes(idArtist)) {
                                listId.add(idArtist)
                            }
                        }
                        tabId = []                
                        for (const idArtist of listId) { 
                            tabId.push(idArtist)
                        }
                        listId = new Set()
                    }
                    //*/

                    // Lieu de concert : Pays
                    if (listIdfllp.size > 0) {
                        for (const idArtist of listIdfllp) { 
                            if (tabId.includes(idArtist)) {
                                listId.add(idArtist)
                            }
                        }
                        tabId = []                
                        for (const idArtist of listId) { 
                            tabId.push(idArtist)
                        }
                        listId = new Set()
                    }
                    //*/

                    // Lieu de concert : ville
                    if (listIdfllv.size > 0) {
                        for (const idArtist of listIdfllv) { 
                            if (tabId.includes(idArtist)) {
                                listId.add(idArtist)
                            }
                        }
                        tabId = []                
                        for (const idArtist of listId) { 
                            tabId.push(idArtist)
                        }
                        listId = new Set()
                    }
                    //*/

                    // Date de concert
                    if (listIdfld.size > 0) {
                        for (const idArtist of listIdfld) { 
                            if (tabId.includes(idArtist)) {
                                listId.add(idArtist)
                            }
                        }
                        tabId = []                
                        for (const idArtist of listId) { 
                            tabId.push(idArtist)
                        }
                        listId = new Set()
                    }
                    //*/

                    tabId.forEach((idArtist) => {
                        $(`#group${idArtist+1}`).show()
                    })
                    //*/
                }
            })
        })
        .catch((error) => {
            //console.error(error)
            alert( error );
        })
    } else { // no filters
        window.location.replace("./allArtists")
    }
//*/
}
/*---*/


/* liste des resultats filtres */
function apiLocation() {
    const requeteGet = fetch('./static/json/listArtist.json')
    requeteGet
    .then((reponse) => {
        const PromesseJson = reponse.json();
        
        PromesseJson.then((data) => {
            $('.results').remove() // Efface les resultats

            for(idArtist=0; idArtist<52; idArtist++){
                // Concerts                    
                Object.entries(data[idArtist].Concerts).forEach((location,i) => {
                    // Localisation
                    paysVille.add(location[0].split("-"))
                    pays.add(location[0].split("-")[1])
                    ville.add(location[0].split("-")[0])
                })
                //*/
            }
        })
    })
    .catch((error) => {
        //console.error(error)
        alert( error );
    })
}
/*---*/

