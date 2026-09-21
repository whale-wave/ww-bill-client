import type { ReactNode } from 'react';
import type { CropperProps } from 'react-easy-crop';
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import UserInfoPage from '@/pages/user/user-info/UserInfoPage';

const mocks = vi.hoisted(() => ({
  choseFile: vi.fn(),
  createObjectURL: vi.fn(),
  logOut: vi.fn(),
  revokeObjectURL: vi.fn(),
  showAppError: vi.fn(),
  uploadFile: vi.fn(),
  updateUser: vi.fn(),
}));

vi.mock('react-easy-crop', () => ({
  default: ({ aspect, cropShape, image, onCropAreaChange, onMediaLoaded, showGrid }: CropperProps) => (
    <div data-aspect={aspect} data-crop-shape={cropShape} data-show-grid={showGrid}>
      <img
        alt=""
        onLoad={() => {
          onMediaLoaded?.({ height: 400, naturalHeight: 400, naturalWidth: 600, width: 600 });
          onCropAreaChange?.(
            { height: 100, width: 66.67, x: 16.67, y: 0 },
            { height: 400, width: 400, x: 100, y: 0 },
          );
        }}
        src={image}
      />
    </div>
  ),
}));

vi.mock('@/entities/user', () => ({
  useGetUserUserInfoQuery: () => ({
    data: {
      avatar: 'https://example.com/avatar.png',
      email: 'avan@example.com',
      name: 'Avan',
      username: 'avan',
    },
  }),
  useGetAccountDeletionStatusQuery: () => ({
    data: { data: { blockers: { customLedgerCount: 0, householdCount: 0 }, canRequest: true } },
    refetch: vi.fn(),
  }),
  usePostAccountDeletionEmailCodeMutation: () => ({ isLoading: false, mutateAsync: vi.fn() }),
  usePostAccountDeletionMutation: () => ({ isLoading: false, mutateAsync: vi.fn() }),
  usePutUserUserInfoMutation: () => [mocks.updateUser, { isLoading: false }],
}));

vi.mock('@/features/auth', () => ({
  useAuthStore: (selector: (state: { logOut: () => void }) => unknown) => selector({ logOut: mocks.logOut }),
}));

vi.mock('@/shared/api', () => ({
  uploadFile: mocks.uploadFile,
}));

vi.mock('@/shared/i18n', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@/shared/lib/chose-file', () => ({
  default: mocks.choseFile,
}));

vi.mock('@/shared/ui/app-feedback', () => ({
  showAppError: mocks.showAppError,
}));

let cleanup: (() => void) | undefined;

function renderPage(element: ReactNode) {
  const container = document.createElement('div');
  const root = createRoot(container);
  const router = createMemoryRouter([{ element, path: '/settings/user' }], {
    initialEntries: ['/settings/user'],
  });
  act(() => root.render(createElement(RouterProvider, { router })));
  cleanup = () => act(() => root.unmount());
  return container;
}

beforeEach(() => {
  mocks.choseFile.mockReset();
  mocks.createObjectURL.mockReset();
  mocks.createObjectURL
    .mockReturnValueOnce('blob:avatar-source')
    .mockReturnValueOnce('blob:avatar-preview');
  mocks.revokeObjectURL.mockReset();
  mocks.showAppError.mockReset();
  mocks.updateUser.mockReset();
  mocks.uploadFile.mockReset();
  vi.spyOn(URL, 'createObjectURL').mockImplementation(mocks.createObjectURL);
  vi.spyOn(URL, 'revokeObjectURL').mockImplementation(mocks.revokeObjectURL);
});

afterEach(() => {
  cleanup?.();
  cleanup = undefined;
  vi.restoreAllMocks();
});

function findButton(container: HTMLElement, label: string) {
  return [...container.querySelectorAll<HTMLButtonElement>('button')]
    .find(button => button.textContent?.includes(label));
}

async function openReadyAvatarCrop(container: HTMLElement) {
  const file = new File(['avatar'], 'avatar.png', { type: 'image/png' });
  mocks.choseFile.mockResolvedValue({ 0: file, length: 1 } as unknown as FileList);

  await act(async () => findButton(container, 'info.changeAvatar')?.click());
  const cropper = container.querySelector('[data-aspect]');
  const image = cropper?.querySelector('img');
  Object.defineProperty(image, 'naturalWidth', { configurable: true, value: 600 });
  Object.defineProperty(image, 'naturalHeight', { configurable: true, value: 400 });
  act(() => image?.dispatchEvent(new Event('load')));

  return cropper;
}

