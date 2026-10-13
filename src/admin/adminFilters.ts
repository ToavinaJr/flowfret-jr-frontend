import type { AdminFilter } from "./AdminListPage";

export const ADMIN_USER_FILTERS: AdminFilter[] = [
  { key: "from", labelKey: "admin.filters.from", type: "date" },
  { key: "to", labelKey: "admin.filters.to", type: "date" },
  {
    key: "role",
    labelKey: "admin.filters.role",
    options: [
      { value: "USER", labelKey: "admin.values.USER" },
      { value: "ADMIN", labelKey: "admin.values.ADMIN" },
    ],
  },
  {
    key: "status",
    labelKey: "admin.filters.status",
    options: ["ACTIVE", "PENDING", "SUSPENDED", "DELETED"].map((value) => ({
      value,
      labelKey: `admin.values.${value}`,
    })),
  },
];

export const ADMIN_CONTENT_FILTERS: AdminFilter[] = [
  { key: "from", labelKey: "admin.filters.from", type: "date" },
  { key: "to", labelKey: "admin.filters.to", type: "date" },
  {
    key: "postStatus",
    labelKey: "admin.filters.status",
    options: ["ACTIVE", "HIDDEN", "DELETED"].map((value) => ({
      value,
      labelKey: `admin.values.${value}`,
    })),
  },
];

export const ADMIN_MEDIA_FILTERS: AdminFilter[] = [
  { key: "from", labelKey: "admin.filters.from", type: "date" },
  { key: "to", labelKey: "admin.filters.to", type: "date" },
  {
    key: "transcriptionStatus",
    labelKey: "admin.filters.status",
    options: [
      "PENDING",
      "DOWNLOADING",
      "PROCESSING",
      "READY_TO_PLAY",
      "COMPLETED",
      "FAILED",
    ].map((value) => ({ value, labelKey: `admin.values.${value}` })),
  },
  {
    key: "provider",
    labelKey: "admin.filters.provider",
    options: ["AUDIUS", "SPOTIFY", "YOUTUBE"].map((value) => ({
      value,
      labelKey: `admin.values.${value}`,
    })),
  },
];

export const ADMIN_UPLOAD_FILTERS: AdminFilter[] = [
  { key: "from", labelKey: "admin.filters.from", type: "date" },
  { key: "to", labelKey: "admin.filters.to", type: "date" },
  {
    key: "uploadStatus",
    labelKey: "admin.filters.status",
    options: ["UPLOADED", "PROCESSING", "AVAILABLE", "FAILED", "DELETED"].map(
      (value) => ({
        value,
        labelKey: `admin.values.${value}`,
      }),
    ),
  },
];

export const ADMIN_PROVIDER_FILTERS: AdminFilter[] = [
  { key: "from", labelKey: "admin.filters.from", type: "date" },
  { key: "to", labelKey: "admin.filters.to", type: "date" },
  {
    key: "provider",
    labelKey: "admin.filters.provider",
    options: ["AUDIUS", "SPOTIFY", "YOUTUBE"].map((value) => ({
      value,
      labelKey: `admin.values.${value}`,
    })),
  },
];

export const ADMIN_DATE_FILTERS: AdminFilter[] = [
  { key: "from", labelKey: "admin.filters.from", type: "date" },
  { key: "to", labelKey: "admin.filters.to", type: "date" },
];

export const ADMIN_LYRICS_REPORT_FILTERS: AdminFilter[] = [
  {
    key: "reportStatus",
    labelKey: "admin.filters.status",
    options: ["OPEN", "REVIEWED", "RESOLVED", "DISMISSED"].map((value) => ({
      value,
      labelKey: `admin.values.${value}`,
    })),
  },
];

export const ADMIN_AUDIT_FILTERS: AdminFilter[] = [
  { key: "action", labelKey: "admin.filters.action", type: "text" },
  { key: "entityType", labelKey: "admin.filters.entityType", type: "text" },
  { key: "from", labelKey: "admin.filters.from", type: "date" },
  { key: "to", labelKey: "admin.filters.to", type: "date" },
];
