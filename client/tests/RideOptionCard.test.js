import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import RideOptionCard from '../src/components/bookings/RideOptionCard.vue';

describe('RideOptionCard', () => {
  it('renders a server-provided fare and emits the selected ride type', async () => {
    const wrapper = mount(RideOptionCard, {
      props: { type: 'shared', fare: 24, selected: false },
    });
    expect(wrapper.text()).toContain('Shared Ride');
    expect(wrapper.text()).toContain('₱24');
    expect(wrapper.text()).toContain('per person (est.)');
    await wrapper.trigger('click');
    expect(wrapper.emitted('select')).toEqual([['shared']]);
  });

  it('does not invent a fare while routing is unavailable', () => {
    const wrapper = mount(RideOptionCard, {
      props: { type: 'non_shared', fare: null, selected: true },
    });
    expect(wrapper.text()).toContain('Fare unavailable');
    expect(wrapper.classes()).toContain('selected');
  });

  it('shows server-provided route duration without inventing driver availability', () => {
    const wrapper = mount(RideOptionCard, {
      props: { type: 'non_shared', fare: 60, duration: 8 },
    });
    expect(wrapper.text()).toContain('8 min estimated');
    expect(wrapper.text()).toContain('whole tricycle (est.)');
    expect(wrapper.text()).not.toContain('drivers nearby');
  });
});
