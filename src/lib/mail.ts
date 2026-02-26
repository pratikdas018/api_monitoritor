import nodemailer from "nodemailer";

type MonitorAlertPayload = {
  to?: string[];
  monitorName: string;
  monitorUrl: string;
  incidentId: string;
  checkedAt: Date;
  responseTimeMs: number | null;
  statusCode: number | null;
  errorMessage?: string | null;
};

let hasShownMailConfigWarning = false;

function getRecipients(overrideRecipients?: string[]) {
  if (overrideRecipients && overrideRecipients.length > 0) {
    return overrideRecipients;
  }

  const envValue = process.env.ALERT_EMAIL_TO ?? "";
  return envValue
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

function getTransporter() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT ?? "587");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const secure = process.env.SMTP_SECURE === "true";
  const isPlaceholderConfig =
    host === "smtp.example.com" ||
    user === "your-user" ||
    pass === "your-password";

  if (!host || !user || !pass || isPlaceholderConfig) {
    if (!hasShownMailConfigWarning) {
      hasShownMailConfigWarning = true;
      console.warn("[mail] SMTP not configured. Email alerts are disabled.");
    }
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });
}

async function sendMail({
  to,
  subject,
  text,
  html,
}: {
  to: string[];
  subject: string;
  text: string;
  html: string;
}) {
  const transporter = getTransporter();
  const from = process.env.SMTP_FROM;

  if (!transporter || !from || to.length === 0) {
    return false;
  }

  try {
    await transporter.sendMail({
      from,
      to: to.join(", "),
      subject,
      text,
      html,
    });

    return true;
  } catch (error) {
    console.error("[mail] Failed to send email alert", error);
    return false;
  }
}

export async function sendMonitorDownEmail(payload: MonitorAlertPayload) {
  const to = getRecipients(payload.to);
  const incidentLink = `${process.env.APP_URL ?? ""}/incidents`;

  return sendMail({
    to,
    subject: `DOWN: ${payload.monitorName} is unreachable`,
    text: [
      `Monitor: ${payload.monitorName}`,
      `URL: ${payload.monitorUrl}`,
      `Incident ID: ${payload.incidentId}`,
      `Checked At: ${payload.checkedAt.toISOString()}`,
      `Status Code: ${payload.statusCode ?? "N/A"}`,
      `Response Time: ${payload.responseTimeMs ?? "N/A"} ms`,
      `Error: ${payload.errorMessage ?? "Unavailable"}`,
      `Incident Page: ${incidentLink || "Not configured"}`,
    ].join("\n"),
    html: `
      <h2>API Incident Detected</h2>
      <p><strong>Monitor:</strong> ${payload.monitorName}</p>
      <p><strong>URL:</strong> ${payload.monitorUrl}</p>
      <p><strong>Incident ID:</strong> ${payload.incidentId}</p>
      <p><strong>Checked At:</strong> ${payload.checkedAt.toISOString()}</p>
      <p><strong>Status Code:</strong> ${payload.statusCode ?? "N/A"}</p>
      <p><strong>Response Time:</strong> ${payload.responseTimeMs ?? "N/A"} ms</p>
      <p><strong>Error:</strong> ${payload.errorMessage ?? "Unavailable"}</p>
      ${
        incidentLink
          ? `<p><a href="${incidentLink}">Open Incident Timeline</a></p>`
          : ""
      }
    `,
  });
}

export async function sendMonitorRecoveredEmail(payload: MonitorAlertPayload) {
  const to = getRecipients(payload.to);
  const incidentLink = `${process.env.APP_URL ?? ""}/incidents`;

  return sendMail({
    to,
    subject: `RECOVERED: ${payload.monitorName} is back up`,
    text: [
      `Monitor: ${payload.monitorName}`,
      `URL: ${payload.monitorUrl}`,
      `Incident ID: ${payload.incidentId}`,
      `Checked At: ${payload.checkedAt.toISOString()}`,
      `Status Code: ${payload.statusCode ?? "N/A"}`,
      `Response Time: ${payload.responseTimeMs ?? "N/A"} ms`,
      `Incident Page: ${incidentLink || "Not configured"}`,
    ].join("\n"),
    html: `
      <h2>API Recovered</h2>
      <p><strong>Monitor:</strong> ${payload.monitorName}</p>
      <p><strong>URL:</strong> ${payload.monitorUrl}</p>
      <p><strong>Incident ID:</strong> ${payload.incidentId}</p>
      <p><strong>Checked At:</strong> ${payload.checkedAt.toISOString()}</p>
      <p><strong>Status Code:</strong> ${payload.statusCode ?? "N/A"}</p>
      <p><strong>Response Time:</strong> ${payload.responseTimeMs ?? "N/A"} ms</p>
      ${
        incidentLink
          ? `<p><a href="${incidentLink}">Open Incident Timeline</a></p>`
          : ""
      }
    `,
  });
}
