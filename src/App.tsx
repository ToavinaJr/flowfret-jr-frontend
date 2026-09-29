import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { lazy, Suspense } from "react";
import { useTranslation } from "react-i18next";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import { AuthGate } from "@/components/AuthGate";
import AppLayout from "@/components/AppLayout";
import { PlaybackProvider } from "@/contexts/PlaybackContext";

const FeedPage = lazy(() => import("@/pages/FeedPage"));
const TunerPage = lazy(() => import("@/pages/TunerPage"));
const ChordsPage = lazy(() => import("@/pages/ChordsPage"));
const UploadPage = lazy(() => import("@/pages/UploadPage"));
const ProfilePage = lazy(() => import("@/pages/ProfilePage"));
const MetronomePage = lazy(() => import("@/pages/MetronomePage"));
const ScalesPage = lazy(() => import("@/pages/ScalesPage"));
const MenuPage = lazy(() => import("@/pages/MenuPage"));
const HistoirePage = lazy(() => import("@/pages/HistoirePage"));
const ContactPage = lazy(() => import("@/pages/ContactPage"));
const ParametresPage = lazy(() => import("@/pages/ParametresPage"));
const MusicSearchPage = lazy(() => import("@/pages/MusicSearchPage"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const HelpPage = lazy(() => import("@/pages/HelpPage"));
const FriendsPage = lazy(() => import("@/pages/FriendsPage"));
const NotificationsPage = lazy(() => import("@/pages/NotificationsPage"));
const PostPage = lazy(() => import("@/pages/PostPage"));
const ModerationPage = lazy(() => import("@/pages/ModerationPage"));
const PlaylistsPage = lazy(() => import("@/pages/PlaylistsPage"));
const TranscriptionsPage = lazy(() => import("@/pages/TranscriptionsPage"));
const AdminRoute = lazy(() => import("@/admin/AdminRoute"));
const AdminLayout = lazy(() => import("@/admin/AdminLayout"));
const AdminOverviewPage = lazy(() => import("@/admin/AdminOverviewPage"));
const AdminUsersPage = lazy(() => import("@/admin/AdminUsersPage"));
const AdminUserDetailPage = lazy(() => import("@/admin/AdminUserDetailPage"));
const AdminContentPage = lazy(() => import("@/admin/AdminContentPage"));
const AdminMediaPage = lazy(() => import("@/admin/AdminMediaPage"));
const AdminMusicPage = lazy(() => import("@/admin/AdminMusicPage"));
const AdminAuditPage = lazy(() => import("@/admin/AdminAuditPage"));

const queryClient = new QueryClient();

const App = () => {
  const { t } = useTranslation();
  return (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem value={{ light: "light", dark: "dark" }}>
      <TooltipProvider>
        <Sonner />
        <AuthProvider>
          <BrowserRouter>
            <PlaybackProvider>
              <AuthGate>
              <Suspense
                fallback={
                  <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
                    {t("common.loading")}
                  </div>
                }
              >
                <Routes>
                  <Route element={<AppLayout />}>
                    <Route path="/" element={<FeedPage />} />
                    <Route path="/tuner" element={<TunerPage />} />
                    <Route path="/chords" element={<ChordsPage />} />
                    <Route path="/upload" element={<UploadPage />} />
                    <Route path="/music" element={<MusicSearchPage />} />
                    <Route path="/playlists" element={<PlaylistsPage />} />
                    <Route path="/transcriptions" element={<TranscriptionsPage />} />
                    <Route path="/metronome" element={<MetronomePage />} />
                    <Route path="/scales" element={<ScalesPage />} />
                    <Route path="/menu" element={<MenuPage />} />
                    <Route path="/histoire" element={<HistoirePage />} />
                    <Route path="/contact" element={<ContactPage />} />
                    <Route path="/parametres" element={<ParametresPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/profile/:userId" element={<ProfilePage />} />
                    <Route path="/friends" element={<FriendsPage />} />
                    <Route path="/notifications" element={<NotificationsPage />} />
                    <Route path="/post/:postId" element={<PostPage />} />
                    <Route path="/help" element={<HelpPage />} />
                    <Route path="/verify-email" element={<FeedPage />} />
                    <Route path="/reset-password" element={<FeedPage />} />
                  </Route>
                  <Route element={<AdminRoute />}>
                    <Route path="/admin" element={<AdminLayout />}>
                      <Route index element={<AdminOverviewPage />} />
                      <Route
                        path="users"
                        element={<AdminUsersPage />}
                      />
                      <Route path="users/:userId" element={<AdminUserDetailPage />} />
                      <Route path="content" element={<AdminContentPage />} />
                      <Route path="content/reports" element={<ModerationPage />} />
                      <Route
                        path="media"
                        element={<AdminMediaPage />}
                      />
                      <Route
                        path="music"
                        element={<AdminMusicPage />}
                      />
                      <Route
                        path="audit"
                        element={<AdminAuditPage />}
                      />
                      <Route
                        path="*"
                        element={<Navigate to="/admin" replace />}
                      />
                    </Route>
                  </Route>
                  <Route
                    path="/moderation"
                    element={<Navigate to="/admin/content/reports" replace />}
                  />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
              </AuthGate>
            </PlaybackProvider>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
  );
};

export default App;
