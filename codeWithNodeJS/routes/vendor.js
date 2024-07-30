const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.send("vendor page");
});

// 會員資料
router.get("/profile/:vid", (req, res) => {
  const conn = req.app.get("mysqlConnection");
  conn.query(
    "select * from vendor where vid = ?",
    [req.params.vid],
    (err, result) => {
      res.render("vendorProfile.ejs", {
        profile: result[0],
        vid: req.params.vid,
      });
    }
  );
});

// 編輯會員資料
router.post("/profile/:uid", async (req, res) => {
  try {
    const { phone, email, address, password } = req.body;
    const vid = req.params.vid;

    // 有被填寫的欄位才會傳入 value
    let updateFields = {}; ///////////////////////改到這邊
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

module.exports = router;
