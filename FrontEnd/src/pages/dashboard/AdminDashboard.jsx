import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { Users, LayoutList, FolderOpen, Clock } from 'lucide-react';
import { fetchAdminFormsThunk, selectAdminForms, selectAdminFormsTotal, selectMboLoading } from '../../store/slices/mboSlice';
import { fetchQuartersThunk, selectActiveQuarter, closeQuarterThunk, selectQuartersSubmitting } from '../../store/slices/quarterSlice';
import { fetchEmployeesThunk, selectEmployeeTotal } from '../../store/slices/employeeSlice';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import StatusBadge from '../../components/shared/StatusBadge';
import LevelBadge from '../../components/shared/LevelBadge';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';

const fmt = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1) : s;

const AdminDashboard = () => {
  const dispatch = useDispatch();

  const adminForms = useSelector(selectAdminForms);
  const adminTotal = useSelector(selectAdminFormsTotal);
  const activeQuarter = useSelector(selectActiveQuarter);
  const employeeTotal = useSelector(selectEmployeeTotal);
  const isSubmitting = useSelector(selectQuartersSubmitting);
  const isMboLoading = useSelector(selectMboLoading);

  const pendingCount = adminForms.filter(f => f.status === 'submitted').length;

  useEffect(() => {
    dispatch(fetchAdminFormsThunk({ limit: 10 }));
    dispatch(fetchQuartersThunk());
    dispatch(fetchEmployeesThunk({ limit: 1 })); // just to get total
  }, [dispatch]);

  const stats = [
    {
      title: 'Total Employees',
      value: employeeTotal || '—',
      icon: Users, color: 'text-blue-600', bg: 'bg-blue-100',
    },
    {
      title: 'Active Quarter',
      value: activeQuarter?.label || 'None',
      icon: FolderOpen, color: 'text-green-600', bg: 'bg-green-100',
    },
    {
      title: 'Total Submissions',
      value: adminTotal || 0,
      icon: LayoutList, color: 'text-indigo-600', bg: 'bg-indigo-100',
    },
    {
      title: 'Pending Reviews',
      value: pendingCount,
      icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-100',
    },
  ];

  const handleCloseQuarter = async () => {
    if (!activeQuarter) return;
    if (window.confirm(`Closing ${activeQuarter.label} will freeze all Draft and Submitted forms. Proceed?`)) {
      const result = await dispatch(closeQuarterThunk(activeQuarter._id));
      if (!result.error) {
        toast.success('Quarter closed successfully.');
        dispatch(fetchAdminFormsThunk({ limit: 10 }));
      } else {
        toast.error(result.payload || 'Failed to close quarter');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-sm text-gray-500">System overview and active quarter management</p>
        </div>
        <Link to="/quarters">
          <Button>+ Open New Quarter</Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-6 flex items-center space-x-4">
              <div className={`p-3 rounded-lg ${stat.bg}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Submissions */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between border-b">
              <CardTitle>Recent Submissions</CardTitle>
              <Link to="/employees">
                <Button variant="ghost" size="sm" className="text-indigo-600">View All</Button>
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              {isMboLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                </div>
              ) : adminForms.length === 0 ? (
                <div className="text-center py-8 text-gray-500 text-sm">No MBO forms yet.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                      <tr>
                        <th className="px-6 py-3">Employee</th>
                        <th className="px-6 py-3">Level</th>
                        <th className="px-6 py-3">Quarter</th>
                        <th className="px-6 py-3 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {adminForms.slice(0, 6).map((form) => (
                        <tr key={form._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 font-medium text-gray-900">
                            {form.employeeId?.name || '—'}
                          </td>
                          <td className="px-6 py-4">
                            {form.employeeId?.level ? <LevelBadge level={form.employeeId.level} /> : '—'}
                          </td>
                          <td className="px-6 py-4 text-gray-500">{form.quarterId?.label || '—'}</td>
                          <td className="px-6 py-4 text-right">
                            <StatusBadge status={fmt(form.status)} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Active Quarter Management */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="bg-indigo-50 border-b-indigo-100">
              <CardTitle className="text-indigo-900">Active Quarter Management</CardTitle>
              {activeQuarter ? (
                <p className="text-sm text-indigo-700/80">
                  Currently managing {activeQuarter.label}.
                </p>
              ) : (
                <p className="text-sm text-gray-500">No active quarter.</p>
              )}
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {activeQuarter ? (
                (() => {
                  const openedDate = new Date(activeQuarter.openedAt);
                  const now = new Date();
                  const elapsedDays = Math.floor((now - openedDate) / (1000 * 60 * 60 * 24));
                  const quarterDurationDays = 90;
                  const progressPct = Math.min(100, Math.round((elapsedDays / quarterDurationDays) * 100));
                  return (
                <>
                  <div>
                    <div className="flex justify-between text-sm font-medium mb-2">
                      <span className="text-gray-700">Opened</span>
                      <span className="text-indigo-600 font-bold">
                        {openedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="bg-indigo-600 h-2.5 rounded-full transition-all" style={{ width: `${progressPct}%` }}></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{elapsedDays} day{elapsedDays !== 1 ? 's' : ''} elapsed</p>
                  </div>

                  <ul className="space-y-3 text-sm">
                    <li className="flex items-center text-green-700">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                      Quarter is Open
                    </li>
                    <li className="flex items-center text-indigo-700">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full mr-3"></div>
                      {adminTotal} submissions so far
                    </li>
                    <li className="flex items-center text-yellow-700">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
                      {pendingCount} pending reviews
                    </li>
                  </ul>

                  <Button
                    variant="secondary"
                    className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={handleCloseQuarter}
                    isLoading={isSubmitting}
                  >
                    Close Quarter
                  </Button>
                </>
                  );
                })()
              ) : (
                <div className="text-center py-4 text-gray-500 text-sm">
                  <p>No active quarter.</p>
                  <Link to="/quarters" className="mt-3 inline-block">
                    <Button size="sm">Open New Quarter</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
