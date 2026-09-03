"""
Cerebellum DDC Client - Python SDK

Provides async interface for interacting with the Cerebellum Network's
Decentralized Data Cloud (DDC) infrastructure.
"""

import os
from typing import Any, Dict, Optional
import httpx
from pydantic import BaseModel, ValidationError


class CereSDKError(Exception):
    """Base exception for Cerebellum SDK errors."""
    pass


class BucketConfig(BaseModel):
    """Schema for bucket configuration."""
    name: str
    encryption: Optional[bool] = False


class StorageObject(BaseModel):
    """Schema for storage objects."""
    bucket_id: str
    key: str
    data: bytes


class DdcClient:
    """
    Async client for Cerebellum Network's Decentralized Data Cloud.
    
    Provides methods to create buckets, store data, and retrieve data
    with automatic error handling and schema validation using pydantic.
    
    Attributes:
        api_base_url: Base URL for DDC API (default from env var or https://api.ddc.cerebellum.network)
        timeout: Request timeout in seconds (default: 30)
    
    Example:
        async with DdcClient() as client:
            bucket = await client.createBucket('my-bucket')
            await client.store(bucket['id'], 'my-key', b'data')
            data = await client.read(bucket['id'], 'my-key')
    """
    
    def __init__(
        self,
        api_base_url: Optional[str] = None,
        timeout: int = 30,
        api_key: Optional[str] = None
    ):
        """
        Initialize DDC Client.
        
        Args:
            api_base_url: Base URL for DDC API. Defaults to env var DDC_API_URL
                         or https://api.ddc.cerebellum.network
            timeout: Request timeout in seconds (default: 30)
            api_key: API key for authentication. Defaults to env var DDC_API_KEY
        """
        self.api_base_url = api_base_url or os.getenv(
            'DDC_API_URL',
            'https://api.ddc.cerebellum.network'
        )
        self.api_key = api_key or os.getenv('DDC_API_KEY')
        self.timeout = timeout
        self._client = None
    
    @property
    def client(self) -> httpx.AsyncClient:
        """Lazy-load the async HTTP client."""
        if self._client is None:
            headers = {}
            if self.api_key:
                headers['Authorization'] = f'Bearer {self.api_key}'
            
            self._client = httpx.AsyncClient(
                base_url=self.api_base_url,
                timeout=self.timeout,
                headers=headers
            )
        return self._client
    
    async def __aenter__(self):
        """Context manager entry."""
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Context manager exit - ensures proper cleanup."""
        await self.close()
        return False
    
    async def createBucket(self, name: str, encryption: bool = False) -> Dict[str, Any]:
        """
        Create a new bucket in the DDC.
        
        Args:
            name: Bucket name
            encryption: Whether to enable encryption (default: False)
        
        Returns:
            Dictionary containing bucket metadata including 'id', 'name', 'created_at'
        
        Raises:
            CereSDKError: If bucket creation fails or validation fails
        
        Example:
            bucket = await client.createBucket('my-bucket', encryption=True)
            print(bucket['id'])
        """
        try:
            # Validate input
            config = BucketConfig(name=name, encryption=encryption)
            
            # Make API request
            response = await self.client.post(
                '/buckets',
                json={
                    'name': config.name,
                    'encryption': config.encryption
                }
            )
            response.raise_for_status()
            
            return response.json()
        
        except ValidationError as e:
            raise CereSDKError(f"Invalid bucket configuration: {e}")
        except httpx.HTTPStatusError as e:
            raise CereSDKError(
                f"Failed to create bucket: HTTP {e.response.status_code} - {e.response.text}"
            )
        except httpx.RequestError as e:
            raise CereSDKError(f"Network error during bucket creation: {e}")
    
    async def store(
        self,
        bucket_id: str,
        key: str,
        data: bytes,
        metadata: Optional[Dict[str, str]] = None
    ) -> Dict[str, Any]:
        """
        Store data in a bucket.
        
        Args:
            bucket_id: ID of the target bucket
            key: Object key/identifier
            data: Binary data to store
            metadata: Optional metadata dictionary
        
        Returns:
            Dictionary containing storage metadata including 'key', 'size', 'hash'
        
        Raises:
            CereSDKError: If storage fails or validation fails
        
        Example:
            result = await client.store(bucket_id, 'file.txt', b'content')
            print(result['hash'])
        """
        try:
            # Validate input
            if not isinstance(data, bytes):
                raise ValueError("Data must be bytes")
            
            obj = StorageObject(bucket_id=bucket_id, key=key, data=data)
            
            # Make API request
            response = await self.client.put(
                f'/buckets/{obj.bucket_id}/objects/{obj.key}',
                content=obj.data,
                headers={'Content-Type': 'application/octet-stream'},
                params={'metadata': metadata} if metadata else {}
            )
            response.raise_for_status()
            
            return response.json()
        
        except ValidationError as e:
            raise CereSDKError(f"Invalid storage object: {e}")
        except httpx.HTTPStatusError as e:
            raise CereSDKError(
                f"Failed to store data: HTTP {e.response.status_code} - {e.response.text}"
            )
        except httpx.RequestError as e:
            raise CereSDKError(f"Network error during storage: {e}")
    
    async def read(self, bucket_id: str, key: str) -> bytes:
        """
        Retrieve data from a bucket.
        
        Args:
            bucket_id: ID of the source bucket
            key: Object key/identifier
        
        Returns:
            Binary data from the object
        
        Raises:
            CereSDKError: If retrieval fails
        
        Example:
            data = await client.read(bucket_id, 'file.txt')
            print(data.decode('utf-8'))
        """
        try:
            response = await self.client.get(
                f'/buckets/{bucket_id}/objects/{key}'
            )
            response.raise_for_status()
            
            return response.content
        
        except httpx.HTTPStatusError as e:
            if e.response.status_code == 404:
                raise CereSDKError(
                    f"Object not found: bucket={bucket_id}, key={key}"
                )
            raise CereSDKError(
                f"Failed to read data: HTTP {e.response.status_code} - {e.response.text}"
            )
        except httpx.RequestError as e:
            raise CereSDKError(f"Network error during read: {e}")
    
    async def close(self) -> None:
        """
        Close the HTTP client connection.
        
        Should be called when done with the client, or use as async context manager.
        
        Example:
            client = DdcClient()
            try:
                # use client
            finally:
                await client.close()
        """
        if self._client is not None:
            await self._client.aclose()
            self._client = None
    
    async def __del__(self):
        """Ensure cleanup on garbage collection."""
        try:
            await self.close()
        except Exception:
            pass
