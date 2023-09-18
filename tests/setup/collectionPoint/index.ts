import fetchMock from 'fetch-mock-jest';

const baseUrl = 'http://collection-point.cere.io';

export const setupCollectionPoint = async () => {
    fetchMock.post(`${baseUrl}/acknowledgment`, 200);
};
