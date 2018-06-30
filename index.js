const unzip = require('unzipper');
const request = require('request');
const moment = require('moment');

const zlib = require('zlib');
const path = require('path');
const stream = require('stream');


const AMPLITUDE_API = 'https://amplitude.com/api/2/export';

function parseJSONFile(contents) {
  const events = [];
  contents.split('\n').forEach((e) => {
    // ignore empty lines
    if (e.trim() !== '') {
      events.push(JSON.parse(e));
    }
  });
  return events;
}

function parseGzip(entry) {
  return new Promise((resolve, reject) => {
    let contents = '';
    entry.pipe(zlib.Gunzip())
      .on('data', (data) => {
        contents += data;
      })
      .on('end', () => {
        try {
          resolve(parseJSONFile(contents));
        } catch (err) {
          reject(err);
        }
      });
  });
}

class Amplitude {
  /**
   * Configure a new API provided key and secret
   * @param {Object} config API configuration
   * @param  {string} config.apiKey Amplitude API key
   * @param  {string} config.apiSecret Amplitude API secret
   */
  constructor({ apiKey, apiSecret }) {
    if (!apiKey || !apiSecret) {
      throw new Error('apiKey and apiSecret parameters are required.');
    }

    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
  }

  /**
   * Download the ZIP file with the events for data range, parse it and return as JSON
   * @param  {(string|Date)} start the start of the range. Can be a ISO string of a Date object
   * @param  {(string|Date)} end the end of the range. Can be a ISO string of a Date object
   * @returns {Array} An JSON array with the event list
   * @async
   */
  export(start, end) {
    return new Promise((resolve, reject) => {
      if (!start || !end) {
        reject(new Error('start and end date and time required.'));
      }

      const startStr = moment(start).format('YYYYMMDD[T]HH');
      const endStr = moment(end).format('YYYYMMDD[T]HH');

      const allEvents = {};
      request.get({
        url: AMPLITUDE_API,
        auth: {
          user: this.apiKey,
          pass: this.apiSecret
        },
        qs: {
          start: startStr,
          end: endStr
        }
      }).pipe(unzip.Parse())
        .pipe(stream.Transform({
          objectMode: true,
          transform(entry, e, cb) {
            const fileName = path.basename(entry.path, '.json.gz');
            parseGzip(entry)
              .then((events) => {
                allEvents[fileName] = events;
                cb();
              })
              .catch((err) => {
                cb(err);
              });
          }
        }))
        .on('error', err => reject(err))
        .on('finish', () => {
          // Sort events by file name (time) and concat files
          const events = [].concat(...Object.keys(allEvents).sort().map(f => allEvents[f]));
          resolve(events);
        });
    });
  }
}

module.exports = Amplitude;
