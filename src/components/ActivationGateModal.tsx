import { useActivationGate } from '../store/activationGate'
import { useSubscriptionStatus } from '../hooks/useSubscriptionStatus'

const SIGNUP_URL = import.meta.env.VITE_SIGNUP_URL ?? '/select-plan'
const SUPPORT_PHONE = import.meta.env.VITE_SUPPORT_PHONE ?? '+233 XX XXX XXXX'
const SUPPORT_EMAIL = import.meta.env.VITE_SUPPORT_EMAIL ?? 'support@shepherdpos.com'

export function ActivationGateModal() {
  const { isOpen, close } = useActivationGate()
  const { data: sub } = useSubscriptionStatus()

  if (!isOpen) return null

  const noPlan = sub?.status === 'no_plan_selected'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 space-y-4">
        <h2 className="text-lg font-semibold">
          {noPlan ? 'Choose a plan' : 'Activate your subscription'}
        </h2>

        {noPlan ? (
          <>
            <p className="text-sm text-gray-500">
              You haven't selected a plan yet. Choose a plan to get started, then complete payment to activate your account.
            </p>
            <a
              href={SIGNUP_URL}
              className="block w-full h-10 rounded-md bg-blue-600 text-white text-sm font-medium text-center leading-10 hover:bg-blue-700"
            >
              Choose a plan
            </a>
          </>
        ) : (
          <>
            <p className="text-sm text-gray-500">
              {sub?.plan
                ? `You selected the ${sub.plan} plan. To start using Shepherd POS, please complete payment with us.`
                : 'Please complete payment to activate your account.'}
            </p>
            <div className="text-sm space-y-1">
              <p>📞 {SUPPORT_PHONE}</p>
              <p>✉️ {SUPPORT_EMAIL}</p>
            </div>
            <p className="text-xs text-gray-400">
              Once payment is confirmed, every section will unlock immediately.
            </p>
          </>
        )}

        <button
          onClick={close}
          className="w-full h-10 rounded-md border border-gray-300 text-sm font-medium hover:bg-gray-50"
        >
          Got it
        </button>
      </div>
    </div>
  )
}
