import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { MandantProvider } from '@/context/MandantContext';
import { ToastProvider } from '@/context/ToastContext';
import Dashboard from '@/pages/Dashboard';
import MandantDetail from '@/pages/MandantDetail';
import ChecklistenRunner from '@/pages/ChecklistenRunner';
import ExportPage from '@/pages/Export';
import FormularEditor from '@/pages/FormularEditor';
import Wissensbasis from '@/pages/Wissensbasis';

function PlaceholderPage({ title, phase }: { title: string; phase: string }): JSX.Element {
  return (
    <div className="mx-auto max-w-2xl rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center">
      <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
      <p className="mt-2 text-sm text-slate-600">Wird in {phase} implementiert.</p>
    </div>
  );
}

export default function App(): JSX.Element {
  return (
    <ToastProvider>
      <MandantProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<AppLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="mandant/:mandantId" element={<MandantDetail />} />
              <Route path="wissensbasis" element={<Wissensbasis />} />
              <Route path="checklisten" element={<ChecklistenRunner />} />
              <Route path="formulare" element={<FormularEditor />} />
              <Route path="export" element={<ExportPage />} />
              <Route
                path="einstellungen"
                element={<PlaceholderPage title="Einstellungen" phase="Phase 8" />}
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </MandantProvider>
    </ToastProvider>
  );
}
