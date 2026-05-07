import Badge from '../ui/Badge';

const LevelBadge = ({ level }) => {
  const levelMap = {
    'Junior': { variant: 'default', label: 'L1 - Junior' },
    'Mid': { variant: 'blue', label: 'L2 - Mid' },
    'Senior': { variant: 'primary', label: 'L3 - Senior' },
    'Lead': { variant: 'purple', label: 'L4 - Lead' },
  };

  const config = levelMap[level] || { variant: 'default', label: level };

  return <Badge variant={config.variant}>{config.label}</Badge>;
};

export default LevelBadge;
