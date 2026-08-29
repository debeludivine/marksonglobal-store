-- Create an idempotent safe transaction processor for order creations
create table if not exists idempotency_log (
  idempotency_key uuid primary key,
  response_payload jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create or replace function place_order_idempotent(
  p_idempotency_key uuid,
  p_user_id uuid,
  p_total_amount numeric,
  p_shipping_fee numeric,
  p_address text,
  p_items jsonb
) returns jsonb language plpgsql security definer as $$
declare
  v_cached_response jsonb;
  v_new_order_id uuid;
  v_item jsonb;
begin
  -- Check if this specific network token key was already processed
  select response_payload into v_cached_response 
  from idempotency_log 
  where idempotency_key = p_idempotency_key;

  if found then
    return v_cached_response;
  end if;

  -- Create New Order Records Securely
  insert into orders (user_id, total_amount, shipping_fee, shipping_address, status)
  values (p_user_id, p_total_amount, p_shipping_fee, p_address, 'pending')
  returning id into v_new_order_id;

  -- Map JSON payload items arrays into real line items
  for v_item in select * from jsonb_array_elements(p_items) loop
    insert into order_items (order_id, product_id, quantity, price_at_purchase)
    values (
      v_new_order_id, 
      (v_item->>'product_id')::uuid, 
      (v_item->>'quantity')::integer, 
      (v_item->>'price')::numeric
    );
    
    -- Atomically deduct matching warehouse catalog item inventory levels
    update products 
    set stock_quantity = stock_quantity - (v_item->>'quantity')::integer
    where id = (v_item->>'product_id')::uuid;
  end loop;

  -- Build final successful output payload maps
  v_cached_response := jsonb_build_object(
    'success', true,
    'order_id', v_new_order_id,
    'message', 'Order initialized successfully.'
  );

  -- Log token reference tracking keys to reject prospective layout duplicates
  insert into idempotency_log (idempotency_key, response_payload)
  values (p_idempotency_key, v_cached_response);

  return v_cached_response;
exception when others then
  return jsonb_build_object('success', false, 'error', SQLERRM);
end;
$$;
