<?php
/**
 * @author           Suat Secmen (http://suat.be)
 * @copyright        2016 Suat Secmen
 * @license          GNU General Public License
 */

// Your Google Drive folder, correct it if you moved/renamed it
$gdriveRoot = $_SERVER['HOME'].'/Google Drive';

// The folder which contains your gists (downloaded via Google Apps Script)
$gistBackups = $gdriveRoot.'/Backups/gists';

// Alfred Preferences Path (create the Gists folder in snippets)
$gistSnippets = $gdriveRoot.'/Configs/AlfredApp/Alfred.alfredpreferences/snippets/Gists';

// --------------

// scan the gists folder for gists
$gists = glob($gistBackups.'/*');
foreach ($gists as $gistFolder) {
	parseGistFolder($gistFolder);
}

/**
 * parse the given gist folder and update the snippet version if the folder
 * matches a pattern
 */
function parseGistFolder($gistFolder) {
	$gistFolderName = preg_replace('~^.*\/([^\/]+)$~', '$1', $gistFolder);
	if (preg_match('~^(\d{4}\-\d{2}\-\d{2}) \- (.*) \- ([a-f0-9]+)$~', $gistFolderName, $m)) {
		if (file_exists($gistFolder.'/'.$m[2])) {
			$mtime = filemtime($gistFolder.'/'.$m[2]);
			updateSnippet($gistFolder, $m[3], $m[2], $mtime);
		}
	}
}

/**
 * check if snippet is up to date, if not recreate it
 */
function updateSnippet($gistFolder, $gistId, $filename, $mtime) {
	$snippet = snippetExists($gistId);
	if (!$snippet || filemtime($snippet) <= $mtime) {
		if ($snippet) {
			$oldJson = file_get_contents($snippet);
			@unlink($snippet);
		} else {
			$oldJson = 0;
		}
		$src = file_get_contents($gistFolder.'/'.$filename);
		createSnippet($gistId, $filename, $src, $oldJson);
	}
}

/**
 * check if snippet exists, return folder if yes
 */
function snippetExists($gistId) {
	global $gistSnippets;
	$dir = glob($gistSnippets.'/* \['.$gistId.'\].json');
	if ($dir) return $dir[0];
	else return 0;
}

/**
 * create the snippet json file
 */
function createSnippet($gistId, $filename, $src, $oldJson = '') {
	global $gistSnippets;
	
	$data = [
		'alfredsnippet' => [
			'snippet' => $src,
			'uid' => $gistId,
			'name' => $filename
		]
	];
	
	// preserve some keys if you set it manually
	if ($oldJson) {
		$arr = @json_decode($oldJson, 1);
		if ($arr && isset($arr['alfredsnippet'])) {
			if (isset($arr['alfredsnippet']['keyword'])) {
				$data['alfredsnippet']['keyword'] = $arr['alfredsnippet']['keyword'];
			}
			if (isset($arr['alfredsnippet']['dontautoexpand'])) {
				$data['alfredsnippet']['dontautoexpand'] = $arr['alfredsnippet']['dontautoexpand'];
			}
		}
	}
	
	file_put_contents($gistSnippets.'/'.$filename.' ['.$gistId.'].json', json_encode($data));
}
