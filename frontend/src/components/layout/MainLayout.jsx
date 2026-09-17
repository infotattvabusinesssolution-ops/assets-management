import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { CommandPaletteModal } from '../common/CommandPaletteModal';
import { FloatingAIAssistant } from '../common/FloatingAIAssistant';

export function MainLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white text-black relative">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-white">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6 space-y-6 bg-white text-black">
          <Outlet />
        </main>
      </div>
      <CommandPaletteModal />
      <FloatingAIAssistant />
    </div>
  );
}
