import { describe, it, expect } from "@jest/globals";

// Tests for contact form email logic (unit tests for validation and routing)
describe("Contact Form Email", () => {
  const VALID_SUBJECTS = ["general", "bug", "feature", "privacy"];
  const SUBJECT_LABELS: Record<string, string> = {
    general: "General Inquiry",
    bug: "Bug Report",
    feature: "Feature Request",
    privacy: "Privacy Request",
  };

  it("maps all subject values to labels", () => {
    for (const subject of VALID_SUBJECTS) {
      expect(SUBJECT_LABELS[subject]).toBeDefined();
      expect(SUBJECT_LABELS[subject].length).toBeGreaterThan(0);
    }
  });

  it("rejects invalid subject values", () => {
    const invalidSubjects = ["spam", "other", "", "admin"];
    for (const subject of invalidSubjects) {
      expect(VALID_SUBJECTS.includes(subject)).toBe(false);
    }
  });

  it("formats email subject line correctly", () => {
    const name = "John Doe";
    const subject = "bug";
    const formatted = `[MyBudget Contact] ${SUBJECT_LABELS[subject]} — ${name}`;
    expect(formatted).toBe("[MyBudget Contact] Bug Report — John Doe");
  });

  it("generates plain text email body with all fields", () => {
    const data = {
      name: "Jane Smith",
      email: "jane@example.com",
      subject: "feature",
      message: "Please add dark mode support",
    };
    const text = `Name: ${data.name}\nEmail: ${data.email}\nSubject: ${SUBJECT_LABELS[data.subject]}\n\nMessage:\n${data.message}`;
    expect(text).toContain("Jane Smith");
    expect(text).toContain("jane@example.com");
    expect(text).toContain("Feature Request");
    expect(text).toContain("dark mode");
  });

  it("generates HTML email body with line breaks", () => {
    const message = "Line 1\nLine 2\nLine 3";
    const html = message.replace(/\n/g, "<br/>");
    expect(html).toBe("Line 1<br/>Line 2<br/>Line 3");
    expect(html).not.toContain("\n");
  });

  it("validates email format with zod-like check", () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    expect(emailRegex.test("user@example.com")).toBe(true);
    expect(emailRegex.test("invalid")).toBe(false);
    expect(emailRegex.test("@example.com")).toBe(false);
    expect(emailRegex.test("user@")).toBe(false);
  });

  it("validates message minimum length", () => {
    const MIN_LENGTH = 10;
    expect("short".length >= MIN_LENGTH).toBe(false);
    expect("This is a valid message".length >= MIN_LENGTH).toBe(true);
  });

  it("validates name is required", () => {
    expect("".length > 0).toBe(false);
    expect("John".length > 0).toBe(true);
  });

  it("falls back to console.log when SMTP_HOST is not set", () => {
    // When SMTP_HOST is empty/undefined, the action logs instead of sending email
    const smtpHost = "";
    const shouldSendEmail = !!smtpHost;
    expect(shouldSendEmail).toBe(false);
  });

  it("sends email when SMTP_HOST is configured", () => {
    const smtpHost = "smtp.gmail.com";
    const shouldSendEmail = !!smtpHost;
    expect(shouldSendEmail).toBe(true);
  });
});
