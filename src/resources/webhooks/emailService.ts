import { resend } from '../../common/resend'
import { OrderItemDetail } from './orderService'

export const sendOrderConfirmationEmail = async (
  customerEmail: string,
  orderDetails: OrderItemDetail[],
  totalAmount: number,
) => {
  const itemsHtml = orderDetails
    .map(
      (item) =>
        `<li>
      <img src="${item.images[0]}" width="100" />
      ${item.quantity}x ${item.name} - $${item.price}
      </li>`,
    )
    .join('')

  await resend.emails.send({
    from: 'onboarding@resend.dev',
    to: customerEmail,
    subject: 'Order Confirmation',
    html: `<h1 style="color: #333; font-family:Arial;">Maison</h1><p>Thank you for your order. We will inform you when your order is shipped. Please see the details of your order below:</p>
         <ul>${itemsHtml}</ul><p>Total Amount: <strong>$${totalAmount}</strong>If you have any questions, please contact us via orders@example.com.</p>`,
  })
}
