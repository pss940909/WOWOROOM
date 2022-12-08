// 資料格式
let orderData = [];

// DOM
const orderList = document.querySelector(".js-orderList");
const discardAllBtn = document.querySelector(".discardAllBtn");

// 初始化
function init() {
  getOrderList();
}
init();
// 取得訂單資訊
function getOrderList() {
  axios
    .get(
      `https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`,
      {
        headers: {
          Authorization: token,
        },
      }
    )
    .then(function (response) {
      orderData = response.data.orders;
      let str = "";
      orderData.forEach(function (item) {
        console.log(orderData);
        // 組時間字串
        const timeStamp = new Date(item.createdAt * 1000);
        const orderTime = `${timeStamp.getFullYear()}/${
          timeStamp.getMonth() + 1
        }/${timeStamp.getDate()}`;
        // 組產品字串
        let productStr = "";
        item.products.forEach(function (productItem) {
          productStr += `<p>${productItem.title}x${productItem.quantity}</p>`;
        });

        // 判斷訂單處理狀態
        let orderStatus = "";
        if (item.paid) {
          orderStatus = "已處理";
        } else {
          orderStatus = "未處理";
        }

        // 組訂單字串
        str += `<tr>
        <td>${item.id}</td>
        <td>
          <p>${item.user.name}</p>
          <p>${item.user.tel}</p>
        </td>
        <td>${item.user.address}</td>
        <td>${item.user.email}</td>
        <td>
          <p>${productStr}</p>
        </td>
        <td>${orderTime}</td>
        <td>
          <a href="#" class='orderStatus' data-status='${item.paid}' data-id='${item.id}'>${orderStatus}</a>
        </td>
        <td>
          <input type="button" class="delSingleOrder-Btn js-orderDelete" data-id='${item.id}' value="刪除" />
        </td>
      </tr>`;
      });
      orderList.innerHTML = str;
      renderC3_lv2();
    });
}

// 渲染圖表
function renderC3() {
  let total = {};
  orderData.forEach(function (item) {
    item.products.forEach(function (productItem) {
      if (total[productItem.category] == undefined) {
        total[productItem.category] = productItem.price * productItem.quantity;
      } else {
        total[productItem.category] += productItem.price * productItem.quantity;
      }
    });
  });
  let totalArr = Object.keys(total);
  console.log(totalArr);
  let categoryArr = [];
  totalArr.forEach(function (item) {
    let arr = [];
    arr.push(item);
    arr.push(total[item]);
    categoryArr.push(arr);
  });

  // C3.js
  let chart = c3.generate({
    bindto: "#chart", // HTML 元素綁定
    data: {
      type: "pie",
      columns: categoryArr,
      colors: {
        床架: "#DACBFF",
        窗簾: "#9D7FEA",
        收納: "#5434A7",
        其他: "#301E5F",
      },
    },
  });
}

function renderC3_lv2() {
  let total = {};
  orderData.forEach(function (item) {
    item.products.forEach(function (productItem) {
      if (total[productItem.title] == undefined) {
        total[productItem.title] = productItem.price * productItem.quantity;
      } else {
        total[productItem.title] += productItem.price * productItem.quantity;
      }
    });
  });
  console.log(total);
  let productNameArr = Object.keys(total);
  console.log(productNameArr);
  let productArr = [];
  productNameArr.forEach(function (item) {
    let arr = [];
    arr.push(item);
    arr.push(total[item]);
    productArr.push(arr);
  });
  productArr.sort(function (a, b) {
    return b[1] - a[1];
  });
  let othersTotal = 0;
  productArr.forEach(function (item, index) {
    if (index > 2) {
      othersTotal += item[1];
    }
  });
  let C3Arr = [];
  productArr.forEach(function (item, index) {
    if (index <= 2) {
      C3Arr.push(item);
    }
  });
  C3Arr.push(["其他", othersTotal]);
  console.log(C3Arr[0][0]);

  // C3.js
  let chart = c3.generate({
    bindto: "#chart", // HTML 元素綁定
    data: {
      type: "pie",
      columns: C3Arr,
      colors: {
        床架: "#DACBFF",
        窗簾: "#9D7FEA",
        收納: "#5434A7",
        其他: "#301E5F",
      },
    },
  });
}

// 監聽訂單列表刪除以及處理
orderList.addEventListener("click", function (e) {
  e.preventDefault();
  const targetClass = e.target.getAttribute("class");
  if (targetClass == null) {
    alert("點擊錯誤");
    return;
  }

  let status = e.target.getAttribute("data-status");
  let id = e.target.getAttribute("data-id");
  // 刪除按鈕
  if (targetClass == "delSingleOrder-Btn js-orderDelete") {
    alert("刪除訂單");
    deleteOrderItem(id);
  }

  // 處理訂單狀態
  if (targetClass == "orderStatus") {
    changeOrderStatus(status, id);
  }
});

// 修改訂單狀態
function changeOrderStatus(status, id) {
  console.log(status, id);
  let newStatus;
  if (status == "true") {
    newStatus = false;
  } else {
    newStatus = true;
  }

  axios
    .put(
      `https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`,
      {
        data: {
          id: id,
          paid: newStatus,
        },
      },
      {
        headers: {
          Authorization: token,
        },
      }
    )
    .then(function (response) {
      alert("修改訂單成功");
      getOrderList();
    });
}
// 刪除訂單
function deleteOrderItem(id) {
  axios
    .delete(
      `https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders/${id}`,
      {
        headers: {
          Authorization: token,
        },
      }
    )
    .then(function (response) {
      console.log(response);
      console.log("刪除該筆訂單成功");
      getOrderList();
    });
}

// 監聽刪除全部訂單
discardAllBtn.addEventListener("click", function (e) {
  e.preventDefault();
  axios
    .delete(
      `https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`,
      {
        headers: {
          Authorization: token,
        },
      }
    )
    .then(function (response) {
      console.log(response);
      console.log("刪除全部訂單成功");
      getOrderList();
    });
});
