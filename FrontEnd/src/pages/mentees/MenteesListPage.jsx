import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { Users, Clock } from 'lucide-react';
import {
  fetchMenteeFormsThunk,
  selectMenteeForms, selectMenteeFormsLoading,
} from '../../store/slices/mboSlice';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import StatusBadge from '../../components/shared/StatusBadge';
import LevelBadge from '../../components/shared/LevelBadge';
import Button from '../../components/ui/Button';

// Normalize status from backend (lowercase) to display format
const fmt = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1) : s;

const MenteesListPage = () => {
  const dispatch = useDispatch();
  const menteeForms = useSelector(selectMenteeForms);
  const isLoading = useSelector(selectMenteeFormsLoading);

  useEffect(() => {
    dispatch(fetchMenteeFormsThunk());
  }, [dispatch]);

  const pendingCount = menteeForms.filter(f => f.status === 'submitted').length;
  const totalCount = menteeForms.length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <span className="ml-3 text-gray-500">Loading mentees...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Mentees</h1>
        <p className="text-sm text-gray-500">Review and approve MBO submissions from your mentees.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-indigo-50 border-indigo-100">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-100 text-indigo-700 rounded-lg">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-indigo-800">Total Mentee Forms</p>
                <h3 className="text-2xl font-bold text-indigo-900">{totalCount}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-orange-50 border-orange-100">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-100 text-orange-700 rounded-lg">
                <Clock className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-orange-800">Pending Reviews</p>
                <h3 className="text-2xl font-bold text-orange-900">{pendingCount}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          {menteeForms.length === 0 ? (
            <div className="text-center py-16">
              <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No mentee forms yet</h3>
              <p className="text-sm text-gray-500 mt-1">When your mentees submit MBO forms, they will appear here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Mentee Name</th>
                    <th className="px-6 py-4">Level</th>
                    <th className="px-6 py-4">Quarter</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {menteeForms.map((form) => {
                    const employee = form.employeeId;
                    const quarter = form.quarterId;
                    const status = fmt(form.status);
                    const isResubmitted = form.submissionCount > 1;
                    const needsReview = form.status === 'submitted';

                    return (
                      <tr key={form._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs">
                              {employee?.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || '?'}
                            </div>
                            <span className="font-medium text-gray-900">{employee?.name || 'Unknown'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {employee?.level ? <LevelBadge level={employee.level} /> : <span className="text-gray-400">—</span>}
                        </td>
                        <td className="px-6 py-4 text-gray-600">{quarter?.label || '—'}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <StatusBadge status={status} />
                            {isResubmitted && (
                              <span className="bg-orange-100 text-orange-800 text-[10px] px-1.5 py-0.5 rounded font-bold uppercase">
                                Resubmitted
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link to={`/mentees/${form._id}`}>
                            <Button size="sm" variant={needsReview ? 'primary' : 'secondary'}>
                              {needsReview ? 'Review' : 'View'}
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MenteesListPage;
