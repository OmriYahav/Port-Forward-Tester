const https = require('https');

module.exports = function iplocate(ip) {
  return new Promise((resolve, reject) => {
    const req = https.get(`https://iplocate.io/api/lookup/${ip}`, res => {
      let data = '';
      res.on('data', chunk => (data += chunk));
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json && json.error) {
            return reject(new Error(json.reason || 'iplocate error'));
          }

        } catch (err) {
          reject(err);
        }
      });
    });
    req.on('error', reject);
  });
};
