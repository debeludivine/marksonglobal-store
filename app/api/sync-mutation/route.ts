import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { toggleWishlist } from '@/lib/customer-actions';

export async function POST(request: Request) {
  try {
    const mutation = await request.json();
    const { id, type, payload, timestamp } = mutation;

    // Based on the mutation type, execute the respective server action / database logic
    if (type === 'TOGGLE_WISHLIST') {
      const { productId } = payload;
      await toggleWishlist(productId);
      return NextResponse.json({ success: true });
    }

    if (type === 'CHECKOUT') {
      // For checkout, we extract the client-generated idempotency key from the payload
      const { idempotencyKey, amount, address, items } = payload;
      
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      // Call the idempotent RPC function
      const { data, error } = await supabase.rpc('place_order_idempotent', {
        p_idempotency_key: idempotencyKey,
        p_user_id: user.id,
        p_total_amount: amount,
        p_shipping_fee: 1000, // Fixed or calculated
        p_address: address,
        p_items: items // [{product_id, quantity, price}]
      });

      if (error) {
        console.error('RPC Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      if (data && data.success === false) {
        return NextResponse.json({ error: data.error }, { status: 400 });
      }

      return NextResponse.json(data);
    }

    // Default 
    return NextResponse.json({ success: true, message: 'Unrecognized mutation, ignoring.' });

  } catch (err: any) {
    console.error('Sync API Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
