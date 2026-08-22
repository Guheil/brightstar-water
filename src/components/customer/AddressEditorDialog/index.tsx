'use client';

import { X } from 'lucide-react';
import AddressEditorForm from '@/components/customer/AddressEditorForm';
import DialogMotionTransition from '@/components/ui/DialogMotionTransition';
import { dialogMotion } from '@/theme/transitions';
import { CloseButton, EditorContent, EditorDialog, EditorTitle } from './elements';
import type { AddressEditorDialogProps } from './interface';

export default function AddressEditorDialog({ initialAddress, initialPhone, initialRecipientName, onClose, onSaved, open }: AddressEditorDialogProps) {
  return (
    <EditorDialog
      aria-labelledby="address-editor-title"
      onClose={onClose}
      open={open}
      scroll="paper"
      slots={{ transition: DialogMotionTransition }}
      transitionDuration={{ enter: dialogMotion.enterDuration, exit: dialogMotion.exitDuration }}
    >
      <EditorTitle id="address-editor-title" data-modal-title-text>
        {initialAddress ? 'Edit delivery address' : 'Add delivery address'}
        <CloseButton aria-label="Close address editor" onClick={onClose}><X size={20} /></CloseButton>
      </EditorTitle>
      <EditorContent data-modal-body>
        <AddressEditorForm
          initialAddress={initialAddress}
          initialPhone={initialPhone}
          initialRecipientName={initialRecipientName}
          onCancel={onClose}
          onSaved={onSaved}
          submitLabel={initialAddress ? 'Save changes' : 'Save address'}
        />
      </EditorContent>
    </EditorDialog>
  );
}
