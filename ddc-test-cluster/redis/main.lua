#!lua name=mylib

local file_data_prefix = 'ddc:dac:data:file:'
local node_aggregation_data_prefix = 'ddc:dac:aggregation:nodes:'
local shared_memory_nodes_prefix = 'ddc:dac:shared:nodes:'

local function is_empty(s)
    return s == nil or s == ''
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

local function update_aggregates_by_node_interior(requestId)
    local result = {}
    local dataKey = file_data_prefix .. requestId
    local chunkKeys = redis.call('JSON.OBJKEYS', dataKey, '$.chunks');
    for j, chunkKey in pairs(chunkKeys[1]) do
        --common data
        local era = redis.call('JSON.GET', dataKey, '$.chunks.' .. chunkKey .. '.log.era'):gsub('[\]\[]', '');
        local aggregationKey = node_aggregation_data_prefix .. era;
        table.insert(result, aggregationKey)


        local hasThisAggregate = redis.call('exists', aggregationKey)
        if hasThisAggregate == 0 then
            redis.call("JSON.SET", aggregationKey, '$', cjson.encode({}))
        end

        --log data
        local wasLogAggregated = tonumber(redis.call('JSON.GET', dataKey, '$.chunks.' .. chunkKey .. '.log.aggregated'):gsub('[\]\[]', ''));
        if wasLogAggregated ~= 1 then
            local logType = tonumber(redis.call('JSON.GET', dataKey, '$.chunks.' .. chunkKey .. '.log.type'):gsub('[\]\[]', ''));
            local logBytesSent = redis.call('JSON.GET', dataKey, '$.chunks.' .. chunkKey .. '.log.bytesSent'):gsub('[\]\[]', '');
            local logNodePublicKey = redis.call('JSON.GET', dataKey, '$.chunks.' .. chunkKey .. '.log.nodePublicKey'):gsub('[\]\[\""]', '');
            local logAggregationPath = '$.' .. logNodePublicKey;

            local hasThisLogNode = redis.call('JSON.OBJLEN', aggregationKey, logAggregationPath)
            if next(hasThisLogNode) == nil then
                redis.call("JSON.SET", aggregationKey, logAggregationPath, cjson.encode({
                    ['totalWrites'] = 0,
                    ['totalReads'] = 0,
                    ['totalBytesSent'] = 0,
                    ['totalBytesReceived'] = 0,
                }))
            end

            if logType == 1 then
                --write
                redis.call("JSON.NUMINCRBY", aggregationKey, logAggregationPath .. '.totalWrites', 1)
            else
                redis.call("JSON.NUMINCRBY", aggregationKey, logAggregationPath .. '.totalReads', 1)
            end
            redis.call("JSON.NUMINCRBY", aggregationKey, logAggregationPath .. '.totalBytesSent', logBytesSent)
            --set flag that log data in this chunk was aggregated
            redis.call('JSON.SET', dataKey, '$.chunks.' .. chunkKey .. '.log.aggregated', 1);
        end

        --ack data
        local hasAck = redis.call('JSON.OBJLEN', dataKey, '$.chunks.' .. chunkKey .. '.ack')
        if next(hasAck) ~= nil then

            local wasAckAggregated = tonumber(redis.call('JSON.GET', dataKey, '$.chunks.' .. chunkKey .. '.ack.aggregated'):gsub('[\]\[]', ''));

            if wasAckAggregated ~= 1 then
                local ackBytesReceived = redis.call('JSON.GET', dataKey, '$.chunks.' .. chunkKey .. '.ack.bytesReceived'):gsub('[\]\[]', '');
                local ackNodePublicKey = redis.call('JSON.GET', dataKey, '$.chunks.' .. chunkKey .. '.ack.nodePublicKey'):gsub('[\]\[\""]', '');
                local ackAggregationPath = '$.' .. ackNodePublicKey;

                local hasThisAckNode = redis.call('JSON.OBJLEN', aggregationKey, ackAggregationPath)
                if next(hasThisAckNode) == nil then
                    redis.call("JSON.SET", aggregationKey, ackAggregationPath, cjson.encode({
                        ['totalWrites'] = 0,
                        ['totalReads'] = 0,
                        ['totalBytesSent'] = 0,
                        ['totalBytesReceived'] = 0,
                    }))
                end

                redis.call("JSON.NUMINCRBY", aggregationKey, ackAggregationPath .. '.totalBytesReceived', ackBytesReceived)
                redis.call('JSON.SET', dataKey, '$.chunks.' .. chunkKey .. '.ack.aggregated', 1);

                --check that nodePublicKey is the same
                local logNodePublicKey = redis.call('JSON.GET', dataKey, '$.chunks.' .. chunkKey .. '.log.nodePublicKey'):gsub('[\]\[\""]', '');
                local ackUserPublicKey = redis.call('JSON.GET', dataKey, '$.chunks.' .. chunkKey .. '.ack.userPublicKey'):gsub('[\]\[\""]', '');

                if logNodePublicKey ~= ackNodePublicKey then
                    local hasNodeInterrupted = redis.call('JSON.OBJLEN', aggregationKey, ackAggregationPath..'.nodeInterruptedSessions')
                    if next(hasNodeInterrupted) == nil then
                        redis.call('JSON.SET', aggregationKey, logNodePublicKey..'.nodeInterruptedSessions', cjson.encode({}))
                    end
                    redis.call("JSON.SET", aggregationKey, logNodePublicKey .. '.nodeInterruptedSessions.'..chunkKey, cjson.encode({
                        ['ackUserPublicKey'] = ackUserPublicKey,
                        ['chunkId'] = chunkKey
                    }))
                end
            end
        end
    end
    return result
