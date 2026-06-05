import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/wissensbasis', label: 'Wissensbasis' },
  { to: '/checklisten', label: 'Checklisten' },
  { to: '/formulare', label: 'Formulare' },
  { to: '/export', label: 'Export' },
  { to: '/einstellungen', label: 'Einstellungen' },
] as const;

function linkClass(isActive: boolean): string {
  return [
    'flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors',
    isActive ? 'bg-white/15 text-white' : 'text-white/80 hover:bg-white/10 hover:text-white',
  ].join(' ');
}

export function Sidebar(): JSX.Element {
  return (
    <aside className="flex w-60 shrink-0 flex-col bg-primary text-white">
      <div className="border-b border-white/10 px-4 py-5">
        <p className="text-xs uppercase tracking-wider text-white/60">LPM Manager</p>
        <h1 className="mt-1 text-lg font-semibold leading-tight">Loss Prevention</h1>
        <p className="text-xs text-white/70">JW Safety &amp; Security</p>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={'end' in item ? item.end : false}
            className={({ isActive }) => linkClass(isActive)}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
