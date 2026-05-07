import { useLocation, Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const Breadcrumbs = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  return (
    <nav className="flex items-center text-sm text-gray-500 mb-6 px-1">
      <Link to="/dashboard" className="hover:text-indigo-600 transition-colors">
        <Home className="h-4 w-4" />
      </Link>
      
      {pathnames.map((value, index) => {
        const last = index === pathnames.length - 1;
        const to = `/${pathnames.slice(0, index + 1).join('/')}`;
        const title = value.charAt(0).toUpperCase() + value.slice(1).replace('-', ' ');

        return (
          <div key={to} className="flex items-center">
            <ChevronRight className="h-4 w-4 mx-2 flex-shrink-0 text-gray-400" />
            {last ? (
              <span className="font-medium text-gray-900" aria-current="page">
                {title}
              </span>
            ) : (
              <Link to={to} className="hover:text-indigo-600 transition-colors">
                {title}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
};

export default Breadcrumbs;
