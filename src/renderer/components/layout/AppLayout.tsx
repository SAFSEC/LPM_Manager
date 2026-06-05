import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { StatusBar } from './StatusBar';
import { Toast } from '@/components/ui/Toast';

export function AppLayout(): JSX.Element {
  return (
    <div className="flex h-full min-h-screen flex-col bg-surface">
      <div className="flex min-h-0 flex-1 overflow-hidden">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <Header />
          <main className="min-h-0 flex-1 overflow-auto p-6">
            <Outlet />
          </main>
        </div>
      </div>
      <StatusBar />
      <Toast />
    </div>
  );
}
