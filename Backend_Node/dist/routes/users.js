"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const usersController_1 = require("../controllers/usersController");
const verifyJwt_1 = require("../middleware/verifyJwt");
const isSuperAdmin_1 = require("../middleware/isSuperAdmin");
const router = (0, express_1.Router)();
router.get('/', usersController_1.listHandler);
router.post('/', usersController_1.createHandler);
router.get('/:user_Id', usersController_1.findHandler);
// Admin-only endpoints
router.put('/update', verifyJwt_1.verifyJwt, isSuperAdmin_1.isSuperAdmin, usersController_1.updateHandler);
router.put('/:id', verifyJwt_1.verifyJwt, isSuperAdmin_1.isSuperAdmin, usersController_1.updateHandler);
router.post('/delete', verifyJwt_1.verifyJwt, isSuperAdmin_1.isSuperAdmin, usersController_1.deleteHandler);
router.delete('/:id', verifyJwt_1.verifyJwt, isSuperAdmin_1.isSuperAdmin, usersController_1.deleteHandler);
exports.default = router;
