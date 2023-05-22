import http from "k6/http";
import { check, group, sleep } from "k6";
import { Counter, Trend } from "k6/metrics";
import {
  formatDate,
  DebugOrLog,
  randomString,
  randInt,
} from "../../../lib/util.js";
import {
  RunID,
  Execution,
  ExecutionType,
  loadServiceConfig,
  withHeaders,
} from "../../../lib/init.js";
import { Environment } from "../../../lib/init.js";
import {
  createLocation,
  deleteLocation,
  createStockAreaItemInventory,
} from "../../../lib/services/inventory.service.js";
import uuid from "../../../lib/uuid.js";

var inventoryConfig = Object.assign({}, loadServiceConfig("inventory"), {
  params: withHeaders({ "Content-type": "application/json", accept: "json" }),
});

// Parameters & Constants
const TestID = "inventory-locations";
const enableDebug = true;

// Counters
var BackendReadCounter = new Counter("BackendReadCounter");
var APICallCounter = new Counter("APICallCounter");

var ExecutionOptions_Scenarios;

const stressStages = [
  { duration: "2m", target: 2 },
  { duration: "2m", target: 5 },  
  { duration: "2m", target: 10 },
  { duration: "5m", target: 25 },
];
const stressStartRate = 1;
const stressPreAllocatedVUs = 20;

switch (Execution) {
  case ExecutionType.smoke:
    ExecutionOptions_Scenarios = {
        performanceCheck: {
        exec: "performanceCheck",
        executor: "per-vu-iterations",
        vus: 2,
        iterations: 2,
        maxDuration: "5m",
      },
    };
    break;
  case ExecutionType.stress:
    ExecutionOptions_Scenarios = {
      performanceCheck: {
        exec: "performanceCheck",
        executor: "ramping-arrival-rate",
        startTime: "0s",
        startRate: 20,
        preAllocatedVUs: 100,
        stages: stressStages,
      },

    };
    break;

}

// configure k6 - workload model
export let options = {
  tags: {
    run_id: RunID,
    test_id: TestID,
  },
  scenarios: ExecutionOptions_Scenarios,
  thresholds: {
    http_req_failed: ["rate<0.05"],
    http_req_duration: ["p(95)<3000"],
    "http_req_duration{inventory:performanceCheck}": ["avg<2000"],
  },
  setuptimeout: "100s",
};

// setup configuration
export function setup() {
  DebugOrLog(
    `== SETUP BEGIN ===========================================================`,
    enableDebug
  );
  DebugOrLog(`Start of test: ${formatDate(new Date())}`, enableDebug);
 
  return { config: inventoryConfig, stockAreaItemInventory };
}

export function teardown(data) {
  DebugOrLog("== TEARDOWN ===========================", enableDebug);
  // deleteLocation(data.config, data.config.data, data.siteId);
}


export function performanceCheck({ config }) {
  setTag(config, "performanceCheck");

  const res = http.get(config.baseUrl + `/api/test/performance`, config.params);

  checkSuccess(
    res,
    "Performance Test - Get Aggregated Values Across Item Locations"
  );
}


function setTag(config, tag) {
  config.params.tags = { inventory: tag };
}

function checkSuccess(res, message) {
  APICallCounter.add(1);

  const success = check(res, {
    [message]: () => {
      BackendReadCounter.add(1);
      return res.status == 200;
    },
  });

  if (!success) {
    DebugOrLog(
      `ERROR -> code: ${res.status} k6:${res.error_code}. error: ${res.error}`,
      enableDebug
    );
  }
}
