const { execFile } = require('node:child_process');
const path = require('node:path');
const script = path.join(__dirname, 'sendSafetyMail.php');
function invoke(args, message) {
  return new Promise((resolve, reject) => {
    const child = execFile(process.env.PHP_BINARY || 'php', [script, ...args], { timeout: 20000, windowsHide: true }, error => {
      if (error) reject(Object.assign(new Error('PHP mail relay failed'), { code: 'PHP_MAIL_' + error.code }));
      else resolve();
    });
    child.stdin.on('error', reject);
    child.stdin.end(message);
  });
}
module.exports = {
  available: () => invoke(['--check']).then(() => true, () => false),
  async sendMail(message) {
    await invoke([], JSON.stringify(message));
    return { accepted: message.to };
  }
};
