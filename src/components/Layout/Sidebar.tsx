import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  Users,
  CalendarPlus,
  Calendar,
  Menu,
  X,
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { path: '/', icon: LayoutDashboard, label: '仪表盘' },
  { path: '/courses', icon: BookOpen, label: '课程管理' },
  { path: '/teachers', icon: Users, label: '教师管理' },
  { path: '/scheduling', icon: CalendarPlus, label: '智能排课' },
  { path: '/schedule', icon: Calendar, label: '课程表' },
];

export const Sidebar: React.FC = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <>
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-gradient-to-b from-primary-800 to-primary-900 text-white transform transition-transform duration-300 ease-in-out ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="px-6 py-8">
            <h1 className="text-2xl font-bold">排课平台</h1>
            <p className="text-sm text-primary-200 mt-1">智能课程管理系统</p>
          </div>

          <nav className="flex-1 px-4">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 mb-2 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-white text-primary-800 shadow-lg'
                      : 'text-primary-100 hover:bg-primary-700'
                  }`
                }
                onClick={() => setIsMobileOpen(false)}
              >
                <item.icon size={20} />
                <span className="font-medium">{item.label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="px-6 py-4 border-t border-primary-700">
            <p className="text-xs text-primary-300">© 2024 排课平台</p>
          </div>
        </div>
      </aside>

      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </>
  );
};
