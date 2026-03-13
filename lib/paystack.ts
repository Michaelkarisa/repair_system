'use server';

import { PaymentInitRequest, PaymentInitResponse, PaymentVerifyResponse } from '@/lib/types';

const PAYSTACK_PUBLIC_KEY = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_API_URL = 'https://api.paystack.co';

export async function initializePayment(
  request: PaymentInitRequest
): Promise<PaymentInitResponse> {
  if (!PAYSTACK_SECRET_KEY) {
    console.warn('[v0] Paystack secret key not configured');
    return {
      status: false,
      message: 'Payment service not configured',
    };
  }

  try {
    const response = await fetch(`${PAYSTACK_API_URL}/transaction/initialize`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: request.email,
        amount: Math.round(request.amount * 100), // Convert to kobo
        metadata: request.metadata,
        callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/invoices/payment-callback`,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('[v0] Paystack error:', data);
      return {
        status: false,
        message: data.message || 'Failed to initialize payment',
      };
    }

    return {
      status: true,
      message: 'Payment initialized',
      data: {
        authorization_url: data.data.authorization_url,
        access_code: data.data.access_code,
        reference: data.data.reference,
      },
    };
  } catch (error) {
    console.error('[v0] Payment initialization error:', error);
    return {
      status: false,
      message: 'Payment initialization failed',
    };
  }
}

export async function verifyPayment(reference: string): Promise<PaymentVerifyResponse> {
  if (!PAYSTACK_SECRET_KEY) {
    console.warn('[v0] Paystack secret key not configured');
    return {
      status: false,
      message: 'Payment service not configured',
    };
  }

  try {
    const response = await fetch(
      `${PAYSTACK_API_URL}/transaction/verify/${encodeURIComponent(reference)}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('[v0] Paystack verification error:', data);
      return {
        status: false,
        message: data.message || 'Failed to verify payment',
      };
    }

    return {
      status: true,
      message: 'Payment verified',
      data: {
        reference: data.data.reference,
        amount: data.data.amount / 100, // Convert back to original currency
        status: data.data.status,
        customer: {
          email: data.data.customer.email,
        },
      },
    };
  } catch (error) {
    console.error('[v0] Payment verification error:', error);
    return {
      status: false,
      message: 'Payment verification failed',
    };
  }
}

export async function getPaymentGatewayUrl(publicKey: string): Promise<string | null> {
  if (!publicKey) {
    console.warn('[v0] Paystack public key not configured');
    return null;
  }

  return `https://js.paystack.co/v1/inline.js`;
}

export function getPaystackPublicKey(): string | null {
  return PAYSTACK_PUBLIC_KEY || null;
}
