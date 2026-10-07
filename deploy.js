const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('Client :: ready');
  
  // First, find the assets-management directory
  conn.exec('find / -type d -name "assets-management" 2>/dev/null', (err, stream) => {
    if (err) throw err;
    let paths = '';
    stream.on('close', (code, signal) => {
      console.log('Paths found:\n' + paths);
      const dirs = paths.split('\n').filter(p => p.trim() !== '');
      if (dirs.length === 0) {
        console.log('Could not find assets-management directory');
        conn.end();
        return;
      }
      
      // Usually it's /root/assets-management or /var/www/...
      // Let's just try the first one that looks like a repo.
      const targetDir = dirs[0].trim();
      console.log('Deploying to: ' + targetDir);
      
      conn.exec(`cd "${targetDir}" && git pull origin main && npm run build || true && pm2 restart all || true`, (err2, stream2) => {
         if (err2) throw err2;
         stream2.on('close', (code2, signal2) => {
             console.log('Deployment complete with code ' + code2);
             conn.end();
         }).on('data', (data) => {
             console.log('STDOUT: ' + data);
         }).stderr.on('data', (data) => {
             console.log('STDERR: ' + data);
         });
      });
      
    }).on('data', (data) => {
      paths += data;
    }).stderr.on('data', (data) => {
      console.log('STDERR: ' + data);
    });
  });
}).connect({
  host: '191.215.37.241',
  port: 22,
  username: 'root',
  password: 'Yoga@1431430'
});
