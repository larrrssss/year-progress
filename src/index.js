require('dotenv').config();
const progress = require('progress-string');
const Twit = require('twit');
const cron = require('node-cron');
const fs = require('fs');
const path = require('path');

const T = new Twit({
  consumer_key:         process.env.CONSUMER_KEY,
  consumer_secret:      process.env.CONSUMER_KEY_SECRET,
  access_token:         process.env.ACCESS_TOKEN,
  access_token_secret:  process.env.ACCESS_TOKEN_SECRET,
  timeout_ms:           60 * 1000,
  strictSSL:            true,    
});

function getProgressBar(current, total) {
  return progress({ width: 10, total, complete: '█', incomplete: '░' })(current);
}

async function yearProgress() {
  const lastPercentage = await fs.promises.readFile(path.join(__dirname, 'progress.txt'));

  const start = new Date(2021, 0, 1);
  const end = new Date(2021, 11, 31);

  const percentage = Math.floor(( ( new Date() - start ) / ( end - start ) ) * 100);
  if (percentage === Number(lastPercentage.toString())) return;

  await fs.promises.writeFile(path.join(__dirname, 'progress.txt'), String(percentage));
  const b = getProgressBar(percentage, 100);
  const string = `${b} ${percentage}%`;

  T.post('statuses/update', { status: string }, async (error) => {
    if (error) throw error;

    const message = `Tweet Posted: ${new Date().toISOString()}`;
    await fs.promises.appendFile(path.join(__dirname, 'log.txt'), `${message}\n`);
  });
}

cron.schedule('0 0,12 * * *', () => {
  yearProgress();
});