end

local function update_aggregates_by_node(requestIds)
    local result = {}
    for i, requestId in ipairs(requestIds) do
        local redisKey = update_aggregates_by_node_interior(requestId)
        table.insert(result, redisKey)
    end
    return result;
end

redis.register_function('update_aggregates_by_node', update_aggregates_by_node)

local function save_log_v2(keys, args)
    local result = {}
    local prefix = file_data_prefix
    for i, key in ipairs(keys) do
        local data = cjson.decode(key);

        -- keys
        local sessionId = data['sessionId']
        assert(is_empty(sessionId) == false, 'sessionId cannot be empty')
        local fileRequestId = data['requestId'] -- FIXME, fileRequestId should be in data
        -- assert(is_empty(fileRequestId) == false, 'fileRequestId cannot be empty')
        local chunkRequestId = fileRequestId .. ':' .. data['cid'] -- FIXME, chunkRequestId should be in data
        -- assert(is_empty(chunkRequestId) == false, 'chunkRequestId cannot be empty')
        local cid = data['cid'] -- FIXME, cid should be in data
        assert(is_empty(cid) == false, 'cid cannot be empty')


        -- data fields
        local bucketId = data['bucketId']

        local timestamp = data['timestamp']
        assert(type(timestamp) == "string", "timestamp is not a string")

        local userPublicKey = data['userPublicKey']
        assert(type(timestamp) == "string", "timestamp is not a string")

        local nodePublicKey = data['nodePublicKey']
        assert(is_empty(userPublicKey) == false, 'nodePublicKey cannot be empty')

        local era = timestamp_to_era(timestamp, 1)

        local address = data['address']

        local signature = data['signature']
        assert(is_empty(signature) == false, 'signature cannot be empty')

        local gas = data['gas']
        assert(is_empty(gas) == false, 'gas cannot be empty')

        local type = data['type']
        assert(type == 1 or type == 2 or type == 3, 'type should be a number from 1 to 3 (1-write, 2-read, 3-search)')


        -- redis key
        local redisKey = prefix .. fileRequestId

        -- check if this key exists
        local redisKeyExists = redis.call('EXISTS', redisKey)
        local fileAllChunkCids = {}
        if redisKeyExists == 0 then
            -- then it's a "head chunk" and file data(like size and count of chunks) should be in data
            fileAllChunkCids = data['allChunkCids']
            assert(fileAllChunkCids and next(fileAllChunkCids) ~= nil, "allChunkCids is not an array")


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
                ['chunkCids'] = fileAllChunkCids,
            }
        }

        local encodedCurrentChunk = cjson.encode(currentChunk);
        encodedCurrentChunk = encodedCurrentChunk:gsub('\"timestamp\":\"' .. timestamp .. '\"', '\"timestamp\":' .. timestamp)

        local chunkDataPath = '$.chunks.' .. chunkRequestId

        local hasThisChunk = redis.call('JSON.OBJLEN', redisKey, chunkDataPath)
        assert(next(hasThisChunk) == nil, "A chunk with this chunkRequestId (" .. chunkRequestId .. ") already exists and cannot be overwritten")
        redis.call('JSON.SET', redisKey, chunkDataPath, encodedCurrentChunk);

        table.insert(result, redisKey)
        update_aggregates_by_node_interior(fileRequestId)

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
        local fileRequestId = data['requestId'] -- FIXME, fileRequestId should be in data
        -- assert(is_empty(fileRequestId) == false, 'fileRequestId cannot be empty')
        local chunkRequestId = fileRequestId .. ':' .. data['cid'] -- FIXME, chunkRequestId should be in data
        -- assert(is_empty(chunkRequestId) == false, 'chunkRequestId cannot be empty')
        local cid = data['cid'] -- FIXME, cid should be in data
        assert(is_empty(cid) == false, 'cid cannot be empty')

        -- redis key
        local redisKey = prefix .. fileRequestId

        -- requestedChunkCids
        local requestedChunkCids = {}
        local requestedChunkCidsPath = '$.fileInfo.requestedChunkCids'
        local hasRequestedChunkCids = redis.call('JSON.OBJLEN', redisKey, requestedChunkCidsPath)
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
        assert(is_empty(signature) == false, 'signature cannot be empty')

        local chunkAck = {
            ['userTimestamp'] = userTimestamp,
            ['signature'] = signature,
            ['saveRecordTimestamp'] = saveRecordTimestamp,
            ['userPublicKey'] = userPublicKey,
            ['nodePublicKey'] = nodePublicKey,
            ['bytesReceived'] = gas,
            ['nonce'] = nonce,
            ['requestedChunkCids'] = requestedChunkCids,
        }

        local encodedAckData = cjson.encode(chunkAck);
        encodedAckData = encodedAckData:gsub('\"userTimestamp\":\"' .. userTimestamp .. '\"', '\"userTimestamp\":' .. userTimestamp)
        encodedAckData = encodedAckData:gsub('\"saveRecordTimestamp\":\"' .. userTimestamp .. '\"', '\"saveRecordTimestamp\":' .. userTimestamp)

        -- save data
        local ackDataPath = '$.chunks.' .. chunkRequestId .. '.ack'

        local hasThisAck = redis.call('JSON.OBJLEN', redisKey, ackDataPath)
        assert(next(hasThisAck) == nil, "ack for chunkRequestId (" .. chunkRequestId .. ") already exists and cannot be overwritten")
        redis.call('JSON.SET', redisKey, ackDataPath, encodedAckData);

        table.insert(result, redisKey)
        update_aggregates_by_node_interior(fileRequestId)

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

