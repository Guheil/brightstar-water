'use client';

import { MoreHorizontal } from 'lucide-react';
import { useState } from 'react';
import {
  ActionIcon,
  ActionMenu,
  ActionMenuItem,
  ActionText,
  ActionTrigger,
} from './elements';
import type { AdminEntityActionMenuProps } from './interface';

export default function AdminEntityActionMenu({
  actions,
  ariaLabel,
}: AdminEntityActionMenuProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);

  const close = () => setAnchorEl(null);

  return (
    <>
      <ActionTrigger
        aria-expanded={open ? 'true' : undefined}
        aria-haspopup="menu"
        aria-label={ariaLabel}
        onClick={(event) => setAnchorEl(event.currentTarget)}
      >
        <MoreHorizontal aria-hidden="true" />
      </ActionTrigger>
      <ActionMenu anchorEl={anchorEl} onClose={close} open={open}>
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <ActionMenuItem
              $danger={action.tone === 'danger'}
              disabled={action.disabled}
              key={action.label}
              onClick={() => {
                close();
                action.onSelect();
              }}
            >
              {Icon ? (
                <ActionIcon>
                  <Icon aria-hidden="true" />
                </ActionIcon>
              ) : null}
              <ActionText>{action.label}</ActionText>
            </ActionMenuItem>
          );
        })}
      </ActionMenu>
    </>
  );
}
