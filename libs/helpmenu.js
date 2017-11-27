const chalk = require('chalk');

const help = chalk`{bold Usage}
	$ {green splash} {dim [command] [flags]}

{bold Commands}
	{cyan settings} {dim [size|dir]}				{gray # Setup splash-cli}
	{cyan get-settings}					{gray # Get settings}
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

	{yellow -i --info}					{gray # Show exif data}
	{yellow -q --quiet} 					{gray # No output}


{bold {magenta Source Filters}}
	{yellow -u --user} {dim <username>} 				{gray # Grab random photo from user}
	{yellow --collection} {dim <id|alias>}				{gray # Grab random photo from collection}
	{yellow --id} {dim <id|url>}					{gray # Grab photo by ID}
	
{bold {magenta Search Filters}}
	{yellow -o --orientation} {dim <squarish|portrait|landscape>}	{gray # Photo orientation}
	{yellow -f --featured} 					{gray # Filter by featured}
	{yellow --query} {dim <query>}					{gray # Grab photo by keyword}
`;

module.exports = help;
