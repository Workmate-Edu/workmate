import { randomUUID } from 'crypto';
import { User } from '@/models/user';
import { PaymentOrder } from '@/models/payment-order';
import { connectDB } from '@/lib/mongodb';
import { quoteLegacyOrder } from './order-policy';

// Internal service only. Not wired to checkout until shared transactional
// fulfilment, legacy migration and the offer rules are ready.
export async function createLegacyPaymentOrder(authenticatedUserId: string, input: unknown) {
  if (!/^[a-f\d]{24}$/i.test(authenticatedUserId)) throw new Error('Invalid account');
  await connectDB();
  const owner = await User.findById(authenticatedUserId).select('role parentProfile.children').lean();
  if (!owner) throw new Error('Account not found');
  const quote = quoteLegacyOrder(input, {
    id: authenticatedUserId,
    role: owner.role,
    childIds: (owner.parentProfile?.children || []).map((child: any) => String(child)),
  });
  const order = await PaymentOrder.create({ ...quote, reference: `WM-${randomUUID()}` });
  return { orderId: String(order._id), reference: order.reference, amount: quote.amountCents / 100, currency: quote.currency };
}
