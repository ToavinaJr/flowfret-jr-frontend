import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { lazy, Suspense } from "react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import { AuthGate } from "@/components/AuthGate";
import AppLayout from "@/components/AppLayout";

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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem value={{ light: "light", dark: "dark" }}>
      <TooltipProvider>
        <Sonner />
        <AuthProvider>
          <BrowserRouter>
            <AuthGate>
              <Suspense
                fallback={
                  <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
                    Chargementâ€¦
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
                <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </AuthGate>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
