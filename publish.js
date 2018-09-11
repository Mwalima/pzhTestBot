var zipFolder = require('zip-folder');
var path = require('path');
var fs = require('fs');
var request = require('request');

var rootFolder = path.resolve('.');
var zipPath = path.resolve(rootFolder, '../i242fe0126ee3428592e534e.zip');
var kuduApi = 'https://i242fe0126ee3428592e534e.scm.azurewebsites.net/api/zip/site/wwwroot';
var userName = '$i242fe0126ee3428592e534e';
var password = '0Y522jNnviAxQsl9Rm5FQ18DZkyKqNrqkxtAzp9si2wnxlzzRt1D6DbpuYij';

function uploadZip(callback) {
  fs.createReadStream(zipPath).pipe(request.put(kuduApi, {
    auth: {
      username: userName,
      password: password,
      sendImmediately: true
    },
    headers: {
      "Content-Type": "applicaton/zip"
    }
  }))
  .on('response', function(resp){
    if (resp.statusCode >= 200 && resp.statusCode < 300) {
      fs.unlink(zipPath);
      callback(null);
    } else if (resp.statusCode >= 400) {
      callback(resp);
    }
  })
  .on('error', function(err) {
    callback(err)
  });
}

function publish(callback) {
  zipFolder(rootFolder, zipPath, function(err) {
    if (!err) {
      uploadZip(callback);
    } else {
      callback(err);
    }
  })
}

publish(function(err) {
  if (!err) {
    console.log('i242fe0126ee3428592e534e publish');
  } else {
    console.error('failed to publish i242fe0126ee3428592e534e', err);
  }
});