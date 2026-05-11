import { Lock } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';

const MboPhase2Table = ({ 
  objectives = [], 
  accomplishments = [], 
  p2Editable, 
  fullyLocked, 
  onAccomplishmentChange 
}) => {
  return (
    <Card>
      <CardHeader className="bg-emerald-50/50 border-b">
        <CardTitle className="text-emerald-900 flex items-center gap-2">
          🏆 Phase 2 — Accomplishments {fullyLocked && <Lock className="h-4 w-4 text-gray-400" />}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3 text-left w-8">#</th>
                <th className="px-4 py-3 text-left">Objective</th>
                <th className="px-4 py-3 text-left">Accomplishments</th>
                <th className="px-4 py-3 text-left w-40">Manager's Comments</th>
                <th className="px-4 py-3 text-left w-24">Achieved %</th>
                <th className="px-4 py-3 text-left w-28">Accomplished</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {objectives.map((obj, idx) => (
                <tr key={idx} className="align-top">
                  <td className="px-4 py-3 text-gray-400 font-medium">{idx + 1}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{obj.title}</td>
                  <td className="px-4 py-3">
                    {p2Editable ? (
                      <textarea 
                        className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm" 
                        rows={2} 
                        value={accomplishments[idx]?.accomplishment || ''} 
                        onChange={(e) => onAccomplishmentChange(idx, 'accomplishment', e.target.value)} 
                        placeholder="Describe your accomplishment..." 
                      />
                    ) : (
                      <span className="text-gray-700">{obj.accomplishment || '—'}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs italic">{obj.managerComment || <span className="text-gray-300">—</span>}</td>
                  <td className="px-4 py-3 text-gray-600">{obj.achievedPercent != null ? `${obj.achievedPercent}%` : '—'}</td>
                  <td className="px-4 py-3">
                    {p2Editable ? (
                      <select 
                        className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm" 
                        value={accomplishments[idx]?.accomplished ? 'yes' : 'no'} 
                        onChange={(e) => onAccomplishmentChange(idx, 'accomplished', e.target.value === 'yes')}
                      >
                        <option value="no">No</option>
                        <option value="yes">Yes</option>
                      </select>
                    ) : (
                      obj.accomplished != null ? (
                        obj.accomplished ? <span className="text-green-600 font-semibold">✅ Yes</span> : <span className="text-red-500 font-semibold">❌ No</span>
                      ) : <span className="text-gray-300">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default MboPhase2Table;
