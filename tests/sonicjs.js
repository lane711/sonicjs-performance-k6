import http from "k6/http";
import { sleep, check } from "k6";
import { Counter } from "k6/metrics";
const env = JSON.parse(open(`../env/${__ENV.HOST}.json`));

export const requests = new Counter("http_reqs");

export const options = {
  stages: [{ target: 1, duration: "10s" }],
  thresholds: {
    http_reqs: ["count < 100"],
  },
};

export default function () {

  getSingleRecord();
  getPagesRecords();

}

const records = [
  '16850589875220000::5cavthu',
  '16850589925000000::c26r5md',
  '16850589972400000::umy79gl',
  '16850590216390000::g6f31n5',
  '16850590257280000::dkax3i0',
  '16850590294120000::62kh7gd',
  '16850590334650000::2cvano2',
  '16850590375890000::4403i1l',
  '16850590412060000::0oreeah',
  '16850590446240000::uihkwh4',
]

function getSingleRecord(){
  const record = records[getRandomInt(9)]
  const url = `${env.sonicjs.baseUrl}/api/content/site1::content::customer::${record}`
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

function getPagesRecords(){
  const url = `${env.sonicjs.baseUrl}/api/contents-with-meta/customer`
  console.log("***Hitting the GET endpoint** 🔥", url);
  const res = http.get(url);

  const checkRes = check(res, {
    "status is 200": (r) => r.status === 200,
    "response body has data": (r) =>
      r.body.indexOf(
        "keys"
      ) !== -1,
  });
}

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

