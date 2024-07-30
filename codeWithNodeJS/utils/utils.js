exports.queryAsync = function (conn, sql, values) {
  return new Promise((resolve, reject) => {
    conn.query(sql, values, (err, result) => {
      if (err) {
        console.error("SQL Error: ", err);
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};

// 引用密碼雜湊加密模組
const bcrypt = require("bcrypt");
// 密碼雜湊加密函式
exports.hashPW = async function (originalPW) {
  const saltRounds = 10;
  try {
    const hash = await bcrypt.hash(originalPW, saltRounds);
    return hash;
  } catch (error) {
    console.error("Error hashing password:", error);
    throw error;
  }
};
// 雜湊密碼驗證函式
exports.verifyPW = async function (originalPW, hashedPW) {
  try {
    const isMatch = await bcrypt.compare(originalPW, hashedPW);
    return isMatch;
  } catch (error) {
    console.error("Error verifying password:", error);
  }
};

// 資料庫更新函式 ==> 攤主
exports.updateVendorProfile = async function (conn, vid, profileData) {
  return new Promise((resolve, reject) => {
    const keys = Object.keys(profileData);
    // 如果都沒填寫，就不執行動作
    if (keys.length === 0) {
      resolve();
      return;
    }
    // 依照有填寫的欄位動態生成 SQL語法
    let sql = `UPDATE vendor SET ${keys
      .map((key) => `${key} = ?`)
      .join(",")} WHERE vid = ?`;
    let params = [...Object.values(profileData), vid];
    // 更新資料庫
    conn.query(sql, params, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};
