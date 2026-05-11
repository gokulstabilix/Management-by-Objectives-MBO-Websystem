import Button from '../../../components/ui/Button';

const SubmitFinalModal = ({ mentorName, onClose, onConfirm, isLoading }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
      <div className="px-6 py-4 border-b flex items-center gap-3">
        <span className="text-xl">📋</span>
        <h3 className="text-lg font-bold text-gray-900">Submit Final MBO Sheet?</h3>
      </div>
      <div className="p-6">
        <p className="text-sm text-gray-700">
          Once submitted, your accomplishments will be sent to <strong>{mentorName || 'your mentor'}</strong> for final review and scoring.
        </p>
      </div>
      <div className="px-6 py-4 border-t flex justify-end gap-3 bg-gray-50">
        <Button variant="ghost" onClick={onClose} disabled={isLoading}>Cancel</Button>
        <Button onClick={onConfirm} isLoading={isLoading}>Submit Final Sheet</Button>
      </div>
    </div>
  </div>
);

export default SubmitFinalModal;
