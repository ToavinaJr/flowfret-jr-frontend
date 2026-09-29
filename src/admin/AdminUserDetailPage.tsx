import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, ArrowLeft, Ban, KeyRound, Shield, Trash2 } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import {
  deleteAdminUser,
  fetchAdminUser,
  revokeAdminUserSessions,
  setAdminUserRole,
  setAdminUserStatus,
} from "@/services/adminApi";
import type { AdminUser } from "@/types/admin";
import { ApiClientError } from "@/types/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AdminStatus } from "./AdminListPage";
import { formatAdminDate } from "./adminFormat";

type UserAction = "role" | "status" | "sessions" | "delete";
const DELETE_CONFIRMATION = "DELETE";

export default function AdminUserDetailPage() {
  const { t, i18n } = useTranslation();
  const { userId = "" } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [action, setAction] = useState<UserAction | null>(null);
  const [reason, setReason] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [nextRole, setNextRole] = useState("USER");
  const [nextStatus, setNextStatus] = useState("ACTIVE");

  const userQuery = useQuery({
    queryKey: ["admin", "user", userId],
    queryFn: () => fetchAdminUser(userId),
    enabled: Boolean(userId),
  });

  const actionMutation = useMutation({
    mutationFn: async (variables: {
      action: UserAction;
      reason: string;
      role: string;
      status: string;
    }) => {
      switch (variables.action) {
        case "role":
          return setAdminUserRole(userId, variables.role, variables.reason);
        case "status":
          return setAdminUserStatus(userId, variables.status, variables.reason);
        case "sessions":
          return revokeAdminUserSessions(userId, variables.reason);
        case "delete":
          return deleteAdminUser(userId, variables.reason);
      }
    },
    onSuccess: (result, variables) => {
      queryClient.setQueryData<AdminUser>(["admin", "user", userId], (current) => ({
        ...result.user,
        activity: current?.activity,
      }));
      void queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      void queryClient.invalidateQueries({ queryKey: ["admin", "audit"] });
      void queryClient.invalidateQueries({ queryKey: ["admin", "statistics"] });
      toast.success(
        variables.action === "sessions"
          ? t("admin.userDetail.sessionsRevoked", {
              count: result.revokedSessionCount,
            })
          : t("admin.userDetail.actionComplete", {
              count: result.revokedSessionCount,
            }),
      );
      closeAction();
      if (variables.action === "delete") {
        void queryClient.removeQueries({ queryKey: ["admin", "user", userId] });
        navigate("/admin/users", { replace: true });
      }
    },
    onError: (error) => {
      const code =
        error instanceof ApiClientError
          ? error.graphQLErrors[0]?.extensions?.code
          : undefined;
      toast.error(
        code
          ? t(`admin.userDetail.errors.${code}`, {
              defaultValue: t("admin.userDetail.actionFailed"),
            })
          : t("admin.userDetail.actionFailed"),
      );
    },
  });

  function openAction(nextAction: UserAction) {
    setAction(nextAction);
    setReason("");
    setConfirmation("");
    setNextRole(userQuery.data?.role === "ADMIN" ? "USER" : "ADMIN");
    setNextStatus(userQuery.data?.status === "SUSPENDED" ? "ACTIVE" : "SUSPENDED");
  }

  function closeAction() {
    setAction(null);
    setReason("");
    setConfirmation("");
  }

  function submitAction(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!action || reason.trim().length < 3) return;
    if (action === "delete" && confirmation !== DELETE_CONFIRMATION) return;
    actionMutation.mutate({ action, reason: reason.trim(), role: nextRole, status: nextStatus });
  }

  const user = userQuery.data;
  const isUnavailable = !user || user.isDeleted || user.status === "DELETED";
  const date = (value?: string | null) =>
    value ? formatAdminDate(value, i18n.language) : t("admin.userDetail.never");

  return (
    <section aria-labelledby="admin-user-detail-title" className="space-y-6">
      <Link
        to="/admin/users"
        className="inline-flex min-h-11 items-center gap-2 rounded-lg text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft aria-hidden="true" className="h-4 w-4" />
        {t("admin.userDetail.back")}
      </Link>

      {userQuery.isError ? (
        <div role="alert" className="rounded-xl border border-destructive/30 bg-card p-5">
          <p className="font-medium">{t("admin.userDetail.loadFailed")}</p>
          <button
            type="button"
            onClick={() => void userQuery.refetch()}
            className="mt-3 min-h-11 rounded-lg bg-secondary px-4 text-sm"
          >
            {t("common.retry")}
          </button>
        </div>
      ) : null}

      {userQuery.isLoading ? (
        <div aria-label={t("common.loading")} className="h-48 animate-pulse rounded-xl bg-secondary" />
      ) : null}

      {user ? (
        <>
          <header className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="text-sm text-muted-foreground">@{user.username}</p>
              <h1 id="admin-user-detail-title" className="mt-1 break-words text-2xl font-semibold">
                {user.displayName || user.username}
              </h1>
              <p className="mt-1 break-all text-sm text-muted-foreground">{user.email}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <AdminStatus value={user.role} />
                <AdminStatus value={user.status} />
                {user.isDeleted ? <AdminStatus value="DELETED" /> : null}
              </div>
            </div>
            {!isUnavailable ? (
              <div className="flex flex-wrap gap-2">
                <ActionButton icon={Shield} onClick={() => openAction("role")}>
                  {t("admin.userDetail.changeRole")}
                </ActionButton>
                <ActionButton icon={Ban} onClick={() => openAction("status")}>
                  {t("admin.userDetail.changeStatus")}
                </ActionButton>
                <ActionButton icon={KeyRound} onClick={() => openAction("sessions")}>
                  {t("admin.userDetail.revokeSessions")}
                </ActionButton>
                <ActionButton destructive icon={Trash2} onClick={() => openAction("delete")}>
                  {t("admin.userDetail.delete")}
                </ActionButton>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">{t("admin.userDetail.deletedNotice")}</p>
            )}
          </header>

          <div className="grid gap-4 lg:grid-cols-2">
            <InfoSection title={t("admin.userDetail.accountTitle")}>
              <InfoRow label={t("admin.userDetail.createdAt")} value={date(user.createdAt)} />
              <InfoRow label={t("admin.userDetail.updatedAt")} value={date(user.updatedAt)} />
              <InfoRow label={t("admin.columns.lastLogin")} value={date(user.lastLoginAt)} />
              {user.deletedAt ? (
                <InfoRow label={t("admin.userDetail.deletedAt")} value={date(user.deletedAt)} />
              ) : null}
              <InfoRow label={t("admin.userDetail.userId")} value={user.id} />
            </InfoSection>

            <InfoSection title={t("admin.userDetail.activityTitle")}>
              {user.activity ? (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <Metric label={t("admin.userDetail.posts")} value={user.activity.posts} />
                  <Metric label={t("admin.userDetail.comments")} value={user.activity.comments} />
                  <Metric label={t("admin.userDetail.playlists")} value={user.activity.playlists} />
                  <Metric label={t("admin.userDetail.uploads")} value={user.activity.uploads} />
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">{t("admin.userDetail.activityUnavailable")}</p>
              )}
            </InfoSection>
          </div>
        </>
      ) : null}

      <Dialog
        open={action !== null}
        onOpenChange={(open) => {
          if (!open && !actionMutation.isPending) closeAction();
        }}
      >
        <DialogContent className="w-[calc(100%-2rem)] max-w-lg rounded-xl">
          <DialogHeader>
            <DialogTitle>
              {action ? t(`admin.userDetail.actions.${action}.title`) : ""}
            </DialogTitle>
            <DialogDescription>
              {action ? t(`admin.userDetail.actions.${action}.description`) : ""}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={submitAction} className="space-y-4">
            {action === "role" ? (
              <SelectField
                id="admin-user-role"
                label={t("admin.userDetail.role")}
                value={nextRole}
                onChange={setNextRole}
                options={["USER", "ADMIN"]}
                translate={(value) => t(`admin.values.${value}`)}
              />
            ) : null}
            {action === "status" ? (
              <SelectField
                id="admin-user-status"
                label={t("admin.userDetail.status")}
                value={nextStatus}
                onChange={setNextStatus}
                options={["ACTIVE", "PENDING", "SUSPENDED"]}
                translate={(value) => t(`admin.values.${value}`)}
              />
            ) : null}
            <label htmlFor="admin-user-action-reason" className="block text-sm">
              <span className="mb-1 block text-muted-foreground">
                {t("admin.userDetail.reason")}
              </span>
              <textarea
                id="admin-user-action-reason"
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                minLength={3}
                maxLength={500}
                required
                rows={3}
                className="w-full resize-y rounded-lg border border-border bg-background p-3 outline-none focus:ring-2 focus:ring-primary"
              />
            </label>
            {action === "delete" ? (
              <div className="space-y-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3">
                <p className="flex items-start gap-2 text-sm text-destructive">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  {t("admin.userDetail.deleteWarning")}
                </p>
                <label htmlFor="admin-user-delete-confirmation" className="block text-sm">
                  <span className="mb-1 block text-muted-foreground">
                    {t("admin.userDetail.typeDelete", { token: DELETE_CONFIRMATION })}
                  </span>
                  <input
                    id="admin-user-delete-confirmation"
                    value={confirmation}
                    onChange={(event) => setConfirmation(event.target.value)}
                    autoComplete="off"
                    className="min-h-11 w-full rounded-lg border border-border bg-background px-3"
                  />
                </label>
              </div>
            ) : null}
            <DialogFooter>
              <button
                type="button"
                onClick={closeAction}
                disabled={actionMutation.isPending}
                className="min-h-11 rounded-lg border border-border px-4 text-sm disabled:opacity-50"
              >
                {t("common.cancel")}
              </button>
              <button
                type="submit"
                disabled={
                  actionMutation.isPending ||
                  reason.trim().length < 3 ||
                  (action === "delete" && confirmation !== DELETE_CONFIRMATION) ||
                  (action === "role" && nextRole === user?.role) ||
                  (action === "status" && nextStatus === user?.status)
                }
                className={`min-h-11 rounded-lg px-4 text-sm text-primary-foreground disabled:opacity-50 ${action === "delete" ? "bg-destructive" : "bg-primary"}`}
              >
                {actionMutation.isPending
                  ? t("common.loading")
                  : action
                    ? t(`admin.userDetail.actions.${action}.confirm`)
                    : t("common.save")}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
}

