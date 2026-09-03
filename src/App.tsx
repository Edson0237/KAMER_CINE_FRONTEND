import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/shared/auth/AuthContext';
import { ProtectedRoute } from '@/shared/auth/ProtectedRoute';
import { NiveauGuard } from '@/shared/auth/NiveauGuard';
import { AppLayout } from '@/shared/layout/AppLayout';
import { LoginScreen } from '@/modules/auth/components/LoginScreen';
import { ForgotPasswordScreen } from '@/modules/auth/components/ForgotPasswordScreen';
import { TwoFactorScreen } from '@/modules/auth/components/TwoFactorScreen';
import { Dashboard } from '@/modules/pilotage/components/Dashboard';
import { CarteCameroun } from '@/modules/pilotage/components/CarteCameroun';
import { TerritoireList } from '@/modules/territoire/components/TerritoireList';
import { CommuneDetail } from '@/modules/territoire/components/CommuneDetail';
import { ApprenantList } from '@/modules/formation/components/ApprenantList';
import { EncadreurList } from '@/modules/formation/components/EncadreurList';
import { SessionList } from '@/modules/formation/components/SessionList';
import { PresenceList } from '@/modules/formation/components/PresenceList';
import { ResultatList } from '@/modules/formation/components/ResultatList';
import { AttestationList } from '@/modules/formation/components/AttestationList';
import { AuditLogScreen } from '@/modules/admin/components/AuditLogScreen';
import { UserManagementScreen } from '@/modules/admin/components/UserManagementScreen';
import { RoleManagementScreen } from '@/modules/admin/components/RoleManagementScreen';
import { NationalOverview } from '@/modules/admin/components/NationalOverview';
import { ParametresScreen } from '@/modules/admin/components/ParametresScreen';
import { FeatureFlagsScreen } from '@/modules/admin/components/FeatureFlagsScreen';
import { ActualiteManagementScreen } from '@/modules/site-public/components/ActualiteManagementScreen';
import { FaqManagementScreen } from '@/modules/site-public/components/FaqManagementScreen';
import { EquipeManagementScreen } from '@/modules/site-public/components/EquipeManagementScreen';
import { PartenaireManagementScreen } from '@/modules/site-public/components/PartenaireManagementScreen';
import { CandidatureManagementScreen } from '@/modules/site-public/components/CandidatureManagementScreen';
import { ContactManagementScreen } from '@/modules/site-public/components/ContactManagementScreen';
import { ForcePasswordChangeScreen } from '@/modules/auth/components/ForcePasswordChangeScreen';
import { ProfileScreen } from '@/modules/auth/components/ProfileScreen';

/**
 * Composant racine — configure le routing de l'application web.
 *
 * <p>Toutes les routes sauf /login, /forgot-password et /verify-2fa sont
 * protégées par {@link ProtectedRoute}. L'application est enveloppée dans
 * {@link AuthProvider} pour exposer le contexte d'authentification.</p>
 */
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/forgot-password" element={<ForgotPasswordScreen />} />
          <Route path="/verify-2fa" element={<TwoFactorScreen />} />
          <Route
            path="/force-password-change"
            element={
              <ProtectedRoute>
                <ForcePasswordChangeScreen />
              </ProtectedRoute>
            }
          />
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<ProfileScreen />} />
            <Route path="/carte" element={<CarteCameroun />} />
            <Route path="/territoires" element={<TerritoireList />} />
            <Route path="/communes/:id" element={<CommuneDetail />} />
            <Route path="/apprenants" element={<ApprenantList />} />
            <Route path="/encadreurs" element={<EncadreurList />} />
            <Route path="/sessions" element={<SessionList />} />
            <Route path="/presences" element={<PresenceList />} />
            <Route path="/resultats" element={<ResultatList />} />
            <Route path="/attestations" element={<AttestationList />} />
            <Route path="/admin/overview" element={<NiveauGuard niveaux={[0, 1]}><NationalOverview /></NiveauGuard>} />
            <Route path="/admin/audit" element={<NiveauGuard niveaux={[0, 1]}><AuditLogScreen /></NiveauGuard>} />
            <Route path="/admin/users" element={<NiveauGuard niveaux={[0, 1]}><UserManagementScreen /></NiveauGuard>} />
            <Route path="/admin/roles" element={<NiveauGuard niveaux={[0, 1]}><RoleManagementScreen /></NiveauGuard>} />
            <Route path="/admin/parametres" element={<NiveauGuard niveaux={[0]}><ParametresScreen /></NiveauGuard>} />
            <Route path="/admin/feature-flags" element={<NiveauGuard niveaux={[0]}><FeatureFlagsScreen /></NiveauGuard>} />
            <Route path="/site/actualites" element={<NiveauGuard niveaux={[1]}><ActualiteManagementScreen /></NiveauGuard>} />
            <Route path="/site/faq" element={<NiveauGuard niveaux={[1]}><FaqManagementScreen /></NiveauGuard>} />
            <Route path="/site/equipe" element={<NiveauGuard niveaux={[1]}><EquipeManagementScreen /></NiveauGuard>} />
            <Route path="/site/partenaires" element={<NiveauGuard niveaux={[1]}><PartenaireManagementScreen /></NiveauGuard>} />
            <Route path="/site/candidatures" element={<NiveauGuard niveaux={[1]}><CandidatureManagementScreen /></NiveauGuard>} />
            <Route path="/site/contact" element={<NiveauGuard niveaux={[1]}><ContactManagementScreen /></NiveauGuard>} />
          </Route>
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
