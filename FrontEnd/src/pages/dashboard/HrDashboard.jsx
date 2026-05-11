import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { Users, UserMinus, FolderOpen, Target, AlertTriangle } from 'lucide-react';
import { fetchAdminFormsThunk, selectAdminForms, selectAdminFormsTotal, selectMboLoading } from '../../store/slices/mboSlice';
import { fetchQuartersThunk, selectActiveQuarter } from '../../store/slices/quarterSlice';
import { fetchEmployeesThunk, selectEmployees, selectEmployeeTotal } from '../../store/slices/employeeSlice';
import { fetchMappingsThunk, selectMappings } from '../../store/slices/mentorMapSlice';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import StatusBadge from '../../components/shared/StatusBadge';
import LevelBadge from '../../components/shared/LevelBadge';
import Button from '../../components/ui/Button';
import { MBO_STATUSES } from '../../constants/mboStatuses';

const fmt = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1) : s;

const HrDashboard = () => {
  const dispatch = useDispatch();

  const adminForms = useSelector(selectAdminForms);
  const adminTotal = useSelector(selectAdminFormsTotal);
  const activeQuarter = useSelector(selectActiveQuarter);
  const employeeTotal = useSelector(selectEmployeeTotal);
  const mappings = useSelector(selectMappings);
  const isMboLoading = useSelector(selectMboLoading);

  useEffect(() => {
    dispatch(fetchAdminFormsThunk({ limit: 10 }));
    dispatch(fetchQuartersThunk());
    dispatch(fetchEmployeesThunk({ limit: 1 }));
    dispatch(fetchMappingsThunk());
  }, [dispatch]);

  const unmappedCount = mappings.filter(m => m.role === 'employee' && !m.mentorId).length;
  const submittedCount = adminForms.filter(f =>
    f.status === MBO_STATUSES.SUBMITTED || f.status === MBO_STATUSES.ACCOMPLISHMENT_SUBMITTED
  ).length;

  const stats = [
    {
      title: 'Total Employees', value: employeeTotal || '—',
      icon: Users, color: 'text-blue-600', bg: 'bg-blue-100', subtitle: 'Organization members',
    },
    {
      title: 'Unmapped Employees', value: unmappedCount,
      icon: UserMinus, color: 'text-red-600', bg: 'bg-red-100',
      subtitle: unmappedCount > 0 ? 'Action required' : 'All mapped ✓',
    },
    {
      title: 'Open Quarter', value: activeQuarter?.label || 'None',
      icon: FolderOpen, color: 'text-green-600', bg: 'bg-green-100',
      subtitle: activeQuarter ? 'Active phase' : 'No active quarter',
    },
    {
      title: 'MBO Submissions', value: adminTotal || 0,
      icon: Target, color: 'text-indigo-600', bg: 'bg-indigo-100',
      subtitle: `${submittedCount} pending review`,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500">
            {activeQuarter ? `${activeQuarter.label} Performance Cycle` : 'No active quarter'}
          </p>
        </div>
      </div>

      {/* Unmapped Alert Banner */}
      {unmappedCount > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex items-start justify-between">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-semibold text-orange-800">Unmapped Employees Detected</h3>
              <p className="text-sm text-orange-700 mt-1">
                There are <strong>{unmappedCount}</strong> employees currently lacking an assigned mentor.
                This may delay MBO objective finalization.
              </p>
            </div>
          </div>
          <Link to="/mentor-map">
            <Button variant="secondary" size="sm" className="bg-white text-orange-700 border-orange-300 hover:bg-orange-50 whitespace-nowrap ml-4">
              Assign Mentors
            </Button>
          </Link>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1 uppercase tracking-wider">{stat.title}</p>
                  <h3 className="text-3xl font-bold text-gray-900">{stat.value}</h3>
                  <p className="text-xs font-medium text-gray-500 mt-2">{stat.subtitle}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.bg} opacity-80`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* MBO Status Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between border-b bg-white">
          <CardTitle>MBO Status Overview</CardTitle>
          <div className="flex gap-2">
            <Link to="/mentor-map">
              <Button size="sm" className="ml-2 bg-indigo-600">Assign Mentors</Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isMboLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
            </div>
          ) : adminForms.length === 0 ? (
            <div className="text-center py-8 text-gray-500 text-sm">
              {activeQuarter ? 'No MBO forms submitted yet this quarter.' : 'No active quarter.'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Employee</th>
                    <th className="px-6 py-4">Level</th>
                    <th className="px-6 py-4">Dept</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Quarter</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {adminForms.map((form) => (
                    <tr key={form._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs mr-3">
                            {form.employeeId?.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || '?'}
                          </div>
                          <span className="font-medium text-gray-900">{form.employeeId?.name || '—'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {form.employeeId?.level ? <LevelBadge level={form.employeeId.level} /> : '—'}
                      </td>
                      <td className="px-6 py-4 text-gray-500">{form.employeeId?.department || '—'}</td>
                      <td className="px-6 py-4">
                        <StatusBadge status={fmt(form.status)} />
                      </td>
                      <td className="px-6 py-4 text-gray-500">{form.quarterId?.label || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default HrDashboard;
