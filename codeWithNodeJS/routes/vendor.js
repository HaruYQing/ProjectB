const express = require("express");
const router = express.Router();
const { queryAsync, hashPW, updateVendorProfile } = require("../utils/utils");

router.get("/", (req, res) => {
  res.send("vendor page");
});

// 會員資料 (for ejs)
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
// 會員資料 API
router.get("/api/profile/:vid", (req, res) => {
  const conn = req.app.get("mysqlConnection");
  conn.query(
    "select * from vendor where vid = ?",
    [req.params.vid],
    (err, result) => {
      res.json(result[0]);
    }
  );
});

// 編輯會員資料 (for ejs)
router.post("/profile/:vid", async (req, res) => {
  try {
    const { first_name, last_name, phone, email, address, password } = req.body;
    const vid = req.params.vid;
    const conn = req.app.get("mysqlConnection");

    // 有被填寫的欄位才會傳入 value
    let updateFields = {};
    if (first_name) updateFields.first_name = first_name;
    if (last_name) updateFields.last_name = last_name;
    if (phone) updateFields.phone = phone;
    if (email) updateFields.email = email;
    if (address) updateFields.address = address;
    // 有被填寫的密碼才會被雜湊加密並傳入
    if (password) {
      var hashedPW = await hashPW(password);
      updateFields.password = hashedPW;
    }

    // 假如有欄位被填寫才會 update到資料庫，否則就是回到原畫面
    if (Object.keys(updateFields > 0)) {
      await updateVendorProfile(conn, vid, updateFields);
      res.redirect(`/vendor/profile/${vid}`);
    } else {
      res.redirect(`/vendor/profile/${vid}`);
    }
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).send("An error occurred while updating the profile");
  }
});
// 編輯會員資料 --React--
router.put("/put/profile/:vid", async (req, res) => {
  try {
    const { first_name, last_name, phone, email, address, password } = req.body;
    const vid = req.params.vid;
    const conn = req.app.get("mysqlConnection");

    // 有被填寫的欄位才會傳入 value
    let updateFields = {};
    if (first_name) updateFields.first_name = first_name;
    if (last_name) updateFields.last_name = last_name;
    if (phone) updateFields.phone = phone;
    if (email) updateFields.email = email;
    if (address) updateFields.address = address;
    // 有被填寫的密碼才會被雜湊加密並傳入
    if (password) {
      var hashedPW = await hashPW(password);
      updateFields.password = hashedPW;
    }

    // 假如有欄位被填寫才會 update到資料庫，否則就是回到原畫面
    if (Object.keys(updateFields).length > 0) {
      await updateVendorProfile(conn, vid, updateFields);
      res.status(200).json({
        message: "Profile updated successfully",
        updatedFields: Object.keys(updateFields),
      });
    } else {
      res.status(200).json({ message: "No fields to update" });
    }
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).send("An error occurred while updating the profile");
  }
});

// 我要擺攤

// 攤位資訊
router.get("/info/:vid", (req, res) => {
  res.send("<h1>shop info here</h1>");
});

module.exports = router;
