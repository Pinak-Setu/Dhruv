import { metadata } from '@/app/layout';

describe('Canonical metadata', () => {
  it('exposes metadataBase and canonical alternate', () => {
    expect(metadata.metadataBase).toBeTruthy();
    // @ts-expect-error Metadata types allow URL|undefined
    const base = metadata.metadataBase as URL;
    expect(base.href).toMatch(/^https?:\/\//);
    expect(metadata.alternates).toBeTruthy();
    expect(metadata.alternates?.canonical).toBe('/');
  });
});


