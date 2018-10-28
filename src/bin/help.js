import isMonth from '@splash-cli/is-month';
import chalk from 'chalk';

import pkg from '../../package.json';

export default chalk`{bold Usage} (v${pkg.version})
	${isMonth('december') ? chalk`{yellow Merry Christmas!}\n` : ''}
	$ {green splash} {dim [command] [flags]}

{bold {cyan Commands}}
	{cyan settings {dim <get|set|restore>}}	{dim GET/SET/RESTORE SETTINGS}
	{cyan alias {dim <get|set|remove>}}			{dim GET/SET COLLECTION ALIASES}
	{cyan user {dim <login|logout|get>}} {dim MANAGE USER LOGIN/LOGOUT - GET USER INFOS}
		{dim {bold use "user help" for more arguments infos}}

{bold {yellow Options}}
	{yellow -h --help}			{dim THIS MESSAGE}
	{yellow -v --version}			{dim v${pkg.version}}

	${process.platform === 'darwin' ? (
		chalk`{yellow --scale {dim <auto|fill|fit|stretch|center>}}  {dim SET WALLPAPER SCALE}\n\t{yellow --screen {dim <all|main|monitor number>}}	{dim SET AS WALLPAPER ON SELECTED MONITOR}`
	) : ('')}

	{yellow -s --save {dim [optional_path]}} 	{dim DOWNLOAD WITHOUT SETTING AS WALLPAPER}

	{yellow -i --info}			{dim SHOW EXIF}
	{yellow -q --quiet}			{dim NO OUTPUT}


{bold {red Source Filters}}
	{red -u --user {dim <username>}}		{dim RANDOM PHOTO FROM PROVIDED USER}
	{red --collection {dim <id|alias>}}		{dim RANDOM PHOTO FROM PROVIDED COLLECTION}
	{red -c --curated}			{dim RANDOM CURATED PHOTO}
	{red --id {dim <id|url>}}			{dim PHOTO BY ID}
	{red --day}				{dim GET THE PHOTO OF THE DAY}
	
{bold {red Search Filters}}
	{red -f --featured}			{dim LIMIT TO ONLY FEATURED PHOTOS}
	{red --query {dim <query>}}			{dim RANDOM FROM QUERY}
`;
