const https = require('https');

module.exports = function iplocate(ip) {
  return new Promise((resolve, reject) => {
    const req = https.get(`https://iplocate.io/api/lookup/${ip}`, res => {
      let data = '';
      res.on('data', chunk => (data += chunk));
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (err) {
          reject(err);
        }
      });
    });
    req.on('error', reject);
  });
};
