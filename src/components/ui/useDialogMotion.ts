'use client';

import { useEffect, useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import { useTheme } from '@mui/material/styles';
import gsap from 'gsap';
import { dialogMotion } from '@/theme/transitions';

export function useDialogMotion(open: boolean) {
  const theme = useTheme();
  const dialogRef = useRef<HTMLDivElement>(null);
  const [present, setPresent] = useState(open);

  useEffect(() => {
    if (!open) return;
    const frame = window.requestAnimationFrame(() => setPresent(true));
    return () => window.cancelAnimationFrame(frame);
  }, [open]);

  useGSAP(
    () => {
      const root = dialogRef.current;
      if (!root || !present) return;

      const paper = root.querySelector<HTMLElement>('.MuiDialog-paper');
      const backdrop = root.querySelector<HTMLElement>('.MuiBackdrop-root');
      const icon = root.querySelector<HTMLElement>('[data-modal-icon]');
      const body = root.querySelector<HTMLElement>('[data-modal-body]');
      const actions = root.querySelector<HTMLElement>('[data-modal-actions]');
      const targets = [paper, backdrop, icon, body, actions].filter(
        (target): target is HTMLElement => Boolean(target),
      );

      if (!paper) return;

      const prefersReducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)',
      ).matches;

      if (prefersReducedMotion) {
        gsap.set(targets, { clearProps: 'all' });
        if (!open) setPresent(false);
        return;
      }

      gsap.killTweensOf(targets);

      if (open) {
        if (backdrop) gsap.set(backdrop, { opacity: 0 });
        gsap.set(paper, {
          autoAlpha: 0,
          y: dialogMotion.enterOffset,
          scale: dialogMotion.enterScale,
          rotate: dialogMotion.enterRotate,
          transformOrigin: '50% 100%',
        });
        if (icon) {
          gsap.set(icon, {
            autoAlpha: 0,
            scale: dialogMotion.iconEnterScale,
            rotate: dialogMotion.iconEnterRotate,
          });
        }
        if (body) {
          gsap.set(body, {
            autoAlpha: 0,
            y: dialogMotion.contentOffset,
          });
        }
        if (actions) {
          gsap.set(actions, {
            autoAlpha: 0,
            y: dialogMotion.actionsOffset,
          });
        }

        const timeline = gsap.timeline();

        if (backdrop) {
          timeline.to(
            backdrop,
            {
              opacity: 1,
              duration: theme.transitions.duration.shorter / 1000,
              ease: 'power2.out',
            },
            0,
          );
        }

        timeline.to(
          paper,
          {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            rotate: 0,
            duration: theme.transitions.duration.complex / 1000,
            ease: 'power3.out',
          },
          0,
        );

        if (icon) {
          timeline.to(
            icon,
            {
              autoAlpha: 1,
              scale: 1,
              rotate: 0,
              duration: theme.transitions.duration.standard / 1000,
              ease: 'back.out(1.45)',
            },
            dialogMotion.iconDelay,
          );
        }

        if (body) {
          timeline.to(
            body,
            {
              autoAlpha: 1,
              y: 0,
              duration: theme.transitions.duration.short / 1000,
              ease: 'power2.out',
            },
            dialogMotion.bodyDelay,
          );
        }

        if (actions) {
          timeline.to(
            actions,
            {
              autoAlpha: 1,
              y: 0,
              duration: theme.transitions.duration.short / 1000,
              ease: 'power2.out',
            },
            dialogMotion.actionsDelay,
          );
        }

        return () => timeline.kill();
      }

      const timeline = gsap.timeline({
        onComplete: () => setPresent(false),
      });

      if (body || actions) {
        timeline.to(
          [body, actions].filter(Boolean),
          {
            autoAlpha: 0,
            y: dialogMotion.exitContentOffset,
            duration: theme.transitions.duration.shortest / 1000,
            ease: 'power2.in',
          },
          0,
        );
      }

      if (icon) {
        timeline.to(
          icon,
          {
            autoAlpha: 0,
            scale: dialogMotion.iconExitScale,
            rotate: dialogMotion.iconExitRotate,
            duration: theme.transitions.duration.shortest / 1000,
            ease: 'power2.in',
          },
          0,
        );
      }

      timeline.to(
        paper,
        {
          autoAlpha: 0,
          y: dialogMotion.exitOffset,
          scale: dialogMotion.exitScale,
          rotate: dialogMotion.exitRotate,
          duration: theme.transitions.duration.leavingScreen / 1000,
          ease: 'power2.in',
        },
        0,
      );

      if (backdrop) {
        timeline.to(
          backdrop,
          {
            opacity: 0,
            duration: theme.transitions.duration.shorter / 1000,
            ease: 'power2.in',
          },
          0,
        );
      }

      return () => timeline.kill();
    },
    {
      dependencies: [open, present],
      revertOnUpdate: true,
      scope: dialogRef,
    },
  );

  return {
    dialogRef,
    isClosing: present && !open,
    present,
  };
}
