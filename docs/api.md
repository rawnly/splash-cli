# API
- ## DIR
	Option: `--dir [path]` <br>
	Shortcut: `-d` <br>
	<br>

	Set the default download directory.
	```bash
        $ splash --dir ~/Desktop
        # //=> `~/Pictures/splash_photos` ==> `~/Desktop`
	```

	else you can use this option to get the current download directory

	```bash
		$ splash --dir
		# //=> At the moment the directory is '~/Pictures/splash_photos'
    ```

- ##  SAVE
	Option: `--save [path]` <br>
	Shortcut: `-s` <br>
	<br>

	Save the downloaded photo to a local folder if specified, or to the usually `~/Pictures/splash_photos`
	```bash
		$ splash --save ~/Desktop
	```

- ## INFO
	Option: `--info` <br>
	Shortcut: `-i` <br>
	<br>
	Normal usage but when finish to download the photo prints **ID**, **EXIF** and **author url**.
	```bash
		$ splash -i   # or --info

		# You can also combine it with --id
		$ splash -i --id EXAMPLE_PHOTO_ID
	```
	![info](https://cloud.githubusercontent.com/assets/16429579/21467813/7c7c4de4-c9fa-11e6-92db-adffb3e091a5.png)

- ##  ID
	Option: `--id <id | url>` <br>
	Shortcut: `none` <br>
	<br>

	Get the image from **ID** or **URL**.

	> You can get the image id on the [unsplash website](https://unsplash.com) by opening an image and grabbing the **ID** from the url.

	> https://unsplash.com/?photo=`EXAMPLE_PHOTO_ID`

	If you have ever downloaded the photo with **splash-cli** and it is in your actual download folder it will not be downloaded again.
	```bash
		$ splash --id YJ9ygJAVzmO
		# or
		$ splash --id https://unsplash.com/?photo=YJ9ygJAVzmO
	```

- ## CLEAN
	Option: `--clean` <br>
	Shortcut: `-c` <br>
	<br>
	Delete all downloaded photos.
	```bash
		$ splash --clean 		
	```

- ## RESTORE
	Option: `--restore` <br>
	<br>
	Restore default settings.

- ## UPDATE
	Option: `--update` <br>
	Shortcut: `-u` <br>
	<br>
	Download  and install the latest version.
	```bash
		$ splash --update 		 
	```

- ## LIST
	Option: `--list` <br>
	Shortcut: `-l` <br>
	<br>
	Print an array with the list of the downloaded photos.
	```bash
		$ splash -l 		
	```
	You can also export it with `--export`
	```bash
		$ splash -l --export
	```
	> NOTE: File names are photos id
