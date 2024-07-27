const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);
app.use(express.static("public"));

// 引用密碼雜湊加密模組
const bcrypt = require("bcrypt");
// 密碼雜湊加密函式
async function hashPW(originalPW) {
  const saltRounds = 10;
  try {
    const hash = await bcrypt.hash(originalPW, saltRounds);
    return hash;
  } catch (error) {
    console.error("Error hashing password:", error);
    throw error;
  }
}
// 雜湊密碼驗證函式
async function verifyPW(originalPW, hashedPW) {
  try {
    const isMatch = await bcrypt.compare(originalPW, hashedPW);
    return isMatch;
  } catch (error) {
    console.error("Error verifying password:", error);
  }
}
// 資料庫更新函式
async function updateUserProfile(uid, profileData) {
  return new Promise((resolve, reject) => {
    const { nickname, phone, email, address, password } = profileData;
    const keys = Object.keys(profileData);
    // 如果都沒填寫，就不執行動作
    if (keys.length === 0) {
      resolve();
      return;
    }
    // 依照有填寫的欄位動態生成 SQL語法
    let sql = `UPDATE member SET ${keys
      .map((key) => `${key} = ?`)
      .join(",")} WHERE uid = ?`;
    let params = [...Object.values(profileData), uid];
    // 更新資料庫
    conn.query(sql, params, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
}

const bp = require("body-parser");
app.use(bp.urlencoded({ extened: true }));
app.use(bp.json());

app.set("view engine", "ejs");

const mysql = require("mysql");
const { log, error } = require("console");
const conn = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "haoshih_test",
});

conn.connect((err) => {
  if (err) {
    console.log("MySQL連線失敗");
    return;
  } else {
    console.log("MySQL連線成功");
  }
});

app.get("/", (req, res) => {
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.send("<h1>您即將進入會員專區～</h1>");
});

// 會員專區首頁 => 預設導到會員資料畫面
app.get("/member/index/:uid", (req, res) => {
  res.redirect(`/member/profile/${req.params.uid}`);
});

// 會員資料
app.get("/member/profile/:uid", (req, res) => {
  conn.query(
    "select * from member where uid = ?",
    [req.params.uid],
    (err, result) => {
      res.render("memberProfile.ejs", {
        profile: result[0],
        uid: req.params.uid,
      });
    }
  );
});

app.post("/member/profile/:uid", async (req, res) => {
  try {
    const { nickname, phone, email, address, password } = req.body;
    const uid = req.params.uid;

    // 有被填寫的欄位才會傳入 value
    let updateFields = {};
    if (nickname) updateFields.nickname = nickname;
    if (phone) updateFields.phone = phone;
    if (email) updateFields.email = email;
    if (address) updateFields.address = address;
    // 有被填寫的密碼才會被雜湊加密並傳入
    if (password) {
      hashedPW = await hashPW(password);
      updateFields.password = hashedPW;
    }

    // 假如有欄位被填寫才會 update到資料庫，否則就是回到原畫面
    if (Object.keys(updateFields > 0)) {
      await updateUserProfile(uid, updateFields);
      res.redirect(`/member/profile/${req.params.uid}`);
    } else {
      res.redirect(`/member/profile/${req.params.uid}`);
    }
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).send("An error occurred while updating the profile");
  }
});

function queryAsync(sql, values) {
  return new Promise((resolve, reject) => {
    conn.query(sql, values, (err, result) => {
      if (err) {
        console.error("SQL Error: ", err);
        reject(err);
      } else {
        console.log("SQL Result: ", result);
        resolve(result);
      }
    });
  });
}

