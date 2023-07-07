#!lua name=mylib

local file_data_prefix = 'ddc:dac:data:file:'
local node_aggregate_key_prefix = 'ddc:dac:aggregation:nodes:'
local node_aggregate_key = node_aggregate_key_prefix .. 'all'
local shared_memory_nodes_prefix = 'ddc:dac:shared:nodes:'

local function is_empty(s)
    return s == nil or s == ''
end

local function is_number(v)
    return type(v) == 'number'
end

local function timestamp_to_era(timestamp, args)
    -- Hardcode era setting
    local year_start = 1672531200
    local interval = 120


    --Get time from timestamp
    local time = string.sub(tostring(timestamp):gsub("%.", ""), 0, 10)
    -- Calculate how many eras passed
    local q, _ = math.modf((time - year_start) / interval)
    return q

end

redis.register_function('timestamp_to_era', timestamp_to_era)

local function update_node_aggregates(node_aggregation_redis_key, node_public_key, request_id, log_type, acked, bytes_sent, bytes_received, response_time_ms)
    assert(log_type ~= nil, 'log_type cannot be nil');

    local has_aggregate_redis_key =  redis.call('EXISTS', node_aggregation_redis_key);
    if has_aggregate_redis_key == 0 then
        redis.call('JSON.SET', node_aggregation_redis_key, '$', cjson.encode({}));
    end

    local aggregate_json_path = '$.' .. node_public_key;
    local aggregate_json = redis.call('JSON.OBJLEN', node_aggregation_redis_key, aggregate_json_path);

    if next(aggregate_json) == nil then
        redis.call('JSON.SET', node_aggregation_redis_key, aggregate_json_path, cjson.encode({
            ['totalReads'] = ((not acked) and log_type == 2) and 1 or 0,
            ['totalReadsAcked'] = (acked and log_type == 2) and 1 or 0,
            ['totalWrites'] = ((not acked) and log_type == 1) and 1 or 0,
            ['totalWritesAcked'] = (acked and log_type == 1) and 1 or 0,
            ['totalQueries'] = ((not acked) and log_type == 3) and 1 or 0,
            ['totalQueriesAcked'] = (acked and log_type == 3) and 1 or 0,
            ['totalBytesSent'] = bytes_sent,
            ['totalBytesReceived'] = bytes_received,
            ['averageResponseTimeMs'] = response_time_ms,
            ['averageResponseTimeMsSamples'] = 1,
            ['requestIds'] = 1,
            ['cpuUsedPercent'] = 0,
            ['cpuTotal'] = 0,
            ['memoryUsedPercent'] = 0,
            ['memoryTotalBytes'] = 0,
            ['storageUsedPercent'] = 0,
            ['storageTotalBytes'] = 0,
            ['resourceSamples'] = 0,
        }));
        if request_id then
            redis.call('JSON.SET', node_aggregation_redis_key, aggregate_json_path..'.requestIds', '[]')
        end

    else
        if log_type == 1 then --write
            if acked == true then
                redis.call("JSON.NUMINCRBY", node_aggregation_redis_key, aggregate_json_path .. '.totalWritesAcked', 1);
            else
                redis.call("JSON.NUMINCRBY", node_aggregation_redis_key, aggregate_json_path .. '.totalWrites', 1);
            end
        end

        if log_type == 2 then --read
            if acked == true then
                redis.call("JSON.NUMINCRBY", node_aggregation_redis_key, aggregate_json_path .. '.totalReadsAcked', 1);
            else
                redis.call("JSON.NUMINCRBY", node_aggregation_redis_key, aggregate_json_path .. '.totalReads', 1);
            end
        end

        if log_type == 3 then --query
            if acked == true then
                redis.call("JSON.NUMINCRBY", node_aggregation_redis_key, aggregate_json_path .. '.totalQueriesAcked', 1);
            else
                redis.call("JSON.NUMINCRBY", node_aggregation_redis_key, aggregate_json_path .. '.totalQueries', 1);
            end
        end
        assert(bytes_sent ~= nil, 'bytes_sent cannot be nil');
        if (bytes_sent > 0) then
            redis.call("JSON.NUMINCRBY", node_aggregation_redis_key, aggregate_json_path .. '.totalBytesSent', bytes_sent);
        end
        assert(bytes_received ~= nil, 'bytes_received cannot be nil');
        if (bytes_received > 0) then
            redis.call("JSON.NUMINCRBY", node_aggregation_redis_key, aggregate_json_path .. '.totalBytesReceived', bytes_received);
        end
        assert(response_time_ms ~= nil, 'response_time_ms cannot be nil');
        if (response_time_ms > 0) then
            local existing_response_times_ms = redis.call("JSON.GET", node_aggregation_redis_key, aggregate_json_path .. '.averageResponseTimeMs'):gsub('[\]\[]', '') + 0;
            local response_time_ms_samples = redis.call("JSON.GET", node_aggregation_redis_key, aggregate_json_path .. '.averageResponseTimeMsSamples'):gsub('[\]\[]', '') + 0;
            local next_response_time_ms_samples = response_time_ms_samples + 1;
            local next_response_time_ms = ((existing_response_times_ms * response_time_ms_samples) + response_time_ms) / next_response_time_ms_samples;
            redis.call("JSON.SET", node_aggregation_redis_key, aggregate_json_path .. '.averageResponseTimeMs', next_response_time_ms);
            redis.call("JSON.NUMINCRBY", node_aggregation_redis_key, aggregate_json_path .. '.averageResponseTimeMsSamples', 1);
        end
        --add request_id in requestIds
        if request_id then
            local has_request_id = redis.call('JSON.ARRINDEX', node_aggregation_redis_key, aggregate_json_path..'.requestIds', '"'..request_id..'"')
            if has_request_id[1] == -1 then
                redis.call('JSON.ARRAPPEND', node_aggregation_redis_key, aggregate_json_path..'.requestIds', '"'..request_id..'"')
            end

        end
    end
