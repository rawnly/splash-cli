package collection

import (
	"fmt"
	"github.com/MakeNowJust/heredoc"
	"github.com/rawnly/splash-cli/lib"
	"github.com/rawnly/splash-cli/lib/keys"
	"github.com/rawnly/splash-cli/lib/terminal"
	"github.com/spf13/cobra"
)

var getCollectionCmd = &cobra.Command{
	Use:   "get",
	Args:  cobra.ExactArgs(1),
	Short: "Get collection infos",
	RunE: func(cmd *cobra.Command, args []string) error {
		templateString := heredoc.Doc(`
			{{ color "default+b" .Title }} 
			{{ dim .Description }} 

			{{ dim "---" }}
			Total Photos: {{ .TotalPhotos }} 
			Created by: {{ color "yellow" .User.Name }} ({{ underline "@" }}{{ underline .User.Username }}) 
		`)

		ctx := cmd.Context()
		api := keys.GetApiInstance(ctx)

		id := lib.ParseCollections(args)[0]

		collection, err := api.GetCollection(id)

		if err != nil {
			return err
		}

		template, err := lib.StringTemplate(templateString, collection)

		if err != nil {
			return err
		}

		fmt.Println(template)
		terminal.HyperLink("Click here to learn more", collection.Links.Html)

		return nil
	},
}

func init() {

}
