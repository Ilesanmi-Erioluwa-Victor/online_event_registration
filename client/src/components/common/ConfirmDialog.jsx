import { useState } from 'react';
import Modal from './Modal.jsx';
import Button from './Button.jsx';

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
}) => {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return;
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={title} size="sm">
      <p className="text-neutral-600 mb-6">{message}</p>
      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={handleClose} disabled={loading}>
          {cancelText}
        </Button>
        <Button variant={variant} onClick={handleConfirm} loading={loading}>
          {confirmText}
        </Button>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
