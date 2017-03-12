# API
- ## DIR
	Command: `dir [--flags]` <br>
	<br>

	Set the default download directory.
	```bash
        $ splash dir --set ~/Desktop
        # //=> `~/Pictures/splash_photos` ==> `~/Desktop`
	```

	else you can use this option to get the current download directory

	```bash
		$ splash dir
		# //=> Right now the directory is '~/Pictures/splash_photos'
    ```
<br>

- ## SAVE
	Command: `save [--flags]` <br>
	<br>

	Save the downloaded photo to a local folder if specified, or to the usually `~/Pictures/splash_photos`
	
	```bash
    $ splash save --dest [path]
    # -d --dest
	```
	
	You can also add `--set` parameter to set the photo as wallpaper.

	```bash
    	$ splash --dest ~/Desktop --set
    	# -s --set 
	```
  ```bash 
   	$ splash --set
	```
	
<br>

- ## INFO
	Option: `--info` <br>
	Shortcut: `-i` <br>
	<br>
	Normal usage but when finish to download the photo prints **ID**, **EXIF** and **author url**.
	```bash
		$ splash --info   # or -i

		$ splash -i --id EXAMPLE_PHOTO_ID
		# => Output
		
		#or 
		$ splash save --dest ~/Pictures --info
		# => Output
	```
	![info](https://cloud.githubusercontent.com/assets/16429579/21467813/7c7c4de4-c9fa-11e6-92db-adffb3e091a5.png)

<br>

- ##  ID
	Option: `--id <id | url>` <br>
	Shortcut: `none` <br>
	<br>

	Get the image from **ID** or **URL**.

	> You can get the image id on the [unsplash website](https://unsplash.com) by opening an image and grabbing the **ID** from the url.
 https://unsplash.com/?photo=`EXAMPLE_PHOTO_ID`

  	If you have ever downloaded the photo with **splash-cli** and it is in your actual download folder it will not be downloaded again.
	
	```bash
		$ splash --id YJ9ygJAVzmO
		# or
		$ splash --id https://unsplash.com/?photo=YJ9ygJAVzmO
	```

	As `--info` you can combine it with others subcommands or flags.
	
	```bash
      		$ splash --id YJ9ygJAVzmO --theme
	```

<br>

- ## CLEAN
	Command: `clean` <br>
	<br>
	Delete all downloaded photos.
	```bash
		$ splash clean 		
	```
<br>

- ## RESTORE
	Command: `restore` <br>
	<br>
	Restore default settings.


- ## UPDATE
	Command: `update` <br>
	<br>
	Download  and install the latest version.


<br>


- ## LIST
	Command: `list` <br>
	
	<br>
	
	Print an array with the list of the downloaded photos.
	```bash
		$ splash list		
	```
	You can also export it with `--export`
	```bash
		$ splash list --export
	```
	> NOTE: File names are photos id


<br>

- ## THEME
  Option: `--theme` <br>
  Shortcut: `-t`
  
  Toggle the macOS `dark mode` according to photo's brightness.
  
  <br>
  
  ![theme](https://cloud.githubusercontent.com/assets/16429579/23823903/7dcdba94-066c-11e7-9dc4-23cf338c80f5.png)

  
  ```bash
    $ splash --theme
  ```