end

local function update_aggregates_by_request_id(request_id)
    local result = {}
    local data_key = file_data_prefix .. request_id
    local chunk_keys = redis.call('JSON.OBJKEYS', data_key, '$.chunks');
    for _, chunk_key in pairs(chunk_keys[1]) do
        --common data
        local era = redis.call('JSON.GET', data_key, '$.chunks.' .. chunk_key .. '.log.era'):gsub('[\]\[]', '');
        assert(era ~= nil, 'era is nil' .. ' for request_id ' .. request_id .. ' chunk_key ' .. chunk_key)

        local era_aggregate_key = node_aggregate_key_prefix .. era;

        local has_this_aggregate = redis.call('exists', era_aggregate_key)
        if has_this_aggregate == 0 then
            redis.call("JSON.SET", era_aggregate_key, '$', cjson.encode({}))
        else
            table.insert(result, era_aggregate_key)
        end

        --log data
        local was_log_aggregated = tonumber(redis.call('JSON.GET', data_key, '$.chunks.' .. chunk_key .. '.log.aggregated'):gsub('[\]\[]', ''));
        assert(was_log_aggregated ~= nil, 'log.aggregated is nil for request_id ' .. request_id .. ' chunk_key ' .. chunk_key);

        if was_log_aggregated ~= 1 then
            local log_type = redis.call('JSON.GET', data_key, '$.chunks.' .. chunk_key .. '.log.type'):gsub('[\]\[]', '') + 0;
            assert(log_type ~= nil, 'log.type is nil' .. ' for request_id' .. request_id .. ' chunk_key ' .. chunk_key)
            local log_bytes_sent = redis.call('JSON.GET', data_key, '$.chunks.' .. chunk_key .. '.log.bytesSent'):gsub('[\]\[]', '') + 0;
            assert(log_bytes_sent ~= nil, 'log.bytesSent is nil for request_id ' .. request_id .. ' chunk_key ' .. chunk_key);
            local log_node_public_key = redis.call('JSON.GET', data_key, '$.chunks.' .. chunk_key .. '.log.nodePublicKey'):gsub('[\]\[\""]', '');
            assert(log_node_public_key ~= nil, 'log.nodePublicKey is nil for request_id ' .. request_id .. ' chunk_key ' .. chunk_key);

            update_node_aggregates(era_aggregate_key, log_node_public_key, request_id,  log_type, false, 0, 0, 0)
            update_node_aggregates(node_aggregate_key, log_node_public_key, nil, log_type, false, 0, 0, 0)

            redis.call('JSON.SET', data_key, '$.chunks.' .. chunk_key .. '.log.aggregated', 1);
        end

        --ack data
        local has_ack = redis.call('JSON.OBJLEN', data_key, '$.chunks.' .. chunk_key .. '.ack')
        if next(has_ack) ~= nil then
            local was_ack_aggregated = tonumber(redis.call('JSON.GET', data_key, '$.chunks.' .. chunk_key .. '.ack.aggregated'):gsub('[\]\[]', ''));
            assert(was_ack_aggregated ~= nil, 'ack.aggregated is nil for request_id ' .. request_id .. ' chunk_key ' .. chunk_key);

            if was_ack_aggregated ~= 1 then
                local ack_bytes_received = redis.call('JSON.GET', data_key, '$.chunks.' .. chunk_key .. '.ack.bytesReceived'):gsub('[\]\[]', '') + 0;
                assert(ack_bytes_received ~= nil, 'ack.bytesReceived is nil for request_id ' .. request_id .. ' chunk_key ' .. chunk_key);
                local ack_node_public_key = redis.call('JSON.GET', data_key, '$.chunks.' .. chunk_key .. '.ack.nodePublicKey'):gsub('[\]\[\""]', '');
                assert(ack_node_public_key ~= nil, 'ack.nodePublicKey is nil for request_id ' .. request_id .. ' chunk_key ' .. chunk_key);
                local log_timestamp = redis.call('JSON.GET', data_key, '$.chunks.' .. chunk_key .. '.log.timestamp'):gsub('[\]\[]', '') + 0;
                assert(log_timestamp ~= nil, 'log.timestamp is nil' .. ' for request_id' .. request_id .. ' chunk_key ' .. chunk_key)
                local log_type = redis.call('JSON.GET', data_key, '$.chunks.' .. chunk_key .. '.log.type'):gsub('[\]\[]', '') + 0;
                assert(log_type ~= nil, 'log.type is nil' .. ' for request_id' .. request_id .. ' chunk_key ' .. chunk_key)
                local ack_user_timestamp = redis.call('JSON.GET', data_key, '$.chunks.' .. chunk_key .. '.ack.userTimestamp'):gsub('[\]\[]', '') + 0;
                assert(ack_user_timestamp ~= nil, 'ack.userTimestamp is nil' .. ' for request_id' .. request_id .. ' chunk_key ' .. chunk_key)


                local response_time_ms = nil
                if (ack_user_timestamp ~= nil and log_timestamp ~= nil) then
                    response_time_ms = (ack_user_timestamp - log_timestamp)
                end

                local bytes_received = 0
                if log_type == 1 then
                    bytes_received = ack_bytes_received
                end

                local bytes_sent = 0
                if (log_type == 2 or log_type == 3) then
                    bytes_sent = ack_bytes_received
                end

                update_node_aggregates(era_aggregate_key, ack_node_public_key, request_id, log_type, true, bytes_sent, bytes_received, response_time_ms)
                update_node_aggregates(node_aggregate_key, ack_node_public_key, nil, log_type, true, bytes_sent, bytes_received, response_time_ms)

                redis.call('JSON.SET', data_key, '$.chunks.' .. chunk_key .. '.ack.aggregated', 1);

                --check that nodePublicKey is the same
                local log_node_public_key = redis.call('JSON.GET', data_key, '$.chunks.' .. chunk_key .. '.log.nodePublicKey'):gsub('[\]\[\""]', '');
                local ack_user_public_key = redis.call('JSON.GET', data_key, '$.chunks.' .. chunk_key .. '.ack.userPublicKey'):gsub('[\]\[\""]', '');

                if log_node_public_key ~= ack_node_public_key then
                    local has_node_interrupted = redis.call('JSON.OBJLEN', era_aggregate_key, ackAggregationPath..'.nodeInterruptedSessions')
                    if next(has_node_interrupted) == nil then
                        redis.call('JSON.SET', era_aggregate_key, log_node_public_key ..'.nodeInterruptedSessions', cjson.encode({}))
                    end
                    redis.call("JSON.SET", era_aggregate_key, log_node_public_key .. '.nodeInterruptedSessions.'.. chunk_key, cjson.encode({
                        ['ackUserPublicKey'] = ack_user_public_key,
                        ['chunkId'] = chunk_key
                    }))
                end
            end
        end
    end
    return result
