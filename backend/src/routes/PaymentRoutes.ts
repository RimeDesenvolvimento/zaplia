import express from "express";
import isAuth from "../middleware/isAuth";
import * as CreatePixPaymentController      from "../controllers/PaymentPlanWithPixController";

const {createPixPaymentController} = CreatePixPaymentController;

const paymentRoutes = express.Router();

paymentRoutes.post("/payment/pix", createPixPaymentController);


export default paymentRoutes;
