"""Unit tests for DdcClient."""

import pytest
from unittest.mock import AsyncMock, patch, MagicMock
import httpx
from ddc_client import DdcClient, CereSDKError, BucketConfig


@pytest.mark.asyncio
async def test_create_bucket_success():
    """Test successful bucket creation."""
    async with DdcClient(api_base_url='http://localhost:8080') as client:
        with patch.object(client, 'client') as mock_client:
            mock_response = AsyncMock()
            mock_response.json.return_value = {
                'id': 'bucket-123',
                'name': 'test-bucket',
                'created_at': '2026-07-03T12:00:00Z'
            }
            mock_client.post.return_value = mock_response
            
            result = await client.createBucket('test-bucket')
            
            assert result['id'] == 'bucket-123'
            assert result['name'] == 'test-bucket'
            mock_client.post.assert_called_once()


@pytest.mark.asyncio
async def test_create_bucket_invalid_name():
    """Test bucket creation with invalid parameters."""
    client = DdcClient()
    
    with pytest.raises(CereSDKError, match="Invalid bucket configuration"):
        await client.createBucket(123)  # Invalid type


@pytest.mark.asyncio
async def test_store_data_success():
    """Test successful data storage."""
    async with DdcClient(api_base_url='http://localhost:8080') as client:
        with patch.object(client, 'client') as mock_client:
            mock_response = AsyncMock()
            mock_response.json.return_value = {
                'key': 'test-key',
                'size': 100,
                'hash': 'sha256:abc123'
            }
            mock_client.put.return_value = mock_response
            
            result = await client.store('bucket-123', 'test-key', b'test data')
            
            assert result['key'] == 'test-key'
            mock_client.put.assert_called_once()


@pytest.mark.asyncio
async def test_read_data_success():
    """Test successful data retrieval."""
    async with DdcClient(api_base_url='http://localhost:8080') as client:
        with patch.object(client, 'client') as mock_client:
            mock_response = AsyncMock()
            mock_response.content = b'test data'
            mock_client.get.return_value = mock_response
            
            result = await client.read('bucket-123', 'test-key')
            
            assert result == b'test data'
            mock_client.get.assert_called_once()


@pytest.mark.asyncio
async def test_read_data_not_found():
    """Test read when object doesn't exist."""
    async with DdcClient(api_base_url='http://localhost:8080') as client:
        with patch.object(client, 'client') as mock_client:
            mock_response = AsyncMock()
            mock_response.status_code = 404
            mock_response.raise_for_status.side_effect = httpx.HTTPStatusError(
                "Not found", request=None, response=mock_response
            )
            mock_client.get.return_value = mock_response
            
            with pytest.raises(CereSDKError, match="Object not found"):
                await client.read('bucket-123', 'nonexistent')


@pytest.mark.asyncio
async def test_context_manager():
    """Test async context manager usage."""
    async with DdcClient(api_base_url='http://localhost:8080') as client:
        assert client is not None
        assert client._client is None  # Not initialized until first use


@pytest.mark.asyncio
async def test_env_var_configuration():
    """Test configuration from environment variables."""
    with patch.dict('os.environ', {
        'DDC_API_URL': 'https://custom.api.com',
        'DDC_API_KEY': 'test-key-123'
    }):
        client = DdcClient()
        assert client.api_base_url == 'https://custom.api.com'
        assert client.api_key == 'test-key-123'
        await client.close()
