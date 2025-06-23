export interface FlutterwaveConfig {
  public_key: string;
  tx_ref: string;
  amount: number;
  currency: string;
  payment_options: string;
  redirect_url: string;
  customer: {
    email: string;
    name: string;
    phone_number?: string;
  };
  customizations: {
    title: string;
    description: string;
    logo: string;
  };
  meta?: Record<string, unknown>;
}

export interface FlutterwaveWebhookEvent {
  event: 'charge.completed' | 'transfer.completed' | 'transaction.successful';
  data: {
    id: number;
    tx_ref: string;
    flw_ref: string;
    amount: number;
    currency: string;
    customer: {
      email: string;
      name: string;
      phone_number?: string;
    };
    status: 'successful' | 'failed' | 'pending';
    payment_type: string;
    meta?: Record<string, unknown>;
  };
}

export interface TransactionResponse {
  status: 'success' | 'failed';
  message: string;
  data?: {
    link?: string;
    transaction_id?: string;
  };
}
