import React from 'react';
import { LiquidityStatus } from '../types';
import { STATUS_COLORS, STATUS_LABELS } from '../constants';
import { IconCheck, IconX, IconAlert, IconUsers } from './Icons';

interface Props {
  status: LiquidityStatus;
  mini?: boolean;
}

const StatusBadge: React.FC<Props> = ({ status, mini = false }) => {
  const colorClass = STATUS_COLORS[status];
  const label = STATUS_LABELS[status];

  let Icon = IconUsers;
  if (status === LiquidityStatus.AVAILABLE) Icon = IconCheck;
  if (status === LiquidityStatus.EMPTY) Icon = IconX;
  if (status === LiquidityStatus.CROWDED) Icon = IconAlert;

  if (mini) {
    return (
      <div className={`w-3 h-3 rounded-full ${status === LiquidityStatus.AVAILABLE ? 'bg-green-500' : status === LiquidityStatus.EMPTY ? 'bg-red-500' : 'bg-yellow-500'}`} />
    );
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border ${colorClass}`}>
      <Icon className="w-4 h-4" />
      {label}
    </span>
  );
};

export default StatusBadge;