package models

import (
	"fmt"
	"strconv"
	"strings"
)

type Version struct {
	Major int
	Minor int
	Patch int
}

func (v Version) String() string {
	return VersionToString(&v)
}

func VersionToString(v *Version) string {
	if v == nil {
		return ""
	}

	return strconv.Itoa(v.Major) + "." + strconv.Itoa(v.Minor) + "." + strconv.Itoa(v.Patch)
}

func VersionFromString(v string) (*Version, error) {
	v = strings.TrimSpace(v)
	v = strings.TrimPrefix(v, "v")
	v, _, _ = strings.Cut(v, "-")
	v, _, _ = strings.Cut(v, "+")

	s := strings.Split(v, ".")
	if len(s) != 3 {
		return nil, fmt.Errorf("invalid version %q", v)
	}

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
