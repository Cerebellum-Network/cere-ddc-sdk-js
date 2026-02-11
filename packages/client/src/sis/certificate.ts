export default async function fetchCertificateHash(httpUrl: string): Promise<string> {
  const url = `${httpUrl}/api/v1/node`;

  const response = await fetch(url);

  if (!response.ok) {
    const errorText = await response.text();
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

  return data.certificate.hash;
}
