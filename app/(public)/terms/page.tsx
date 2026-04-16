import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Conditions — MyBudget",
  description: "Terms and conditions for using MyBudget",
};

export default function TermsPage() {
  return (
    <article className="prose prose-neutral dark:prose-invert max-w-none">
      <h1>Terms & Conditions</h1>
      <p className="text-muted-foreground">Last updated: April 2026</p>

      <h2>1. Acceptance of Terms</h2>
      <p>
        By accessing or using MyBudget (&ldquo;the Service&rdquo;), you agree to be bound by these Terms
        & Conditions. If you do not agree to these terms, please do not use the Service.
      </p>

      <h2>2. Description of Service</h2>
      <p>
        MyBudget is a personal finance tracking application. The Service allows
        you to record, categorize, and analyze your expenses and income.
      </p>

      <h2>3. User Responsibilities</h2>
      <ul>
        <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
        <li>You are responsible for all activities that occur under your account.</li>
        <li>You agree to provide accurate and complete information when creating your account.</li>
        <li>You are responsible for maintaining the security of your account.</li>
      </ul>

      <h2>4. Prohibited Use</h2>
      <p>You may not:</p>
      <ul>
        <li>Use the Service for any unlawful purpose or to process illegal financial transactions.</li>
        <li>Attempt to gain unauthorized access to other users&apos; accounts or data.</li>
        <li>Interfere with or disrupt the integrity or performance of the Service.</li>
        <li>Upload malicious files or attempt to exploit vulnerabilities in the application.</li>
        <li>Use the Service to store sensitive financial data such as credit card numbers, bank account numbers, or social security numbers.</li>
      </ul>

      <h2>5. Data Ownership</h2>
      <p>
        You retain full ownership of all data you enter into MyBudget. We do not sell
        or share your financial data with third parties.
      </p>

      <h2>6. Limitation of Liability</h2>
      <p>
        The Service is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo; without warranties of any kind,
        either express or implied. We shall not be liable for any indirect, incidental, special,
        consequential, or punitive damages resulting from your use of or inability to use the
        Service, including but not limited to loss of data, loss of revenue, or financial
        decisions made based on information provided by the Service.
      </p>

      <h2>7. Changes to Terms</h2>
      <p>
        We reserve the right to modify these terms at any time. Changes will be effective
        immediately upon posting. Your continued use of the Service after changes are posted
        constitutes your acceptance of the modified terms.
      </p>

      <h2>8. Governing Law</h2>
      <p>
        These terms shall be governed by and construed in accordance with applicable local laws.
        Any disputes arising from these terms shall be resolved through good-faith negotiation
        before pursuing formal legal remedies.
      </p>

      <h2>9. Contact</h2>
      <p>
        For questions about these Terms & Conditions, please contact us at{" "}
        <a href="mailto:admin@appbox.app">admin@appbox.app</a> or through our{" "}
        <a href="/contact">Contact Us</a> page.
      </p>
    </article>
  );
}
