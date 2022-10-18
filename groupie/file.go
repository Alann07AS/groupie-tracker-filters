package groupie

import "io/ioutil"

/* Ecriture fichier json */
func WriteFile(filename string, data []byte) {
	path := "./static/json/"
	//data := []byte(txt)
	err := ioutil.WriteFile(path + filename, data, 0o644) //(0777 pour unix)
	check(err)
}

/* Affichage des erreurs */
func check(e error) {
	if e != nil {
		panic(e)
	}
}