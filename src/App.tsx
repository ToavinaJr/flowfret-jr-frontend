import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import { AuthGate } from "@/components/AuthGate";
import AppLayout from "@/components/AppLayout";
import FeedPage from "@/pages/FeedPage";
import TunerPage from "@/pages/TunerPage";
import ChordsPage from "@/pages/ChordsPage";
import UploadPage from "@/pages/UploadPage";
import ProfilePage from "@/pages/ProfilePage";
import PlayerPage from "@/pages/PlayerPage";
import MetronomePage from "@/pages/MetronomePage";
import ScalesPage from "@/pages/ScalesPage";
import MenuPage from "@/pages/MenuPage";
import HistoirePage from "@/pages/HistoirePage";
import ContactPage from "@/pages/ContactPage";
import ParametresPage from "@/pages/ParametresPage";
import MusicSearchPage from "@/pages/MusicSearchPage";
import NotFound from "@/pages/NotFound";
import HelpPage from "@/pages/HelpPage";
import FriendsPage from "@/pages/FriendsPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem value={{ light: "light", dark: "dark" }}>
      <TooltipProvider>
        <Sonner />
        <AuthProvider>
          <BrowserRouter>
            <AuthGate>
              <Routes>
                <Route element={<AppLayout />}>
                  <Route path="/" element={<FeedPage />} />
                  <Route path="/tuner" element={<TunerPage />} />
                  <Route path="/chords" element={<ChordsPage />} />
                  <Route path="/upload" element={<UploadPage />} />
                  <Route path="/player" element={<PlayerPage />} />
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
                  <Route path="/help" element={<HelpPage />} />
                  <Route path="/verify-email" element={<FeedPage />} />
                  <Route path="/reset-password" element={<FeedPage />} />
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AuthGate>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
