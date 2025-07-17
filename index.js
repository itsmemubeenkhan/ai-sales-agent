const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { getLeadsFromFile } = require('./scrape');
const { askOpenAI } = require('./ai');
const { parsePhoneNumber } = require('libphonenumber-js');
const fs = require('fs');

const client = new Client();

client.on('qr', (qr) => {
  qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
  console.log('✅ WhatsApp client is ready!');
  startSalesSequence();
});

client.on('message', async (msg) => {
  const response = await askOpenAI(msg.body);
  msg.reply(response);
});

function formatNumber(raw, defaultCountry = 'US') {
  try {
    const phoneNumber = parsePhoneNumber(raw, defaultCountry);
    return phoneNumber.number.replace('+', '') + '@c.us';
  } catch (err) {
    console.error('Invalid number:', raw);
    return null;
  }
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const messageTemplates = [
  "Hey {{name}}, I help local businesses grow via SEO & Web design. Can I share some free insights?",
  "Hi {{name}} 👋 Need help with online visibility or a new website? I help businesses like yours daily.",
  "Hello {{name}}, I'm reaching out to help with digital marketing — may I send a quick audit report?"
];

function getRandomMessage(name) {
  const template = messageTemplates[Math.floor(Math.random() * messageTemplates.length)];
  return template.replace('{{name}}', name || 'there');
}

async function startSalesSequence() {
  const leads = getLeadsFromFile();

  for (let i = 0; i < leads.length; i++) {
    const lead = leads[i];
    const { name, phone } = lead;
    const formatted = formatNumber(phone);

    if (!formatted) continue;

    const message = getRandomMessage(name);

    try {
      await client.sendMessage(formatted, message);
      console.log(`✅ Message sent to ${formatted} (${name})`);
    } catch (err) {
      console.error(`❌ Failed to send message to ${formatted}:`, err.message);
    }

    const delayTime = Math.floor(Math.random() * (45000 - 15000 + 1)) + 15000;
    console.log(`⏳ Waiting for ${delayTime / 1000}s before next message...`);
    await delay(delayTime);
  }
}

client.initialize();
