"use client"
import { checkPayment, createPaymentLink, updateSuscriptionDuration, updateSuscriptionExpired } from "@/actions/libellula";
import SideBarAdmin from "@/components/Bars/sideBarAdmin";
import SideBarDoctor from "@/components/Bars/sideBarDoctor";
import { Payment, paymentRefId, Plans, Roles, SubscriptionStatus, suscriptionRefId } from "@/utils/const";
import { useAuth } from "@/utils/context/authContext";
import { Button, Modal } from "@heroui/react";
import { getDoc, serverTimestamp, Timestamp, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { v4 as uuidV4 } from 'uuid'

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, suscription, LoadData } = useAuth()
    const [qr, setQr] = useState<string>()
    console.log("suscription", suscription)

    useEffect(() => {
        console.log("QR", qr)
    }, [qr])


    useEffect(() => {
        if (!suscription) return
        if (suscription.status === SubscriptionStatus.INACTIVE ||
            (suscription.status === SubscriptionStatus.EXPIRED && suscription.paymentId)
        ) {
            onCheckPayment()
            return
        }
        if (suscription.status === SubscriptionStatus.EXPIRED && !suscription.paymentId) {
            console.log("creando nuevo link de pago")
            createNewPayment()
            return
        }
        if (suscription.suscriptionEnd.toMillis() < Timestamp.now().toMillis() && suscription.status === SubscriptionStatus.ACTIVE) {
            console.log("suscripcion expirada")
            updateSuscriptionExpired(suscription.uid)
        }
    }, [suscription])
    const onCheckPayment = async () => {
        if (!suscription || !user) return
        try {
            if (suscription.paymentId) {
                const payment = await getDoc(paymentRefId(suscription.paymentId))
                if (!payment.exists()) {
                    await createNewPayment()
                    return
                }
                const paymentData = await checkPayment(payment.id)
                console.log("paymentData", paymentData)
                if (paymentData.datos.pagado) {
                    await updateSuscriptionDuration(suscription.uid, 1)
                }
                else if (paymentData.datos.deuda_expirada) {
                    await createNewPayment()
                }
                else {
                    const data: Payment = payment.data() as Payment
                    console.log("data", data)
                    setQr(data.paymentUrl)
                }
            }
            else {
                await createNewPayment()
            }
        }
        catch (error) {
            console.log("error", error)
        }
    }

    const createNewPayment = async () => {
        if (!user || !suscription) return
        const paymentId = uuidV4()
        const response: Payment = await createPaymentLink({
            email_cliente: user.email!,
            identificador: paymentId,
            descripcion: 'Pago suscripcion',
            lineas_detalle_deuda: [
                {
                    concepto: suscription.plan === Plans.INDIVIDUAL ? "Plan individual" : "Plan equipo",
                    cantidad: 1,
                    costo_unitario: Plans.INDIVIDUAL ? 0.1 : 0.15,
                    descuento_unitario: 0
                }
            ]
        })
        const suscriptionRef = suscriptionRefId(suscription.uid)
        await updateDoc(suscriptionRef, {
            paymentId: paymentId,
            updatedAt: serverTimestamp()
        })
        console.log("RESPONSE", response)
        setQr(response.paymentUrl)
    }
    return (
        <div className="relative flex flex-row h-screen w-screen">
            {suscription?.status === SubscriptionStatus.INACTIVE &&
                <Modal
                    isOpen>
                    <Modal.Backdrop>
                        <Modal.Container>
                            <Modal.Dialog>
                                <Modal.Header>
                                    <div
                                        className="text-center text-xl font-bold">
                                        Ya casi terminamos
                                    </div>
                                </Modal.Header>
                                <Modal.Body>
                                    <div
                                        className="flex flex-col gap-2">
                                        <div
                                            className="text-center">
                                            Para habilitar tu cuenta solo falta realizar el pago<br />
                                            presiona el boton <b>"realizar el pago"</b> y Seras<br />
                                            redirigido a nuestra pasarela de pago<br />
                                            una vez realizado el pago presiona <br />
                                            <b>"Ya realice el pago"</b>
                                        </div>
                                    </div>
                                    {qr &&
                                        <div
                                            className="flex items-center justify-center">
                                            <img
                                                src={qr}
                                                alt="pago qr"
                                                className="w-52 h-52" />
                                        </div>
                                    }
                                </Modal.Body>
                                <Modal.Footer>
                                    <div
                                        className="flex flex-col items-center justify-center gap-2 w-full">
                                        {/* <Button
                                            className={`rounded-xl`}
                                            isDisabled={isLoading}
                                            isPending={isLoading}
                                            onPress={onCheckPayment}>
                                            {({ isPending }) =>
                                                <>
                                                    {isPending && <Spinner className="mr-2" color="current" />}
                                                    Realizar el pago
                                                </>
                                            }
                                        </Button> */}
                                        <Button
                                            className={`rounded-xl`}
                                            onPress={LoadData}>
                                            Ya realice el pago
                                        </Button>
                                    </div>
                                </Modal.Footer>
                            </Modal.Dialog>
                        </Modal.Container>
                    </Modal.Backdrop>
                </Modal>
            }
            {suscription?.status === SubscriptionStatus.EXPIRED &&
                <Modal
                    isOpen>
                    <Modal.Backdrop>
                        <Modal.Container>
                            <Modal.Dialog>
                                <Modal.Header>
                                    <div
                                        className="text-center text-xl font-bold">
                                        Renueva tu suscripcion
                                    </div>
                                </Modal.Header>
                                <Modal.Body>
                                    <div
                                        className="flex flex-col gap-2">
                                        <div
                                            className="text-center">
                                            Tu suscripcion acaba de vencer<br />
                                            si te gusta la pagina porque no renuevas para seguir usandola?<br />
                                            una vez realizado el pago presiona <br />
                                            <b>"Ya realice el pago"</b>
                                        </div>
                                    </div>
                                    {qr &&
                                        <div
                                            className="flex items-center justify-center">
                                            <img
                                                src={qr}
                                                alt="pago qr"
                                                className="w-52 h-52" />
                                        </div>
                                    }
                                </Modal.Body>
                                <Modal.Footer>
                                    <div
                                        className="flex flex-col items-center justify-center gap-2 w-full">
                                        {/* <Button
                                            className={`rounded-xl`}
                                            isDisabled={isLoading}
                                            isPending={isLoading}
                                            onPress={onCheckPayment}>
                                            {({ isPending }) =>
                                                <>
                                                    {isPending && <Spinner className="mr-2" color="current" />}
                                                    Realizar el pago
                                                </>
                                            }
                                        </Button> */}
                                        <Button
                                            className={`rounded-xl`}
                                            onPress={LoadData}>
                                            Ya realice el pago
                                        </Button>
                                    </div>
                                </Modal.Footer>
                            </Modal.Dialog>
                        </Modal.Container>
                    </Modal.Backdrop>
                </Modal>
            }
            {user?.role === Roles.ADMIN &&
                <SideBarAdmin />
            }
            {user?.role === Roles.DOCTOR &&
                <SideBarDoctor />
            }
            <main className="flex-grow w-full h-full flex items-center justify-center bg-[#4fa2a807]">
                <div
                    className="w-full max-w-7xl h-full p-4">
                    {children}
                </div>
            </main>
        </div>
    );
}