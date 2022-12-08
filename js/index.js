// DOM
const productList = document.querySelector(".productWrap");
const productSelect = document.querySelector(".productSelect");
const cartList = document.querySelector(".shoppingCart-tableList");
const discardAllBtn = document.querySelector(".discardAllBtn");
const orderInfoBtn = document.querySelector(".orderInfo-btn");
const orderInfoForm = document.querySelector(".orderInfo-form");
// 資料格式
let productData = [];
let cartData = [];

function init() {
  getProductList();
  getCartList();
}
init();

// 取得產品資料
function getProductList() {
  axios
    .get(
      `https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/products`
    )
    .then(function (response) {
      productData = response.data.products;
      renderProductList();
    });
}
// 組字串
function combineHTML(item) {
  return `<li class="productCard">
    <h4 class="productType">新品</h4>
    <img
      src="${item.images}"
      alt=""
    />
    <a href="#" class="js-addCart addCartBtn" data-id='${
      item.id
    }'>加入購物車</a> 
    <h3>${item.title}</h3>
    <del class="originPrice">NT$${toThousands(item.origin_price)}</del>
    <p class="nowPrice">NT$${toThousands(item.price)}</p>
    </li>`;
  // data-id : 埋產品id在加入購物車按鈕
}

// 渲染產品列表
function renderProductList() {
  let str = "";
  productData.forEach(function (item) {
    str += combineHTML(item);
  });
  productList.innerHTML = str;
}

// 監聽篩選事件
productSelect.addEventListener("change", function (e) {
  if (e.target.value === "全部") {
    renderProductList();
  } else {
    let newStr = "";
    let newData = productData.filter(function (item) {
      if (e.target.value === item.category) {
        return item;
      }
    });
    newData.forEach(function (item) {
      newStr += combineHTML(item);
    });
    productList.innerHTML = newStr;
  }
});

// 監聽加入購物車按鈕
productList.addEventListener("click", function (e) {
  e.preventDefault();
  let addCartClass = e.target.getAttribute("class");
  let productId = e.target.dataset.id;
  if (addCartClass !== "js-addCart addCartBtn") {
    return;
  }

  let numCheck = 1;
  cartData.forEach(function (item) {
    if (productId === item.product.id) {
      numCheck = item.quantity += 1;
    }
  });
  console.log(numCheck);
  axios
    .post(
      `https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`,
      {
        data: {
          productId: `${productId}`,
          quantity: numCheck,
        },
      }
    )
    .then(function (response) {
      console.log(response);
      alert("加入購物車");
      getCartList();
    });
});

// 取得購物車列表

function getCartList() {
  axios
    .get(
      `https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`
    )
    .then(function (response) {
      cartData = response.data.carts;
      document.querySelector(".js-total").textContent = toThousands(
        response.data.finalTotal
      );
      let str = "";
      cartData.forEach(function (item) {
        str += `<tr>
        <td>
          <div class="cardItem-title">
            <img src="${item.product.images}" alt="" />
            <p>${item.product.title}</p>
          </div>
        </td>
        <td>${toThousands(item.product.price)}</td>
        <td>${item.quantity}</td>
        <td>${toThousands(item.product.price * item.quantity)}</td>
        <td class="discardBtn">
          <a href="#" class="material-icons" data-id=${item.id}> clear </a>
        </td>
      </tr>`;
      });
      cartList.innerHTML = str;
    });
}

// 刪除購物車單筆品項
cartList.addEventListener("click", function (e) {
  e.preventDefault();
  let cartId = e.target.dataset.id;
  if (cartId == undefined) {
    alert("請重新點擊");
    return;
  }
  axios
    .delete(
      `https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts/${cartId}`
    )
    .then(function (response) {
      console.log(response);
      alert("刪除成功");
      getCartList();
    });
});

// 刪除所有品項
discardAllBtn.addEventListener("click", function (e) {
  e.preventDefault();
  axios
    .delete(
      `https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`
    )
    .then(function (response) {
      console.log(response.data.message);
      alert("刪除所有品項成功");
      getCartList();
    })
    .catch(function (response) {
      console.log(response.message);
      alert("購物車已全部清空，請勿重複點擊");
    });
});

// 送出訂單

orderInfoBtn.addEventListener("click", function (e) {
  e.preventDefault();
  //確認購物車內有資料
  if (cartData.length == 0) {
    alert("請加入購物車");
    return;
  }
  const customerName = document.querySelector("#customerName").value;
  const customerPhone = document.querySelector("#customerPhone").value;
  const customerEmail = document.querySelector("#customerEmail").value;
  const customerAddress = document.querySelector("#customerAddress").value;
  const customerTradeWay = document.querySelector("#tradeWay").value;
  // 簡單確認表格資料是否都有填寫
  if (
    customerName == "" ||
    customerPhone == "" ||
    customerEmail == "" ||
    customerAddress == "" ||
    customerTradeWay == ""
  ) {
    alert("請輸入訂單資訊");
  }
  axios
    .post(
      `https://livejs-api.hexschool.io/api/livejs/v1/customer/pss940909/orders`,
      {
        data: {
          user: {
            name: customerName,
            tel: customerPhone,
            email: customerEmail,
            address: customerAddress,
            payment: customerTradeWay,
          },
        },
      }
    )
    .then(function (response) {
      console.log(response);
      alert("訂單建立成功");
      getCartList();
    });

  orderInfoForm.reset();
});

// utilities 千分位
function toThousands(x) {
  var parts = x.toString().split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return parts.join(".");
}
