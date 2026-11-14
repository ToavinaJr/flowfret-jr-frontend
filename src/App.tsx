import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { lazy, Suspense } from "react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthProvider";
import { AuthGate } from "@/components/AuthGate";
import { PlaybackProvider } from "@/contexts/PlaybackContext";
import { CapoProvider } from "@/contexts/CapoContext";
import { AppShellSkeleton } from "@/components/skeletons/AppShellSkeleton";
import AppLayout from "@/components/AppLayout";
import ToolsLayout from "@/components/ToolsLayout";
import ScrollToTop from "@/components/ScrollToTop";

const FeedPage = lazy(() => import("@/pages/FeedPage"));
const PersistentMediaPlayer = lazy(
  () => import("@/components/PersistentMediaPlayer"),
);
const GlobalSearchPage = lazy(() => import("@/pages/GlobalSearchPage"));
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
const RecommendationsPage = lazy(() => import("@/pages/RecommendationsPage"));
const StatsPage = lazy(() => import("@/pages/StatsPage"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const HelpPage = lazy(() => import("@/pages/HelpPage"));
const FriendsPage = lazy(() => import("@/pages/FriendsPage"));
const ChatPage = lazy(() => import("@/pages/ChatPage"));
const NotificationsPage = lazy(() => import("@/pages/NotificationsPage"));
const PostPage = lazy(() => import("@/pages/PostPage"));
const ModerationPage = lazy(() => import("@/pages/ModerationPage"));
const PlaylistsPage = lazy(() => import("@/pages/PlaylistsPage"));
const FavoritesPage = lazy(() => import("@/pages/FavoritesPage"));
const LibraryPage = lazy(() => import("@/pages/LibraryPage"));
const SharedPlaylistPage = lazy(() => import("@/pages/SharedPlaylistPage"));
const TranscriptionsPage = lazy(() => import("@/pages/TranscriptionsPage"));
const TeachingPage = lazy(() => import("@/pages/TeachingPage"));
const AdminRoute = lazy(() => import("@/admin/AdminRoute"));
const AdminLayout = lazy(() => import("@/admin/AdminLayout"));
const AdminOverviewPage = lazy(() => import("@/admin/AdminOverviewPage"));
const AdminUsersPage = lazy(() => import("@/admin/AdminUsersPage"));
const AdminUserDetailPage = lazy(() => import("@/admin/AdminUserDetailPage"));
const AdminContentPage = lazy(() => import("@/admin/AdminContentPage"));
const AdminMediaPage = lazy(() => import("@/admin/AdminMediaPage"));
const AdminMusicPage = lazy(() => import("@/admin/AdminMusicPage"));
const AdminAuditPage = lazy(() => import("@/admin/AdminAuditPage"));
const AdminContactPage = lazy(() => import("@/admin/AdminContactPage"));
const AdminTeachersPage = lazy(() => import("@/admin/AdminTeachersPage"));
const AdminEntityManagerPage = lazy(
  () => import("@/admin/AdminEntityManagerPage"),
);

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        value={{ light: "light", dark: "dark" }}
      >
        <TooltipProvider>
          <Sonner />
          <AuthProvider>
            <BrowserRouter>
              <ScrollToTop />
              <CapoProvider>
                <PlaybackProvider>
                  <AuthGate>
                    <Suspense fallback={<AppShellSkeleton />}>
                      <Routes>
                        <Route element={<AppLayout />}>
                          <Route path="/" element={<FeedPage />} />
                          <Route
                            path="/search"
                            element={<GlobalSearchPage />}
                          />
                          <Route element={<ToolsLayout />}>
                            <Route path="/chords" element={<ChordsPage />} />
                            <Route path="/scales" element={<ScalesPage />} />
                            <Route path="/tuner" element={<TunerPage />} />
                            <Route
                              path="/metronome"
                              element={<MetronomePage />}
                            />
                          </Route>
                          <Route path="/upload" element={<UploadPage />} />
                          <Route path="/music" element={<MusicSearchPage />} />
                          <Route path="/recommendations" element={<RecommendationsPage />} />
                          <Route path="/stats" element={<StatsPage />} />
                          <Route path="/library" element={<LibraryPage />} />
                          <Route path="/favorites" element={<FavoritesPage />} />
                          <Route
                            path="/playlists"
                            element={<PlaylistsPage />}
                          />
                          <Route
                            path="/transcriptions"
                            element={<TranscriptionsPage />}
                          />
                          <Route path="/teaching" element={<TeachingPage />} />
                          <Route path="/menu" element={<MenuPage />} />
                          <Route path="/histoire" element={<HistoirePage />} />
                          <Route path="/contact" element={<ContactPage />} />
                          <Route
                            path="/parametres"
                            element={<ParametresPage />}
                          />
                          <Route path="/profile" element={<ProfilePage />} />
                          <Route
                            path="/profile/:userId"
                            element={<ProfilePage />}
                          />
                          <Route path="/friends" element={<FriendsPage />} />
                          <Route
                            path="/messages/:conversationId?"
                            element={<ChatPage />}
                          />
                          <Route
                            path="/notifications"
                            element={<NotificationsPage />}
                          />
                          <Route path="/post/:postId" element={<PostPage />} />
                          <Route path="/help" element={<HelpPage />} />
                          <Route path="/verify-email" element={<FeedPage />} />
                          <Route
                            path="/reset-password"
                            element={<FeedPage />}
                          />
                        </Route>
                        <Route
                          path="/shared-playlist/:playlistId"
                          element={<SharedPlaylistPage />}
                        />
                        <Route element={<AdminRoute />}>
                          <Route path="/admin" element={<AdminLayout />}>
                            <Route index element={<AdminOverviewPage />} />
                            <Route path="users" element={<AdminUsersPage />} />
                            <Route
                              path="users/:userId"
                              element={<AdminUserDetailPage />}
                            />
                            <Route
                              path="content"
                              element={<AdminContentPage />}
                            />
                            <Route
                              path="content/reports"
                              element={<ModerationPage />}
                            />
                            <Route path="media" element={<AdminMediaPage />} />
                            <Route path="music" element={<AdminMusicPage />} />
                            <Route path="audit" element={<AdminAuditPage />} />
                            <Route path="contact" element={<AdminContactPage />} />
                            <Route
                              path="teachers"
                              element={<AdminTeachersPage />}
                            />
                            <Route
                              path="data"
                              element={<AdminEntityManagerPage />}
                            />
                            <Route
                              path="*"
                              element={<Navigate to="/admin" replace />}
                            />
                          </Route>
                        </Route>
                        <Route
                          path="/moderation"
                          element={
                            <Navigate to="/admin/content/reports" replace />
                          }
                        />
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </Suspense>
                  </AuthGate>
                  <Suspense fallback={null}>
                    <PersistentMediaPlayer />
                  </Suspense>
                </PlaybackProvider>
              </CapoProvider>
            </BrowserRouter>
          </AuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
