"use server";
import {
  NewPayment,
  Payment,
  paymentRefId,
  SubscriptionStatus,
  Suscription,
  suscriptionRefId,
} from "@/utils/const";
import axios from "axios";
import {
  getDoc,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
} from "firebase/firestore";

export const createPaymentLink = async (data: NewPayment): Promise<Payment> => {
  try {
    const response = await axios.post(`${process.env.API_LIBELULA}registrar`, {
      appkey: process.env.APPKEY_LIBELULA,
      ...data,
    });
    const payment = {
      paymentUrl: response.data.qr_simple_url,
      ...data,
    };
    await setDoc(paymentRefId(data.identificador), payment);
    return payment;
  } catch (error) {
    console.error("Error creating payment link:", error);
    throw error;
  }
};

export const checkPayment = async (paymentId: string) => {
  try {
    const response = await axios.post(
      `${process.env.API_LIBELULA}consultar_deudas/por_identificador`,
      {
        appkey: process.env.APPKEY_LIBELULA,
        identificador: paymentId,
      },
    );
    return response.data;
  } catch (error) {
    console.error("Error creating payment link:", error);
    throw error;
  }
};

export const updateSuscriptionDuration = async (
  suscriptionId: string,
  months: number = 1,
) => {
  try {
    const suscriptionRef = suscriptionRefId(suscriptionId);
    const suscriptionStart = new Date();
    const subscriptionEnd = new Date(suscriptionStart);
    subscriptionEnd.setMonth(subscriptionEnd.getMonth() + months);
    await updateDoc(suscriptionRef, {
      status: SubscriptionStatus.ACTIVE,
      suscriptionStart: Timestamp.fromDate(suscriptionStart),
      suscriptionEnd: Timestamp.fromDate(subscriptionEnd),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error updating suscription duration:", error);
    throw error;
  }
};

export const updateSuscriptionExpired = async (suscriptionId: string) => {
  try {
    const suscriptionRef = suscriptionRefId(suscriptionId);
    await updateDoc(suscriptionRef, {
      status: SubscriptionStatus.EXPIRED,
      paymentId: null,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error updating suscription expired:", error);
    throw error;
  }
};