// 我的訂單
app.get("/member/orderList/:uid", async (req, res) => {
  try {
    // 抓這個 uid 的訂單資料 => vid 找到 vendor table => vinfo 找到 vendor_info table
    const orderQuery = `
      SELECT o.*, vi.brand_name 
      FROM orderList o 
      JOIN vendor v ON o.vid = v.vid 
      JOIN vendor_info vi ON v.vinfo = vi.vinfo 
      WHERE o.uid = ?
    `;
    const orders = await queryAsync(orderQuery, [req.params.uid]);

    // 將交易狀態轉為文字訊息、格式化日期
    // todo: 把商品編號 pid 連結到 product table
    function getStatusText(status) {
      switch (status) {
        case 0:
          return "未出貨";
        case 1:
          return "已出貨";
        case 2:
          return "待收貨";
        case 3:
          return "已完成";
        default:
          return "未知狀態";
      }
    }
    const formattedOrdersPromises = orders.map(async (order) => {
      let detailObj;
      try {
        detailObj = JSON.parse(order.detail);
      } catch (error) {
        console.error(
          "Error parsing JSON:",
          error,
          "Order detail:",
          order.detail
        );
        detailObj = { amount: 0, price: 0, total: 0 }; // 設置一個默認值
      }
      // 抓商品資料
      let productData = await queryAsync(
        "SELECT * FROM product WHERE pid = ?",
        [detailObj.pid]
      );

      // 假設 productData 中包含了名為 img01 的 Base64 圖片數據
      let productImage = productData[0].img01;

      // 檢查 productImage 的類型和內容
      // console.log("Product Image Type:", typeof productImage);
      // console.log("Product Image:", productImage);

      // 根據 productImage 的實際類型進行處理
      if (productImage) {
        if (Buffer.isBuffer(productImage)) {
          // 如果是 Buffer，轉換為 Base64
          productImage = `data:image/jpeg;base64,${productImage.toString(
            "base64"
          )}`;
        } else if (typeof productImage === "string") {
          // 如果已經是字符串，檢查是否需要添加前綴
          if (!productImage.startsWith("data:image/")) {
            productImage = `data:image/jpeg;base64,${productImage}`;
          }
        } else {
          // 如果是其他類型，設置為 null
          console.log("Unexpected image data type");
          productImage = null;
        }
      } else {
        productImage = null;
      }

      return {
        ...order,
        detailObj: detailObj,
        productData: productData[0],
        productImage: productImage,
        statusText: getStatusText(order.status),
        formatted_order_time: new Date(order.order_time).toLocaleString(
          "zh-TW",
          {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          }
        ),
      };
    });

    const formattedOrders = await Promise.all(formattedOrdersPromises);

    res.render("memberOrderList.ejs", {
      uid: req.params.uid,
      orders: formattedOrders,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Fail to render your page" });
  }
});

// 按讚攤位
app.get("/member/like/:uid", async (req, res) => {
  try {
    const heartQuery = `
        SELECT * FROM heart WHERE uid = ?
    `;
    const likes = await queryAsync(heartQuery, [req.params.uid]);
    console.log(`likes: ${likes}`);

    if (likes.length === 0 || !likes[0].list) {
      return res.send([]); // 如果沒有找到該會員或沒有喜歡的項目，返回空數列
    }

    const likesNumArr = likes[0]["list"].split(",").map(Number); // [1,2]
    console.log(`likesNumArr: ${likesNumArr}`);

    // to-do: 抓 logo圖片、抓視覺圖(需要篩選，不一定有 5 張)
    const likesQuery = `
    SELECT v.vid, vi.brand_name 
    FROM vendor v 
    JOIN vendor_info vi ON v.vinfo = vi.vinfo 
    WHERE v.vid = ?
  `;

    const likedBrandPromises = likesNumArr.map(async (value) => {
      // console.log(`vid: ${typeof value}---${value}`);
      try {
        const result = await queryAsync(likesQuery, [value]);
        // console.log(`Query result for vid ${value}:`, result);
        return result;
      } catch (error) {
        console.error(`Error querying for vid ${value}:`, error);
        return null;
      }
    });

    const likedBrandResult = await Promise.all(likedBrandPromises);
    // console.log("Final liked brand results:", likedBrandResult);

    // 處理結果，假設每個查詢返回一個數組，我們取第一個元素
    const likedBrandArr = likedBrandResult
      .map((result) => result[0])
      .filter(Boolean);
    /* 
        [
          {
            "vid": 1,
            "brand_name": "店家二號"
          },
          {
            "vid": 2,
            "brand_name": "店家一號"
          }
        ]
      */

    res.render("memberLike.ejs", {
      likedList: likedBrandArr,
      uid: req.params.uid,
    });
  } catch (error) {
    console.error("Error in /member/like/:uid:", error);
    res.status(500).send("Internal Server Error");
  }
});

// 聊天室頁面
app.get("/member/chat/:uid", (req, res) => {
  conn.query(
    "select * from member where uid = ?",
    [req.params.uid],
    (err, result) => {
      res.render("memberChat.ejs", {
        profile: result[0],
        uid: req.params.uid,
      });
    }
  );
});

// Socket.IO 事件處理
io.on("connection", (socket) => {
  socket.emit("user connected", "一個用戶連接了");

  // 處理聊天訊息
  socket.on("chat message", (msg) => {
    io.emit("chat message", msg);
  });

  socket.on("disconnect", () => {
    io.emit("用戶斷開連接");
  });
});

app.use((req, res) => {
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.send("<h1>網站維護中...</h1>");
});

const PORT = 3200 || process.env.PORT;
http.listen(PORT, () => {
  console.log(`服務器運行在 ${PORT} 端口`);
});
