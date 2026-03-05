import { connectToDatabase } from "@/lib/db";
import {
  sendMonitorDownEmail,
  sendMonitorHighLatencyEmail,
  sendMonitorRecoveredEmail,
} from "@/lib/mail";
import AlertChannel from "@/models/AlertChannel";
import type { MonitorRegion } from "@/models/Monitor";

type AlertEventType = "down" | "recovery" | "high_latency";

type AlertPayload = {
  eventType: AlertEventType;
  projectId?: string | null;
  monitorName: string;
  monitorUrl: string;
  region: MonitorRegion;
  checkedAt: Date;
  responseTimeMs: number | null;
  statusCode: number | null;
  errorMessage?: string | null;
  incidentId?: string;
};

async function postJsonWebhook(url: string, body: Record<string, unknown>) {
  if (!url) return false;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    return response.ok;
  } catch (error) {
    console.error("[alerts] webhook send failed", error);
    return false;
  }
}

async function sendEmailAlert(to: string[] | undefined, payload: AlertPayload) {
  if (payload.eventType === "down") {
    return sendMonitorDownEmail({
      to,
      monitorName: payload.monitorName,
      monitorUrl: payload.monitorUrl,
      incidentId: payload.incidentId ?? "N/A",
      checkedAt: payload.checkedAt,
      responseTimeMs: payload.responseTimeMs,
      statusCode: payload.statusCode,
      errorMessage: payload.errorMessage,
    });
  }

  if (payload.eventType === "recovery") {
    return sendMonitorRecoveredEmail({
      to,
      monitorName: payload.monitorName,
      monitorUrl: payload.monitorUrl,
      incidentId: payload.incidentId ?? "N/A",
      checkedAt: payload.checkedAt,
      responseTimeMs: payload.responseTimeMs,
      statusCode: payload.statusCode,
      errorMessage: payload.errorMessage,
    });
  }

  if (payload.responseTimeMs !== null) {
    return sendMonitorHighLatencyEmail({
      to,
      monitorName: payload.monitorName,
      monitorUrl: payload.monitorUrl,
      checkedAt: payload.checkedAt,
      responseTimeMs: payload.responseTimeMs,
      statusCode: payload.statusCode,
    });
  }

  return false;
}

async function sendChannelAlert(channel: {
  type: "email" | "slack" | "discord" | "telegram";
  config: Record<string, unknown>;
}, payload: AlertPayload) {
  const title = `[${payload.eventType.toUpperCase()}] ${payload.monitorName} (${payload.region})`;
  const message = payload.errorMessage ?? "No additional error context.";

  if (channel.type === "email") {
    const recipients = String(channel.config.recipients ?? "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);
    return sendEmailAlert(recipients.length > 0 ? recipients : undefined, payload);
  }

  if (channel.type === "slack") {
    const webhookUrl = String(channel.config.webhookUrl ?? "");
    return postJsonWebhook(webhookUrl, {
      text: `${title}\nURL: ${payload.monitorUrl}\nLatency: ${payload.responseTimeMs ?? "N/A"} ms\nStatus: ${payload.statusCode ?? "N/A"}\n${message}`,
    });
  }

  if (channel.type === "discord") {
    const webhookUrl = String(channel.config.webhookUrl ?? "");
    return postJsonWebhook(webhookUrl, {
      content: `${title}\nURL: ${payload.monitorUrl}\nLatency: ${payload.responseTimeMs ?? "N/A"} ms\nStatus: ${payload.statusCode ?? "N/A"}\n${message}`,
    });
  }

  if (channel.type === "telegram") {
    const botToken = String(channel.config.botToken ?? "");
    const chatId = String(channel.config.chatId ?? "");
    if (!botToken || !chatId) return false;

    const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
    return postJsonWebhook(telegramUrl, {
      chat_id: chatId,
      text: `${title}\n${payload.monitorUrl}\nLatency: ${payload.responseTimeMs ?? "N/A"} ms\nStatus: ${payload.statusCode ?? "N/A"}\n${message}`,
    });
  }

  return false;
}

function shouldSendForEvent(
  eventType: AlertEventType,
  events: { onDown: boolean; onRecovery: boolean; onHighLatency: boolean } | undefined,
) {
  if (!events) return false;
  if (eventType === "down") return events.onDown;
  if (eventType === "recovery") return events.onRecovery;
  return events.onHighLatency;
}

export async function dispatchAlert(payload: AlertPayload) {
  await connectToDatabase();

  const channels = await AlertChannel.find({
    enabled: true,
    $or: [{ projectId: payload.projectId ?? null }, { projectId: null }],
  })
    .select("type config events")
    .lean();

  const sendableChannels = channels.filter((channel) =>
    shouldSendForEvent(payload.eventType, channel.events),
  );

  if (sendableChannels.length === 0) {
    await sendEmailAlert(undefined, payload);
    return;
  }

  await Promise.all(
    sendableChannels.map((channel) =>
      sendChannelAlert(
        {
          type: channel.type,
          config: (channel.config as Record<string, unknown>) ?? {},
        },
        payload,
      ),
    ),
  );
}
