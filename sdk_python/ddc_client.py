import httpx

class CereSDKError(Exception):
    pass

class DdcClient:
    def __init__(self):
        self.client = httpx.AsyncClient()

    async def some_method(self):
        try:
            response = await self.client.get('https://api.example.com/data')
            response.raise_for_status()
            return response.json()
        except httpx.HTTPStatusError as e:
            raise CereSDKError(f"HTTP error occurred: {e}")
        except httpx.RequestError as e:
            raise CereSDKError(f"Request error occurred: {e}")

    async def another_method(self):
        try:
            response = await self.client.post('https://api.example.com/data', json={'key': 'value'})
            response.raise_for_status()
            return response.json()
        except httpx.HTTPStatusError as e:
            raise CereSDKError(f"HTTP error occurred: {e}")
        except httpx.RequestError as e:
            raise CereSDKError(f"Request error occurred: {e}")

    def close(self):
        self.client.aclose()
