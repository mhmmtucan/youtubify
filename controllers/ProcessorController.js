'use strict';

var fs = require('fs');
var crypto = require('crypto');
var request = require('request');
var events = require('events');
var eventEmitter = new events.EventEmitter();
var horizon = require('horizon-youtube-mp3');

// Replace "###...###" below with your project's host, access_key and access_secret.
var defaultOptions = {
    host: 'identify-eu-west-1.acrcloud.com',
    endpoint: '/v1/identify',
    signature_version: '1',
    data_type: 'audio',
    secure: true,
    access_key: '54dfca0c47640aa655fc2992e490059f',
    access_secret: 'u264VoJGQ2uFuufJRHAzBRvmFC5LHWMrFMQFflFF'
};

function buildStringToSign(method, uri, accessKey, dataType, signatureVersion, timestamp) {
    return [method, uri, accessKey, dataType, signatureVersion, timestamp].join('\n');
}

function sign(signString, accessSecret) {
    return crypto.createHmac('sha1', accessSecret)
        .update(new Buffer(signString, 'utf-8'))
        .digest().toString('base64');
}

/**
 * Identifies a sample of bytes
 */
function identify(data, options, cb) {

    var current_data = new Date();
    var timestamp = current_data.getTime() / 1000;

    var stringToSign = buildStringToSign('POST',
        options.endpoint,
        options.access_key,
        options.data_type,
        options.signature_version,
        timestamp);

    var signature = sign(stringToSign, options.access_secret);

    var formData = {
        sample: data,
        access_key: options.access_key,
        data_type: options.data_type,
        signature_version: options.signature_version,
        signature: signature,
        sample_bytes: data.length,
        timestamp: timestamp,
    };
    request.post({
        url: "http://" + options.host + options.endpoint,
        method: 'POST',
        formData: formData
    }, cb);
}

function makeRequest(next, slicedArray) {
    return new Promise((resolve, reject) => {
        var resultBody = {}, combinedArray = [];
        var count = 0;
        for (let i = 0; i < slicedArray.length; i++) {
            identify(slicedArray[i], defaultOptions, (err, httpResponse, body) => {
                if (err) {
                    reject(err);
                    next();
                }
                resultBody = JSON.parse(body);
                if (resultBody.status.msg.localeCompare("Success") == 0) {
                    combinedArray.push(resultBody.metadata);
                }
                count += 1;
                if (count === slicedArray.length) {
                    resolve(combinedArray);
                }
            });
        }
    });
}

exports.processMusic = function (next, videoUrl, cb) {
    /*
    eventEmitter.on('fileExists', onConvertVideoComplete);

    if(!fs.existsSync(__dirname + '/../files/'+videoUrl+'.mp3')) {
        horizon.downloadToLocal(
            'https://www.youtube.com/watch?v=' + videoUrl,
            './files',
            videoUrl+'.mp3',
            null,
            null,
            onConvertVideoComplete,
            onConvertVideoProgress
        );
    } else {
        eventEmitter.emit('fileExists', null, 'File already exists!')
    } */

    horizon.downloadToLocal(
        'https://www.youtube.com/watch?v=' + videoUrl,
        './files',
        videoUrl+'.mp3',
        null,
        null,
        onConvertVideoComplete,
        onConvertVideoProgress
    );

    function onConvertVideoProgress(percent, timemark, targetSize) {
        console.log('Progress:', percent, 'Timemark:', timemark, 'Target Size:', targetSize);
    }

    async function onConvertVideoComplete(err, finalResult) {
        console.log(finalResult);
        var bitmap = fs.readFileSync(__dirname + '/../files/'+videoUrl+'.mp3');
        var vidLength = bitmap.length;
        const pieceLength = 250000;
        let numberOfPieces = parseInt(vidLength / pieceLength);
        var slicedArray = [];
        var result;

        for (let i = 0; i < numberOfPieces; i++) {
            slicedArray.push(new Buffer.from(bitmap).slice(i * pieceLength, (i + 1) * pieceLength))
        }
        await makeRequest(next, slicedArray).then(combinedArray => {
            console.log("Making api request for analyze");
            // TODO: iterate over all music data or interrupt api request in first api call
            result = combinedArray[0];

            // get basic music information
            var resultJSON = {};

            result.music.forEach(item => {
                if (resultJSON.title == null) resultJSON.title = item.title;
                if (resultJSON.album == null) resultJSON.album = item.album.name;
                if (resultJSON.genres == null && item.genres) resultJSON.genres = item.genres[0].name;
                if (resultJSON.artists == null && item.artists) resultJSON.artists = item.artists[0].name;
                if (resultJSON.spotifyID == null) resultJSON.spotifyID = item.external_metadata.spotify.track.id;
            });

            cb(null, resultJSON);

        }).catch(err => {
            console.log(err);
            cb(error);
        });
    }
};
