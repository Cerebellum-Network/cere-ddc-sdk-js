export default async function fetchCertificateHash(httpUrl: string): Promise<string> {
  const url = `${httpUrl}/api/v1/node`;
  console.log('[fetchCertificateHash] Attempting to fetch from:', url);

  try {
    const response = await fetch(url);
    console.log('[fetchCertificateHash] Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[fetchCertificateHash] Error response body:', errorText);
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = (await response.json()) as {
      pub_key: string;
      certificate: {
        hash: string;
        expires_at: string;
        renews_at: string;
      };
    };

    console.log('[fetchCertificateHash] Successfully fetched certificate hash');
    return data.certificate.hash;
  } catch (error) {
    console.error('[fetchCertificateHash] Fetch failed for URL:', url);
    console.error('[fetchCertificateHash] Error name:', (error as Error).name);
    console.error('[fetchCertificateHash] Error message:', (error as Error).message);
    console.error('[fetchCertificateHash] Error cause:', (error as any).cause);
    throw error;
  }
}
