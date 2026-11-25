# Vic

## Local setup with XAMPP

1. Open the XAMPP Control Panel and start **Apache** and **MySQL**.
2. Open `http://localhost/phpmyadmin`, choose **New**, and create a database named `vic_db` with the `utf8mb4_unicode_ci` collation.
3. In `backend`, copy `.env.example` to `.env`. For a standard local XAMPP install, set `DB_HOST=127.0.0.1`, `DB_PORT=3306`, `DB_NAME=vic_db`, `DB_USER=root`, and leave `DB_PASSWORD` empty. Keep the existing `.env` values if you already use a different XAMPP MySQL password. Set `JWT_SECRET` to a private random value.
4. Open a terminal in `backend` and run `npm install`, then `npm run dev` (or `npm start`). The API creates the tables from `backend/config/schema.sql` and inserts starter data on first launch. It does not erase populated tables during ordinary startup.
5. In a second terminal at the project root, run `npm install` once and `npm start`. Open `http://localhost:4200`; the Angular proxy forwards `/api` requests to the local backend at port 5000.
6. To confirm the API is reachable, open `http://localhost:5000/api/health`. To check the data, open phpMyAdmin and select `vic_db`.

If the API reports a database connection error, confirm MySQL is running, that the database name and credentials in `backend/.env` match phpMyAdmin, and that port 3306 is free. Do not commit `backend/.env` or replace it with `.env.example` on a machine that already has working credentials.

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 20.3.34.

## Pharmacovigilance email delivery

Use Node.js 20 or later and install the backend dependencies. Set `SMTP_HOST`, `SMTP_USER`, `SMTP_PASSWORD`, and `EMAIL_FROM` for each backend instance. SMTP defaults to port 465 with implicit TLS. Set `SMTP_PORT=587` if your mail provider specifies STARTTLS on port 587. Restart the backend after changing the configuration.

- **Gmail** uses `smtp.gmail.com`, the full Gmail address as the username and sender, and a [Google App Password](https://myaccount.google.com/apppasswords) after enabling [2-Step Verification](https://support.google.com/accounts/answer/185839).
- **cPanel mailbox** uses the outgoing server and SMTP port shown under **Email Accounts → Connect Devices → Secure SSL/TLS Settings**, plus the full mailbox address and its password.

In **Admin → Settings → Email Templates & Notifications**, enter the notification recipients, one address per line. **Email History** lists the individual queue entries for that environment. An accepted status records that the sending mail server accepted the message. Inbox delivery can be checked in the recipient mailbox or in the mail provider's logs.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
