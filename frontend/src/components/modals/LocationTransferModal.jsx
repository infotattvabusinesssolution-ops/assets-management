import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Legacy entry point: transfers now use the full movement workflow.
export function LocationTransferModal({ asset }) {
  const navigate = useNavigate();
  const assetId = asset?.id || asset?.assetId;

  useEffect(() => {
    navigate(assetId
      ? `/movements/transfer?assetId=${encodeURIComponent(assetId)}`
      : '/movements/transfer', {
      state: assetId ? { assetId } : undefined,
      replace: true
    });
  }, [assetId, navigate]);

  return null;
}
