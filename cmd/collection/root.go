package collection

import "github.com/spf13/cobra"

var Cmd = &cobra.Command{
	Use:   "collection",
	Short: "CRUD on collections",
}

func init() {
	Cmd.AddCommand(getCollectionCmd)
}
