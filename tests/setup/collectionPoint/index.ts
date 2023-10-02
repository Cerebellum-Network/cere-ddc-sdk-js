import fetchMock from 'fetch-mock-jest';

const baseUrl = 'http://collection-point.cere.io';

export const setupCollectionPoint = async () => {
    fetchMock.post(`${baseUrl}/acknowledgment`, (url, request) => {
        const ack = request.body && JSON.parse(request.body.toString());

        // console.log('CollectionPoint:', 'acknowledgment', ack);

        return {
            status: 200,
        };
    });
};
