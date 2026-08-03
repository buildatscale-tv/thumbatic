import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { ImageLibraryModal } from './ImageLibraryModal';
import { useThumbnailStore } from '../store/thumbnailStore';
import { deleteImage, listImages, putImage } from '../storage/imageStore';
import { IMAGE_LIBRARY } from '../constants/images';
import type { ImageElementProperties, ThumbnailElement } from '../types';

const AWS = IMAGE_LIBRARY.find(image => image.label === 'AWS')!;

const imageElement = (id: string, src: string): ThumbnailElement => ({
  id,
  type: 'image',
  name: id,
  position: { x: 175, y: 550 },
  zIndex: 5000,
  properties: { size: 128, rotation: 0, opacity: 100, src },
});

const canvasImages = () =>
  useThumbnailStore.getState().elements
    .filter(element => element.type === 'image')
    .map(element => (element.properties as ImageElementProperties).src);

const png = (fill: number) => new Blob([new Uint8Array(32).fill(fill)], { type: 'image/png' });

beforeEach(async () => {
  cleanup();
  for (const image of await listImages()) await deleteImage(image.id);
  useThumbnailStore.setState({ showImageLibrary: true, elements: [] });
});

describe('Your Uploads tab', () => {
  it('says the library is empty when nothing has been uploaded', async () => {
    render(<ImageLibraryModal />);
    fireEvent.click(screen.getByRole('button', { name: /your uploads/i }));

    expect(await screen.findByText(/nothing here yet/i)).toBeTruthy();
  });

  it('lists stored uploads with their size, and counts them on the tab', async () => {
    await putImage(png(1), { name: 'brand-mark.png', width: 300, height: 200 });
    await putImage(png(2), { name: 'second-logo.png', width: 120, height: 120 });

    render(<ImageLibraryModal />);
    const tab = await screen.findByRole('button', { name: /your uploads \(2\)/i });
    fireEvent.click(tab);

    expect(await screen.findByText('brand-mark.png')).toBeTruthy();
    expect(screen.getByText('second-logo.png')).toBeTruthy();
  });

  it('deleting an upload removes it from the list', async () => {
    await putImage(png(3), { name: 'temporary.png', width: 50, height: 50 });

    render(<ImageLibraryModal />);
    fireEvent.click(await screen.findByRole('button', { name: /your uploads/i }));
    fireEvent.click(await screen.findByRole('button', { name: /delete temporary\.png/i }));

    // Wait on the DOM, not the store. The list re-renders after the delete resolves,
    // and asserting on the store first raced that render.
    await waitFor(() => expect(screen.queryByText('temporary.png')).toBeNull());
    expect(await listImages()).toHaveLength(0);
  });
});

describe('the image library tab', () => {
  it('ticks the images the canvas already holds', async () => {
    useThumbnailStore.setState({ elements: [imageElement('image-1', AWS.value)] });

    render(<ImageLibraryModal />);

    expect(await screen.findByText('1 selected')).toBeTruthy();
  });

  it('adds a newly ticked image once, and only that one', async () => {
    render(<ImageLibraryModal />);
    fireEvent.click(await screen.findByText(AWS.label));
    fireEvent.click(screen.getByRole('button', { name: /^Add \(1\)$/ }));

    expect(canvasImages()).toEqual([AWS.value]);
  });

  it('takes an image off the canvas when it is unticked', async () => {
    useThumbnailStore.setState({ elements: [imageElement('image-1', AWS.value)] });

    render(<ImageLibraryModal />);
    fireEvent.click(await screen.findByText(AWS.label));
    fireEvent.click(screen.getByRole('button', { name: /^Remove \(1\)$/ }));

    expect(canvasImages()).toEqual([]);
  });

  it('leaves an uploaded image alone, since the library does not offer it', async () => {
    useThumbnailStore.setState({ elements: [imageElement('image-upload', 'img:' + 'a'.repeat(64))] });

    render(<ImageLibraryModal />);
    fireEvent.click(await screen.findByText(AWS.label));
    fireEvent.click(screen.getByRole('button', { name: /^Add \(1\)$/ }));

    expect(canvasImages()).toEqual(['img:' + 'a'.repeat(64), AWS.value]);
  });
});
