import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Agentation } from 'agentation';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CommandPaletteProvider } from './context/CommandPaletteContext';

import { MainLayout } from './components/layout/MainLayout';
import { Login } from './pages/Login';
import { ExecutiveDashboard } from './pages/ExecutiveDashboard';
import { AssetList } from './pages/AssetList';
import { Asset360Detail } from './pages/Asset360Detail';
import { AssetForm } from './pages/AssetForm';
import { AssetEdit } from './pages/AssetEdit';
import { MyAssets } from './pages/MyAssets';
import { BulkUpload } from './pages/BulkUpload';
import { AssetHierarchy } from './pages/AssetHierarchy';
import { AssetApproval } from './pages/AssetApproval';
import { ReceivingWorkbench } from './pages/ReceivingWorkbench';
import { ReceiveWithoutPO } from './pages/ReceiveWithoutPO';
import { ReceivingHistory } from './pages/ReceivingHistory';
import { BulkTaggingWorkbench } from './pages/BulkTaggingWorkbench';
import { PrintTagsWorkbench } from './pages/PrintTagsWorkbench';
import { TagWorkbench } from './pages/TagWorkbench';
import { CustodyTransferWorkbench } from './pages/CustodyTransferWorkbench';
import { AssignmentMovementWorkbench } from './pages/AssignmentMovementWorkbench';
import { AssignAsset } from './pages/AssignAsset';
import { MovementHistory } from './pages/MovementHistory';
import TransferMovement from './pages/TransferMovement';
import { MovementApprovals } from './pages/MovementApprovals';
import { StocktakeManager } from './pages/StocktakeManager';
import { AssetVerification } from './pages/AssetVerification';
import { AuditExecution } from './pages/AuditExecution';
import AuditManagement from './pages/AuditManagement';
import CreateAudit from './pages/CreateAudit';
import { AuditReport } from './pages/AuditReport';
import { MaintenanceManager } from './pages/MaintenanceManager';
import { CreateWorkOrder } from './pages/CreateWorkOrder';
import { MaintenancePlans } from './pages/MaintenancePlans';
import { PreventiveMaintenance } from './pages/PreventiveMaintenance';
import { DiscoveryWorkbench } from './pages/DiscoveryWorkbench';
import { DiscoverySettings } from './pages/DiscoverySettings';
import { ImportToAsset360 } from './pages/ImportToAsset360';
import { DiscoveredDevicesWorkbench } from './pages/DiscoveredDevicesWorkbench';
import { ReportsCatalogue } from './pages/ReportsCatalogue';
import { WorkflowDesigner } from './pages/WorkflowDesigner';
import { AISuite } from './pages/AISuite';
import { AssetTracking } from './pages/AssetTracking';
import { LocationMap } from './pages/LocationMap';
import { Geofencing } from './pages/Geofencing';
import { LocationHistory } from './pages/LocationHistory';
import { ProximitySearch } from './pages/ProximitySearch';
import { AdminMasterData } from './pages/AdminMasterData';
import { MobileScanWorkbench } from './pages/MobileScanWorkbench';
import { UserManagementWorkbench } from './pages/UserManagementWorkbench';
import { ServiceProviderAction } from './pages/ServiceProviderAction';
import { SpareParts } from './pages/SpareParts';
import { MasterDataSetup } from './pages/admin/MasterDataSetup';
import { IntegrationsConsole } from './pages/admin/IntegrationsConsole';
import { AuditLogsConsole } from './pages/admin/AuditLogsConsole';
import { EmailNotifications } from './pages/admin/EmailNotifications';
import { BackupScheduler } from './pages/admin/BackupScheduler';
import { UserManagement } from './pages/admin/UserManagement';
import { RolesPermissions } from './pages/admin/RolesPermissions';
import { CompanyOrganization } from './pages/admin/CompanyOrganization';
import { SystemConfiguration } from './pages/admin/SystemConfiguration';

