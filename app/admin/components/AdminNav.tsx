'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';

const AdminNav = () => {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path ? 'bg-blue-700' : '';
  };

  return (
    <div className="bg-blue-600 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <nav className="flex space-x-4">
          <Link
            href="/admin/system-prompt"
            className={`px-3 py-2 rounded hover:bg-blue-700 transition-colors ${isActive('/admin/system-prompt')}`}
          >
            System Prompt
          </Link>
          <Link
            href="/admin/examples"
            className={`px-3 py-2 rounded hover:bg-blue-700 transition-colors ${isActive('/admin/examples')}`}
          >
            Examples
          </Link>
          <Link
            href="/admin/proposed-examples"
            className={`px-3 py-2 rounded hover:bg-blue-700 transition-colors ${isActive('/admin/proposed-examples')}`}
          >
            Proposed Examples
          </Link>
        </nav>
        <button
          onClick={() => signOut({ callbackUrl: '/admin/signin' })}
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default AdminNav;
