import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import StatusPill from '../src/components/ui/StatusPill.vue';

describe('StatusPill', () => {
  it('formats machine statuses for people', () => {
    const wrapper = mount(StatusPill, { props: { status: 'driver_arriving' } });
    expect(wrapper.text()).toBe('Driver Arriving');
    expect(wrapper.classes()).toContain('info');
  });
});