const queryClient = new QueryClient();

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CommandPaletteProvider>
          <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <Routes>
              <Route path="/login" element={<Login />} />

              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <MainLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<ExecutiveDashboard />} />
                <Route path="assets" element={<AssetList />} />
                <Route path="assets/new" element={<AssetForm />} />
                <Route path="assets/edit" element={<AssetEdit />} />
                <Route path="assets/edit/:id" element={<AssetEdit />} />
                <Route path="assets/:id/edit" element={<AssetEdit />} />
                <Route path="assets/my-assets" element={<MyAssets />} />
                <Route path="my-assets" element={<MyAssets />} />
                <Route path="assets/bulk-upload" element={<BulkUpload />} />
                <Route path="bulk-upload" element={<BulkUpload />} />
                <Route path="assets/hierarchy" element={<AssetHierarchy />} />
                <Route path="hierarchy" element={<AssetHierarchy />} />
                <Route path="assets/approvals" element={<AssetApproval />} />
                <Route path="approvals" element={<AssetApproval />} />
                <Route path="assets/:id" element={<Asset360Detail />} />
                <Route path="inventory" element={<SpareParts />} />
                <Route path="inventory/levels" element={<SpareParts />} />
                <Route path="inventory/ledger" element={<SpareParts />} />
                <Route path="receiving" element={<ReceivingWorkbench />} />
                <Route path="receiving/with-po" element={<ReceivingWorkbench />} />
                <Route path="receiving/without-po" element={<ReceiveWithoutPO />} />
                <Route path="receive-without-po" element={<ReceiveWithoutPO />} />
                <Route path="receiving/tag-assets" element={<TagWorkbench />} />
                <Route path="receiving/bulk-tagging" element={<BulkTaggingWorkbench />} />
                <Route path="receiving/print-tags" element={<PrintTagsWorkbench />} />
                <Route path="receiving/history" element={<ReceivingHistory />} />
                <Route path="receiving/history/:id" element={<ReceivingHistory />} />
                <Route path="tagging" element={<TagWorkbench />} />
                <Route path="movements" element={<AssignmentMovementWorkbench />} />
                <Route path="movements/transfer" element={<TransferMovement />} />
                <Route path="movements/assign" element={<AssignAsset />} />
                <Route path="movements/approvals" element={<MovementApprovals />} />
                <Route path="movements/transit" element={<AssignmentMovementWorkbench defaultTab="transfer" />} />
                <Route path="movements/history" element={<MovementHistory />} />
                <Route path="movement-history" element={<MovementHistory />} />
                <Route path="movement-approvals" element={<MovementApprovals />} />
                <Route path="stocktakes" element={<AssetVerification />} />
                <Route path="stocktakes/verify" element={<AssetVerification />} />
                <Route path="stocktakes/execution" element={<AuditExecution />} />
                <Route path="stocktakes/execution/:id" element={<AuditExecution />} />
                <Route path="audit/execution" element={<AuditExecution />} />
                <Route path="audit/execution/:id" element={<AuditExecution />} />
                <Route path="audit-execution" element={<AuditExecution />} />
                <Route path="stocktakes/management" element={<AuditManagement />} />
                <Route path="audit-management" element={<AuditManagement />} />
                <Route path="audit/management" element={<AuditManagement />} />
                <Route path="stocktakes/create" element={<CreateAudit />} />
                <Route path="stocktakes/audits/create" element={<CreateAudit />} />
                <Route path="stocktakes/reports" element={<AuditReport />} />
                <Route path="stocktakes/reports/:id" element={<AuditReport />} />
                <Route path="reports/audit" element={<AuditReport />} />
                <Route path="audit-reports" element={<AuditReport />} />
                <Route path="verification" element={<AssetVerification />} />
                <Route path="maintenance" element={<MaintenanceManager />} />
                <Route path="maintenance/plans" element={<MaintenancePlans />} />
                <Route path="maintenance-plans" element={<MaintenancePlans />} />
                <Route path="maintenance/preventive" element={<PreventiveMaintenance />} />
                <Route path="preventive-maintenance" element={<PreventiveMaintenance />} />
                <Route path="maintenance/create" element={<CreateWorkOrder />} />
                <Route path="maintenance/new" element={<CreateWorkOrder />} />
                <Route path="maintenance/work-orders/new" element={<CreateWorkOrder />} />
                <Route path="maintenance/providers" element={<ServiceProviderAction />} />
                <Route path="maintenance/providers/add" element={<ServiceProviderAction />} />
                <Route path="maintenance/providers/create" element={<ServiceProviderAction />} />
                <Route path="maintenance/providers/:id/edit" element={<ServiceProviderAction />} />
                <Route path="service-providers" element={<ServiceProviderAction />} />
                <Route path="maintenance/spare-parts" element={<SpareParts />} />
                <Route path="spare-parts" element={<SpareParts />} />
                <Route path="discovery" element={<DiscoveryWorkbench defaultTab="network" />} />
                <Route path="discovery/jobs" element={<DiscoveryWorkbench defaultTab="jobs" />} />
                <Route path="discovery/devices" element={<DiscoveredDevicesWorkbench />} />
                <Route path="discovery/import" element={<ImportToAsset360 />} />
                <Route path="discovery/settings" element={<DiscoverySettings />} />
                <Route path="asset-tracking" element={<AssetTracking />} />
                <Route path="location-map" element={<LocationMap />} />
                <Route path="geofencing" element={<Geofencing />} />
                <Route path="location-history" element={<LocationHistory />} />
                <Route path="proximity-search" element={<ProximitySearch />} />
                <Route path="rtls" element={<AssetTracking />} />
                <Route path="rtls/map" element={<LocationMap />} />
                <Route path="reports" element={<ReportsCatalogue />} />
                <Route path="workflows" element={<WorkflowDesigner />} />
                <Route path="admin/workflow-configuration" element={<WorkflowDesigner />} />
                <Route path="ai-insights" element={<AISuite />} />
                <Route path="ai-assistant" element={<AISuite />} />
                <Route path="master-data" element={<MasterDataSetup />} />
                <Route path="admin/master-data" element={<MasterDataSetup />} />
                <Route path="asset-groups" element={<MasterDataSetup />} />
                <Route path="admin/asset-groups" element={<MasterDataSetup />} />
                <Route path="classes" element={<MasterDataSetup />} />
                <Route path="admin/classes" element={<MasterDataSetup />} />
                <Route path="admin/integrations" element={<IntegrationsConsole />} />
                <Route path="integrations" element={<IntegrationsConsole />} />
                <Route path="admin/audit-logs" element={<AuditLogsConsole />} />
                <Route path="admin/notifications" element={<EmailNotifications />} />
                <Route path="notifications" element={<EmailNotifications />} />
                <Route path="admin/backup-scheduler" element={<BackupScheduler />} />
                <Route path="backup-scheduler" element={<BackupScheduler />} />
                <Route path="admin/users" element={<UserManagement />} />
                <Route path="admin/roles" element={<RolesPermissions />} />
                <Route path="admin/roles-permissions" element={<RolesPermissions />} />
                <Route path="admin/organization" element={<CompanyOrganization />} />
                <Route path="admin/companies" element={<CompanyOrganization />} />
                <Route path="admin/departments" element={<CompanyOrganization />} />
                <Route path="admin/locations" element={<CompanyOrganization />} />
                <Route path="admin/cost-centers" element={<CompanyOrganization />} />
                <Route path="admin/system-config" element={<SystemConfiguration />} />
                <Route path="admin/settings" element={<SystemConfiguration />} />
                <Route path="admin/configuration" element={<SystemConfiguration />} />
                <Route path="admin/workflows" element={<WorkflowDesigner />} />
                <Route path="admin/workflow-configuration" element={<WorkflowDesigner />} />
                <Route path="users" element={<Navigate to="/admin/users" replace />} />
                <Route path="mobile-scan" element={<MobileScanWorkbench />} />
              </Route>
            </Routes>
            <Agentation />
          </BrowserRouter>
        </CommandPaletteProvider> 
      </AuthProvider>
    </QueryClientProvider>

  );
}

export default App;

