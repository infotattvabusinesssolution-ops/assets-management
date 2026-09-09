import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CommandPaletteProvider } from './context/CommandPaletteContext';

import { MainLayout } from './components/layout/MainLayout';
import { Login } from './pages/Login';
import { ExecutiveDashboard } from './pages/ExecutiveDashboard';
import { AssetList } from './pages/AssetList';
import { Asset360Detail } from './pages/Asset360Detail';
import { AssetForm } from './pages/AssetForm';
import { ReceivingWorkbench } from './pages/ReceivingWorkbench';
import { TagWorkbench } from './pages/TagWorkbench';
import { CustodyTransferWorkbench } from './pages/CustodyTransferWorkbench';
import { StocktakeManager } from './pages/StocktakeManager';
import { FinancialWorkbench } from './pages/FinancialWorkbench';
import { MaintenanceManager } from './pages/MaintenanceManager';
import { ContractManager } from './pages/ContractManager';
import { DiscoveryWorkbench } from './pages/DiscoveryWorkbench';
import { FloorMapEditor } from './pages/FloorMapEditor';
import { DisposalWorkbench } from './pages/DisposalWorkbench';
import { ReportsCatalogue } from './pages/ReportsCatalogue';
import { WorkflowDesigner } from './pages/WorkflowDesigner';
import { AISuite } from './pages/AISuite';
import { AdminMasterData } from './pages/AdminMasterData';
import { AuditLogViewer } from './pages/AuditLogViewer';
import { MobileScanWorkbench } from './pages/MobileScanWorkbench';

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
          <BrowserRouter>
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
                <Route path="assets/:id" element={<Asset360Detail />} />
                <Route path="receiving" element={<ReceivingWorkbench />} />
                <Route path="tagging" element={<TagWorkbench />} />
                <Route path="movements" element={<CustodyTransferWorkbench />} />
                <Route path="stocktakes" element={<StocktakeManager />} />
                <Route path="finance" element={<FinancialWorkbench />} />
                <Route path="maintenance" element={<MaintenanceManager />} />
                <Route path="contracts" element={<ContractManager />} />
                <Route path="discovery" element={<DiscoveryWorkbench />} />
                <Route path="maps" element={<FloorMapEditor />} />
                <Route path="disposals" element={<DisposalWorkbench />} />
                <Route path="reports" element={<ReportsCatalogue />} />
                <Route path="workflows" element={<WorkflowDesigner />} />
                <Route path="ai-insights" element={<AISuite />} />
                <Route path="master-data" element={<AdminMasterData />} />
                <Route path="admin/master-data" element={<Navigate to="/master-data" replace />} />
                <Route path="audit-trail" element={<AuditLogViewer />} />
                <Route path="mobile-scan" element={<MobileScanWorkbench />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </CommandPaletteProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
