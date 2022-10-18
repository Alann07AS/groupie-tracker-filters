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
/*-*/

/* Initialisation de la page */
$(document).ready(function(){
    // initialisation des filtres
    $("#live-start").val(aujourdhui)
    $("#live-end").val(aujourdhui)

    //  Filters 
    // Nombre de membre
    for (i=1; i<=8; i++) {
        $(`#number-member`).append(`
            <div class="checkbox">
                <input type="checkbox" name="number-member-${i}" id="number-member-${i}"/>
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
        yearCreateMin = $(`#create-min`).val()
        if (yearCreateMin > yearCreateMax) {
            yearCreateMax = yearCreateMin
            $(`#create-max`).val(yearCreateMin)
        }
        listFilter("fcd") // ffd: filter creation date
    })

    $(`#create-max`).change(() => {
        yearCreateMax = $(`#create-max`).val()
        if (yearCreateMax < yearCreateMin) {
            yearCreateMin = yearCreateMax
            $(`#create-min`).val(yearCreateMax)
        }
        listFilter("fcd") // ffd: filter creation date
    })

    // First album
    $(`#first-min`).change(() => {
        yearfirstMin = $(`#first-min`).val()
        if (yearfirstMin > yearfirstMax) {
            yearfirstMax = yearfirstMin
            $(`#first-max`).val(yearfirstMin)
        }
        listFilter("ffd") // ffd: filter first date
    })

    $(`#first-max`).change(() => {
        yearfirstMax = $(`#first-max`).val()
        if (yearfirstMax < yearfirstMin) {
            yearfirstMin = yearfirstMax
            $(`#first-min`).val(yearfirstMax)
        }
        listFilter("ffd") // ffd: filter first date
    })

    // Nombre de membre
    $(`input[type=checkbox]`).change(function() {
        listFilter("fnm") // fnm : filter number member
    })
    
    // Lieu de concert
    $(`#live-country`).change(() => {
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

        listFilter("fllp") // fllp: filter live location pays
    })

    $(`#live-city`).change(() => {
        listFilter("fllv") // fllv: filter live location ville
    })

    // Date de concert
    $(`#live-start`).change(() => {
        liveCountry = $(`#live-start`).val()
        listFilter("fld") // fld: filter live date
    })

    $(`#live-end`).change(() => {
        liveCountry = $(`#live-end`).val()
        listFilter("fld") // fld: filter live date
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
function listFilter(typeFilter) {
    let createMinFilter = $(`#create-min`).val()
    let createMaxFilter = $(`#create-max`).val()
    let firstMinFilter = $(`#first-min`).val()
    let firstMaxFilter = $(`#first-max`).val()
    let liveCountry = $(`#live-country`).val()
    let liveCity = $(`#live-city`).val()
    let liveStart = $(`#live-start`).val()
    let liveEnd = $(`#live-end`).val()
    let searchFilter = $(`#search`).val().toUpperCase()

    // Masque tous les groupes
    for(i=1; i<=52; i++){
        $(`#group${i}`).hide()
    }

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
                    if (typeFilter == "fcd" && creationDate >= createMinFilter && creationDate <= createMaxFilter) {
                        $(`#group${idArtist+1}`).show()
                    }
                    if (typeFilter == "sch" && creationDate.toString().indexOf(searchFilter) > -1) {
                        console.log("search !")
                        $(`#result-search`).append(`
                            <option id="creationDate${idArtist}" class="results">CreationDate:${idArtist}: ${data[idArtist].Name} : ${data[idArtist].CreationDate}</option>
                        `)
                        $(`#group${idArtist+1}`).show()
                    }
                    //*/

                    // Fisrt album
                    let firstAlbum = data[idArtist].FirstAlbum
                    let yearFirstAlbum = firstAlbum.split('-')[2]
                    if (typeFilter == "ffd" && yearFirstAlbum >= firstMinFilter && yearFirstAlbum <= firstMaxFilter) {
                        $(`#group${idArtist+1}`).show()
                    }
                    if (typeFilter == "sch" && firstAlbum.toString().indexOf(searchFilter) > -1) {
                        $(`#result-search`).append(`
                            <option id="firstAlbum${idArtist}" class="results">FirstAlbum:${idArtist}: ${data[idArtist].Name} : ${data[idArtist].FirstAlbum}</option>
                        `)
                        $(`#group${idArtist+1}`).show()
                    }
                    //*/

                    // Members
                    if (typeFilter == "fnm") {
                        let nbMember = data[idArtist].Members.length
                        for (inm=1; inm<=8; inm++) {
                            if ($(`#number-member-${inm}`).prop("checked") && inm == nbMember) {
                                $(`#group${idArtist+1}`).show()
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

                        if (typeFilter == "fllp" && liveCountry.toUpperCase() == pays) {
                            $(`#group${idArtist+1}`).show()
                        }

                        if (typeFilter == "fllv" && strUcFirst(liveCity) == ville) {
                            $(`#group${idArtist+1}`).show()
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

                            if (typeFilter == "fld" && liveS.getTime() <= dateC.getTime() && liveE.getTime() >= dateC.getTime()) {
                                $(`#group${idArtist+1}`).show()
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
            })
        })
        .catch((error) => {
            //console.error(error)
            alert( error );
        })
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

