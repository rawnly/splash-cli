package models

import (
	"strconv"
	"strings"
)

type Version struct {
	Major int
	Minor int
	Patch int
}

func VersionToString(v *Version) string {
	return strconv.Itoa(v.Major) + "." + strconv.Itoa(v.Minor) + "." + strconv.Itoa(v.Patch)
}

func VersionFromString(v string) (*Version, error) {
	s := strings.Split(v, ".")
	major, err := strconv.Atoi(s[0])
	if err != nil {
		return nil, err
	}

	minor, err := strconv.Atoi(s[1])
	if err != nil {
		return nil, err
	}

	patch, err := strconv.Atoi(s[2])
	if err != nil {
		return nil, err
	}

	return &Version{
		Major: major,
		Minor: minor,
		Patch: patch,
	}, nil
}

func (v *Version) IsNewerThan(v2 *Version) bool {
	if v.Major > v2.Major {
		return true
	}

	if v.Minor > v2.Minor {
		return true
	}

	if v.Patch > v2.Patch {
		return true
	}

	return false
}
