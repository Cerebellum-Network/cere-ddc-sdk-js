import { JsonCipher } from '../../packages/ciphers/src/JsonCipher';
import { Curve25519Cipher } from '../../packages/ciphers/src/index';

describe('Event cipher', () => {
  it('Encrypt and decrypt (string)', async () => {
    const testSubject = new JsonCipher(new Curve25519Cipher(new TextEncoder().encode('super-secret')));

    const given = `
      {
                "k1": "v1",
                "k2": "v2",
                "k3": {
                    "k4": true,
                    "k5": ["v5", "v5"]
                },
                "k6": {
                    "k7": {
                        "k8": "123"
                    }
                }
            }
    `;

    const encrypted = await testSubject.encrypt(given);
    expect(JSON.parse(encrypted)).toEqual(
      JSON.parse(
        `{"k1":"0xcb773bec122073d56ce0873531e8e3435e41","k2":"0x327d1fcd4e79389eb9fb226c44b58b6beb63","k3":{"k4":"0x53804b133382f30cbdc2b5e4c51cd4663e7cff6e","k5":["0xc69e28ca22784fa8c2f3c9918bbe63f4a611","0xfdc4b18d20dcabda7df588a2f89e327f86d1"]},"k6":{"k7":{"k8":"0x7fe0c886a6d3a85cfab3254f1b5b0440e2d35f"}}}`,
      ),
    );

    const decrypted = await testSubject.decrypt(encrypted);
    expect(JSON.parse(decrypted)).toEqual(JSON.parse(given));
  });

  it('Encrypt and decrypt (event)', async () => {
    const testSubject = new JsonCipher(new Curve25519Cipher(new TextEncoder().encode('super-secret')));

    const given = {
      id: '7646e755-3edc-4b28-91db-58d9e77c8a2f',
      timestamp: new Date('2025-01-09T08:50:00.747Z').toISOString(),
      event_type: 'VIDEO_ENDED',
      payload: {
        campaignId: '7',
        videoId:
          'https://cdn.dragon.cere.network/81/baear4ieupzxqgdwuy4f24el6nsnswdqd2mua56x5rcylwskqagjjxbiwfy/Screenshot%202024-11-01%20at%2007.45.18.png',
      },
    };

    const encrypted = await testSubject.encrypt(JSON.stringify(given));
    expect(JSON.parse(encrypted)).toEqual(
      JSON.parse(
        `{"id":"0x834fbfe98864bff37399800986d035b154b90070824faf7eb2f6806017f0d60f3a8f93970a09311fe53af799630d1008f6c9ba62","event_type":"0xcf70da825196c0b4de3a1242e52ec336de32072e3af4bbdf5f6361","timestamp":"0x92c3637beeb46d6b4187e9161449ccfacd42dcf5ad3a698ea9b1f987d91d7c0d410094c30278db43","payload":{"campaignId":"0x89d0fd1dc7a7bd8b476a1cb94106657984","videoId":"0x0362066c5d8c9c6b5e24f4af6e95e12ad8a57cea9bc16e87cd65cbecd4091d6d71888c28a163030c43c2e2bcd7a15dd521bdd786ebf45fb02e6ec44a89b1d7650f3c15f4c80263587957b291632cb0a86f885ffc7652fa50ee4522f5e20a2ae990974e306a596ebdcb2cf31159a9850cd1db0cedc5ff404b22c8811e10222b1c747ce6fb556a9017ad1f7d61bbcf2b2371e66551c2f97e3a898b"}}`,
      ),
    );

    const decrypted = await testSubject.decrypt(encrypted);
    expect(decrypted).toEqual(JSON.stringify(given));
  });

  it('Encrypt and decrypt (scopes)', async () => {
    const testSubject = new JsonCipher(
      new Curve25519Cipher(new TextEncoder().encode('super-secret')),
      new Array<string>('$.k1', '$.k3.k4', '$.k3.k5[0]', '$.k6.k7.k8'),
    );

    const given = `
      {
                "k1": "v1",
                "k2": "v2",
                "k3": {
                    "k4": true,
                    "k5": ["v5", "v5"]
                },
                "k6": {
                    "k7": {
                        "k8": "123"
                    }
                }
            }
    `;

    const encrypted = await testSubject.encrypt(given);
    expect(JSON.parse(encrypted)).toEqual(
      JSON.parse(
        `{"k1":"0xcb773bec122073d56ce0873531e8e3435e41","k2":"v2","k3":{"k4":"0x53804b133382f30cbdc2b5e4c51cd4663e7cff6e","k5":["0xc69e28ca22784fa8c2f3c9918bbe63f4a611","v5"]},"k6":{"k7":{"k8":"0x7fe0c886a6d3a85cfab3254f1b5b0440e2d35f"}}}`,
      ),
    );

    const decrypted = await testSubject.decrypt(encrypted);
    expect(JSON.parse(decrypted)).toEqual(JSON.parse(given));
  });
});
