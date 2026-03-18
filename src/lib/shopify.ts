interface ShopifyOrderParams {
  shopDomain: string;       // e.g. 'edibleblooms.com.au'
  accessToken: string;      // private app Admin API token
  productName: string;
  priceInCents: number;
  quantity?: number;
  deliveryAddress: {
    line1: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
  };
  customerNote?: string;
}

export async function placeShopifyOrder(params: ShopifyOrderParams): Promise<{ orderId: string | null; error?: string }> {
  const {
    shopDomain,
    accessToken,
    productName,
    priceInCents,
    quantity = 1,
    deliveryAddress,
    customerNote,
  } = params;

  const price = (priceInCents / 100).toFixed(2);

  const body = {
    order: {
      line_items: [
        {
          title: productName,
          price,
          quantity,
          requires_shipping: true,
        },
      ],
      shipping_address: {
        address1: deliveryAddress.line1,
        city: deliveryAddress.city,
        province: deliveryAddress.state,
        zip: deliveryAddress.postcode,
        country_code: deliveryAddress.country ?? 'AU',
      },
      note: customerNote ?? 'Order placed via Broflow',
      financial_status: 'paid',
      send_receipt: false,
      send_fulfillment_receipt: false,
    },
  };

  try {
    const res = await fetch(
      `https://${shopDomain}/admin/api/2024-01/orders.json`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': accessToken,
        },
        body: JSON.stringify(body),
      }
    );

    if (!res.ok) {
      const text = await res.text();
      return { orderId: null, error: `Shopify ${res.status}: ${text}` };
    }

    const data = await res.json() as { order: { id: number } };
    return { orderId: String(data.order.id) };
  } catch (err) {
    return { orderId: null, error: String(err) };
  }
}
