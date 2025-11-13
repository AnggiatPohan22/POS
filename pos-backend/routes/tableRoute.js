const express = require("express");
const { addTable, getTable, updateTable } = require("../controllers/tableController");
const { isVerifiedUser } = require("../middlewares/tokenVerification");

const router = express.Router();


router.route("/").post(isVerifiedUser ,addTable);
router.route("/").get(isVerifiedUser ,getTable);
router.route("/:id").put(isVerifiedUser ,updateTable);

console.log("✅ tableRoute loaded successfully");

module.exports = router;