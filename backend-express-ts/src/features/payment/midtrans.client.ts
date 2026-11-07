import { createHash } from "node:crypto";
import { env } from "../../config/env.js";
import { AppError } from "../../common/errors.js";

const configured = Boolean(
  env.MIDTRANS_SERVER_KEY && env.MIDTRANS_CLIENT_KEY,
);

const snapBaseUrl = env.MIDTRANS_IS_PRODUCTION
  ? "https://app.midtrans.com"
  : "https://app.sandbox.midtrans.com";
const apiBaseUrl = env.MIDTRANS_IS_PRODUCTION
  ? "https://api.midtrans.com"
  : "https://api.sandbox.midtrans.com";

const authHeader = () =>
  `Basic ${Buffer.from(`${env.MIDTRANS_SERVER_KEY}:`).toString("base64")}`;

const assertConfigured = () => {
  if (!configured) {
    throw new AppError(
      "Midtrans is not configured",
      503,
      "PAYMENT_NOT_CONFIGURED",
    );
  }
};

export interface SnapTransactionPayload {
  transaction_details: {
    order_id: string;
    gross_amount: number;
  };
  customer_details: {
    first_name: string;
    email: string;
  };
  expiry: {
    unit: "hours";
    duration: number;
  };
}

export const createSnapTransaction = async (
  payload: SnapTransactionPayload,
) => {
  assertConfigured();

  const response = await fetch(`${snapBaseUrl}/snap/v1/transactions`, {
    method: "POST",
    headers: {
      Authorization: authHeader(),
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new AppError(
      `Midtrans transaction failed: ${body}`,
      502,
      "PAYMENT_PROVIDER_ERROR",
    );
  }

  return (await response.json()) as {
    token: string;
    redirect_url: string;
  };
};

export const getMidtransTransactionStatus = async (orderNumber: string) => {
  assertConfigured();

  const response = await fetch(
    `${apiBaseUrl}/v2/${encodeURIComponent(orderNumber)}/status`,
    {
      method: "GET",
      headers: {
        Authorization: authHeader(),
        Accept: "application/json",
      },
    },
  );

  if (!response.ok) {
    throw new AppError(
      "Failed to fetch Midtrans transaction status",
      502,
      "PAYMENT_PROVIDER_ERROR",
    );
  }

  return (await response.json()) as {
    transaction_status: string;
    fraud_status?: string;
    transaction_id?: string;
    payment_type?: string;
    gross_amount?: string;
  };
};

export const verifyMidtransSignature = (
  orderId: string,
  statusCode: string,
  grossAmount: string,
  signature: string,
) => {
  if (!env.MIDTRANS_SERVER_KEY) return false;

  const expected = createHash("sha512")
    .update(`${orderId}${statusCode}${grossAmount}${env.MIDTRANS_SERVER_KEY}`)
    .digest("hex");

  return expected === signature;
};
