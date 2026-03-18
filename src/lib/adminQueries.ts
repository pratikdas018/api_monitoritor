import { Types } from "mongoose";

import { connectToDatabase, hasMongoConfig } from "@/lib/db";
import ActivityLog from "@/models/ActivityLog";
import CheckHistory from "@/models/CheckHistory";
import Incident from "@/models/Incident";
import Monitor from "@/models/Monitor";
import MonitorLog from "@/models/MonitorLog";
import User from "@/models/User";

type PaginationInput = {
  page?: number;
  limit?: number;
};

export type AdminStats = {
  totalUsers: number;
  totalApis: number;
  activeApis: number;
  downApis: number;
  incidentsLast24h: number;
};

export type AdminIncidentRow = {
  id: string;
  monitorId: string;
  monitorName: string;
  monitorUrl: string;
  status: string;
  message: string;
  startedAt: string;
  resolvedAt: string | null;
};

export type AdminTrendRow = {
  date: string;
  uptimePercentage: number;
  avgLatencyMs: number;
};

export type AdminUserRow = {
  id: string;
  authId: string | null;
  name: string;
  email: string;
  role: "user" | "admin";
  status: "active" | "suspended" | "deleted";
  createdAt: string;
  lastLoginAt: string | null;
};

export type AdminApiRow = {
  id: string;
  name: string;
  url: string;
  status: string;
  uptimePercentage: number;
  responseTimeMs: number | null;
  intervalMinutes: number;
  userId: string;
  ownerEmail: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AdminLogRow = {
  id: string;
  monitorId: string;
  userId: string;
  eventType: string;
  status: string | null;
  region: string | null;
  message: string | null;
  responseTimeMs: number | null;
  statusCode: number | null;
  timestamp: string;
};

export type AdminActivityRow = {
  id: string;
  userId: string;
  userEmail: string | null;
  role: "user" | "admin";
  action: string;
  targetType: string | null;
  targetId: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  timestamp: string;
};

function normalizePage(input?: number) {
  const page = Number(input ?? 1);
  if (!Number.isFinite(page) || page < 1) return 1;
  return Math.floor(page);
}

function normalizeLimit(input?: number, max = 100) {
  const limit = Number(input ?? 20);
  if (!Number.isFinite(limit) || limit < 1) return 20;
  return Math.min(max, Math.floor(limit));
}

function getPagination(input?: PaginationInput) {
  const page = normalizePage(input?.page);
  const limit = normalizeLimit(input?.limit);
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

function toIso(value: unknown) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value as string);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

function toRegex(value?: string | null) {
  if (!value) return null;
  const normalized = value.replace(/\+/g, " ");
  let decoded = normalized;
  try {
    decoded = decodeURIComponent(normalized);
  } catch {
    decoded = normalized;
  }
  const trimmed = decoded.trim();
  if (!trimmed) return null;
  return new RegExp(trimmed.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
}

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function looksLikeEmail(value: string) {
  const trimmed = value.trim();
  if (trimmed.length < 6 || trimmed.length > 254) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
}

function nameFromEmail(email: string) {
  const local = normalizeEmail(email).split("@")[0] ?? "user";
  const clean = local.replace(/[._-]+/g, " ").trim();
  if (!clean) return "User";
  return clean
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

async function hydrateUsersFromOperationalData() {
  const [monitorRows, activityRows] = await Promise.all([
    Monitor.find({})
      .select("userId ownerEmail")
      .lean<{ userId?: string; ownerEmail?: string | null }[]>(),
    ActivityLog.find({})
      .select("userId userEmail")
      .sort({ timestamp: -1 })
      .limit(5000)
      .lean<{ userId?: string; userEmail?: string | null }[]>(),
  ]);

  const emailToAuthId = new Map<string, string | null>();

  for (const row of monitorRows) {
    const userId = (row.userId ?? "").trim();
    const ownerEmail = normalizeEmail(row.ownerEmail ?? "");

    if (looksLikeEmail(ownerEmail)) {
      const authId = looksLikeEmail(userId) ? null : userId || null;
      if (!emailToAuthId.has(ownerEmail) || (authId && !emailToAuthId.get(ownerEmail))) {
        emailToAuthId.set(ownerEmail, authId);
      }
    }

    if (looksLikeEmail(userId) && !emailToAuthId.has(normalizeEmail(userId))) {
      emailToAuthId.set(normalizeEmail(userId), null);
    }
  }

  for (const row of activityRows) {
    const userEmail = normalizeEmail(row.userEmail ?? "");
    const userId = (row.userId ?? "").trim();
    if (!looksLikeEmail(userEmail)) continue;
    const authId = looksLikeEmail(userId) ? null : userId || null;
    if (!emailToAuthId.has(userEmail) || (authId && !emailToAuthId.get(userEmail))) {
      emailToAuthId.set(userEmail, authId);
    }
  }

  await Promise.all(
    Array.from(emailToAuthId.entries()).map(async ([email, authId]) => {
      if (!looksLikeEmail(email)) return;
      const existing = await User.findOne({ email }).select("_id authId role status").lean();
      const update: Record<string, unknown> = {};
      if (authId && (!existing?.authId || !existing.authId.trim())) {
        update.authId = authId;
      }
      if (!existing) {
        update.name = nameFromEmail(email);
        update.role = "user";
        update.status = "active";
      }

      await User.findOneAndUpdate(
        { email },
        {
          $set: update,
          $setOnInsert: {
            email,
          },
        },
        { upsert: true, new: true },
      );
    }),
  );
}

function calcTotalPages(total: number, limit: number) {
  if (total <= 0) return 0;
  return Math.ceil(total / limit);
}

function toCsv(rows: Record<string, unknown>[]) {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  const escapeCell = (value: unknown) => {
    const text = value === null || value === undefined ? "" : String(value);
    return `"${text.replace(/"/g, '""')}"`;
  };
  const lines = [
    headers.join(","),
    ...rows.map((row) => headers.map((key) => escapeCell(row[key])).join(",")),
  ];
  return lines.join("\n");
}

export async function getAdminStatsData() {
  if (!hasMongoConfig()) {
    return {
      stats: {
        totalUsers: 0,
        totalApis: 0,
        activeApis: 0,
        downApis: 0,
        incidentsLast24h: 0,
      } as AdminStats,
      recentIncidents: [] as AdminIncidentRow[],
      trends: [] as AdminTrendRow[],
    };
  }

  await connectToDatabase();
  await hydrateUsersFromOperationalData();

  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const trendSince = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [userCount, monitorCount, activeApis, downApis, incidentsLast24h, recentIncidents, trendRows] =
    await Promise.all([
      User.countDocuments({ status: { $ne: "deleted" } }),
      Monitor.countDocuments({}),
      Monitor.countDocuments({ status: "up" }),
      Monitor.countDocuments({ status: "down" }),
      Incident.countDocuments({ startedAt: { $gte: since24h } }),
      Incident.find({})
        .sort({ startedAt: -1 })
        .limit(20)
        .select("monitorId monitorName monitorUrl status message startedAt resolvedAt")
        .lean(),
      CheckHistory.aggregate<{ _id: string; total: number; down: number; avgLatency: number }>([
        { $match: { timestamp: { $gte: trendSince } } },
        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$timestamp",
              },
            },
            total: { $sum: 1 },
            down: {
              $sum: {
                $cond: [{ $eq: ["$status", "down"] }, 1, 0],
              },
            },
            avgLatency: { $avg: "$latency" },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

  const recentIncidentRows: AdminIncidentRow[] = recentIncidents.map((incident) => ({
    id: String(incident._id),
    monitorId: String(incident.monitorId),
    monitorName: incident.monitorName,
    monitorUrl: incident.monitorUrl,
    status: String(incident.status),
    message: incident.message,
    startedAt: toIso(incident.startedAt) ?? new Date().toISOString(),
    resolvedAt: toIso(incident.resolvedAt),
  }));

  const trends: AdminTrendRow[] = trendRows.map((row) => {
    const total = row.total || 0;
    const down = row.down || 0;
    const uptimePercentage =
      total > 0 ? Number((((total - down) / total) * 100).toFixed(2)) : 100;
    return {
      date: row._id,
      uptimePercentage,
      avgLatencyMs: Number.isFinite(row.avgLatency) ? Math.round(row.avgLatency) : 0,
    };
  });

  return {
    stats: {
      totalUsers: userCount,
      totalApis: monitorCount,
      activeApis,
      downApis,
      incidentsLast24h,
    } as AdminStats,
    recentIncidents: recentIncidentRows,
    trends,
  };
}

export async function getAdminUsersData(input?: {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  status?: string;
}) {
  const { page, limit, skip } = getPagination(input);
  if (!hasMongoConfig()) {
    return { items: [] as AdminUserRow[], page, limit, total: 0, totalPages: 0 };
  }

  await connectToDatabase();
  await hydrateUsersFromOperationalData();
  const regex = toRegex(input?.search);

  const query: Record<string, unknown> = {};
  if (regex) {
    query.$or = [{ email: regex }, { name: regex }, { authId: regex }];
  }
  if (input?.role && ["user", "admin"].includes(input.role)) {
    query.role = input.role;
  }
  if (input?.status && ["active", "suspended", "deleted"].includes(input.status)) {
    query.status = input.status;
  }

  const [users, total] = await Promise.all([
    User.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    User.countDocuments(query),
  ]);

  return {
    items: users.map((user) => ({
      id: String(user._id),
      authId: user.authId ?? null,
      name: user.name || "N/A",
      email: user.email,
      role: user.role,
      status: user.status,
      createdAt: toIso(user.createdAt) ?? new Date().toISOString(),
      lastLoginAt: toIso(user.lastLoginAt),
    })) as AdminUserRow[],
    page,
    limit,
    total,
    totalPages: calcTotalPages(total, limit),
  };
}

export async function getAdminApisData(input?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  userId?: string;
}) {
  const { page, limit, skip } = getPagination(input);
  if (!hasMongoConfig()) {
    return { items: [] as AdminApiRow[], page, limit, total: 0, totalPages: 0 };
  }

  await connectToDatabase();
  const regex = toRegex(input?.search);
  const query: Record<string, unknown> = {};

  if (input?.status && ["up", "down", "paused", "unknown"].includes(input.status)) {
    query.status = input.status;
  }
  if (input?.userId) {
    query.userId = input.userId.trim();
  }
  if (regex) {
    query.$or = [{ name: regex }, { url: regex }, { userId: regex }, { ownerEmail: regex }];
  }

  const [monitors, total] = await Promise.all([
    Monitor.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Monitor.countDocuments(query),
  ]);

  return {
    items: monitors.map((monitor) => ({
      id: String(monitor._id),
      name: monitor.name,
      url: monitor.url,
      status: monitor.status,
      uptimePercentage: monitor.uptimePercentage ?? 0,
      responseTimeMs: monitor.lastResponseTimeMs ?? null,
      intervalMinutes: monitor.intervalMinutes,
      userId: monitor.userId,
      ownerEmail: monitor.ownerEmail ?? null,
      createdAt: toIso(monitor.createdAt) ?? new Date().toISOString(),
      updatedAt: toIso(monitor.updatedAt) ?? new Date().toISOString(),
    })) as AdminApiRow[],
    page,
    limit,
    total,
    totalPages: calcTotalPages(total, limit),
  };
}

export async function getAdminLogsData(input?: {
  page?: number;
  limit?: number;
  userId?: string;
  monitorId?: string;
  eventType?: string;
  dateFrom?: string;
  dateTo?: string;
  format?: "json" | "csv";
}) {
  const { page, limit, skip } = getPagination(input);
  if (!hasMongoConfig()) {
    return { items: [] as AdminLogRow[], page, limit, total: 0, totalPages: 0, csv: "" };
  }

  await connectToDatabase();
  const query: Record<string, unknown> = {};

  if (input?.userId) {
    query.userId = input.userId.trim();
  }
  if (input?.eventType) {
    query.eventType = input.eventType.trim();
  }
  if (input?.monitorId && Types.ObjectId.isValid(input.monitorId)) {
    query.monitorId = input.monitorId;
  }

  if (input?.dateFrom || input?.dateTo) {
    const timestamp: Record<string, Date> = {};
    if (input.dateFrom) {
      const start = new Date(input.dateFrom);
      if (!Number.isNaN(start.getTime())) timestamp.$gte = start;
    }
    if (input.dateTo) {
      const end = new Date(input.dateTo);
      if (!Number.isNaN(end.getTime())) timestamp.$lte = end;
    }
    if (Object.keys(timestamp).length > 0) {
      query.timestamp = timestamp;
    }
  }

  const [logs, total] = await Promise.all([
    MonitorLog.find(query).sort({ timestamp: -1 }).skip(skip).limit(limit).lean(),
    MonitorLog.countDocuments(query),
  ]);

  const items: AdminLogRow[] = logs.map((log) => ({
    id: String(log._id),
    monitorId: String(log.monitorId),
    userId: log.userId,
    eventType: log.eventType,
    status: log.status ?? null,
    region: log.region ?? null,
    message: log.message ?? null,
    responseTimeMs: log.responseTimeMs ?? null,
    statusCode: log.statusCode ?? null,
    timestamp: toIso(log.timestamp) ?? new Date().toISOString(),
  }));

  return {
    items,
    page,
    limit,
    total,
    totalPages: calcTotalPages(total, limit),
    csv: input?.format === "csv" ? toCsv(items as unknown as Record<string, unknown>[]) : "",
  };
}

export async function getAdminActivityData(input?: {
  page?: number;
  limit?: number;
  search?: string;
  action?: string;
  role?: string;
  dateFrom?: string;
  dateTo?: string;
  format?: "json" | "csv";
}) {
  const { page, limit, skip } = getPagination(input);
  if (!hasMongoConfig()) {
    return { items: [] as AdminActivityRow[], page, limit, total: 0, totalPages: 0, csv: "" };
  }

  await connectToDatabase();
  const regex = toRegex(input?.search);
  const query: Record<string, unknown> = {};

  if (regex) {
    query.$or = [{ userId: regex }, { userEmail: regex }, { action: regex }, { targetType: regex }];
  }
  if (input?.action) {
    query.action = input.action.trim();
  }
  if (input?.role && ["user", "admin"].includes(input.role)) {
    query.role = input.role;
  }
  if (input?.dateFrom || input?.dateTo) {
    const timestamp: Record<string, Date> = {};
    if (input.dateFrom) {
      const start = new Date(input.dateFrom);
      if (!Number.isNaN(start.getTime())) timestamp.$gte = start;
    }
    if (input.dateTo) {
      const end = new Date(input.dateTo);
      if (!Number.isNaN(end.getTime())) timestamp.$lte = end;
    }
    if (Object.keys(timestamp).length > 0) {
      query.timestamp = timestamp;
    }
  }

  const [rows, total] = await Promise.all([
    ActivityLog.find(query).sort({ timestamp: -1 }).skip(skip).limit(limit).lean(),
    ActivityLog.countDocuments(query),
  ]);

  const items: AdminActivityRow[] = rows.map((row) => ({
    id: String(row._id),
    userId: row.userId,
    userEmail: row.userEmail ?? null,
    role: row.role,
    action: row.action,
    targetType: row.targetType ?? null,
    targetId: row.targetId ?? null,
    ipAddress: row.ipAddress ?? null,
    userAgent: row.userAgent ?? null,
    timestamp: toIso(row.timestamp) ?? new Date().toISOString(),
  }));

  return {
    items,
    page,
    limit,
    total,
    totalPages: calcTotalPages(total, limit),
    csv: input?.format === "csv" ? toCsv(items as unknown as Record<string, unknown>[]) : "",
  };
}

export function parsePaginationParams(searchParams: URLSearchParams) {
  return {
    page: Number(searchParams.get("page") ?? "1"),
    limit: Number(searchParams.get("limit") ?? "20"),
  };
}

export function isObjectId(value: string | null) {
  if (!value) return false;
  return Types.ObjectId.isValid(value);
}
