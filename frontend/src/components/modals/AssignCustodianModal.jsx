import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Legacy entry point: custodian assignments now use the full assignment workflow.
export function AssignCustodianModal({ isOpen, asset }) {
  const navigate = useNavigate();
  const assetId = asset?.id || asset?.assetId;

  useEffect(() => {
    if (!isOpen) return;
    navigate(assetId
      ? `/movements/assign?assetId=${encodeURIComponent(assetId)}`
      : '/movements/assign', {
      state: assetId ? { assetId } : undefined,
      replace: true
    });
  }, [isOpen, assetId, navigate]);

  return null;
}