end

local function update_aggregates_by_request_ids(request_ids)
    local result = {}
    for i, request_id in ipairs(request_ids) do
        local redis_key = update_aggregates_by_request_id(request_id)
        table.insert(result, redis_key)
    end
    return result;
end

redis.register_function('update_aggregates_by_request_ids', update_aggregates_by_request_ids)

local function save_log_v2(keys, args)
    local result = {}
    local prefix = file_data_prefix
    for i, key in ipairs(keys) do
        local data = cjson.decode(key);

        -- keys
        local sessionId = data['sessionId']
        assert(is_empty(sessionId) == false, 'sessionId cannot be empty')
        local fileRequestId = data['requestId'] -- FIXME, fileRequestId should be in data
        assert(is_empty(fileRequestId) == false, 'requestId cannot be empty')
        local cid = data['cid'] -- FIXME, cid should be in data
        assert(is_empty(cid) == false, 'cid cannot be empty')
        local chunk_key = fileRequestId .. ':' .. cid

        -- data fields
        local bucketId = data['bucketId']

        local timestamp = data['timestamp'] + 0
        assert(timestamp ~= nil, "timestamp cannot be nil")

        local userPublicKey = data['userPublicKey']
        assert(is_empty(userPublicKey) == false, 'userPublicKey cannot be empty')

        local nodePublicKey = data['nodePublicKey']
        assert(is_empty(userPublicKey) == false, 'nodePublicKey cannot be empty')

        local era = timestamp_to_era(timestamp, 1)

        local address = data['address']

        local signature = data['signature']
        --assert(is_empty(signature) == false, 'signature cannot be empty')

        local gas = data['gas']
        assert(is_empty(gas) == false, 'gas cannot be empty')

        local type = data['type']
        assert(type == 1 or type == 2 or type == 3, 'type should be a number from 1 to 3 (1-write, 2-read, 3-search)')


        -- redis key
        local redisKey = prefix .. fileRequestId

        -- check if this key exists
        local redisKeyExists = redis.call('EXISTS', redisKey)
        local fileAllChunkCids
        if redisKeyExists == 0 then
            -- then it's a "head chunk" and file data(like size and count of chunks) should be in data
            fileAllChunkCids = data['allChunkCids']
            assert(fileAllChunkCids ~= nil, "allChunkCids cannot be nil")

            -- save base data structure and add file info
            local encodedFileData = cjson.encode({
                ['fileRequestId'] = fileRequestId,
                ['timestamp'] = timestamp,
                ['userPublicKey'] = userPublicKey,
                ['fileInfo'] = {
                    ['chunkCids'] = fileAllChunkCids
                },
                ['bucketId'] = bucketId,
                ['chunks'] = {}
            });
            encodedFileData = encodedFileData:gsub('\"timestamp\":\"' .. timestamp .. '\"', '\"timestamp\":' .. timestamp)
            redis.call("JSON.SET", redisKey, '$', encodedFileData)
        end

        local currentChunk = {
            ['cid'] = cid,
            ['log'] = {
                ['timestamp'] = timestamp,
                ['signature'] = signature,
                ['sessionId'] = sessionId,
                ['userAddress'] = address,
                ['bytesSent'] = gas,
                ['userPublicKey'] = userPublicKey,
                ['nodePublicKey'] = nodePublicKey,
                ['type'] = type,
                ['bucketId'] = bucketId,
                ['era'] = era,
                ['aggregated'] = 0
            }
        }

        local encodedCurrentChunk = cjson.encode(currentChunk);
        encodedCurrentChunk = encodedCurrentChunk:gsub('\"timestamp\":\"' .. timestamp .. '\"', '\"timestamp\":' .. timestamp)

        local chunkDataPath = '$.chunks.' .. chunk_key

        local hasThisChunk = redis.call('JSON.OBJLEN', redisKey, chunkDataPath)
        assert(next(hasThisChunk) == nil, "A chunk with chunk_key " .. chunk_key .. " already exists and cannot be overwritten")
        redis.call('JSON.SET', redisKey, chunkDataPath, encodedCurrentChunk);

        table.insert(result, redisKey)
        update_aggregates_by_request_id(fileRequestId)

    end

    return result;

