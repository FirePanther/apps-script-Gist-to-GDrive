/**
 * @author           Suat Secmen (http://suat.be)
 * @copyright        2016 Suat Secmen
 * @license          GNU General Public License
 */

// Don't forget to add this Library (Resources > Libraries...) before you run this script:
// 1B7FSrk5Zi6L1rSxxTDgDEUsPzlukDsi4KGuTMorsTQHhGBzBkMun4iDF

// existing folder in GDrive (doesn't have to be absolute, just one or
// two parents to prevent duplicate results)
var rootFolderPath = 'Backups/gists',
    
    // https://github.com/settings/applications/new
    // your callback url is: https://script.google.com/macros/d/{SCRIPT-ID}/usercallback
    // your script id can be found unter File > Project properties
    github = {
      clientId: '...',
      clientSecret: '...'
    };

/**
 * Main script, download all your gists into a GDrive folder.
 * This script keeps your GDrive gist backups also up to date.
 */
function run() {
  var service = getGithubService();
  if (service.hasAccess()) {
    var response = UrlFetchApp.fetch('https://api.github.com/gists', {
      headers: {
        Authorization: 'Bearer ' + service.getAccessToken()
      }
    }),
        results = JSON.parse(response.getContentText()),
        keep = [];
    for (var x in results) {
      keep.push(downloadGist(results[x]));
    }
    removeDeprecatedGists(keep);
  } else {
    var authorizationUrl = service.getAuthorizationUrl();
    Logger.log('NO GITHUB ACCESS, open URL: ' + authorizationUrl);
    throw 'Please check the logs (ctrl/cmd + enter) to authorize.';
  }
}

/**
 * Create oauth2 github service.
 */
function getGithubService() {
  return OAuth2.createService('github')
    .setAuthorizationBaseUrl('https://github.com/login/oauth/authorize')
    .setTokenUrl('https://github.com/login/oauth/access_token')
    .setClientId(github.clientId)
    .setClientSecret(github.clientSecret)
    .setCallbackFunction('authCallback')
    .setPropertyStore(PropertiesService.getUserProperties());
}

/**
 * Callback after calling the auth url.
 */
function authCallback(request) {
  var error = '',
      service = getGithubService();
  try {
    if (service.handleCallback(request)) {
      return HtmlService.createHtmlOutput(
        '<div style="font-family: verdana; color: green;">' +
        'Success! You can close this tab.' +
        '</div>');
    } else error = 'Denied. You can close this tab.';
  } catch(e) {
    error = e;
  }
  return HtmlService.createHtmlOutput(
    '<div style="font-family: verdana; color: red;">' +
      error +
    '</div>');
}

/**
 * Downloads the whole gist (all files).
 */
function downloadGist(arr) {
  var prop = PropertiesService.getScriptProperties(),
      propVal = prop.getProperty('gist-'+arr.id),
      gistData = propVal && propVal[0] == '{' ? JSON.parse(propVal) : 0;
  if (!gistData || gistData.updated_at !== arr.updated_at) {
    // (re)download
    // create folder
    // folderName: yyyy-mm-dd - filename.ext - id
    var folderName = arr.created_at.substr(0, 10) + ' - ' + Object.keys(arr.files)[0] + ' - ' + arr.id,
      folder = createFolderIfNotExists(rootFolderPath, folderName);
    
    // download description as file
    if (arr.description && arr.description.length) folder.createFile('__description', arr.description);
    
    // download files into folder
    var files = arr.files;
    for (var x in files) {
      if (!downloadFile(files[x], folder)) return ''; // skip for now
    }
    
    Logger.log('Downloaded/Updated Gist: ' + folderName);
    prop.setProperty('gist-'+arr.id, JSON.stringify({
      'updated_at': arr.updated_at,
      'folder_name': folderName
    }));
    return folderName;
  } else {
    return gistData.folder_name;
  }
}

/**
 * Downloads the gist file into the folder.
 */
function downloadFile(file, folder) {
  try {
    var src = UrlFetchApp.fetch(file.raw_url),
        fileIterator = folder.getFiles(file.filename);
    // "override" file(s)
    while (fileIterator.hasNext()) {
      fileIterator.next().setTrashed(true);
    }
    folder.createFile(file.filename, src);
    return true;
  } catch(e) {
    return false;
  }
}

/**
 * Removes all gists that are not in the 'keep' array.
 */
function removeDeprecatedGists(keep) {
  var rootFolder = getFolder(rootFolderPath),
      rootFolderIterator = rootFolder.getFolders();
  while (rootFolderIterator.hasNext()) {
    var folder = rootFolderIterator.next();
    if (keep.indexOf(folder.getName()) == -1) {
      // delete
      folder.setTrashed(true);
      Logger.log(folder.getName()+' is deprecated');
    }
  }
}

/**
 * Checks if the folderName exists in the path. Creates it if not.
 * Returns the folder object.
 */
function createFolderIfNotExists(path, folderName) {
  var folder = getFolder(path + '/' + folderName);
  if (!folder) {
    var parent = getFolder(path);
    if (!parent) throw 'Couldn\'t find obligatory folder: ' + parent;
    folder = parent.createFolder(folderName);
  }
  return folder;
}

/**
 * Gets the folder that matches the given path (checks the parents).
 */
function getFolder(pathStr) {
  var path = pathStr.split('/'),
      name = path.pop(),
      pathLen = path.length,
      folders = DriveApp.getFoldersByName(name);
  if (!folders || !folders.hasNext()) return false;
  while (folders.hasNext()) {
    var folder = folders.next(),
        err = false,
        check = folder;
    if (pathLen) {
      for (var i = pathLen; i > 0; i--) {
        check = getParent(check);
        if (!check || check.getName() !== path[i - 1]) {
          err = true;
          break;
        }
      }
    }
    if (!err) return folder;
  }
  return false;
}

/**
 * Gets the first parent of the file or folder, or returns null
 * if in the file/folder is in the root or invalid.
 */
function getParent(file) {
  if (typeof file != 'object' || !file.getParents) return null;
  var parents = file.getParents();
  if (parents.hasNext()) return parents.next();
  else return null;
}