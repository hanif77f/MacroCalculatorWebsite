"use client";

import { useState, type FormEvent } from "react";

const topics = [
  "General questions about the website",
  "Reporting errors or technical issues",
  "Content suggestions",
  "Partnership or collaboration inquiries",
  "Feedback on user experience",
  "Corrections or updates to published content",
];

export default function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);

    const formData = new FormData(event.currentTarget);
    const submission = {
      name: formData.get("name"),
      email: formData.get("email"),
      topic: formData.get("topic"),
      message: formData.get("message"),
      website: formData.get("website"),
    };

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submission),
      });
      const result = await response.json() as { message?: string; error?: string };

      if (!response.ok) {
        setFeedback({ type: "error", text: result.error ?? "We could not send your message. Please try again." });
        return;
      }

      event.currentTarget.reset();
      setFeedback({ type: "success", text: result.message ?? "Your message has been sent." });
    } catch {
      setFeedback({ type: "error", text: "We could not reach the server. Please try again or email macrocalculators@gmail.com." });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section aria-labelledby="contact-form-title" className="contact-form-section">
      <div className="about-section-label"><span>Send us a message</span><span>Write to our team</span></div>
      <div className="contact-form-layout">
        <div className="contact-form-intro">
          <h2 id="contact-form-title">How can we help?</h2>
          <p>Fill out the form and we&apos;ll get back to you by email, usually within 48–72 hours.</p>
          <a href="mailto:macrocalculators@gmail.com">Prefer email? macrocalculators@gmail.com</a>
        </div>

        <form className="contact-form" onSubmit={handleSubmit}>
          <div className="contact-form-row">
            <label>
              <span>Your name</span>
              <input autoComplete="name" maxLength={100} name="name" placeholder="Jane Smith" required />
            </label>
            <label>
              <span>Email address</span>
              <input autoComplete="email" maxLength={254} name="email" placeholder="jane@example.com" required type="email" />
            </label>
          </div>
          <label>
            <span>What is this about?</span>
            <select defaultValue="" name="topic" required>
              <option disabled value="">Choose a topic</option>
              {topics.map((topic) => <option key={topic} value={topic}>{topic}</option>)}
            </select>
          </label>
          <label>
            <span>Your message</span>
            <textarea maxLength={5000} name="message" placeholder="Tell us how we can help..." required rows={6} />
          </label>
          <label aria-hidden="true" className="contact-form-honeypot" tabIndex={-1}>
            <span>Leave this field empty</span>
            <input autoComplete="off" name="website" tabIndex={-1} />
          </label>
          <div className="contact-form-submit-row">
            <p>We&apos;ll only use your details to respond to your message.</p>
            <button disabled={isSubmitting} type="submit">{isSubmitting ? "Sending..." : "Send message"} <span aria-hidden="true">↗</span></button>
          </div>
          {feedback && <p aria-live="polite" className={`contact-form-feedback contact-form-feedback-${feedback.type}`} role={feedback.type === "error" ? "alert" : "status"}>{feedback.text}</p>}
        </form>
      </div>
    </section>
  );
}
