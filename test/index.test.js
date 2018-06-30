const fs = require('fs');

const request = require('request');
const Amplitude = require('../index.js');

// const myMock = jest.fn();
// myMock.mockReturnValue(fs.createReadStream('events.test.json'));

jest.mock('request');


test('should fetch events from compressed api response', async () => {
  expect.assertions(1);
  request.get.mockImplementation((() => fs.createReadStream('./test/test.zip')));

  const a = new Amplitude({ apiKey: 'anything', apiSecret: 'something' });
  const result = await a.export('20180101T00', '20180101T02');
  expect(result.length).toBe(9892);
});