end

redis.register_function('save_log_v2', save_log_v2)

local function save_ack_v2(keys, args)
    local result = {}
    local prefix = file_data_prefix
    for i, key in ipairs(keys) do
        local data = cjson.decode(key);

        -- keys
        local sessionId = data['sessionId']
        assert(is_empty(sessionId) == false, 'sessionId cannot be empty')
        local fileRequestId = data['requestId'] -- FIXME, requestId should be in data
        assert(is_empty(fileRequestId) == false, 'requestId cannot be empty')
        local cid = data['cid'] -- FIXME, cid should be in data
        assert(is_empty(cid) == false, 'cid cannot be empty')
        local chunkRequestId = fileRequestId .. ':' .. cid -- FIXME, chunkRequestId should be in data

        -- redis key
        local redisKey = prefix .. fileRequestId

        -- requestedChunkCids
        local requestedChunkCids = {}
        local requestedChunkCidsPath = '$.fileInfo.requestedChunkCids'
        local hasRequestedChunkCids = redis.call('JSON.ARRLEN', redisKey, requestedChunkCidsPath)
        if next(hasRequestedChunkCids) == nil then
            requestedChunkCids = data['requestedChunkCids']
            assert(requestedChunkCids and next(requestedChunkCids) ~= nil, "requestedChunkCids is not an array")
            redis.call("JSON.SET", redisKey, requestedChunkCidsPath, cjson.encode(requestedChunkCids))
        end


        -- data fields
        local userTimestamp = data['userTimestamp']
        local saveRecordTimestamp = data['saveRecordTimestamp']
        local userPublicKey = data['userPublicKey']
        local nodePublicKey = data['nodePublicKey']
        local gas = data['gas']
        local nonce = data['nonce']
        local signature = data['signature']
        --assert(is_empty(signature) == false, 'signature cannot be empty')

        local chunkAck = {
            ['userTimestamp'] = userTimestamp,
            ['signature'] = signature,
            ['saveRecordTimestamp'] = saveRecordTimestamp,
            ['userPublicKey'] = userPublicKey,
            ['nodePublicKey'] = nodePublicKey,
            ['bytesReceived'] = gas,
            ['nonce'] = nonce,
            ['requestedChunkCids'] = requestedChunkCids,
            ['aggregated'] = 0
        }

        local encodedAckData = cjson.encode(chunkAck);
        encodedAckData = encodedAckData:gsub('\"saveRecordTimestamp\":\"' .. userTimestamp .. '\"', '\"saveRecordTimestamp\":' .. userTimestamp)

        -- save data
        local ackDataPath = '$.chunks.' .. chunkRequestId .. '.ack'

        local hasThisAck = redis.call('JSON.OBJLEN', redisKey, ackDataPath)
        assert(next(hasThisAck) == nil, "ack for chunkRequestId " .. chunkRequestId .. " already exists and cannot be overwritten")
        redis.call('JSON.SET', redisKey, ackDataPath, encodedAckData);

        table.insert(result, redisKey)
        update_aggregates_by_request_id(fileRequestId)

    end

    return result;

