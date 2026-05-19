import { Order } from '@/services/firestore';

/**
 * Utility helper to send automated WhatsApp notifications to the admin using the UltraMsg API.
 */
export async function sendWhatsAppNotification(message: string): Promise<void> {
  const instanceId = process.env.ULTRAMSG_INSTANCE_ID || process.env.NEXT_PUBLIC_ULTRAMSG_INSTANCE_ID || 'instance176356';
  const token = process.env.ULTRAMSG_TOKEN || process.env.NEXT_PUBLIC_ULTRAMSG_TOKEN || 'dkdo6ia7gzb49tb1';
  const phoneNumber = process.env.NEXT_PUBLIC_ADMIN_WHATSAPP_NUMBER || '+923001030542';

  if (!instanceId || !token || !phoneNumber) {
    console.warn('UltraMsg notification aborted: Missing credentials.');
    return;
  }

  // Clean phone number format (ensure no whitespaces)
  const cleanPhone = phoneNumber.trim().replace(/\s+/g, '');
  const url = `https://api.ultramsg.com/${instanceId}/messages/chat`;

  // Construct form parameters
  const params = new URLSearchParams();
  params.append('token', token);
  params.append('to', cleanPhone);
  params.append('body', message);

  try {
    // Send standard POST request in background (non-blocking for UI transitions)
    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
      mode: 'no-cors' // Bypass client CORS preflights securely
    }).then(() => {
      console.log('UltraMsg WhatsApp notification triggered successfully.');
    }).catch((err) => {
      console.log('UltraMsg WhatsApp background delivery trace:', err);
    });
  } catch (error) {
    console.error('Failed to trigger UltraMsg WhatsApp notification:', error);
  }
}

/**
 * Compiles and sends a WhatsApp notification for new user signup.
 */
export async function notifyNewSignup(fullName: string, email: string): Promise<void> {
  const signupTime = new Date().toLocaleString('en-PK', { timeZone: 'Asia/Karachi' });
  const msg = `*📢 HYDER TRADERS - Naya Registration!*\n\n👤 *Name:* ${fullName}\n📧 *Email:* ${email}\n⏰ *Time:* ${signupTime}`;
  await sendWhatsAppNotification(msg);
}

/**
 * Compiles and sends a WhatsApp notification for new orders.
 */
export async function notifyNewOrder(orderData: any, trackingId: string): Promise<void> {
  const customerName = orderData.shippingAddress?.fullName || 'Guest Customer';
  const orderTotal = orderData.total || 0;
  const paymentMethod = orderData.paymentMethod || 'COD';
  const orderTime = new Date().toLocaleString('en-PK', { timeZone: 'Asia/Karachi' });

  const msg = `*🛍️ HYDER TRADERS - Naya Order!*\n\n👤 *Customer:* ${customerName}\n💰 *Total:* PKR ${orderTotal.toLocaleString()}\n📦 *Tracking ID:* ${trackingId}\n💳 *Method:* ${paymentMethod}\n⏰ *Time:* ${orderTime}`;
  await sendWhatsAppNotification(msg);
}

/**
 * Compiles and sends a WhatsApp notification for uploaded payment screenshots.
 */
export async function notifyPaymentScreenshot(customerName: string, orderId: string): Promise<void> {
  const msg = `*📸 HYDER TRADERS - Payment Receipt Uploaded!*\n\n👤 *Customer:* ${customerName}\n📦 *Order ID:* ${orderId}\n📝 *Notice:* A bank transfer receipt screenshot has been uploaded. Please review the transaction in the Admin Dashboard!`;
  await sendWhatsAppNotification(msg);
}
