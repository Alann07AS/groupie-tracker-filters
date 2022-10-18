package groupie

import (
	"regexp"
	"strconv"
	"strings"
)

/*------------------ Class Date ---------------------*/

type Date struct {
	Day      int
	Month    int
	Year     int
	FullDate string
}

// Constructeur Date
func NewDate(fullDate string) Date {
	re := regexp.MustCompile(`(?m)[*]`)
	fullDate = re.ReplaceAllString(fullDate, "")
	spDate := strings.Split(fullDate, "-")

	day, err := strconv.Atoi(spDate[0])
	if err != nil {
		day = 0
	}
	month, err := strconv.Atoi(spDate[1])
	if err != nil {
		month = 0
	}
	year, err := strconv.Atoi(spDate[2])
	if err != nil {
		year = 0
	}

	return Date{day, month, year, fullDate}
}

/* ----------------------------------------------------------------------------------------*/
