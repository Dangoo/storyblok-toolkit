import React from 'react';
import { cleanup, render, act, screen, waitFor } from '@testing-library/react';

import { Image } from '../Image';

const storyblokImage =
  'https://a.storyblok.com/f/39898/3310x2192/e4ec08624e/demo-image.jpeg';

describe('[image] Image', () => {
  afterEach(() => {
    cleanup();
    jest.restoreAllMocks();
  });

  it('should render an image with the src to load', async () => {
    act(() => {
      render(<Image alt="flowers" src={storyblokImage} />);
    });

    expect(screen.getByAltText('')).toHaveStyle('opacity: 1');

    expect(screen.getByAltText('flowers')).not.toHaveAttribute('src');
    expect(screen.getByAltText('flowers')).toHaveAttribute('data-src');
  });

  it('should let native loading handle loading if supported', async () => {
    global.HTMLImageElement.prototype.loading = 'lazy';

    act(() => {
      render(<Image alt="flowers" src={storyblokImage} />);
    });

    expect(screen.getByAltText('flowers')).toHaveAttribute('src');
  });

  it('should create io as loading fallback', async () => {
    const observe = jest.fn();
    const unobserve = jest.fn();
    const disconnect = jest.fn();

    delete global.window.location;
    global.window = Object.create(window);
    global.window.IntersectionObserver = jest.fn(() => ({
      observe,
      unobserve,
      disconnect,
    })) as any;

    act(() => {
      render(<Image alt="flowers" src={storyblokImage} />);
    });

    await waitFor(() =>
      expect(screen.getByAltText('flowers')).toHaveAttribute('src'),
    );

    expect(observe).toHaveBeenCalled();
  });

  it('should render null if src is not a storyblok asset', async () => {
    jest.spyOn(console, 'error').mockImplementation(jest.fn());

    act(() => {
      render(<Image data-testid="img" src="http://localhost/test.png" />);
    });

    expect(screen.queryByTestId('img')).toBeNull();
  });
});
