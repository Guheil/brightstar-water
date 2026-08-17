import { describe, expect, it } from 'vitest';
import { createImmediateMockServices } from './createMockServices';

describe('mock data services', () => {
  it('restores fixture data on reset', async () => {
    const services = createImmediateMockServices();
    const initial = await services.dataService.loadSnapshot();

    await services.products.save({ ...initial.products[0], name: 'Temporary name' });
    const reset = await services.dataService.reset();

    expect(reset.products[0].name).toBe(initial.products[0].name);
  });
});
