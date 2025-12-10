export default async function fetchCertificateHash(httpUrl: string): Promise<string> {
  const response = await fetch(`${httpUrl}/api/v1/node`);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${await response.text()}`);
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
