import { UserCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';

const ProfilePage = () => {
  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="text-sm text-gray-500">Manage your personal information and preferences.</p>
      </div>
      <Card>
        <CardContent className="p-12 text-center text-gray-500 flex flex-col items-center">
          <UserCircle className="h-16 w-16 mb-4 text-gray-300" />
          <p>Profile management coming soon.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage;
