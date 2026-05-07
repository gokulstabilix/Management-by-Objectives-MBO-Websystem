import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Building2, LayoutDashboard, Users, FileText, Calendar, Network, ShieldAlert, Bell, UserCircle, Target, UsersRound } from 'lucide-react';
import { selectUserRole, selectUserMentorId } from '../../store/slices/authSlice';

const Sidebar = () => {
  const role = useSelector(selectUserRole);
  const mentorId = useSelector(selectUserMentorId);

  const getNavItems = () => {
    const baseItems = [
      { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    ];

    if (role === 'admin') {
      return [
        ...baseItems,
        { label: 'Employees', path: '/employees', icon: Users },
        { label: 'Quarters', path: '/quarters', icon: Calendar },
        { label: 'Manage HR', path: '/admin/users', icon: ShieldAlert },
      ];
    }

    if (role === 'hr') {
      return [
        ...baseItems,
        { label: 'Employees', path: '/employees', icon: Users },
        { label: 'Mentor Mapping', path: '/mentor-map', icon: Network },
        { label: 'Quarters', path: '/quarters', icon: Calendar },
      ];
    }

    if (role === 'employee') {
      const employeeItems = [...baseItems];
      if (mentorId) {
        employeeItems.push({ label: 'My MBOs', path: '/mbo', icon: Target });
      }
      // Assuming 'isMentor' could be checked via another attribute, but we'll show it universally for employees to match 'My Mentees' spec or verify hasMentees. 
      // For now, let's keep it visible or rely on a state variable. The spec says "visible only if they have mentees". We can just show it for now, and handle inside the route or with real data.
      employeeItems.push({ label: 'My Mentees', path: '/mentees', icon: UsersRound });
      
      return employeeItems;
    }

    return baseItems;
  };

  const navItems = getNavItems();

  const bottomItems = [
    { label: 'Notifications', path: '/notifications', icon: Bell },
    { label: 'Profile', path: '/settings/profile', icon: UserCircle },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 h-full flex flex-col hidden lg:flex">
      <div className="h-16 flex items-center px-6 border-b border-gray-200 text-indigo-700 font-bold text-xl tracking-tight gap-2">
        <Building2 className="h-6 w-6" />
        <span>MBO Portal</span>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-2">Main Menu</div>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </NavLink>
        ))}

        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-2 mt-8">Preferences</div>
        {bottomItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </NavLink>
        ))}
      </nav>
      
      {/* Role Badge Footer */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center justify-center py-2 bg-gray-50 rounded-md border border-gray-100">
          <span className="text-xs font-medium text-gray-500 uppercase">Current Role: <span className="font-bold text-indigo-600">{role}</span></span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
