const https = require('https');

module.exports = function ipapi(ip) {
  return new Promise((resolve, reject) => {
    const req = https.get(`https://ipapi.co/${ip}/json/`, res => {
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
