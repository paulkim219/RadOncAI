const { Client } = require('ssh2');
const fs = require('fs');

const conn = new Client();

const config = {
  host: '18.216.159.153',        // REPLACE with your EC2 Public IP
  port: 22,
  username: 'ec2-user',        // REPLACE with 'ubuntu' if using Ubuntu AMI
  // Read the private key file from your local path
  privateKey: fs.readFileSync('./nmradoncai.pem'), 
};

conn.on('ready', () => {
  console.log('Client :: ready');
  
  // EXECUTE COMMAND: 'uptime' (shows how long server has been running)
  conn.exec('uptime', (err, stream) => {
    if (err) throw err;
    
    stream.on('close', (code, signal) => {
      console.log(`Stream :: close :: code: ${code}, signal: ${signal}`);
      conn.end(); // Close connection when command finishes
    }).on('data', (data) => {
      console.log('OUTPUT: ' + data);
    }).stderr.on('data', (data) => {
      console.log('ERROR: ' + data);
    });
  });
}).on('error', (err) => {
  console.error('Connection Failed:', err);
}).connect(config);