function ActionButton({
  children,
  icon: Icon,
  onClick,
  destructive = false,
}: {
  children: React.ReactNode;
  icon: typeof Shield;
  onClick: () => void;
  destructive?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex min-h-11 items-center gap-2 rounded-lg border px-3 text-sm ${destructive ? "border-destructive/40 text-destructive hover:bg-destructive/10" : "border-border hover:bg-secondary"}`}
    >
      <Icon aria-hidden="true" className="h-4 w-4" />
      {children}
    </button>
  );
}

function InfoSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-border bg-card p-5">
      <h2 className="mb-4 font-semibold">{title}</h2>
      {children}
    </section>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 border-b border-border py-2 last:border-0 sm:flex-row sm:justify-between sm:gap-4">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="break-all text-sm font-medium sm:text-right">{value}</dd>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg bg-secondary/60 p-3">
      <p className="text-xl font-semibold tabular-nums">{value.toLocaleString()}</p>
      <p className="mt-1 text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function SelectField({
  id,
  label,
  value,
  onChange,
  options,
  translate,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  translate: (value: string) => string;
}) {
  return (
    <label htmlFor={id} className="block text-sm">
      <span className="mb-1 block text-muted-foreground">{label}</span>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-11 w-full rounded-lg border border-border bg-background px-3"
      >
        {options.map((option) => (
          <option key={option} value={option}>{translate(option)}</option>
        ))}
      </select>
    </label>
  );
}
