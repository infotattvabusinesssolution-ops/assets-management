const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('Client :: ready');
  const targetDir = '/var/www/assets-management';
  console.log('Deploying to: ' + targetDir);

  const deployCmd = [
    `cd "${targetDir}"`,
    `git pull origin main`,
    `echo "=== Updating Backend ==="`,
    `cd "${targetDir}/backend"`,
    `npm install`,
    `npx prisma generate`,
    `pm2 restart asset-backend`,
    `echo "=== Building Frontend ==="`,
    `cd "${targetDir}/frontend"`,
    `npm install`,
    `npm run build`,
    `echo "=== Reloading Nginx ==="`,
    `nginx -t && systemctl reload nginx`,
    `echo "=== Deployment Completed Successfully ==="`
  ].join(' && ');

  conn.exec(deployCmd, (err, stream) => {
    if (err) throw err;
    stream.on('close', (code, signal) => {
      console.log('Deployment stream closed with code ' + code);
      conn.end();
    }).on('data', (data) => {
      process.stdout.write(data);
    }).stderr.on('data', (data) => {
      process.stderr.write(data);
    });
  });
}).connect({
  host: '191.215.37.241',
  port: 22,
  username: 'root',
  password: 'Yoga@1431430'
});
