'use client';

import { cloneElement, forwardRef, useEffect, useRef } from 'react';
import type { ForwardedRef, ReactElement } from 'react';
import Transition from 'react-transition-group/Transition';
import gsap from 'gsap';
import { dialogMotion } from '@/theme/transitions';
import { getDialogMotionTargets } from './elements';
import type { DialogMotionTransitionProps } from './interface';

function reducedMotionRequested() {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

function assignRef<T>(ref: ForwardedRef<T>, value: T | null) {
  if (typeof ref === 'function') {
    ref(value);
    return;
  }

  if (ref) {
    ref.current = value;
  }
}

const DialogMotionTransition = forwardRef<HTMLDivElement, DialogMotionTransitionProps>(
  function DialogMotionTransition(
    {
      appear = true,
      children,
      enter,
      exit,
      in: inProp,
      mountOnEnter,
      onEnter,
      onEntered,
      onEntering,
      onExit,
      onExited,
      onExiting,
      role,
      tabIndex,
      unmountOnExit,
    },
    forwardedRef,
  ) {
    const nodeRef = useRef<HTMLDivElement | null>(null);
    const timelineRef = useRef<gsap.core.Timeline | null>(null);

    useEffect(
      () => () => {
        timelineRef.current?.kill();
      },
      [],
    );

    const setNodeRef = (node: HTMLDivElement | null) => {
      nodeRef.current = node;
      assignRef(forwardedRef, node);
    };

    const stopCurrentMotion = (node: HTMLElement) => {
      timelineRef.current?.kill();
      timelineRef.current = null;

      const { all } = getDialogMotionTargets(node);
      gsap.killTweensOf(all);
    };

    const prepareEnteredState = (node: HTMLElement) => {
      const { actions, body, icon, paper, title } = getDialogMotionTargets(node);

      if (paper) {
        gsap.set(paper, {
          clearProps: 'transform,opacity,visibility,willChange',
        });
      }

      gsap.set(
        [icon, title, body, actions].filter((target): target is HTMLElement => Boolean(target)),
        { clearProps: 'transform,opacity,visibility,willChange' },
      );
    };

    const handleEnter = (isAppearing: boolean) => {
      const node = nodeRef.current;
      if (!node) return;

      stopCurrentMotion(node);
      node.dataset.motionPhase = 'entering';
      node.style.pointerEvents = '';

      const { actions, body, icon, paper, title } = getDialogMotionTargets(node);

      if (!paper || reducedMotionRequested()) {
        prepareEnteredState(node);
        onEnter?.(node, isAppearing);
        return;
      }

      // The paper is deliberately opaque from frame zero. Only transform is animated.
      // The transition state clips paper overflow until the content has settled,
      // preventing a transient scrollbar on the first or final animation frame.
      gsap.set(paper, {
        y: dialogMotion.enterOffset,
        scale: dialogMotion.enterScale,
        rotate: dialogMotion.enterRotate,
        opacity: 1,
        visibility: 'visible',
        transformOrigin: '50% 100%',
        willChange: 'transform',
      });

      if (icon) {
        gsap.set(icon, {
          autoAlpha: 0,
          scale: dialogMotion.iconEnterScale,
          rotate: dialogMotion.iconEnterRotate,
          willChange: 'transform, opacity',
        });
      }

      if (title) {
        gsap.set(title, { autoAlpha: 0, willChange: 'opacity' });
      }

      if (body) {
        gsap.set(body, { autoAlpha: 0, willChange: 'opacity' });
      }

      if (actions) {
        gsap.set(actions, { autoAlpha: 0, willChange: 'opacity' });
      }

      onEnter?.(node, isAppearing);

      const timeline = gsap.timeline();
      timelineRef.current = timeline;

      timeline.to(
        paper,
        {
          y: 0,
          scale: 1,
          rotate: 0,
          duration: dialogMotion.enterDuration / 1000,
          ease: dialogMotion.enterEase,
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
            duration: dialogMotion.iconEnterDuration / 1000,
            ease: dialogMotion.iconEase,
          },
          dialogMotion.iconDelay,
        );
      }

      if (title) {
        timeline.to(
          title,
          {
            autoAlpha: 1,
            duration: dialogMotion.titleEnterDuration / 1000,
            ease: dialogMotion.contentEase,
          },
          dialogMotion.titleDelay,
        );
      }

      if (body) {
        timeline.to(
          body,
          {
            autoAlpha: 1,
            duration: dialogMotion.bodyEnterDuration / 1000,
            ease: dialogMotion.contentEase,
          },
          dialogMotion.bodyDelay,
        );
      }

      if (actions) {
        timeline.to(
          actions,
          {
            autoAlpha: 1,
            duration: dialogMotion.actionsEnterDuration / 1000,
            ease: dialogMotion.contentEase,
          },
          dialogMotion.actionsDelay,
        );
      }
    };

    const handleEntering = (isAppearing: boolean) => {
      const node = nodeRef.current;
      if (node) onEntering?.(node, isAppearing);
    };

    const handleEntered = (isAppearing: boolean) => {
      const node = nodeRef.current;
      if (!node) return;

      prepareEnteredState(node);
      node.dataset.motionPhase = 'entered';
      onEntered?.(node, isAppearing);
    };

    const handleExit = () => {
      const node = nodeRef.current;
      if (!node) return;

      stopCurrentMotion(node);
      node.dataset.motionPhase = 'exiting';
      node.style.pointerEvents = 'none';

      const { actions, body, icon, paper, title } = getDialogMotionTargets(node);
      onExit?.(node);

      if (!paper || reducedMotionRequested()) {
        prepareEnteredState(node);
        return;
      }

      gsap.set(paper, {
        opacity: 1,
        visibility: 'visible',
        willChange: 'transform',
      });

      const timeline = gsap.timeline();
      timelineRef.current = timeline;

      const fadingContent = [title, body, actions].filter(
        (target): target is HTMLElement => Boolean(target),
      );

      if (fadingContent.length) {
        timeline.to(
          fadingContent,
          {
            autoAlpha: 0,
            duration: dialogMotion.contentExitDuration / 1000,
            ease: dialogMotion.exitEase,
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
            duration: dialogMotion.iconExitDuration / 1000,
            ease: dialogMotion.exitEase,
          },
          0,
        );
      }

      timeline.to(
        paper,
        {
          y: dialogMotion.exitOffset,
          scale: dialogMotion.exitScale,
          rotate: dialogMotion.exitRotate,
          duration: dialogMotion.exitDuration / 1000,
          ease: dialogMotion.exitEase,
        },
        0,
      );
    };

    const handleExiting = () => {
      const node = nodeRef.current;
      if (node) onExiting?.(node);
    };

    const handleExited = () => {
      const node = nodeRef.current;
      if (!node) return;

      stopCurrentMotion(node);
      prepareEnteredState(node);
      node.style.pointerEvents = '';
      node.dataset.motionPhase = 'exited';
      onExited?.(node);
    };

    return (
      <Transition<HTMLDivElement>
        appear={appear}
        enter={enter}
        exit={exit}
        in={inProp}
        mountOnEnter={mountOnEnter}
        nodeRef={nodeRef}
        onEnter={handleEnter}
        onEntered={handleEntered}
        onEntering={handleEntering}
        onExit={handleExit}
        onExited={handleExited}
        onExiting={handleExiting}
        timeout={{
          appear: dialogMotion.enterDuration,
          enter: dialogMotion.enterDuration,
          exit: dialogMotion.exitDuration,
        }}
        unmountOnExit={unmountOnExit}
      >
        {(status) =>
          cloneElement(children as ReactElement<Record<string, unknown>>, {
            'data-dialog-motion-state': status,
            ref: setNodeRef,
            role,
            tabIndex,
          })
        }
      </Transition>
    );
  },
);

export default DialogMotionTransition;
