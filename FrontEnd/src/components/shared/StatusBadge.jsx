import Badge from '../ui/Badge';

const StatusBadge = ({ status }) => {
  const statusMap = {
    'Draft': { variant: 'default', label: 'Draft' },
    'Submitted': { variant: 'blue', label: 'Submitted' },
    'Approved': { variant: 'success', label: 'Approved' },
    'Rejected': { variant: 'danger', label: 'Rejected' },
    'Frozen': { variant: 'purple', label: 'Frozen' },
    'Open': { variant: 'success', label: 'Open' },
    'Closed': { variant: 'default', label: 'Closed' },
  };

  const config = statusMap[status] || { variant: 'default', label: status };

  return <Badge variant={config.variant}>{config.label}</Badge>;
};

export default StatusBadge;
