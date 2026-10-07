import { Resend } from "resend";

export const runtime = "nodejs";

const MAX_REQUEST_BYTES = 8_000;
const MAX_NAME_LENGTH = 100;
const MAX_EMAIL_LENGTH = 254;
const MAX_MESSAGE_LENGTH = 5_000;
const contactTopics = [
  "General questions about the website",
  "Reporting errors or technical issues",
  "Content suggestions",
  "Partnership or collaboration inquiries",
  "Feedback on user experience",
  "Corrections or updates to published content",
] as const;

type ContactSubmission = {
  name?: unknown;
  email?: unknown;
  topic?: unknown;
  message?: unknown;
  website?: unknown;
};

function isEmail(value: string) {
  return value.length <= MAX_EMAIL_LENGTH && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(request: Request) {
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > MAX_REQUEST_BYTES) {
    return Response.json({ error: "Your message is too large. Please shorten it and try again." }, { status: 413 });
  }

  let payload: ContactSubmission;
  try {
    const body = await request.text();
    if (new TextEncoder().encode(body).byteLength > MAX_REQUEST_BYTES) {
      return Response.json({ error: "Your message is too large. Please shorten it and try again." }, { status: 413 });
    }
    payload = JSON.parse(body) as ContactSubmission;
  } catch {
    return Response.json({ error: "Please check the form and try again." }, { status: 400 });
  }

  if (typeof payload !== "object" || payload === null || Array.isArray(payload)) {
    return Response.json({ error: "Please check the form and try again." }, { status: 400 });
  }

  if (typeof payload.website === "string" && payload.website.trim()) {
    return Response.json({ error: "Unable to submit this message." }, { status: 400 });
  }

  const name = typeof payload.name === "string" ? payload.name.trim() : "";
  const email = typeof payload.email === "string" ? payload.email.trim() : "";
  const topic = typeof payload.topic === "string" ? payload.topic : "";
  const message = typeof payload.message === "string" ? payload.message.trim() : "";

  if (!name || name.length > MAX_NAME_LENGTH) {
    return Response.json({ error: "Enter your name (up to 100 characters)." }, { status: 400 });
  }
  if (!isEmail(email)) {
    return Response.json({ error: "Enter a valid email address." }, { status: 400 });
  }
  if (!contactTopics.some((allowedTopic) => allowedTopic === topic)) {
    return Response.json({ error: "Choose an inquiry topic from the list." }, { status: 400 });
  }
  if (!message || message.length > MAX_MESSAGE_LENGTH) {
    return Response.json({ error: "Enter a message of up to 5,000 characters." }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.CONTACT_FROM_EMAIL;
  const to = process.env.CONTACT_TO_EMAIL ?? "macrocalculators@gmail.com";
  if (!apiKey || !from) {
    console.error("Contact form email is not configured. Set RESEND_API_KEY and CONTACT_FROM_EMAIL.");
    return Response.json({ error: "The contact form is temporarily unavailable. Please email macrocalculators@gmail.com." }, { status: 503 });
  }

  const resend = new Resend(apiKey);
  try {
    const { error } = await resend.emails.send({
      from,
      to,
      replyTo: email,
      subject: `Website contact: ${topic}`,
      text: `Name: ${name}\nEmail: ${email}\nTopic: ${topic}\n\nMessage:\n${message}`,
    });

    if (error) {
      console.error("Resend could not deliver a contact form message:", error.message);
      return Response.json({ error: "We could not send your message right now. Please try again or email macrocalculators@gmail.com." }, { status: 502 });
    }
  } catch (error) {
    console.error("Contact form email request failed:", error);
    return Response.json({ error: "We could not send your message right now. Please try again or email macrocalculators@gmail.com." }, { status: 502 });
  }

  return Response.json({ message: "Thanks for reaching out. Your message has been sent." });
}
