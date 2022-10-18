package groupie

/*------------------ Class Artist ---------------------*/

type Artist struct {
	Id           int
	Name         string
	Image        string
	Members      []string
	CreationDate int
	FirstAlbum   string
	//Locations    string
	//ConcertDates string
	//Relations    string
	Concerts 	 map[string][]string
}

// Getter : Artist
func GetArtistsByName(name string, list []Artist) int {
	for i, el := range list {
		if el.Name == name {
			return i
		}
	}

	return -1 // si pas trouvé
}

type Locations struct { // var a map[string][]Locations
	Id        int
	Locations []string
	Dates     string
}

type Dates struct { // var a map[string][]Dates
	Id    int
	Dates []string
}

type Relations struct { // var a map[string][]Relations
	Id             int
	Dateslocations map[string][]string
}
