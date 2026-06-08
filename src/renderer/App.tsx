import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { MandantProvider } from '@/context/MandantContext';
import { ToastProvider } from '@/context/ToastContext';
import Dashboard from '@/pages/Dashboard';
import MandantDetail from '@/pages/MandantDetail';
import ChecklistenRunner from '@/pages/ChecklistenRunner';
import ExportPage from '@/pages/Export';
import FormularEditor from '@/pages/FormularEditor';
import Wissensbasis from '@/pages/Wissensbasis';
import Einstellungen from '@/pages/Einstellungen';

export default function App(): JSX.Element {
  return (
    <ToastProvider>
      <MandantProvider>
        <HashRouter>
          <Routes>
            <Route element={<AppLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="mandant/:mandantId" element={<MandantDetail />} />
              <Route path="wissensbasis" element={<Wissensbasis />} />
              <Route path="checklisten" element={<ChecklistenRunner />} />
              <Route path="formulare" element={<FormularEditor />} />
              <Route path="export" element={<ExportPage />} />
              <Route path="einstellungen" element={<Einstellungen />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </HashRouter>
      </MandantProvider>
    </ToastProvider>
  );
}
