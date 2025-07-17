require('dotenv').config();
const axios = require('axios');
const fs = require('fs');

const serpApiKey = process.env.SERPAPI_KEY;

const searchGoogleMaps = async (query, location) => {
  const url = 'https://serpapi.com/search.json';

  const params = {
    engine: 'google_maps',
    type: 'search',
    q: query,
    location: location,
    google_domain: 'google.com',
    hl: 'en',
    gl: 'us',
    api_key: serpApiKey,
  };

  try {
    const res = await axios.get(url, { params });
    const results = res.data.local_results || [];

    const leads = results.map((item) => ({
      name: item.title || '',
      phone: item.phone || '',
      address: item.address || '',
      website: item.website || '',
    })).filter(item => item.phone);

    fs.writeFileSync('leads.json', JSON.stringify(leads, null, 2));
    console.log(`✅ Found ${leads.length} leads. Saved to leads.json`);
  } catch (err) {
    console.error('❌ Error scraping:', err.message);
  }
};

const getLeadsFromFile = () => {
  try {
    const data = fs.readFileSync('leads.json');
    return JSON.parse(data);
  } catch (err) {
    console.error('❌ Failed to read leads.json:', err.message);
    return [];
  }
};

module.exports = {
  searchGoogleMaps,
  getLeadsFromFile
};