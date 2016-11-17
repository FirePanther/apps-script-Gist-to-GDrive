# gist2alfred.php (for MacOS' "AlfredApp")

This script creates snippets for every gist (You'll need the Google Apps Script
to backup your gists first). You can give your snippets a keyword to write out
the whole snippet and the result is everytime up to date, synced with your gist.

## Setup

Correct the first three variables if you're using different folders than me.  
Run this script in a cronjob. This script only updates the snippets if the gists
where updates so it doesn't write very often and you can create a cronjob that
runs it without wasting memory.  
If you change your settings of the gist snippets (adding a keyword or turning off
auto expansion) it preserves this setting even after recreation of the snippet.

Hint: You can create cronjobs easily with a MacOS app called `Cronnix`. Just run
`php $HOME/path/gist2alfred.php` like hourly or daily to stay up to date.
