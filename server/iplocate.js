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
          const result = {
            ip: json.ip,
            city: json.city,
            region: json.subdivision || json.state || json.region,
            region_code: json.subdivision_code || json.state_code || json.region_code,
            country_code: json.country_code,
            country_code_iso3: json.country_code3,
            country_name: json.country,
            country_capital: undefined,
            country_tld: json.tld,
            continent_code: json.continent_code,
            in_eu: json.in_eu,
            postal: json.postal_code,
            latitude: json.latitude,
            longitude: json.longitude,
            timezone: json.time_zone,
            utc_offset: json.utc_offset,
            country_calling_code: json.country_calling_code,
            currency: json.currency,
            currency_name: json.currency_name,
            languages: json.languages,
            asn: json.asn,
            org: json.org,
          };
          resolve(result);
        } catch (err) {
          reject(err);
        }
      });
    });
    req.on('error', reject);
  });
};
