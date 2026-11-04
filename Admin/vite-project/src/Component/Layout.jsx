// import { Outlet } from 'react-router-dom';
// import Sidebar from './Sidebar';

// const Layout = () => {
//   return (
//     <div className="flex min-h-screen bg-gray-100">
//       <Sidebar />
//       <main className="flex-1 overflow-auto">
//         <div className="p-6 lg:p-8">
//           <Outlet />
//         </div>
//       </main>
//     </div>
//   );
// };

// export default Layout;

import { useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <main className="min-w-0 flex-1 overflow-y-auto bg-slate-100 custom-scrollbar">
        <Navbar
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen((open) => !open)}
        />
        <div className="min-h-full p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;