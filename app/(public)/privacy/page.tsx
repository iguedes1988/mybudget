import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — MyBudget",
  description: "How MyBudget handles your data and privacy",
};

export default function PrivacyPage() {
  return (
    <article className="prose prose-neutral dark:prose-invert max-w-none">
      <h1>Privacy Policy</h1>
      <p className="text-muted-foreground">Last updated: April 2026</p>

      <h2>1. Overview</h2>
      <p>
        Your privacy matters to us. This policy explains what data MyBudget collects,
        how it is used, and your rights regarding that data.
      </p>

      <h2>2. Data We Collect</h2>
      <p>MyBudget stores the following data:</p>
      <ul>
        <li><strong>Account information:</strong> Name, email address, and hashed password (bcrypt, cost factor 12).</li>
        <li><strong>Financial data:</strong> Expense and income entries including date, category, vendor/source, amount, and optional notes.</li>
        <li><strong>Team data:</strong> Team membership and invitation records if you use the team/family feature.</li>
      </ul>

      <h2>3. How Your Data Is Used</h2>
      <p>Your data is used exclusively to:</p>
      <ul>
        <li>Authenticate you and manage your account.</li>
        <li>Display your expense and income records, charts, and reports.</li>
        <li>Generate exports in CSV, Excel, and PDF formats.</li>
        <li>Share financial data within your team or family group (if applicable).</li>
      </ul>

      <h2>4. Third-Party Sharing</h2>
      <p>
        <strong>None.</strong> MyBudget does not sell, share, or transmit your data to
        third-party services, analytics platforms, or advertising networks.
      </p>

      <h2>5. Cookies</h2>
      <p>
        MyBudget uses a single session cookie (HttpOnly, Secure, SameSite) to maintain
        your authenticated session. No tracking cookies, analytics cookies, or third-party
        cookies are used.
      </p>

      <h2>6. Data Retention</h2>
      <p>
        Your data is retained for as long as your account exists. When you delete your account,
        all associated data is scheduled for permanent deletion within 30 days. During this
        period you may cancel the deletion and restore your account.
      </p>

      <h2>7. Your Rights</h2>
      <p>You have the right to:</p>
      <ul>
        <li><strong>Access:</strong> View all data associated with your account via the dashboard and export features.</li>
        <li><strong>Export:</strong> Download all your data in CSV, Excel, or PDF format at any time.</li>
        <li><strong>Rectification:</strong> Edit any of your expense or income records at any time.</li>
        <li><strong>Erasure:</strong> Delete individual records or request complete account deletion from Settings.</li>
        <li><strong>Data portability:</strong> Export your data in standard formats (CSV, XLSX) for use in other applications.</li>
      </ul>

      <h2>8. Data Security</h2>
      <ul>
        <li>Passwords are hashed using bcrypt with a cost factor of 12.</li>
        <li>Sessions use JWT tokens with 30-day expiry.</li>
        <li>All state-mutating operations require authentication.</li>
        <li>HTTP security headers (CSP, X-Frame-Options, HSTS) are enforced.</li>
        <li>Rate limiting protects against brute-force attacks.</li>
      </ul>

      <h2>9. Children&apos;s Privacy</h2>
      <p>
        MyBudget is not intended for use by children under 13. We do not knowingly
        collect personal information from children.
      </p>

      <h2>10. Contact</h2>
      <p>
        For privacy-related questions or to exercise your data rights, contact us at{" "}
        <a href="mailto:admin@appbox.app">admin@appbox.app</a> or through
        our <a href="/contact">Contact Us</a> page.
      </p>
    </article>
  );
}
