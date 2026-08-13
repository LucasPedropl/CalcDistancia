import React from 'react';
import { createPortal } from 'react-dom';
import type { RouteData, PriceTier, ThemeMode } from '../types';
import type {
  OrderAssignmentMode,
  OrderCheckoutResult,
  OrderPaymentMethod,
  OrderPaymentResponsibility,
} from '../types/order';
import { isValidPhone } from '../utils/phoneValidation';
import { OrderReviewStep } from './order/OrderReviewStep';
import { OrderPhoneStep } from './order/OrderPhoneStep';
import { OrderPaymentStep } from './order/OrderPaymentStep';
import { OrderModalHeader } from './order/OrderModalHeader';
import { OrderModalFooter } from './order/OrderModalFooter';

type OrderModalStep = 'REVIEW' | 'PHONE' | 'PAYMENT';

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  routeData: RouteData | null;
  price: number | null;
  tier?: PriceTier;
  assignmentMode: OrderAssignmentMode;
  targetMotoboyName?: string;
  establishmentId: string;
  onConfirmSuccess: (checkout: OrderCheckoutResult) => void;
  theme?: ThemeMode;
}

const STEP_LABELS: Record<OrderModalStep, string> = {
  REVIEW: 'Passo 1 de 3 — Revise os dados',
  PHONE: 'Passo 2 de 3 — WhatsApp do cliente',
  PAYMENT: 'Passo 3 de 3 — Pagamento da entrega',
};

const STEP_ORDER: OrderModalStep[] = ['REVIEW', 'PHONE', 'PAYMENT'];

export const OrderModal: React.FC<OrderModalProps> = ({
  isOpen,
  onClose,
  routeData,
  price,
  tier,
  assignmentMode,
  targetMotoboyName,
  establishmentId,
  onConfirmSuccess,
  theme = 'light',
}: OrderModalProps) => {
  const isDark = theme === 'dark';
  const [step, setStep] = React.useState<OrderModalStep>('REVIEW');
  const [phone, setPhone] = React.useState('');
  const [phoneError, setPhoneError] = React.useState<string | null>(null);
  const [paymentResponsibility, setPaymentResponsibility] =
    React.useState<OrderPaymentResponsibility>('CLIENT');
  const [establishmentPaid, setEstablishmentPaid] = React.useState(false);
  const [establishmentPaymentMethod, setEstablishmentPaymentMethod] = React.useState<
    OrderPaymentMethod | undefined
  >(undefined);
  const [paymentError, setPaymentError] = React.useState<string | null>(null);

  const resetState = React.useCallback(() => {
    setStep('REVIEW');
    setPhone('');
    setPhoneError(null);
    setPaymentResponsibility('CLIENT');
    setEstablishmentPaid(false);
    setEstablishmentPaymentMethod(undefined);
    setPaymentError(null);
  }, []);

  React.useEffect(() => {
    if (!isOpen) resetState();
  }, [isOpen, resetState]);

  if (!isOpen || !routeData) return null;

  const stepIndex = STEP_ORDER.indexOf(step);

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleConfirm = () => {
    if (!isValidPhone(phone)) {
      setPaymentError('Informe um telefone válido do cliente antes de confirmar.');
      setStep('PHONE');
      return;
    }

    if (paymentResponsibility === 'ESTABLISHMENT' && !establishmentPaid) {
      setPaymentError('Conclua o pagamento do estabelecimento antes de enviar.');
      return;
    }

    onConfirmSuccess({
      trackingPhone: phone,
      paymentResponsibility,
      establishmentPaid: paymentResponsibility === 'ESTABLISHMENT' && establishmentPaid,
      paymentMethod: establishmentPaymentMethod,
    });
    handleClose();
  };

  const handleAdvance = () => {
    if (step === 'REVIEW') {
      setStep('PHONE');
      return;
    }

    if (!isValidPhone(phone)) {
      setPhoneError('Informe um telefone válido para receber notificações via WhatsApp.');
      return;
    }
    setStep('PAYMENT');
  };

  return createPortal(
    <div className="fixed inset-0 z-[1100] flex items-start justify-center overflow-y-auto bg-black/80 p-4 pt-20 backdrop-blur-md sm:items-center sm:py-8">
      <div
        className={`my-auto w-full max-w-md overflow-hidden rounded-2xl border shadow-2xl transition-colors ${
          isDark ? 'border-zinc-800 bg-zinc-950 text-white' : 'border-slate-200 bg-white text-slate-900'
        }`}
      >
        <OrderModalHeader
          stepLabel={STEP_LABELS[step]}
          stepIndex={stepIndex}
          stepCount={STEP_ORDER.length}
          isDark={isDark}
          onClose={handleClose}
        />

        {step === 'REVIEW' && (
          <OrderReviewStep
            routeData={routeData}
            price={price}
            tier={tier}
            isDirect={assignmentMode === 'DIRECT'}
            targetMotoboyName={targetMotoboyName}
            isDark={isDark}
          />
        )}

        {step === 'PHONE' && (
          <OrderPhoneStep
            phone={phone}
            phoneError={phoneError}
            isDark={isDark}
            onPhoneChange={(value) => {
              setPhone(value);
              setPhoneError(null);
            }}
          />
        )}

        {step === 'PAYMENT' && (
          <OrderPaymentStep
            price={price}
            theme={theme}
            establishmentId={establishmentId}
            paymentResponsibility={paymentResponsibility}
            paymentError={paymentError}
            onResponsibilityChange={(responsibility) => {
              setPaymentResponsibility(responsibility);
              setPaymentError(null);
              if (responsibility !== 'ESTABLISHMENT') {
                setEstablishmentPaid(false);
                setEstablishmentPaymentMethod(undefined);
              }
            }}
            onEstablishmentPaid={(method) => {
              setEstablishmentPaid(true);
              setEstablishmentPaymentMethod(method);
              setPaymentError(null);
            }}
          />
        )}

        <OrderModalFooter
          step={step}
          isDark={isDark}
          onAdvance={handleAdvance}
          onBack={() => setStep(step === 'PAYMENT' ? 'PHONE' : 'REVIEW')}
          onCancel={handleClose}
          onConfirm={handleConfirm}
        />
      </div>
    </div>,
    document.body,
  );
};
