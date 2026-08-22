import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const read = (relative: string) => readFileSync(resolve(process.cwd(), relative), 'utf8');

const apiContext = read('src/lib/orders/apiServer.ts');
const operationsServer = read('src/lib/orders/server.ts');
const operationRoutes = [
  read('src/app/api/operations/route.ts'),
  read('src/app/api/operations/page/route.ts'),
  read('src/app/api/operations/orders/[id]/route.ts'),
  read('src/app/api/operations/deliveries/[id]/route.ts'),
];

describe('operational profile access', () => {
  it('reads profiles through the authenticated request client instead of expanding service-role grants', () => {
    expect(apiContext).toContain("import { createClient } from '@/lib/supabase/server';");
    expect(apiContext).toContain('profileClient = await createClient();');
    expect(operationsServer).toContain("profileClient.from('profiles')");
    expect(operationsServer).not.toContain("client.from('profiles')");
  });

  it('uses the authenticated profile client for every operational snapshot shape', () => {
    for (const route of operationRoutes) {
      expect(route).toContain('context.profileClient, context.actor');
    }
  });

  it('uses the authenticated customer profile already loaded for a customer snapshot', () => {
    expect(operationsServer).toContain("actor.role === 'customer'\n      ? [actor]");
  });
});
