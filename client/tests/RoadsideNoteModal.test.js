import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import RoadsideNoteModal from '../src/components/roadside/RoadsideNoteModal.vue';

function mountModal(props = {}) {
  return mount(RoadsideNoteModal, {
    props: { open: true, modelValue: '', ...props },
    global: { stubs: { Teleport: true, Transition: false } },
  });
}

describe('RoadsideNoteModal', () => {
  it('renders an accessible dialog that explains it is separate from booking', () => {
    const wrapper = mountModal();
    expect(wrapper.get('[role="dialog"]').attributes('aria-modal')).toBe('true');
    expect(wrapper.text()).toContain('separate from booking');
    expect(wrapper.text()).toContain('Show me to drivers');
  });

  it('emits note changes and submit from the form', async () => {
    const wrapper = mountModal();
    await wrapper.get('textarea').setValue('Victoria Public Market');
    await wrapper.get('form').trigger('submit');
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['Victoria Public Market']);
    expect(wrapper.emitted('submit')).toHaveLength(1);
  });

  it('offers stop sharing for an active signal', async () => {
    const wrapper = mountModal({ active: true, expiry: '9:55 AM' });
    expect(wrapper.text()).toContain('Live on driver maps');
    await wrapper.get('.is-danger').trigger('click');
    expect(wrapper.emitted('stop')).toHaveLength(1);
  });
});
