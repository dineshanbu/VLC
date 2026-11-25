<?php
// CLI only. The hosting account's mail relay handles delivery.
if (PHP_SAPI !== 'cli') { http_response_code(404); exit; }
if (!function_exists('mail')) { exit(2); }
if (($argv[1] ?? '') === '--check') {
    if (PHP_OS_FAMILY === 'Windows' && trim((string) ini_get('sendmail_path')) === '') {
        $relay = @fsockopen(ini_get('SMTP'), (int) ini_get('smtp_port'), $errno, $reason, 2);
        if (!$relay) { exit(4); }
        fclose($relay);
    }
    exit(0);
}
$message = json_decode(stream_get_contents(STDIN), true);
$to = $message['to'][0] ?? '';
$from = $message['from'] ?? '';
foreach ([$to, $from] as $address) {
    if (preg_match('/[\r\n]/', $address) || !filter_var($address, FILTER_VALIDATE_EMAIL)) { exit(3); }
}
$headers = [
    'From' => $from,
    'MIME-Version' => '1.0',
    'Content-Type' => 'text/html; charset=UTF-8',
    'Content-Transfer-Encoding' => 'base64',
];
$body = chunk_split(base64_encode($message['html']));
exit(@mail($to, 'Adverse Event Reporting', $body, $headers) ? 0 : 1);
