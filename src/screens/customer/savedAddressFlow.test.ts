import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const account = readFileSync(resolve(process.cwd(), 'src/screens/customer/AccountScreen/index.tsx'), 'utf8');
const checkout = readFileSync(resolve(process.cwd(), 'src/screens/customer/CheckoutScreen/index.tsx'), 'utf8');
const editor = readFileSync(resolve(process.cwd(), 'src/components/customer/AddressEditorForm/index.tsx'), 'utf8');
const map = readFileSync(resolve(process.cwd(), 'src/screens/customer/DeliveryPinMap/index.tsx'), 'utf8');
const route = readFileSync(resolve(process.cwd(), 'src/app/api/customer/addresses/[id]/route.ts'), 'utf8');
const migration = readFileSync(resolve(process.cwd(), 'supabase/migrations/202608220010_customer_saved_addresses.sql'), 'utf8');

describe('saved delivery address flow', () => {
  it('shows an account warning only when saved addresses are initialized and missing', () => {
    expect(account).toContain('addressesInitialized && !usableAddress');
    expect(account).toContain('Delivery address needed');
    expect(account).toContain('<CircleAlert />');
  });

  it('uses saved database addresses in checkout instead of creating Order delivery records', () => {
    expect(checkout).toContain('<AddressSelector');
    expect(checkout).toContain('<AddressEditorDialog');
    expect(checkout).not.toContain("label: 'Order delivery'");
    expect(checkout).not.toContain('saveDeliveryAddress({');
  });

  it('uses controlled address type and PSGC location choices', () => {
    expect(editor).toContain("(['home', 'work', 'other'] as const)");
    expect(editor).toContain("fetchPsgcOptions('provinces')");
    expect(editor).toContain("fetchPsgcOptions('municipalities'");
    expect(editor).toContain("fetchPsgcOptions('barangays'");
  });

  it('requires an intentional pin for new addresses and supports current location', () => {
    expect(editor).toContain('reportInitial={Boolean(initialAddress)}');
    expect(map).toContain('navigator.geolocation.getCurrentPosition');
    expect(map).toContain("new Marker({ draggable: true })");
    expect(map).toContain("map.on('click'");
  });

  it('scopes mutations to the authenticated customer on both route and database layers', () => {
    expect(route).toContain("p_actor_id: context.actor.id");
    expect(migration).toContain('where id = p_address_id and customer_id = p_actor_id');
    expect(migration).toContain('customer_addresses_one_default_idx');
    expect(migration).toContain('using gist (location)');
  });

  it('does not store exact address or coordinate data in the business audit payload', () => {
    expect(migration).toContain("'address.created'");
    expect(migration).toContain("'address.updated'");
    expect(migration).not.toContain("jsonb_build_object('latitude'");
    expect(migration).not.toContain("jsonb_build_object('address_line'");
  });
});
