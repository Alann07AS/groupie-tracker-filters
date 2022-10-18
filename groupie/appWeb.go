package groupie

import (
	"encoding/json"
	"fmt"
	"html/template"
	"io/ioutil"
	"log"
	"net/http"
)

var (
	ListArtist []Artist
	ListConcert map[string][]Relations
)

/* Lancement du serveur */
func StartAppWeb() {
	port := ":8080" // 67 test erreur

	f := http.FileServer(http.Dir("static"))
	s := http.StripPrefix("/static/", f)
	http.Handle("/static/", s)

	http.HandleFunc("/", homeHandler)
	http.HandleFunc("/allArtists", handleArtists)
	http.HandleFunc("/artist", handleArtist)

	fmt.Print("Start server : http://localhost", port, "/\n")
	log.Fatal(http.ListenAndServe(port, nil))
}

// Page d'acceuil
func homeHandler(w http.ResponseWriter, r *http.Request) {
	// Erreur 404
	if r.URL.Path!= "/" {
		t, _ := template.ParseFiles("./template/error404.html")
		t.Execute(w, nil)      
		return
	}

	brutApi, _ := http.Get("https://groupietrackers.herokuapp.com/api/artists")
	bodyApi, _ := ioutil.ReadAll(brutApi.Body)
	WriteFile("listArtist.json", bodyApi)
	json.Unmarshal(bodyApi, &ListArtist)

	brutApi, _ = http.Get("https://groupietrackers.herokuapp.com/api/relation")
	bodyApi, _ = ioutil.ReadAll(brutApi.Body)
	json.Unmarshal(bodyApi, &ListConcert)

	// Ajout des concerts dans le json Artists
	for i := range ListArtist {
		ListArtist[i].Concerts = ListConcert["index"][i].Dateslocations
	}
	file, _ := json.MarshalIndent(ListArtist, "", "	")
	WriteFile("listArtist.json", file) // Ecriture du fichier json

	t, err := template.ParseFiles("./template/index.html")
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError) // erreur 500
	} else {
		t.Execute(w, nil)
	}
}

// Page Liste Artistes
func handleArtists(w http.ResponseWriter, r *http.Request) {
	// Erreur 404
	if r.URL.Path!= "/allArtists" {
		//http.Error(w, "ERROR 404: NOT FOUND", http.StatusNotFound)  
		t, _ := template.ParseFiles("./template/error404.html")
		t.Execute(w, nil)      
		return
	}

	r.ParseForm()

	tmpArtists, err := template.ParseFiles("template/allArtists.html")
	if err != nil {
		log.Fatal(err)
	}
	err2 := tmpArtists.Execute(w, ListArtist)
	if err2 != nil {
		log.Fatal(err2)
	}
}

// Page Liste Artistes
func handleArtist(w http.ResponseWriter, r *http.Request) {
	// Erreur 404
	if r.URL.Path!= "/artist" {
		//http.Error(w, "ERROR 404: NOT FOUND", http.StatusNotFound)  
		t, _ := template.ParseFiles("./template/error404.html")
		t.Execute(w, nil)      
		return
	}

	r.ParseForm()
	index := 0

	groupName := r.FormValue("group")
	if groupName != "" {
		index = GetArtistsByName(groupName, ListArtist)
		if index == -1 {
			t, _ := template.ParseFiles("./template/error404.html")
			t.Execute(w, nil)      
			return
		}

		tmpArtist, err := template.ParseFiles("template/artist.html")
		if err != nil {
			log.Fatal(err)
		}
		tmpArtist.Execute(w, ListArtist[index])
		
	}
}

//*/
