import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import ConfirmationModal from '../src/components/ui/ConfirmationModal.vue';

function mountModal(props = {}) {
  return mount(ConfirmationModal, {
    props: {
      open: true,
      title: 'Cancel this booking?',
      message: 'This action cannot be undone.',
      confirmLabel: 'Yes, cancel booking',
      danger: true,
      ...props,
    },
    global: { stubs: { Teleport: true, Transition: false } },
  });
}

describe('ConfirmationModal', () => {
  it('renders an accessible alert dialog with the supplied copy', () => {
    const wrapper = mountModal();

    expect(wrapper.get('[role="alertdialog"]').attributes('aria-modal')).toBe('true');
    expect(wrapper.text()).toContain('Cancel this booking?');
    expect(wrapper.text()).toContain('Yes, cancel booking');
  });

  it('emits confirm only after the confirmation button is selected', async () => {
    const wrapper = mountModal();

    await wrapper.get('.modal-actions .is-danger').trigger('click');

    expect(wrapper.emitted('confirm')).toHaveLength(1);
  });

  it('emits cancel when Escape is pressed', async () => {
    const wrapper = mountModal();

    await wrapper.get('.modal-backdrop').trigger('keydown', { key: 'Escape' });

    expect(wrapper.emitted('cancel')).toHaveLength(1);
  });
});
