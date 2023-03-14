#!lua name=mylib

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


local function update_aggregates(keys, args)
   local result = {}
   for i, key in ipairs(keys) do
      local data = cjson.decode(redis.call('JSON.GET', key));
      local prefix = string.sub(key, 1, 11)
      local nodeId = data['nodeId']
      local timestamp = data['timestamp']
      local gas = data['gas']
      local type = data['type']
      local era = timestamp_to_era(timestamp, 1)
      local isAck = string.sub(key, 9, 11) == 'ack'

      redis.call('JSON.SET', key, '$.era', era)

      local new_key = prefix .. ":aggregate:" .. nodeId .. ':' .. era

      local exists = redis.call('exists', new_key)
      if exists==0 then
         redis.call('HSET', new_key, 'nodeId', nodeId, 'era', era, 'gas', gas)
      else
         redis.call('HINCRBY', new_key, 'gas', gas)
      end

      if isAck then
         local status = math.random(100) > 10 and 200 or math.random(5) + 500
         local responseTime = math.random(30) + 100
         if nodeId == 'a2d14e71b52e5695e72c0567926bc68b68bda74df5c1ccf1d4ba612c153ff66b' then
            responseTime = math.random(100) > 20 and math.random(20) + 100 or math.random(100) + 500
         end
         local throughput = math.random(50) + 2000
         redis.call('JSON.SET', key, '$.status', status)
         redis.call('JSON.SET', key, '$.responseTime', responseTime)
         redis.call('JSON.SET', key, '$.throughput', throughput)
      end

      table.insert(result, new_key)
   end

   return result;

end

redis.register_function('update_aggregates', update_aggregates)


local function save_log(keys, args)
   local result = {}
   local prefix = 'ddc:dac:data:'
   for i, key in ipairs(keys) do
      local data = cjson.decode(key);

      local requestId = data['requestId']
      local sessionId = data['sessionId']
      local timestamp = data['timestamp']
      assert(type(timestamp) == "string", "timestamp is not a string")
      local address = data['address']
      local gas = data['gas']
      local userPublicKey = data['userPublicKey']
      local nodePublicKey = data['nodePublicKey']
      local type = data['type']
      local nodeId = data['nodeId']
      local bucketId = data['bucketId']
      local meta = data['meta']

      local responseStatus = -1
      local responseTime = -1
      local throughput = -1
      local era = timestamp_to_era(timestamp, 1)

      local dataKey = prefix .. requestId

      local saveData = {
         ['requestId'] = requestId,
         ['sessionId'] = sessionId,
         ['timestamp'] = timestamp,
         ['address'] = address,
         ['gas'] = gas,
         ['userPublicKey'] = userPublicKey,
         ['nodePublicKey'] = nodePublicKey,
         ['type'] = type,
         ['nodeId'] = nodeId,
         ['bucketId'] = bucketId,
         ['meta'] = meta,
         ['calculated'] = {
            ['responseStatus'] = responseStatus,
            ['responseTime'] = responseTime,
            ['throughput'] = throughput,
            ['era'] = era,
         }
      }
      --data['calculated'] = {['responseStatus'] = 0, ['responseTime'] = '', ['throughput'] = 0}

      local encodedLogData =  cjson.encode(saveData)
      encodedLogData = encodedLogData:gsub('\"timestamp\":\"'..timestamp..'\"', '\"timestamp\":'..timestamp)

      redis.call("JSON.SET", dataKey, "$", encodedLogData)


      table.insert(result, dataKey)
   end

   return result;

end

redis.register_function('save_log', save_log)


local function save_ack(keys, args)
   --local big = require 'bignumber'
   local result = {}
   local prefix = 'ddc:dac:data:'
   for i, key in ipairs(keys) do
      local data = cjson.decode(key);
      local requestId = data['requestId']
      local userTimestamp = data['userTimestamp']
      assert(type(userTimestamp) == "string", "userTimestamp is not a string")
      local saveRecordTimestamp = data['saveRecordTimestamp']
      assert(type(saveRecordTimestamp) == "string", "saveRecordTimestamp is not a string")
      local userPublicKey = data['userPublicKey']
      local nodePublicKey = data['nodePublicKey']
      local gas = data['gas']
      local nonce = data['nonce']
      local size = data['gas']

      local dataKey = prefix .. requestId

      local saveAck = {
         ['userTimestamp'] = userTimestamp,
         ['saveRecordTimestamp'] = saveRecordTimestamp,
         ['userPublicKey'] = userPublicKey,
         ['nodePublicKey'] = nodePublicKey,
         ['gas'] = gas,
         ['nonce'] = nonce,
         ['size'] = size,
      }


      local encodedAckData = cjson.encode(saveAck);
      encodedAckData = encodedAckData:gsub('\"userTimestamp\":\"'..userTimestamp..'\"', '\"userTimestamp\":'..userTimestamp)
      encodedAckData = encodedAckData:gsub('\"saveRecordTimestamp\":\"'..userTimestamp..'\"', '\"saveRecordTimestamp\":'..userTimestamp)

      -- save data
      redis.call("JSON.SET", dataKey, "$.ack", encodedAckData)

      -- update calculations
      local logDataTimestamp = redis.call('JSON.GET', dataKey, '$.timestamp'):gsub('[\]\[]','')
      local responseTime = tonumber(string.sub(saveRecordTimestamp, -15)) - tonumber(string.sub(logDataTimestamp, -15))
      local responseStatus = 200
      local throughput = size/responseTime * 1000000000 -- bytes to second

      redis.call("JSON.SET", dataKey, "$.calculated.responseTime", responseTime)
      redis.call("JSON.SET", dataKey, "$.calculated.responseStatus", responseStatus)
      redis.call("JSON.SET", dataKey, "$.calculated.throughput", throughput)

      table.insert(result, dataKey)
   end

   return result;

end

redis.register_function('save_ack', save_ack)


local function create_common_index(timestamp, args)
   local INDEX_NAME = 'ddc:dac:searchCommonIndex'
   local indexes = redis.call("FT._LIST")

   for i, key in ipairs(indexes) do
      if key == INDEX_NAME then
         redis.call("FT.DROPINDEX", INDEX_NAME)
      end
   end

   local result = redis.call("FT.CREATE", INDEX_NAME, "ON", "JSON", "PREFIX", "1", "ddc:dac:data", "SCHEMA",
           "$.requestId", "AS", "requestId", "TEXT",
           "$.sessionId", "AS", "sessionId", "TEXT",
           "$.address", "AS", "address", "TEXT",
           "$.userPublicKey", "AS", "userPublicKey", "TEXT",
           "$.nodePublicKey", "AS", "nodePublicKey", "TEXT",
           "$.nodeId", "AS", "nodeId", "TEXT",

           "$.type","AS","type","NUMERIC",
           "$.gas","AS","gas","NUMERIC",
           "$.bucketId","AS","bucketId","NUMERIC",


           '$.calculated.era', "AS", "era", "NUMERIC",
           '$.calculated.responseTime', "AS", "responseTime", "NUMERIC",
           '$.calculated.responseStatus', "AS", "responseStatus", "NUMERIC",
           '$.calculated.throughput', "AS", "throughput", "NUMERIC",

           "$.timestamp", "AS", "timestamp", "NUMERIC"

   )

   return indexes;
end

redis.register_function('create_common_index', create_common_index)