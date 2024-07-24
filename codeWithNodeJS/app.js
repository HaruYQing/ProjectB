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
const { log } = require("console");
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

app.get("/member/index/:uid", (req, res) => {
  res.redirect(`/member/profile/${req.params.uid}`);
});

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
      if (err) reject(err);
      else resolve(result);
    });
  });
}

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
    const formattedOrders = orders.map((order) => ({
      ...order,
      statusText: getStatusText(order.status),
      formatted_order_time: new Date(order.order_time).toLocaleString("zh-TW", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
    }));

    res.render("memberOrderList.ejs", {
      uid: req.params.uid,
      orders: formattedOrders,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
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
