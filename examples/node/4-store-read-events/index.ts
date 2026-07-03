import { DdcClient, Link, DagNode, TESTNET, DagNodeUri } from '@cere-ddc-sdk/ddc-client';

/**
 * The wallet should have enough CERE to pay for the transaction fees
 */
const user = 'hybrid label reunion only dawn maze asset draft cousin height flock nation';

/**
 * The DDC bucket where the file will be stored
 */
const bucketId = 12068n;

/**
 * The website CNS name
 */
const streamCnsName = 'events-stream-example';

/**
 * Create a DDC client instance and connect it to DDC TESTNET
 */
const client = await DdcClient.create(user, { ...TESTNET, logLevel: 'silent' });

/**
 * Get the previous event root attached to the stream CNS record
 */
const prevEvent = await client.read(new DagNodeUri(bucketId, streamCnsName)).catch(() => null);

/*
 * Create a new root event with a link to the previous event root (if exists)
 */
const rootEvent = new DagNode(
  JSON.stringify({
    type: 'example-run',
    time: new Date().toISOString(),
  }),
  prevEvent ? [new Link(prevEvent.cid, prevEvent.size)] : [],
);

/**
 * Store the new root event to the DDC and update the stream CNS record
 */
const rootEventUri = await client.store(bucketId, rootEvent, {
  name: streamCnsName,
});

console.log('Event stream stored into bucket', bucketId, 'with CID', rootEventUri.cid);

/**
 * Recursevly read the last 5 events from the DDC starting from the root event (the latest one)
 */
async function readEventNodes(rootNodeUri: DagNodeUri, depth = 5): Promise<DagNode[]> {
  const rootNode = await client.read(rootNodeUri);
  const [prevNodeLink] = rootNode.links;

  if (!prevNodeLink || depth === 1) {
    return [rootNode];
  }

  const prevNodeUri = new DagNodeUri(bucketId, prevNodeLink.cid);
  const prevNodes = await readEventNodes(prevNodeUri, depth - 1);

  return [rootNode, ...prevNodes];
}

const allNodes = await readEventNodes(rootEventUri);

console.log(
  'All events in the stream:',
  allNodes.map((event) => JSON.parse(event.data.toString())),
);

/**
 * Disconnect the client
 */
await client.disconnect();
