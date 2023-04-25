package expressions

import "regexp"

const (
	CollectionIdExtractor string = "unsplash\\.com\\/collections\\/([A-z0-9]+)\\/([a-z\\-]+)\\/?$"
	PhotoIdExtractor      string = "unsplash\\.com\\/photos\\/([A-z0-9]+)\\/?$"
)

func IsPhotoUrl(url string) bool {
	re := regexp.MustCompile(PhotoIdExtractor)

	return re.MatchString(url)
}

func IsCollectionUrl(url string) bool {
	re := regexp.MustCompile(CollectionIdExtractor)

	return re.MatchString(url)
}

func ExtractPhotoId(url string) string {
	re := regexp.MustCompile(PhotoIdExtractor)

	if re.MatchString(url) {
		return re.FindStringSubmatch(url)[1]
	}

	return ""
}

func ExtractCollectionId(url string) (id string, name string) {
	re := regexp.MustCompile(CollectionIdExtractor)

	if re.MatchString(url) {
		items := re.FindStringSubmatch(url)

		id = items[1]
		name = items[2]

		return
	}

	return "", ""
}
