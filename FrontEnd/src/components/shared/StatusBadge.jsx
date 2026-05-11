import Badge from '../ui/Badge';
import { getStatusBadge } from '../../utils/statusColors';

const StatusBadge = ({ status }) => {
  const config = getStatusBadge(status);
  return <Badge variant={config.variant}>{config.label}</Badge>;
};

export default StatusBadge;
