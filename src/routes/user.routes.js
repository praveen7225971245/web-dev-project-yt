import express from 'express';
import {registerUser} from '../controllers/user.controller.js';

const router = express.Router();

router.route("/register").post(registerUser);  //http://localhost:5000/api/v1/users/register

export default router;