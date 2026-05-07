import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Mail, Briefcase, User as UserIcon, Network, Calendar, Building2, ArrowLeft } from 'lucide-react';
import {
  fetchEmployeeByIdThunk, deactivateEmployeeThunk,
  selectSelectedEmployee, selectEmployeeProfileLoading, selectEmployeesError,
} from '../../store/slices/employeeSlice';
import { selectUserRole } from '../../store/slices/authSlice';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import LevelBadge from '../../components/shared/LevelBadge';
import RoleBadge from '../../components/shared/RoleBadge';
import StatusBadge from '../../components/shared/StatusBadge';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';

const EmployeeProfilePage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const userRole = useSelector(selectUserRole);
  const profileData = useSelector(selectSelectedEmployee);
  const isLoading = useSelector(selectEmployeeProfileLoading);
  const error = useSelector(selectEmployeesError);
  const isAdminOrHr = ['admin', 'hr'].includes(userRole);

  useEffect(() => {
    if (id) dispatch(fetchEmployeeByIdThunk(id));
  }, [dispatch, id]);

  const handleDeactivate = async () => {
    if (window.confirm(`Deactivate ${emp?.name}? They will lose system access.`)) {
      const result = await dispatch(deactivateEmployeeThunk(id));
      if (!result.error) {
        toast.success(`${emp?.name} has been deactivated.`);
        navigate('/employees');
      } else {
        toast.error(result.payload || 'Failed to deactivate');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <span className="ml-3 text-gray-500">Loading profile...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 font-medium">{error}</p>
        <Button variant="secondary" className="mt-4" onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    );
  }

  // profileData can be { user, mentees, mboHistory } OR just the user object
  const emp = profileData?.user || profileData;
  const mentees = profileData?.mentees || [];
  const mboHistory = profileData?.mboHistory || [];

  if (!emp) return null;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-gray-600 p-1">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Employee Profile</h1>
        </div>
        {isAdminOrHr && (
          <div className="flex gap-3">
            {emp.isActive && (
              <Button
                variant="secondary"
                className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                onClick={handleDeactivate}
              >
                Deactivate
              </Button>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column - Personal Info */}
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="h-24 w-24 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-3xl mx-auto mb-4">
                {emp.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
              <h2 className="text-xl font-bold text-gray-900">{emp.name}</h2>
              <p className="text-gray-500 text-sm mb-4">{emp.email}</p>
              <div className="flex flex-wrap justify-center gap-2 mb-6">
                {emp.level && <LevelBadge level={emp.level} />}
                <RoleBadge role={emp.role} />
                {!emp.isActive && (
                  <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded-full">Inactive</span>
                )}
              </div>

              <div className="border-t border-gray-100 pt-4 space-y-3 text-sm text-left">
                {emp.department && (
                  <div className="flex items-center text-gray-600">
                    <Briefcase className="h-4 w-4 mr-3 text-gray-400" />
                    <span className="font-medium">{emp.department}</span>
                  </div>
                )}
                <div className="flex items-center text-gray-600">
                  <Mail className="h-4 w-4 mr-3 text-gray-400" />
                  <span className="truncate">{emp.email}</span>
                </div>
                {emp.createdAt && (
                  <div className="flex items-center text-gray-600">
                    <Building2 className="h-4 w-4 mr-3 text-gray-400" />
                    <span>Joined {new Date(emp.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b py-4">
              <CardTitle className="text-sm uppercase tracking-wider text-gray-500">Mentorship</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <UserIcon className="h-4 w-4 text-indigo-500" /> Assigned Mentor
                </h4>
                {emp.mentorId ? (
                  <div className="bg-gray-50 p-3 rounded-md border border-gray-100">
                    <p className="font-medium text-gray-900 text-sm">{emp.mentorId?.name || 'Mentor'}</p>
                    {emp.mentorId?.level && <p className="text-xs text-gray-500">{emp.mentorId.level}</p>}
                  </div>
                ) : (
                  <span className="text-sm text-orange-500 font-medium bg-orange-50 px-2 py-1 rounded">
                    No mentor assigned
                  </span>
                )}
              </div>

              {mentees.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <Network className="h-4 w-4 text-indigo-500" /> Mentees ({mentees.length})
                  </h4>
                  <div className="space-y-2">
                    {mentees.map(m => (
                      <div key={m._id} className="bg-gray-50 p-2 px-3 rounded-md border border-gray-100 flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-900">{m.name}</span>
                        {m.level && <LevelBadge level={m.level} />}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - MBO History */}
        <div className="md:col-span-2">
          <Card className="h-full">
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-indigo-600" />
                MBO History
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {mboHistory.length === 0 ? (
                <div className="p-8 text-center text-gray-500 text-sm">
                  No MBO history available for this employee.
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {mboHistory.map((history) => (
                    <div key={history._id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50 transition-colors">
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">
                          {history.quarterId?.label || 'Quarter'}
                        </h3>
                        <div className="flex items-center gap-3">
                          <StatusBadge status={history.status} />
                          {history.submittedAt && (
                            <span className="text-sm text-gray-500">
                              • Submitted {new Date(history.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="text-xs text-gray-400 capitalize">{history.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EmployeeProfilePage;
