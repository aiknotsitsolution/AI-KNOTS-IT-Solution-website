const router = require("express").Router();
const {
    createTech,
    getTechData,
    
    updateTech,
    deleteTech,
} = require("../../controller/techcontroller/techcontroller.js");
const {
    getPaginatedTechData,
} = require("../../controller/techcontroller/techPaginationController.js");

router.post("/create", createTech);
router.get("/", (req, res, next) => {
    if (req.query.page !== undefined || req.query.limit !== undefined) {
        return getPaginatedTechData(req, res, next);
    }

    return getTechData(req, res, next);
});
router.put("/update/:id", updateTech);
router.delete("/delete/:id", deleteTech);

module.exports = router;
