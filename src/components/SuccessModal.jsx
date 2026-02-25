import { useEffect } from 'react';
import qnextLogo from '../assets/qnext.svg';
import successIllustration from '../assets/Success_modal.svg';
import '../styles/SuccessModal.scss';

function SuccessModal({
  open,
  title = 'Success!',
  message = 'Your action was completed successfully.',
  detail = '',
  autoCloseMs = 5000,
  onClose,
}) {
  useEffect(() => {
    if (!open || !autoCloseMs) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      onClose?.();
    }, autoCloseMs);

    return () => window.clearTimeout(timer);
  }, [open, autoCloseMs, onClose]);

  if (!open) {
    return null;
  }

  const seconds = Math.ceil((autoCloseMs || 0) / 1000);

  return (
    <div className="success-modal-overlay" onClick={onClose}>
      <div className="success-modal-card" onClick={(event) => event.stopPropagation()}>
        <img src={qnextLogo} alt="QNext" className="success-modal-logo" />
        <img src={successIllustration} alt="Success" className="success-modal-illustration" />

        <h2>{title}</h2>
        <p className="success-modal-message">{message}</p>
        {detail ? <p className="success-modal-detail">{detail}</p> : null}
        {autoCloseMs ? <p className="success-modal-autoclose">Closes automatically in {seconds}s...</p> : null}

        <button type="button" className="success-modal-button" onClick={onClose}>
          Done
        </button>
      </div>
    </div>
  );
}

export default SuccessModal;
