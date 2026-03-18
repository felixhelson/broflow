import { Resend } from 'resend';

interface OrderNotificationData {
  businessName: string;
  notificationEmail: string;
  productName: string;
  amountCents: number;
  deliveryAddress?: Record<string, string>;
  customerNote?: string;
}

export async function sendOrderNotificationEmail(data: OrderNotificationData) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const { businessName, notificationEmail, productName, amountCents, deliveryAddress } = data;

  const addressLines = deliveryAddress
    ? [deliveryAddress.line1, deliveryAddress.city, deliveryAddress.state, deliveryAddress.postcode, deliveryAddress.country]
        .filter(Boolean).join(', ')
    : 'Not provided';

  await resend.emails.send({
    from: 'Broflow Orders <orders@broflow.app>',
    to: notificationEmail,
    subject: `New order: ${productName}`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #D85A30; margin-bottom: 4px;">New Broflow Order</h2>
        <p style="color: #6B7280; margin-top: 0;">Hi ${businessName} — you have a new order to fulfil.</p>
        <div style="background: #F9FAFB; border-radius: 12px; padding: 16px; margin: 20px 0;">
          <p style="margin: 0 0 8px;"><strong>Product:</strong> ${productName}</p>
          <p style="margin: 0 0 8px;"><strong>Amount:</strong> $${(amountCents / 100).toFixed(2)}</p>
          <p style="margin: 0;"><strong>Deliver to:</strong> ${addressLines}</p>
        </div>
        <p style="color: #6B7280; font-size: 13px;">
          Questions? Reply to this email or contact us at hello@broflow.app
        </p>
      </div>
    `,
  });
}
