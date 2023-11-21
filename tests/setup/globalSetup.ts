import { startEnvironment } from './environment';

export default async () => {
  console.log(''); // New line

  await startEnvironment();
};
