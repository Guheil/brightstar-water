export const dialogMotionSelectors = {
  actions: '[data-modal-actions]',
  body: '[data-modal-body]',
  icon: '[data-modal-icon]',
  paper: '.MuiDialog-paper',
  title: '[data-modal-title-text]',
} as const;

export function getDialogMotionTargets(root: HTMLElement) {
  const paper = root.querySelector<HTMLElement>(dialogMotionSelectors.paper);
  const icon = root.querySelector<HTMLElement>(dialogMotionSelectors.icon);
  const title = root.querySelector<HTMLElement>(dialogMotionSelectors.title);
  const body = root.querySelector<HTMLElement>(dialogMotionSelectors.body);
  const actions = root.querySelector<HTMLElement>(dialogMotionSelectors.actions);

  return {
    actions,
    body,
    icon,
    paper,
    title,
    all: [paper, icon, title, body, actions].filter(
      (target): target is HTMLElement => Boolean(target),
    ),
  };
}
