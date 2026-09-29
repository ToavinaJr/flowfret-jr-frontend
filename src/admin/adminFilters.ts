import type { AdminFilter } from "./AdminListPage";

export const ADMIN_USER_FILTERS: AdminFilter[] = [
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
  {
    key: "provider",
    labelKey: "admin.filters.provider",
    options: ["AUDIUS", "SPOTIFY", "YOUTUBE"].map((value) => ({
      value,
      labelKey: `admin.values.${value}`,
    })),
  },
];

export const ADMIN_AUDIT_FILTERS: AdminFilter[] = [
  { key: "action", labelKey: "admin.filters.action", type: "text" },
  { key: "entityType", labelKey: "admin.filters.entityType", type: "text" },
];