describe('user info page', () => {
  it('renders the profile avatar as a circle', () => {
    const container = renderPage(createElement(UserInfoPage));
    const avatar = container.querySelector<HTMLImageElement>('img[alt="Avan"]');

    expect(avatar?.parentElement?.classList).toContain('rounded-full');
  });

  it('requires acknowledgement and an email code before account deletion can be requested', () => {
    const container = renderPage(createElement(UserInfoPage));
    const openButton = [...container.querySelectorAll('button')].find(button => button.textContent?.includes('deletion.open'));

    act(() => openButton?.click());

    const submitButton = [...container.querySelectorAll('button')].find(button => button.textContent?.includes('deletion.submit'));
    expect(submitButton).toBeDefined();
    expect(submitButton).toHaveProperty('disabled', true);
  });

  it('opens a user-controlled square crop before uploading an avatar', async () => {
    const container = renderPage(createElement(UserInfoPage));
    const cropper = await openReadyAvatarCrop(container);

    expect(mocks.choseFile).toHaveBeenCalledWith({ accept: 'image/*' });
    expect(cropper?.getAttribute('data-aspect')).toBe('1');
    expect(cropper?.getAttribute('data-crop-shape')).toBe('rect');
    expect(cropper?.getAttribute('data-show-grid')).toBe('true');
    expect(mocks.uploadFile).not.toHaveBeenCalled();
  });

  it('shows upload progress and only replaces the avatar after upload and profile update succeed', async () => {
    const drawImage = vi.fn();
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext')
      .mockReturnValue({ drawImage } as unknown as CanvasRenderingContext2D);
    vi.spyOn(HTMLCanvasElement.prototype, 'toBlob')
      .mockImplementation(callback => callback(new Blob(['cropped'], { type: 'image/webp' })));
    let resolveUpload: ((value: { data: { url: string }; statusCode: number }) => void) | undefined;
    mocks.uploadFile.mockReturnValue(new Promise((resolve) => {
      resolveUpload = resolve;
    }));
    mocks.updateUser.mockResolvedValue({ statusCode: 200 });
    const container = renderPage(createElement(UserInfoPage));
    await openReadyAvatarCrop(container);

    act(() => findButton(container, 'info.avatarApplyCrop')?.click());
    await act(async () => Promise.resolve());

    expect(findButton(container, 'info.avatarUploading')).toBeDefined();
    expect(container.querySelector('[data-avatar-crop-dialog] button[aria-busy="true"]')).not.toBeNull();

    await act(async () => {
      resolveUpload?.({ data: { url: '/api/media/public/avatar-id/main-v1' }, statusCode: 200 });
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(drawImage).toHaveBeenCalledWith(expect.any(HTMLImageElement), 100, 0, 400, 400, 0, 0, 512, 512);
    expect(mocks.updateUser).toHaveBeenCalledWith({
      avatar: '/api/media/public/avatar-id/main-v1',
      name: 'Avan',
    });
    expect(container.querySelector('[data-avatar-crop-dialog]')).toBeNull();
    expect(container.querySelector<HTMLImageElement>('img[alt="Avan"]')?.src).toBe('blob:avatar-preview');
    expect(findButton(container, 'info.avatarUpdated')).toBeDefined();
  });

  it('keeps the existing avatar and offers retry feedback when upload fails', async () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext')
      .mockReturnValue({ drawImage: vi.fn() } as unknown as CanvasRenderingContext2D);
    vi.spyOn(HTMLCanvasElement.prototype, 'toBlob')
      .mockImplementation(callback => callback(new Blob(['cropped'], { type: 'image/webp' })));
    const uploadError = new Error('upload failed');
    mocks.uploadFile.mockRejectedValue(uploadError);
    const container = renderPage(createElement(UserInfoPage));
    await openReadyAvatarCrop(container);

    await act(async () => {
      findButton(container, 'info.avatarApplyCrop')?.click();
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(mocks.updateUser).not.toHaveBeenCalled();
    expect(container.querySelector<HTMLImageElement>('img[alt="Avan"]')?.src).toBe('https://example.com/avatar.png');
    expect(container.querySelector('[data-avatar-crop-dialog]')).not.toBeNull();
    expect(mocks.showAppError).toHaveBeenCalledWith(uploadError, { fallbackMessage: 'info.avatarUploadFailed' });
  });
});
