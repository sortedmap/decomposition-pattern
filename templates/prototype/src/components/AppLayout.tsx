import { Outlet, Link } from 'react-router-dom';

export function AppLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <Link to="/" className="text-xl font-semibold text-indigo-600">
          Prototype
        </Link>
        <nav className="flex gap-4 text-sm">
          <Link to="/" className="hover:text-indigo-600">Главная</Link>
        </nav>
      </header>
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
        <Outlet />
      </main>
    </div>
  );
}
