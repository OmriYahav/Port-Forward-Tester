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
          const {
            ip,
            city,
            region,
            region_code,
            country_code,
            country_code_iso3,
            country_name,
            country_capital,
            country_tld,
            continent_code,
            in_eu,
            postal,
            latitude,
            longitude,
            timezone,
            utc_offset,
            country_calling_code,
            currency,
            currency_name,
            languages,
            asn,
            org,
          } = json;
          resolve({
            ip,
            city,
            region,
            region_code,
            country_code,
            country_code_iso3,
            country_name,
            country_capital,
            country_tld,
            continent_code,
            in_eu,
            postal,
            latitude,
            longitude,
            timezone,
            utc_offset,
            country_calling_code,
            currency,
            currency_name,
            languages,
            asn,
            org,
          });
        } catch (err) {
          reject(err);
        }
      });
    });
    req.on('error', reject);
  });
};
