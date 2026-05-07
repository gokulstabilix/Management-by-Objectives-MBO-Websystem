import { ShieldAlert } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';

const ManageHRPage = () => {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Manage HR Accounts</h1>
        <p className="text-sm text-gray-500">Admin panel to create and manage Human Resources personnel.</p>
      </div>
      <Card>
        <CardContent className="p-12 text-center text-gray-500 flex flex-col items-center">
          <ShieldAlert className="h-16 w-16 mb-4 text-gray-300" />
          <p>HR Management interface coming soon.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ManageHRPage;
