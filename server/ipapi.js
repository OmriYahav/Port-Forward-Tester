const https = require('https');

module.exports = function ipapi(ip) {
  return new Promise((resolve, reject) => {
    const req = https.get(`https://ipapi.co/${ip}/json/`, res => {
      if (res.statusCode !== 200) {
        res.resume();
        return reject(new Error(`ipapi status ${res.statusCode}`));
      }
      let data = '';
      res.on('data', chunk => (data += chunk));
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json && json.error) {
            return reject(new Error(json.reason || 'ipapi error'));
          }

        } catch (err) {
          reject(err);
        }
      });
    });
    req.on('error', reject);
  });
};
