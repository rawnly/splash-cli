const chalk = require('chalk');

const help = chalk`{bold Usage}
	$ {green splash} {dim [command] [flags]}

{bold Commands}
	{cyan settings} {dim [size|dir]}				{gray # Setup splash-cli}
	{cyan restore}						{gray # Restore default settings}
	{cyan alias} {dim <name> <value>}				{gray # Alias a collection ID}
	{cyan list} {dim [flags]}					{gray # List all downloaded photos}
	  {yellow --export} {dim [flags]}			  	{gray # Write the list into a json file}
	  {yellow --out} {dim <output file>}				{gray # The list file name}

{bold Options}
	{yellow -h --help}					{gray # Output this menu}
	{yellow -v --version}					{gray # Output version}

	{yellow -s --save}					{gray # Save a photo withoud set it as wallpaper}
	{yellow --size} {dim <raw|full|regular|thumb>}			{gray # Photo size}
	{yellow --quiet} 					{gray # No output}



{bold {magenta Search Filters}}
	{yellow --query} {dim <query>}					{gray # Get photo by keyword}
	{yellow --id} {dim <id|url>}					{gray # Get photo by ID}
	{yellow --collection} {dim <id|alias>}				{gray # Get random photo from collection}
	{yellow --orientation} {dim <squarish|portrait|landscape>}	{gray # Photo orientation}
	{yellow --featured} 					{gray # Filter by featured}
`;

module.exports = help;