end

redis.register_function('save_ack_v2', save_ack_v2)

-- validationKey should be in format validatorPublicKey:nodePublicKey:era
-- validationResults should be in format {"result": string, "data": string}
local function save_validation_result_by_node_interior(validationKey, args)
    local result = {}

    local t = {}
    for part in string.gmatch(validationKey, '([^:]+)') do
        table.insert(t,part)
    end

    assert(is_empty(t[2]) == false, "please set validatorPublicKey in the key ("..validationKey.."), it should be on the first position, like VALIDATOR_PUBLIC_KEY:nodePublicKey:era")
    local validatorPublicKey = t[1]
    assert(is_empty(t[2]) == false, "please set nodePublicKey in the key ("..validationKey.."), it should be on the second position, like validatorPublicKey:NODE_PUBLICK_KEY:era")
    local nodePublicKey = t[2]
    assert(is_empty(t[3]) == false, "please set era in the key ("..validationKey.."), it should be on the third position, like validatorPublicKey:nodePublicKey:ERA")
    local era = t[3]

    local data = cjson.decode(args);

    local validationResult = data['result']
    assert(is_empty(validationResult) == false, "please set result parameter in JSON argument ("..args..")")
    local validationData = data['data']
    assert(is_empty(validationData) == false, "please set data parameter in JSON argument ("..args..")")


    local dataKey = shared_memory_nodes_prefix .. era
    table.insert(result, dataKey)

    --check is key exists
    local redisKeyExists = redis.call('EXISTS', dataKey)
    if redisKeyExists == 0 then
        redis.call("JSON.SET", dataKey, '$', cjson.encode({}))
    end

    --check that nodePublicKey is exists
    local nodePath = '$.'..nodePublicKey
    local hasThisNode = redis.call('JSON.OBJLEN', dataKey, nodePath)
    if next(hasThisNode) == nil then
        redis.call("JSON.SET", dataKey, nodePath, cjson.encode({}))
    end

    --check that validatorPublicKey is exists
    local validatorPath = nodePath..'.'..validatorPublicKey
    local hasThisValidatorCheck = redis.call('JSON.OBJLEN', dataKey, validatorPath)
    assert(next(hasThisValidatorCheck) == nil, "validator with publicKey "..validatorPublicKey.." already saved validation result, yuu are trying to rewrite it")

    redis.call("JSON.SET", dataKey, validatorPath, cjson.encode({
        ['result'] = validationResult,
        ['data'] = validationData
    }))

    return result
