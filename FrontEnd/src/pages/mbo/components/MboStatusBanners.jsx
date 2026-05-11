import { AlertCircle, CheckCircle2, Info, Lock } from 'lucide-react';
import Button from '../../../components/ui/Button';
import { ArrowRight } from 'lucide-react';

const MboStatusBanners = ({ 
  formStatus, 
  mentorComment, 
  mentorName, 
  reviewedAt, 
  finalComment, 
  fullyLocked, 
  apiError, 
  onStartAccomplishments 
}) => {
  return (
    <>
      {formStatus === 'rejected' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-semibold text-red-800">Resubmission Required</h3>
            {mentorComment && <p className="text-sm text-red-700 mt-1 italic">"{mentorComment}"</p>}
          </div>
        </div>
      )}
      
      {formStatus === 'final_rejected' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-semibold text-red-800">Accomplishments Rejected — Please Revise</h3>
            {finalComment && <p className="text-sm text-red-700 mt-1 italic">"{finalComment}"</p>}
          </div>
        </div>
      )}
      
      {formStatus === 'approved' && (
        <div className="bg-teal-50 border border-teal-200 rounded-lg p-4 flex gap-3 items-center justify-between">
          <div className="flex gap-3">
            <CheckCircle2 className="h-5 w-5 text-teal-600 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-semibold text-teal-800">✅ Phase 1 Approved — You can now fill your Accomplishments</h3>
              <p className="text-sm text-teal-700 mt-1">
                Approved by {mentorName || 'Mentor'} on {reviewedAt ? new Date(reviewedAt).toLocaleDateString() : '—'}
              </p>
            </div>
          </div>
          <Button size="sm" className="gap-1 flex-shrink-0" onClick={onStartAccomplishments}>
            <ArrowRight className="h-4 w-4" /> Start Accomplishments
          </Button>
        </div>
      )}
      
      {formStatus === 'submitted' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
          <Info className="h-5 w-5 text-blue-600 flex-shrink-0" />
          <p className="text-sm text-blue-800">This form is <strong>under review</strong>. You cannot edit it until your mentor takes action.</p>
        </div>
      )}
      
      {formStatus === 'accomplishment_submitted' && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex gap-3">
          <Info className="h-5 w-5 text-orange-600 flex-shrink-0" />
          <p className="text-sm text-orange-800">Final sheet submitted — <strong>Awaiting mentor verification</strong></p>
        </div>
      )}
      
      {fullyLocked && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex gap-3">
          <Lock className="h-5 w-5 text-green-600 flex-shrink-0" />
          <p className="text-sm text-green-800 font-semibold">✅ MBO Complete — This form is permanently locked.</p>
        </div>
      )}
      
      {apiError && <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">{apiError}</div>}
    </>
  );
};

export default MboStatusBanners;
