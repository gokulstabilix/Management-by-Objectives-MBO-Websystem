import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { Target, Plus, FileText } from 'lucide-react';
import {
  fetchMyFormsThunk,
  selectMyForms, selectMboLoading, selectMboError,
} from '../../store/slices/mboSlice';
import { fetchQuartersThunk, selectActiveQuarter } from '../../store/slices/quarterSlice';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import StatusBadge from '../../components/shared/StatusBadge';
import Button from '../../components/ui/Button';

// Map backend status (lowercase) to display text
const formatStatus = (status) => {
  const map = { draft: 'Draft', submitted: 'Submitted', approved: 'Approved', rejected: 'Rejected', frozen: 'Frozen' };
  return map[status] || status;
};

const MboListPage = () => {
  const dispatch = useDispatch();
  const forms = useSelector(selectMyForms);
  const isLoading = useSelector(selectMboLoading);
  const error = useSelector(selectMboError);
  const activeQuarter = useSelector(selectActiveQuarter);

  useEffect(() => {
    dispatch(fetchMyFormsThunk());
    dispatch(fetchQuartersThunk());
  }, [dispatch]);

  // Check if there's an active (non-frozen, non-approved) form for the current open quarter
  const isQuarterOpen = !!activeQuarter;
  const activeFormExists = forms.some(f =>
    f.quarterId?._id === activeQuarter?._id || f.quarterId === activeQuarter?._id
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <span className="ml-3 text-gray-500">Loading your MBO forms...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My MBO Forms</h1>
          <p className="text-sm text-gray-500">Track and manage your Management by Objectives forms.</p>
        </div>
        {isQuarterOpen && !activeFormExists && (
          <Link to={`/mbo/new`}>
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> Start New MBO
            </Button>
          </Link>
        )}
      </div>

      {isQuarterOpen && (
        <div className="bg-indigo-50 border border-indigo-100 rounded-lg px-5 py-3 flex items-center gap-3 text-sm">
          <Target className="h-5 w-5 text-indigo-500 flex-shrink-0" />
          <div>
            <span className="font-semibold text-indigo-900">Active Quarter: {activeQuarter.label}</span>
            <span className="text-indigo-700 ml-2">— Quarter is open for MBO submissions.</span>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">{error}</div>
      )}

      {forms.length === 0 && !isLoading ? (
        <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-xl">
          <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No MBO Forms Yet</h3>
          <p className="text-sm text-gray-500 mt-2">
            {isQuarterOpen
              ? 'An active quarter is open. Start your MBO form now.'
              : 'No active quarter. An admin or HR will open the next quarter.'}
          </p>
          {isQuarterOpen && (
            <Link to="/mbo/new" className="mt-6 inline-block">
              <Button className="gap-2"><Plus className="h-4 w-4" /> Start New MBO</Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {forms.map((form) => {
            const displayStatus = formatStatus(form.status);
            const quarterLabel = form.quarterId?.label || 'Quarter';
            const objCount = form.objectives?.length || 0;
            const submittedDate = form.submittedAt
              ? new Date(form.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
              : 'Not submitted';
            const mentorComment = form.mentorReview?.comment;

            return (
              <Card key={form._id} className="flex flex-col hover:border-indigo-300 transition-colors cursor-pointer group">
                <Link to={`/mbo/${form._id}`} className="flex flex-col h-full">
                  <CardHeader className="bg-gray-50 border-b flex flex-row justify-between items-center group-hover:bg-indigo-50/50 transition-colors">
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-indigo-600" />
                      {quarterLabel}
                    </CardTitle>
                    <StatusBadge status={displayStatus} />
                  </CardHeader>
                  <CardContent className="p-6 flex-1 flex flex-col justify-between">
                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Objectives</span>
                        <span className="font-medium text-gray-900">{objCount}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Submitted</span>
                        <span className="font-medium text-gray-900">{submittedDate}</span>
                      </div>
                      {form.submissionCount > 1 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Submission #</span>
                          <span className="font-medium text-orange-600">{form.submissionCount} (Resubmitted)</span>
                        </div>
                      )}
                    </div>

                    {displayStatus === 'Rejected' && mentorComment && (
                      <div className="bg-red-50 text-red-700 p-3 rounded-md text-xs border border-red-100 mt-auto italic">
                        "{mentorComment}"
                      </div>
                    )}
                    {displayStatus === 'Rejected' && !mentorComment && (
                      <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm border border-red-100 font-medium text-center mt-auto">
                        Resubmit Required
                      </div>
                    )}
                    {displayStatus === 'Draft' && (
                      <div className="bg-gray-100 text-gray-700 p-3 rounded-md text-sm border border-gray-200 font-medium text-center mt-auto">
                        Continue Editing
                      </div>
                    )}
                    {displayStatus === 'Approved' && (
                      <div className="bg-green-50 text-green-700 p-3 rounded-md text-sm border border-green-100 font-medium text-center mt-auto">
                        ✓ Approved & Locked
                      </div>
                    )}
                  </CardContent>
                </Link>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MboListPage;
