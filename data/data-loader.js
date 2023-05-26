const axios = require("axios");

const token =
  "1a113f44ab5fc0e4d64834d7981892a753f04edbc84ee4b8eb14717ba6e2919b5b53633b7ea27c05257b967a5bdf31d2e499db6c420bc2edee72b7cb844d8b6df97c3584a942b5327b118292fbb2d85d269948c909a64fded1a1d26490bc2ce7fe32e66241dc5fca4b3697937ffa42ac526b5a3cd73dcaff6c22d72697e5b0de";

console.log("starting data load");

async function createProduct() {
  const product = {
    data: {
      name: "from axois",
      cost: 55,
    },
  };

  const params = {
    headers: { "Content-Type": "application/json", authorization: token },
  };

  const { data } = await axios.post(
    "http://localhost:1337/api/products",
    product,
    params
  );
}

async function getProducts() {
//   const data = await axios.get("http://localhost:1337/api/products");

  axios.get('http://localhost:1337/api/products').then(resp => {

    console.log(resp.data);
});

//   console.log(data.status);
}

// createProduct();
getProducts();