end

-- validationKey should be in format validatorPublicKey:nodePublicKey:era
local function save_validation_result_by_node(validationKeys, validationResults)
    local result = {}
    for i, validationKey in ipairs(validationKeys) do
        local redisKey = save_validation_result_by_node_interior(validationKey, validationResults[i])
        table.insert(result, redisKey)
    end
    return result;
end

redis.register_function('save_validation_result_by_node', save_validation_result_by_node)

local function save_storage_request_log(keys)
    local result = {}

    for _, key in ipairs(keys) do
        local data = cjson.decode(key);

        -- validate arguments

        local timestamp = data['timestamp']
        assert(is_number(timestamp) == true, "timestamp parameter should be a number ("..key..")")

        local storage_node_public_key = data['storageNodePublicKey']
        assert(is_empty(storage_node_public_key) == false, "please set storageNodePublicKey parameter in JSON argument ("..key..")")

        local type = data['type']
        assert(is_empty(type) == false, "please set type parameter in JSON argument ("..key..")")
        assert(type == 1 or type == 2 or type == 3, "type parameter should be 1 or 2 or 3 ("..key..")")

        local bytes = data['bytes']
        assert(is_empty(bytes) == false, "please set bytes parameter in JSON argument ("..key..")")
        assert(is_number(bytes) == true and bytes >= 0, "bytes parameter should be a non-negative number ("..key..")")

        local bucket_id = data['bucketId']
        assert(is_number(bucket_id) == true, "bucketId parameter should be a number ("..key..")")

        local cid = data['cid']
        assert(is_empty(cid) == false, "please set cid parameter in JSON argument ("..key..")")

        local era = timestamp_to_era(timestamp)

        --check is redis_key exists
        local redis_key = node_aggregate_key_prefix .. era;
        local redis_key_exists = redis.call('EXISTS', redis_key)
        if redis_key_exists == 0 then
            redis.call("JSON.SET", redis_key, '$', cjson.encode({}))
        end

        --check that storage_node_public_key path exists
        local node_path = '$.' .. storage_node_public_key
        local node_path_exists = redis.call('JSON.OBJLEN', redis_key, node_path)

        -- create new node aggregate
        if next(node_path_exists) == nil then
            redis.call("JSON.SET", redis_key, node_path, cjson.encode({
                ['totalReads'] = type == 2 and 1 or 0,
                ['totalWrites'] = type == 1 and 1 or 0,
                ['totalQueries'] = type == 3 and 1 or 0,
                ['totalBytesSent'] = (type == 2 or type== 3) and bytes or 0,
                ['totalBytesReceived'] = type == 1 and bytes or 0,
                -- other aggregates
                ['cpuUsedPercent'] = 0,
                ['cpuTotal'] = 0,
                ['memoryUsedPercent'] = 0,
                ['memoryTotalBytes'] = 0,
                ['storageUsedPercent'] = 0,
                ['storageTotalBytes'] = 0,
                ['resourceSamples'] = 0
            }))
        else -- update existing aggregate
            if type == 1 then
                redis.call('JSON.NUMINCRBY', redis_key, node_path..'.totalWrites', 1)
                redis.call('JSON.NUMINCRBY', redis_key, node_path..'.totalBytesReceived', bytes)
            elseif type == 2 then
                redis.call('JSON.NUMINCRBY', redis_key, node_path..'.totalReads', 1)
                redis.call('JSON.NUMINCRBY', redis_key, node_path..'.totalBytesSent', bytes)
            elseif type == 3 then
                redis.call('JSON.NUMINCRBY', redis_key, node_path..'.totalQueries', 1)
                redis.call('JSON.NUMINCRBY', redis_key, node_path..'.totalBytesSent', bytes)
            end
        end

        table.insert(result, redis_key)
    end

    return result
