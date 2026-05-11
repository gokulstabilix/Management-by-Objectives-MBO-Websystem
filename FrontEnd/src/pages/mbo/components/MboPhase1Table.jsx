import { Plus, Trash2, Lock } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';

const MboPhase1Table = ({ 
  fields, 
  register, 
  remove, 
  append, 
  errors, 
  p1Editable, 
  formStatus 
}) => {
  return (
    <Card>
      <CardHeader className="bg-indigo-50/50 border-b">
        <CardTitle className="text-indigo-900 flex items-center gap-2">
          📋 Phase 1 — Objective Setting 
          {!p1Editable && formStatus !== 'draft' && <Lock className="h-4 w-4 text-gray-400" />}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3 text-left w-8">#</th>
                <th className="px-4 py-3 text-left">Objective Title</th>
                <th className="px-4 py-3 text-left">Key Results</th>
                <th className="px-4 py-3 text-left w-32">Progress</th>
                <th className="px-4 py-3 text-left w-24">Set (%)</th>
                {p1Editable && <th className="px-4 py-3 w-10"></th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {fields.map((field, index) => {
                const objErr = errors?.objectives?.[index];
                return (
                  <tr key={field.id} className="align-top">
                    <td className="px-4 py-3 text-gray-400 font-medium">{index + 1}</td>
                    <td className="px-4 py-3">
                      <input 
                        className={`w-full border rounded-md px-2 py-1.5 text-sm ${objErr?.title ? 'border-red-400' : 'border-gray-300'} disabled:bg-gray-50 disabled:cursor-not-allowed`} 
                        {...register(`objectives.${index}.title`)} 
                        disabled={!p1Editable} 
                        placeholder="Objective title" 
                      />
                      {objErr?.title && <p className="text-xs text-red-500 mt-1">{objErr.title.message}</p>}
                    </td>
                    <td className="px-4 py-3">
                      {(field.keyResults || [{ value: '' }]).map((_, krIdx) => (
                        <input 
                          key={krIdx} 
                          className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm mb-1 disabled:bg-gray-50 disabled:cursor-not-allowed" 
                          {...register(`objectives.${index}.keyResults.${krIdx}.value`)} 
                          disabled={!p1Editable} 
                          placeholder={`KR ${krIdx + 1}`} 
                        />
                      ))}
                    </td>
                    <td className="px-4 py-3">
                      <input 
                        className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm disabled:bg-gray-50" 
                        {...register(`objectives.${index}.progress`)} 
                        disabled={!p1Editable} 
                        placeholder="e.g. 75%" 
                      />
                    </td>
                    <td className="px-4 py-3">
                      <select 
                        className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm disabled:bg-gray-50" 
                        {...register(`objectives.${index}.selfScore`)} 
                        disabled={!p1Editable}
                      >
                        <option value="">—</option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                      </select>
                    </td>
                    {p1Editable && (
                      <td className="px-4 py-3">
                        {fields.length > 1 && (
                          <button 
                            type="button" 
                            onClick={() => remove(index)} 
                            className="text-red-400 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {p1Editable && (
          <div className="p-4 border-t">
            <Button 
              type="button" 
              variant="secondary" 
              size="sm" 
              onClick={() => append({ title: '', keyResults: [{ value: '' }], progress: '', selfScore: '', notes: '' })}
            >
              <Plus className="h-4 w-4 mr-1" /> Add Objective
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MboPhase1Table;
