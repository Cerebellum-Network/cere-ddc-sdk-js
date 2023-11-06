import {rest} from 'msw';
import {SetupServer} from 'msw/node';

const baseUrl = 'https://dev-cluster-management.network-dev.aws.cere.io/collection-point';

export const setupCollectionPoint = async (server: SetupServer) => {
    server.use(
        rest.post(`${baseUrl}/acknowledgment`, async (req, res, ctx) => {
            const ack = await req.json();

            // console.log('CollectionPoint:', 'acknowledgment', ack);

            return res(ctx.status(200));
        }),
    );
};
