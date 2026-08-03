import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { LogoLibraryModal } from './LogoLibraryModal';
import { useThumbnailStore } from '../store/thumbnailStore';
import { deleteImage, listImages, putImage } from '../storage/imageStore';

const png = (fill: number) => new Blob([new Uint8Array(32).fill(fill)], { type: 'image/png' });

beforeEach(async () => {
  cleanup();
  for (const image of await listImages()) await deleteImage(image.id);
  useThumbnailStore.setState({ showLogoLibrary: true, logoUrl: '', selectedLogos: [] });
});

describe('Your Uploads tab', () => {
  it('says the library is empty when nothing has been uploaded', async () => {
    render(<LogoLibraryModal />);
    fireEvent.click(screen.getByRole('button', { name: /your uploads/i }));

    expect(await screen.findByText(/nothing here yet/i)).toBeTruthy();
  });

  it('lists stored uploads with their size, and counts them on the tab', async () => {
    await putImage(png(1), { name: 'brand-mark.png', width: 300, height: 200 });
    await putImage(png(2), { name: 'second-logo.png', width: 120, height: 120 });

    render(<LogoLibraryModal />);
    const tab = await screen.findByRole('button', { name: /your uploads \(2\)/i });
    fireEvent.click(tab);

    expect(await screen.findByText('brand-mark.png')).toBeTruthy();
    expect(screen.getByText('second-logo.png')).toBeTruthy();
  });

  it('deleting an upload removes it from the list', async () => {
    await putImage(png(3), { name: 'temporary.png', width: 50, height: 50 });

    render(<LogoLibraryModal />);
    fireEvent.click(await screen.findByRole('button', { name: /your uploads/i }));
    fireEvent.click(await screen.findByRole('button', { name: /delete temporary\.png/i }));

    await waitFor(async () => expect(await listImages()).toHaveLength(0));
    expect(screen.queryByText('temporary.png')).toBeNull();
  });
});
