import { useToast } from '../../context/toast-context';

interface ConfirmDialogProps {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel?: () => void;
}

export function useConfirmDialog() {
  const { showConfirm } = useToast();

  const confirm = ({ title, message, onConfirm, onCancel }: ConfirmDialogProps) => {
    showConfirm(
      title,
      () => {
        onConfirm();
      },
      onCancel
    );
  };

  return confirm;
}