package expressions

import "regexp"

const (
	CollectionIDExtractor string = "unsplash\\.com\\/collections\\/([A-z0-9]+)\\/([a-z\\-]+)\\/?$"
	PhotoIDExtractor      string = "https?:\\/\\/unsplash\\.com\\/photos\\/(\\w+-)+(\\w+)$"
	URLRemover            string = "(https?:\\/\\/)?unsplash\\.com\\/photos\\/(\\w+-)+"
)

func IsPhotoURL(url string) bool {
	re := regexp.MustCompile(URLRemover)

	return re.MatchString(url)
}

func IsCollectionURL(url string) bool {
	re := regexp.MustCompile(CollectionIDExtractor)

	return re.MatchString(url)
}

func CleanupURL(url string) string {
	re := regexp.MustCompile(URLRemover)

	if re.MatchString(url) {
		return re.ReplaceAllString(url, "")
	}

	return ""
}

func ExtractPhotoID(url string) string {
	re := regexp.MustCompile(PhotoIDExtractor)

	if re.MatchString(url) {
		return re.FindStringSubmatch(url)[2]
	}

	return ""
}

func ExtractCollectionID(url string) (id string, name string) {
	re := regexp.MustCompile(CollectionIDExtractor)

	if re.MatchString(url) {
		items := re.FindStringSubmatch(url)

		id = items[1]
		name = items[2]

		return
	}

	return "", ""
}
