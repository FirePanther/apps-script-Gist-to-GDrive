# Gist to GDrive for Google Apps Script

Download/Backup your gists to a GDrive folder.

## Setup

### Prepare your Script

First create a new Google Apps Script. Get your Script ID in `File` > `Project`
properties. You will need this for the OAuth.

Set the `rootFolderPath` variable to the target folder name where you want to
download your gists. Optionally add a parent or two to prevent duplicate findings.

In `Resources` > `Libraries...` search for the library:  
`1B7FSrk5Zi6L1rSxxTDgDEUsPzlukDsi4KGuTMorsTQHhGBzBkMun4iDF`  
and click on `Select`.

### OAuth

Get a Github ClientID and -Secret from: https://github.com/settings/applications/new  
Your callback url is: `https://script.google.com/macros/d/{SCRIPT-ID}/usercallback`  
(Here you need the Script ID from the previous step).  
Add your clientID and secretID into your script (replace the `...`).


## Run

Run the `run` function and open the logs (`Cmd|Ctrl + Enter`) after getting an
error message. In the logs open the OAuth url in a new tab. If everything was
successful run the script again and keep an eye on the logs.

If you run your script again the script just updates the previously downloaded
gists. This way the script does take much less time and if you get a timeout
error you can just run the script again to continue.

## Add triggers (cron jobs)

Click on `Resources` > `Current project's triggers` to add the `run`
function as a `Time-driven` trigger. You could execute it once or twice a day to
stay updated (depends on your gist activity).
