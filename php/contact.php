<?php
/**
 * Kancelaria Księgowa Prestige – Anna Wagner
 * Contact Form Handler (PHP)
 *
 * Umieść ten plik na serwerze z PHP.
 * Skonfiguruj zmienne poniżej przed wdrożeniem.
 */

// ============================================================
// KONFIGURACJA – zmień przed wdrożeniem
// ============================================================
define('RECIPIENT_EMAIL', 'biuro@kancelariaprestige.pl');
define('RECIPIENT_NAME', 'Kancelaria Prestige – Anna Wagner');
define('SITE_NAME', 'Kancelaria Księgowa Prestige');
define('ALLOWED_ORIGIN', ''); // np. 'https://prestige-ksiegowosc.pl' lub '' dla dowolnego

// ============================================================
// CORS & HEADERS
// ============================================================
if (ALLOWED_ORIGIN !== '') {
    header('Access-Control-Allow-Origin: ' . ALLOWED_ORIGIN);
} else {
    header('Access-Control-Allow-Origin: *');
}
header('Content-Type: application/json; charset=UTF-8');
header('X-Content-Type-Options: nosniff');

// Akceptuj tylko POST z AJAX
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Metoda niedozwolona.']);
    exit;
}

if (empty($_SERVER['HTTP_X_REQUESTED_WITH']) || strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) !== 'xmlhttprequest') {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Niedozwolone żądanie.']);
    exit;
}

// ============================================================
// SANITIZE & VALIDATE
// ============================================================
function sanitize(string $input): string
{
    return htmlspecialchars(strip_tags(trim($input)), ENT_QUOTES, 'UTF-8');
}

$name = sanitize($_POST['name'] ?? '');
$email = sanitize($_POST['email'] ?? '');
$phone = sanitize($_POST['phone'] ?? '');
$service = sanitize($_POST['service'] ?? '');
$message = sanitize($_POST['message'] ?? '');
$rodo = isset($_POST['rodo']) ? true : false;

$errors = [];

if (empty($name) || mb_strlen($name) < 2) {
    $errors[] = 'Imię i nazwisko jest wymagane (min. 2 znaki).';
}

if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors[] = 'Podaj prawidłowy adres e-mail.';
}

if (empty($message) || mb_strlen($message) < 10) {
    $errors[] = 'Wiadomość jest wymagana (min. 10 znaków).';
}

if (!$rodo) {
    $errors[] = 'Wymagana jest zgoda na przetwarzanie danych osobowych.';
}

// Honeypot (spam protection)
if (!empty($_POST['website'])) {
    http_response_code(200);
    echo json_encode(['success' => true, 'message' => 'Wiadomość wysłana.']);
    exit;
}

if (!empty($errors)) {
    http_response_code(422);
    echo json_encode(['success' => false, 'message' => implode(' ', $errors)]);
    exit;
}

// ============================================================
// BUILD EMAIL
// ============================================================
$serviceLabels = [
    'pelna-ksiegowosc' => 'Pełna Księgowość',
    'kpir' => 'KPiR / Ryczałt',
    'kadry-place' => 'Kadry i Płace',
    'doradztwo' => 'Doradztwo Podatkowe',
    'inne' => 'Inne',
];

$serviceLabel = $serviceLabels[$service] ?? 'Nie podano';

$subject = '[' . SITE_NAME . '] Nowe zapytanie od: ' . $name;

$emailBody = "
Nowe zapytanie ze strony internetowej " . SITE_NAME . "
=======================================================

Imię i Nazwisko: {$name}
E-mail:          {$email}
Telefon:         " . ($phone ?: 'Nie podano') . "
Usługa:          {$serviceLabel}

Wiadomość:
-----------
{$message}

=======================================================
Data:   " . date('Y-m-d H:i:s') . "
IP:     " . ($_SERVER['REMOTE_ADDR'] ?? 'N/A') . "
";

$headers = "From: " . SITE_NAME . " <noreply@" . ($_SERVER['HTTP_HOST'] ?? 'prestige-ksiegowosc.pl') . ">\r\n";
$headers .= "Reply-To: {$name} <{$email}>\r\n";
$headers .= "X-Mailer: PHP/" . phpversion() . "\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
$headers .= "Content-Transfer-Encoding: 8bit\r\n";

// ============================================================
// SEND EMAIL
// ============================================================
$sent = mail(RECIPIENT_EMAIL, $subject, $emailBody, $headers);

if ($sent) {
    // Auto-reply to sender
    $autoReplySubject = 'Potwierdzenie zapytania – ' . SITE_NAME;
    $autoReplyBody = "
Szanowny/a {$name},

Dziękujemy za kontakt z Kancelarią Księgową Prestige – Anna Wagner.

Otrzymaliśmy Twoje zapytanie i odpowiemy najszybciej jak to możliwe,
zazwyczaj w ciągu 1 dnia roboczego.

Jeśli sprawa jest pilna, prosimy o kontakt telefoniczny:
Tel: +48 600 000 000
(Pon–Pt, 8:00–17:00)

Z poważaniem,
Anna Wagner
Kancelaria Księgowa Prestige
ul. Przykładowa 1, 60-001 Poznań
biuro@prestige-ksiegowosc.pl
";

    $autoReplyHeaders = "From: " . RECIPIENT_NAME . " <" . RECIPIENT_EMAIL . ">\r\n";
    $autoReplyHeaders .= "Content-Type: text/plain; charset=UTF-8\r\n";

    mail($email, $autoReplySubject, $autoReplyBody, $autoReplyHeaders);

    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'Dziękujemy! Wiadomość została wysłana. Odpowiemy najszybciej jak to możliwe.'
    ]);
} else {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Wystąpił błąd serwera. Prosimy o kontakt telefoniczny: +48 600 000 000.'
    ]);
}
