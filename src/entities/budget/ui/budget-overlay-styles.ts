export const BUDGET_OVERLAY_MASK_CLASS_NAME = '!bg-[#26364a]/35 !backdrop-blur-[2px]';

export const BUDGET_CENTER_POPUP_CLASS_NAME = [
  '[--adm-center-popup-min-width:min(390px,calc(100vw-36px))]',
  '[--adm-center-popup-max-width:min(390px,calc(100vw-36px))]',
].join(' ');

export const BUDGET_DIALOG_BODY_CLASS_NAME = [
  '!box-border !w-full !max-w-full !overflow-hidden !rounded-[24px]',
  '!border !border-solid !border-white/80 !bg-white/95 !shadow-ww-floating',
  '[&_.adm-dialog-title]:!px-6 [&_.adm-dialog-title]:!pt-6',
  '[&_.adm-dialog-title]:!text-[18px] [&_.adm-dialog-title]:!font-extrabold [&_.adm-dialog-title]:!text-ww-ink',
  '[&_.adm-dialog-content]:!px-6 [&_.adm-dialog-content]:!pb-5 [&_.adm-dialog-content]:!pt-3',
  '[&_.adm-dialog-content]:!text-[13px] [&_.adm-dialog-content]:!leading-5 [&_.adm-dialog-content]:!text-ww-mid',
  '[&_.adm-dialog-footer]:!gap-2 [&_.adm-dialog-footer]:!border-0 [&_.adm-dialog-footer]:!px-4 [&_.adm-dialog-footer]:!pb-4',
  '[&_.adm-dialog-action-row]:!gap-2 [&_.adm-dialog-action-row]:!border-0',
  '[&_.adm-dialog-button]:!h-11 [&_.adm-dialog-button]:!rounded-[14px] [&_.adm-dialog-button]:!border-0',
  '[&_.adm-dialog-button]:!bg-primary-light/50 [&_.adm-dialog-button]:!text-[13px] [&_.adm-dialog-button]:!font-bold [&_.adm-dialog-button]:!text-primary-deep',
].join(' ');

export const BUDGET_ACTION_SHEET_CLASS_NAME = [
  '[&_.adm-popup-body]:!overflow-hidden [&_.adm-popup-body]:!rounded-t-[26px]',
  '[&_.adm-popup-body]:!border-t [&_.adm-popup-body]:!border-solid [&_.adm-popup-body]:!border-white/80',
  '[&_.adm-popup-body]:!bg-white/95 [&_.adm-popup-body]:!shadow-ww-floating [&_.adm-popup-body]:!backdrop-blur-xl',
  '[&_.adm-action-sheet]:!pb-2',
  '[&_.adm-action-sheet-button-list]:!px-3 [&_.adm-action-sheet-button-list]:!pt-3',
  '[&_.adm-action-sheet-button-item-wrapper]:!border-0',
  '[&_.adm-action-sheet-button-item]:!my-1 [&_.adm-action-sheet-button-item]:!min-h-[50px]',
  '[&_.adm-action-sheet-button-item]:!rounded-[15px] [&_.adm-action-sheet-button-item]:!bg-primary-light/25',
  '[&_.adm-action-sheet-button-item-name]:!text-[14px] [&_.adm-action-sheet-button-item-name]:!font-bold [&_.adm-action-sheet-button-item-name]:!text-ww-ink',
  '[&_.adm-action-sheet-button-item-danger]:!bg-[#fff0f1]',
  '[&_.adm-action-sheet-button-item-danger_.adm-action-sheet-button-item-name]:!text-[#d95761]',
  '[&_.adm-action-sheet-cancel]:!mx-3 [&_.adm-action-sheet-cancel]:!mt-2 [&_.adm-action-sheet-cancel]:!border-0',
  '[&_.adm-action-sheet-cancel_.adm-action-sheet-button-item]:!rounded-[15px] [&_.adm-action-sheet-cancel_.adm-action-sheet-button-item]:!bg-[#f4f5f7]',
].join(' ');
