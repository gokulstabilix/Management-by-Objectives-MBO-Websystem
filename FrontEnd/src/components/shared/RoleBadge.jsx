import Badge from '../ui/Badge';

const RoleBadge = ({ role }) => {
  const roleMap = {
    'admin': { variant: 'danger', label: 'Admin' },
    'hr': { variant: 'warning', label: 'HR' },
    'employee': { variant: 'blue', label: 'Employee' },
  };

  const config = roleMap[role] || { variant: 'default', label: role };

  return <Badge variant={config.variant}>{config.label}</Badge>;
};

export default RoleBadge;
