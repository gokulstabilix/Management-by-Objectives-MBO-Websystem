import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Target, Users, AlertCircle, Clock, CheckCircle2, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { selectUser } from '../../store/slices/authSlice';
import { fetchMyFormsThunk, fetchMenteeFormsThunk, selectMyForms, selectMenteeForms, selectMboLoading } from '../../store/slices/mboSlice';
import { fetchQuartersThunk, selectActiveQuarter } from '../../store/slices/quarterSlice';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import StatusBadge from '../../components/shared/StatusBadge';
import LevelBadge from '../../components/shared/LevelBadge';
import Button from '../../components/ui/Button';
import { MBO_STATUSES } from '../../constants/mboStatuses';

const EmployeeDashboard = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser) || {};
  const myForms = useSelector(selectMyForms);
  const menteeForms = useSelector(selectMenteeForms);
  const activeQuarter = useSelector(selectActiveQuarter);
  const isLoading = useSelector(selectMboLoading);

  useEffect(() => {
    dispatch(fetchMyFormsThunk());
    dispatch(fetchQuartersThunk());
    // If user is a mentor, also load mentee forms
    dispatch(fetchMenteeFormsThunk());
  }, [dispatch]);

  // Find the MBO for the active quarter
  const currentForm = myForms.find(f =>
    f.quarterId?._id === activeQuarter?._id || f.quarterId === activeQuarter?._id
  );
  const mboStatus = currentForm?.status || null;

  const pendingReviews = menteeForms.filter(f =>
    f.status === MBO_STATUSES.SUBMITTED || f.status === MBO_STATUSES.ACCOMPLISHMENT_SUBMITTED
  ).length;
  const isMentor = menteeForms.length > 0 || user.menteeCount > 0;

  const mentorComment = currentForm?.mentorReview?.comment;

  const fmtStatus = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1) : s;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 opacity-60"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Hello, {user.name || 'there'} 👋</h1>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              {user.level && <LevelBadge level={user.level} />}
              {user.department && (
                <>
                  <span className="h-4 w-px bg-gray-300"></span>
                  <span>{user.department}</span>
                </>
              )}
            </div>
          </div>
          {activeQuarter ? (
            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 text-sm">
              <div className="font-semibold text-indigo-900 mb-1">Current Quarter: {activeQuarter.label}</div>
              <div className="text-indigo-700 flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                Quarter is open for MBO submissions
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm text-gray-500">
              No active quarter at this time.
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My MBO Status Card */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>My MBO Status</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-center">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
              </div>
            ) : currentForm ? (
              <>
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <p className="text-gray-500 mb-1 text-sm">Quarter {activeQuarter?.label}</p>
                    <StatusBadge status={fmtStatus(mboStatus)} />
                  </div>
                  <div className="h-12 w-12 rounded-full bg-gray-50 flex items-center justify-center">
                    <Target className="h-6 w-6 text-gray-400" />
                  </div>
                </div>

                {mboStatus === 'rejected' && (
                  <div className="bg-red-50 border border-red-100 rounded-lg p-4 mb-6">
                    <div className="flex gap-2">
                      <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-red-800">Resubmission Required</p>
                        {mentorComment && (
                          <p className="text-sm text-red-700 mt-1 italic">"{mentorComment}"</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {mboStatus === 'approved' && (
                  <div className="bg-green-50 border border-green-100 rounded-lg p-4 mb-6 flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <p className="text-sm text-green-800 font-medium">Your objectives are locked in for this quarter.</p>
                  </div>
                )}

                <div className="mt-auto pt-4 border-t border-gray-100">
                  <Link
                    to={`/mbo/${currentForm._id}`}
                    className="flex items-center justify-center w-full bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors text-sm font-medium"
                  >
                    {mboStatus === 'rejected' ? 'Edit & Resubmit' : 'View MBO Form'}
                  </Link>
                </div>
              </>
            ) : (
              <div className="text-center py-4">
                <Target className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">
                  {activeQuarter
                    ? 'No MBO form for this quarter yet.'
                    : 'No active quarter. Wait for admin to open one.'}
                </p>
                {activeQuarter && (
                  <Link to="/mbo/new" className="mt-4 inline-block">
                    <Button size="sm">Start MBO Form</Button>
                  </Link>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Mentees Summary Card (only if mentor) */}
        {(isMentor || pendingReviews > 0) && (
          <Card className="flex flex-col bg-gradient-to-br from-indigo-600 to-indigo-800 text-white border-0">
            <CardHeader className="border-b border-indigo-500/30">
              <CardTitle className="text-white flex items-center gap-2">
                <Users className="h-5 w-5" />
                My Mentees
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-center py-8">
              <div className="text-center mb-6">
                <div className="text-5xl font-bold mb-2">{pendingReviews}</div>
                <div className="text-indigo-100 text-lg">Pending MBO Reviews</div>
              </div>
              <div className="mt-auto">
                <Link
                  to="/mentees"
                  className="flex items-center justify-center w-full bg-white text-indigo-700 px-4 py-3 rounded-md hover:bg-indigo-50 transition-colors font-semibold shadow-sm group"
                >
                  Review Now
                  <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default EmployeeDashboard;
