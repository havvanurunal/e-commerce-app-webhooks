import { formatOrderId } from '../../common/format'
import { resend } from '../../common/resend'
import { OrderItemDetail } from './orderService'

export const sendOrderConfirmationEmail = async (
  customerEmail: string,
  orderId: string,
  items: OrderItemDetail[],
  totalAmount: number,
) => {
  const formattedOrderId = formatOrderId(orderId)
  const itemsHtml = items
    .map(
      (item) =>
        `<tr>
      <td style="padding: 16px 0; border-bottom: 1px solid #e8e2d9;">
      <table cellpadding="0" cellspacing="0" width="100%">
      <tr>
      <td width="80" style="vertical-align: top;">
       <img src="${item.images[0]}" width="70" height="70" style="border-radius: 8px; object-fit: cover; display: block;" />
       </td>
       <td style="vertical-align: top; padding-left: 16px; font-family: Arial, sans-serif;">
       <p style="margin: 0; font-size: 15px; color: #3a3226;">${item.name}</p>
       <p style="margin: 4px 0 0; font-size: 13px; color: #9a8f7d;">Qty: ${item.quantity}</p>
        </td>
        <td style="vertical-align: top; text-align: right; font-family: Arial,sans-serif; font-size: 15px; color: #3a3226;">$${item.price.toFixed(2)}
      </tr>
      </table>
      </td>
      </tr>`,
    )
    .join('')

  const html = `<table cellpadding="0" cellspacing="0" width="100%" style="background-color: #f7f3ec; padding: 40px 0;">
  <tr>
    <td align="center">
      <table cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; font-family: Helvetica, Arial, sans-serif;">

        <!-- Header -->
        <tr>
          <td style="padding: 32px 40px; text-align: center; border-bottom: 1px solid #e8e2d9;">
            <span style="font-family: Helvetica, Arial, sans-serif; font-size: 20px; letter-spacing: 0.1em; font-variant: small-caps; text-decoration: underline; text-underline-offset: 4px; text-decoration-thickness: 1px; color: #111827;">MAISON</span>
          </td>
        </tr>

        <!-- Greeting -->
        <tr>
          <td style="padding: 32px 40px 8px;">
            <p style="margin: 0; font-size: 15px; color: #3a3226;">Thank you for your order.</p>
            <p style="margin: 8px 0 0; font-size: 14px; color: #9a8f7d;">
              Order Number: ${formattedOrderId} &middot; We'll let you know when it ships.
            </p>
          </td>
        </tr>

        <!-- Items -->
        <tr>
          <td style="padding: 16px 40px;">
            <table cellpadding="0" cellspacing="0" width="100%">
              ${itemsHtml}
            </table>
          </td>
        </tr>

        <!-- Total -->
        <tr>
          <td style="padding: 24px 40px;">
            <table cellpadding="0" cellspacing="0" width="100%">
              <tr>
                <td style="font-size: 15px; color: #3a3226; font-weight: bold;">Total</td>
                <td style="text-align: right; font-size: 15px; color: #3a3226; font-weight: bold;">$${totalAmount.toFixed(2)}</td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding: 24px 40px; background-color: #f7f3ec; text-align: center;">
            <p style="margin: 0; font-size: 12px; color: #9a8f7d;">
              Questions? Contact us at orders@example.com
            </p>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>`

  await resend.emails.send({
    from: 'onboarding@resend.dev',
    to: customerEmail,
    subject: 'Order Confirmation',
    html,
  })
}
