import fetchMock from 'fetch-mock-jest';

const baseUrl = 'https://dev-cluster-management.network-dev.aws.cere.io/collection-point';

export const setupCollectionPoint = async () => {
    fetchMock.post(`${baseUrl}/acknowledgment`, (url, request) => {
        const ack = request.body && JSON.parse(request.body.toString());

        // console.log('CollectionPoint:', 'acknowledgment', ack);

        return {
            status: 200,
        };
    });
};
