import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { Users, Clock, FileText, AlertCircle } from 'lucide-react';
import {
  fetchMyMenteesThunk,
  selectMyMentees,
  selectMyMenteesLoading,
} from '../../store/slices/mboSlice';
import { Card, CardContent } from '../../components/ui/Card';
import StatusBadge from '../../components/shared/StatusBadge';
import LevelBadge from '../../components/shared/LevelBadge';
import Button from '../../components/ui/Button';
import { MBO_STATUSES } from '../../constants/mboStatuses';

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * For mentees with NO MBO form yet, show a neutral "Not Started" pill.
 * Keeps the table visually consistent without crashing on null form data.
 */
const NoFormBadge = () => (
  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 text-xs font-medium">
    <AlertCircle className="h-3 w-3" />
    MBO Not Started
  </span>
);

/**
 * Derives whether a mentor needs to take action on this mentee's form.
 * Safe when form is null.
 */
const getNeedsReview = (form) => {
  if (!form) return false;
  return (
    form.status === MBO_STATUSES.SUBMITTED ||
    form.status === MBO_STATUSES.ACCOMPLISHMENT_SUBMITTED
  );
};

// ── Component ─────────────────────────────────────────────────────────────────

const MenteesListPage = () => {
  const dispatch = useDispatch();
  // Use the source-of-truth selector (includes mentees without forms)
  const myMentees  = useSelector(selectMyMentees);
  const isLoading  = useSelector(selectMyMenteesLoading);

  useEffect(() => {
    dispatch(fetchMyMenteesThunk());
  }, [dispatch]);

  const totalCount   = myMentees.length;
  const pendingCount = myMentees.filter(({ latestForm }) => getNeedsReview(latestForm)).length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
        <span className="ml-3 text-gray-500">Loading mentees...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Mentees</h1>
        <p className="text-sm text-gray-500">
          Review and approve MBO submissions from your mentees.
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-indigo-50 border-indigo-100">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-100 text-indigo-700 rounded-lg">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-indigo-800">Assigned Mentees</p>
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

      {/* Mentee table */}
      <Card>
        <CardContent className="p-0">
          {totalCount === 0 ? (
            <div className="text-center py-16">
              <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No mentees assigned yet</h3>
              <p className="text-sm text-gray-500 mt-1">
                Your HR team will assign mentees to you. They will appear here immediately after assignment.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Mentee Name</th>
                    <th className="px-6 py-4">Level</th>
                    <th className="px-6 py-4">Quarter</th>
                    <th className="px-6 py-4">MBO Status</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {myMentees.map(({ employee, latestForm }) => {
                    const needsReview  = getNeedsReview(latestForm);
                    const needsP1      = latestForm?.status === MBO_STATUSES.SUBMITTED;
                    const needsP2      = latestForm?.status === MBO_STATUSES.ACCOMPLISHMENT_SUBMITTED;
                    const isResubmit   = (latestForm?.submissionCount ?? 0) > 1;

                    return (
                      <tr key={employee._id} className="hover:bg-gray-50 transition-colors">
                        {/* Name / Avatar */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs flex-shrink-0">
                              {employee.name?.split(' ').map((n) => n[0]).join('').slice(0, 2) || '?'}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{employee.name}</p>
                              <p className="text-xs text-gray-400">{employee.email}</p>
                            </div>
                          </div>
                        </td>

                        {/* Level */}
                        <td className="px-6 py-4">
                          {employee.level
                            ? <LevelBadge level={employee.level} />
                            : <span className="text-gray-400">—</span>}
                        </td>

                        {/* Quarter — safe when latestForm is null */}
                        <td className="px-6 py-4 text-gray-600">
                          {latestForm?.quarterId?.label || (
                            <span className="text-gray-400 italic">No quarter</span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4">
                          {latestForm ? (
                            <div className="flex items-center gap-2 flex-wrap">
                              <StatusBadge status={latestForm.status} />
                              {isResubmit && (
                                <span className="bg-orange-100 text-orange-800 text-[10px] px-1.5 py-0.5 rounded font-bold uppercase">
                                  Resubmitted
                                </span>
                              )}
                            </div>
                          ) : (
                            <NoFormBadge />
                          )}
                        </td>

                        {/* Action */}
                        <td className="px-6 py-4 text-right">
                          {latestForm ? (
                            <Link to={`/mentees/${latestForm._id}`}>
                              <Button size="sm" variant={needsReview ? 'primary' : 'secondary'}>
                                {needsP1 ? 'Review P1 →' : needsP2 ? 'Review Final →' : 'View'}
                              </Button>
                            </Link>
                          ) : (
                            <span className="text-xs text-gray-400 italic">
                              Awaiting MBO submission
                            </span>
                          )}
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
