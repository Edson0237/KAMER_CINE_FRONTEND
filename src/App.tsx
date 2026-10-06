import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/shared/auth/AuthContext';
import { ProtectedRoute } from '@/shared/auth/ProtectedRoute';
import { NiveauGuard } from '@/shared/auth/NiveauGuard';
import { PermissionGuard } from '@/shared/auth/PermissionGuard';
import { AppLayout } from '@/shared/layout/AppLayout';
import { LoginScreen } from '@/modules/auth/components/LoginScreen';
import { ForgotPasswordScreen } from '@/modules/auth/components/ForgotPasswordScreen';
import { TwoFactorScreen } from '@/modules/auth/components/TwoFactorScreen';
import { DashboardRouter } from '@/modules/pilotage/components/DashboardRouter';
import { CarteCameroun } from '@/modules/pilotage/components/CarteCameroun';
import { TerritoireList } from '@/modules/territoire/components/TerritoireList';
import { CommuneDetail } from '@/modules/territoire/components/CommuneDetail';
import { ApprenantList } from '@/modules/formation/components/ApprenantList';
import { EncadreurList } from '@/modules/formation/components/EncadreurList';
import { SessionList } from '@/modules/formation/components/SessionList';
import { SessionPickerScreen } from '@/modules/formation/components/SessionPickerScreen';
import { SessionDetailScreen } from '@/modules/formation/components/SessionDetailScreen';
import { AuditLogScreen } from '@/modules/admin/components/AuditLogScreen';
import { UserManagementScreen } from '@/modules/admin/components/UserManagementScreen';
import { RoleManagementScreen } from '@/modules/admin/components/RoleManagementScreen';
import { NationalOverview } from '@/modules/admin/components/NationalOverview';
import { AdminTechniqueOverview } from '@/modules/admin/components/AdminTechniqueOverview';
import { ParametresScreen } from '@/modules/admin/components/ParametresScreen';
import { FeatureFlagsScreen } from '@/modules/admin/components/FeatureFlagsScreen';
import { MaintenanceScreen } from '@/modules/admin/components/MaintenanceScreen';
import { IntegrationsScreen } from '@/modules/admin/components/IntegrationsScreen';
import { SauvegardesScreen } from '@/modules/admin/components/SauvegardesScreen';
import { ActualiteManagementScreen } from '@/modules/site-public/components/ActualiteManagementScreen';
import { FaqManagementScreen } from '@/modules/site-public/components/FaqManagementScreen';
import { EquipeManagementScreen } from '@/modules/site-public/components/EquipeManagementScreen';
import { PartenaireManagementScreen } from '@/modules/site-public/components/PartenaireManagementScreen';
import { CandidatureManagementScreen } from '@/modules/site-public/components/CandidatureManagementScreen';
import { ContactManagementScreen } from '@/modules/site-public/components/ContactManagementScreen';
import { EvenementManagementScreen } from '@/modules/site-public/components/EvenementManagementScreen';
import { CatalogueFormationsScreen } from '@/modules/site-public/components/CatalogueFormationsScreen';
import { ForcePasswordChangeScreen } from '@/modules/auth/components/ForcePasswordChangeScreen';
import { ProfileScreen } from '@/modules/auth/components/ProfileScreen';
import { IncidentManagementScreen } from '@/modules/incident/components/IncidentManagementScreen';
import { DepensesScreen } from '@/modules/budget/components/DepensesScreen';
import { FinancesScreen } from '@/modules/budget/components/FinancesScreen';
import { DiffusionScreen } from '@/modules/communication/components/DiffusionScreen';
import { CirculairesScreen } from '@/modules/communication/components/CirculairesScreen';
import { ReunionsScreen } from '@/modules/communication/components/ReunionsScreen';
import { BibliothequeScreen } from '@/modules/communication/components/BibliothequeScreen';
import { MaterielScreen } from '@/modules/materiel/components/MaterielScreen';
import { ProductionsScreen } from '@/modules/production/components/ProductionsScreen';
import { RapportsScreen } from '@/modules/rapport/components/RapportsScreen';
import { ImportsScreen } from '@/modules/admin/components/ImportsScreen';
import { RealtimeProvider } from '@/shared/realtime/RealtimeProvider';
import { NotificationsScreen } from '@/modules/notification/components/NotificationsScreen';
import { DemoSwitcher } from '@/demo/DemoSwitcher'; // MODE DÉMO TEMPORAIRE — retirer avec src/demo/

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
      {import.meta.env.MODE === 'demo' && <DemoSwitcher />}
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
                <RealtimeProvider>
                  <AppLayout />
                </RealtimeProvider>
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<DashboardRouter />} />
            <Route path="/profile" element={<ProfileScreen />} />
            <Route path="/carte" element={<CarteCameroun />} />
            <Route path="/territoires" element={<TerritoireList />} />
            <Route path="/communes/:id" element={<CommuneDetail />} />
            <Route path="/apprenants" element={<ApprenantList />} />
            <Route path="/encadreurs" element={<EncadreurList />} />
            <Route path="/sessions" element={<SessionList />} />
            <Route path="/sessions/:id" element={<SessionDetailScreen />} />
            <Route path="/presences" element={<SessionPickerScreen tab="presences" />} />
            <Route path="/resultats" element={<SessionPickerScreen tab="resultats" />} />
            <Route path="/attestations" element={<SessionPickerScreen tab="attestations" />} />
            <Route path="/notifications" element={<NotificationsScreen />} />
            <Route path="/incidents" element={<IncidentManagementScreen />} />
            <Route path="/budget/depenses" element={<PermissionGuard anyOf={['depense:read', 'depense:soumettre', 'depense:valider_n4', 'depense:valider_n3', 'depense:valider_n2', 'depense:valider_n1']}><DepensesScreen /></PermissionGuard>} />
            <Route path="/budget/finances" element={<PermissionGuard anyOf={['budget:read', 'subvention:read', 'partenaire_financier:read']}><FinancesScreen /></PermissionGuard>} />
            <Route path="/productions" element={<PermissionGuard permission="production:read"><ProductionsScreen /></PermissionGuard>} />
            <Route path="/rapports" element={<PermissionGuard anyOf={['rapport:read', 'rapport:generer']}><RapportsScreen /></PermissionGuard>} />
            <Route path="/materiel" element={<PermissionGuard permission="materiel:read"><MaterielScreen /></PermissionGuard>} />
            <Route path="/communication/diffusion" element={<PermissionGuard permission="notification:diffuser"><DiffusionScreen /></PermissionGuard>} />
            <Route path="/communication/circulaires" element={<PermissionGuard permission="circulaire:read"><CirculairesScreen /></PermissionGuard>} />
            <Route path="/communication/reunions" element={<PermissionGuard permission="reunion:read"><ReunionsScreen /></PermissionGuard>} />
            <Route path="/communication/bibliotheque" element={<PermissionGuard permission="ressource_bibliotheque:read"><BibliothequeScreen /></PermissionGuard>} />
            <Route path="/admin/overview" element={<NiveauGuard niveaux={[0, 1]}><NationalOverview /></NiveauGuard>} />
            <Route path="/admin/audit" element={<NiveauGuard niveaux={[0, 1]}><AuditLogScreen /></NiveauGuard>} />
            <Route path="/admin/users" element={<NiveauGuard niveaux={[0, 1]}><UserManagementScreen /></NiveauGuard>} />
            <Route path="/admin/roles" element={<NiveauGuard niveaux={[0, 1]}><RoleManagementScreen /></NiveauGuard>} />
            <Route path="/admin/imports" element={<PermissionGuard permission="import:read"><ImportsScreen /></PermissionGuard>} />
            <Route path="/admin/technique" element={<NiveauGuard niveaux={[0]}><AdminTechniqueOverview /></NiveauGuard>} />
            <Route path="/admin/parametres" element={<NiveauGuard niveaux={[0]}><ParametresScreen /></NiveauGuard>} />
            <Route path="/admin/feature-flags" element={<NiveauGuard niveaux={[0]}><FeatureFlagsScreen /></NiveauGuard>} />
            <Route path="/admin/maintenance" element={<NiveauGuard niveaux={[0]}><MaintenanceScreen /></NiveauGuard>} />
            <Route path="/admin/integrations" element={<NiveauGuard niveaux={[0]}><IntegrationsScreen /></NiveauGuard>} />
            <Route path="/admin/sauvegardes" element={<NiveauGuard niveaux={[0]}><SauvegardesScreen /></NiveauGuard>} />
            {/* site.content.manage (§3) — pas un niveau en dur : déléguable à n'importe quel utilisateur via
                user_permission_override, accordée par défaut à N1 et ADMINISTRATEUR_SYSTEME uniquement dans le seed. */}
            <Route path="/site/actualites" element={<PermissionGuard permission="site.content.manage"><ActualiteManagementScreen /></PermissionGuard>} />
            <Route path="/site/faq" element={<PermissionGuard permission="site.content.manage"><FaqManagementScreen /></PermissionGuard>} />
            <Route path="/site/equipe" element={<PermissionGuard permission="site.content.manage"><EquipeManagementScreen /></PermissionGuard>} />
            <Route path="/site/partenaires" element={<PermissionGuard permission="site.content.manage"><PartenaireManagementScreen /></PermissionGuard>} />
            <Route path="/site/evenements" element={<PermissionGuard permission="site.content.manage"><EvenementManagementScreen /></PermissionGuard>} />
            <Route path="/site/catalogue-formations" element={<PermissionGuard permission="site.content.manage"><CatalogueFormationsScreen /></PermissionGuard>} />
            {/* Candidatures/contact restent sur leurs propres permissions (candidature / contact) — pas du "contenu"
                au sens du §3 ; traiter une candidature crée un compte utilisateur, volontairement pas fusionné. */}
            <Route path="/site/candidatures" element={<PermissionGuard permission="candidature:read"><CandidatureManagementScreen /></PermissionGuard>} />
            <Route path="/site/contact" element={<PermissionGuard permission="contact:read"><ContactManagementScreen /></PermissionGuard>} />
          </Route>
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
