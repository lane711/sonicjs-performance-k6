import http from "k6/http";
import { sleep, check } from "k6";
import { Counter } from "k6/metrics";
const env = JSON.parse(open(`../env/${__ENV.HOST}.json`));

export const requests = new Counter("http_reqs");

export const options = {
  stages: [{ target: 1, duration: "30s" }],
  thresholds: {
    http_reqs: ["count < 100"],
  },
};

export default function () {

  getSingleRecord();
  getPagedRecords();

}

function getSingleRecord(){
  const url = `${env.strapi.baseUrl}/api/customers/${getRandomInt(250000)}?populate=*`
  console.log("***Hitting the GET endpoint** 🔥", url);
  const res = http.get(url);

  const checkRes = check(res, {
    "status is 200": (r) => r.status === 200,
    "response body has data": (r) =>
      r.body.indexOf(
        "data"
      ) !== -1,
  });
}

function getPagedRecords(){
  const url = `${env.strapi.baseUrl}/api/customers?pagination[page]=${getRandomInt(1000)}&pagination[pageSize]=25&populate=*`
  console.log("***Hitting the GET endpoint** 🔥", url);
  const res = http.get(url);

  const checkRes = check(res, {
    "status is 200": (r) => r.status === 200,
    "response body has data": (r) =>
      r.body.indexOf(
        "data"
      ) !== -1,
  });
}

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