end

redis.register_function('save_storage_request_log', save_storage_request_log)

local function save_node_resources_used(keys)
    local result = {}

    for _, key in ipairs(keys) do
        local data = cjson.decode(key);

        -- validate arguments
        local node_public_key = data['nodePublicKey']
        assert(is_empty(node_public_key) == false, "please set nodePublicKey parameter in JSON argument ("..key..")")

        local timestamp = data['timestamp']
        assert(is_number(timestamp) == true, "timestamp parameter should be a number ("..key..")")

        local cpu_used_percent = data['cpuUsedPercent']
        assert(is_number(cpu_used_percent) == true, "cpuUsedPercent parameter should be a number ("..key..")")

        local cpu_total = data['cpuTotal']
        assert(is_number(cpu_total) == true, "cpuTotal parameter should be a number ("..key..")")

        local memory_used_percent = data['memoryUsedPercent']
        assert(is_number(memory_used_percent) == true, "memoryUsedPercent parameter should be a number ("..key..")")

        local memory_total_bytes = data['memoryTotalBytes']
        assert(is_number(memory_total_bytes) == true, "memoryBytesTotal parameter should be a number ("..key..")")

        local storage_used_percent = data['storageUsedPercent']
        assert(is_number(storage_used_percent) == true, "storageUsedPercent parameter should be a number ("..key..")")

        local storage_total_bytes = data['storageTotalBytes']
        assert(is_number(storage_total_bytes) == true, "storageBytesTotal parameter should be a number ("..key..")")

        local era = timestamp_to_era(timestamp)

        --check is redis_key exists
        local redis_key = node_aggregate_key_prefix .. era;
        local redis_key_exists = redis.call('EXISTS', redis_key)
        if redis_key_exists == 0 then
            redis.call("JSON.SET", redis_key, '$', cjson.encode({}))
        end

        --check that storage_node_public_key path exists
        local node_path = '$.' .. node_public_key
        local node_path_exists = redis.call('JSON.OBJLEN', redis_key, node_path)

        -- create new node aggregate
        if next(node_path_exists) == nil then
            redis.call("JSON.SET", redis_key, node_path, cjson.encode({
                ['cpuUsedPercent'] = cpu_used_percent,
                ['cpuTotal'] = cpu_total,
                ['memoryUsedPercent'] = memory_used_percent,
                ['memoryTotalBytes'] = memory_total_bytes,
                ['storageUsedPercent'] = storage_used_percent,
                ['storageTotalBytes'] = storage_total_bytes,
                ['resourceSamples'] = 1,
                -- other aggregates
                ['totalReads'] = 0,
                ['totalReadsAcked'] = 0,
                ['totalWrites'] = 0,
                ['totalWritesAcked'] = 0,
                ['totalQueries'] = 0,
                ['totalQueriesAcked'] = 0,
                ['totalBytesSent'] = 0,
                ['totalBytesReceived'] = 0,
                ['averageResponseTimeMs'] = 0,
                ['averageResponseTimeMsSamples'] = 0,
            }))
        else -- update existing node aggregate
            local aggregate = cjson.decode(redis.call('JSON.GET', redis_key, node_path))[1]
            local resource_samples = aggregate['resourceSamples']
            local next_resource_samples = resource_samples + 1
            aggregate['cpuUsedPercent'] = (aggregate['cpuUsedPercent'] * resource_samples + cpu_used_percent) / next_resource_samples
            aggregate['cpuTotal'] = cpu_total
            aggregate['memoryUsedPercent'] = (aggregate['memoryUsedPercent'] * resource_samples + memory_used_percent) / next_resource_samples
            aggregate['memoryTotalBytes'] = memory_total_bytes
            aggregate['storageUsedPercent'] = (aggregate['storageUsedPercent'] * resource_samples + storage_used_percent) / next_resource_samples
            aggregate['storageTotalBytes'] = storage_total_bytes
            aggregate['resourceSamples'] = next_resource_samples
            redis.call('JSON.SET', redis_key, node_path, cjson.encode(aggregate))
        end

        table.insert(result, redis_key)
    end

    return result
end

redis.register_function('save_node_resources_used', save_node_resources_used)