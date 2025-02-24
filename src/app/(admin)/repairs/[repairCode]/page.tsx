"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { format } from "date-fns";
import { es } from "date-fns/locale"; // Para formato en español

// Función para formatear fechas de manera consistente
const formatDate = (dateString: string) => {
  if (!dateString) return "Fecha no disponible";
  return format(new Date(dateString), "dd/MM/yyyy HH:mm:ss", { locale: es });
};

interface Repair {
  _id: string;
  repairCode: string;
  title: string;
  status: string;
  priority: string;
  requiresCustomerApproval: boolean;
  receivedBy: string;
  repairVerifiedBy: string;
  estimatedCompletion: string;
  warranty: boolean;
  warrantyPeriod: number;
  totalCost: number;
  technicianNotes?: string;
  internalNotes?: string;
  createdAt: string;
  updatedAt: string;

  customerId: {
    _id: string;
    fullname: string;
    email: string;
  };

  technician?: {
    _id: string;
    fullname: string;
  } | null;

  device: {
    type: string;
    brand: string;
    model: string;
    serialNumber: string;
    physicalCondition: string;
    flaw: string;
    passwordOrPattern?: string | null;
  };

  timeline: {
    status: string;
    timestamp: string;
    note: string;
    changedBy: string;
    roleAtChange: string;
    _id: string;
  }[];

  attachments: {
    url: string;
    description: string;
    uploadedAt: string;
    _id: string;
  }[];

  customerNotifications: {
    message: string;
    sentAt: string;
    method: string;
    _id: string;
  }[];

  usedParts: {
    partName: string;
    partCost: number;
    partSupplier: string;
    _id: string;
  }[];
}

export default function RepairDetailPage() {
  const params = useParams();
  const repairCode = params?.repairCode as string | undefined;
  const [repair, setRepair] = useState<Repair | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!repairCode) {
      setError("Código de reparación no encontrado en la URL");
      setLoading(false);
      return;
    }

    async function fetchRepair() {
      try {
        console.log("CODIGO DE REPARACION:", repairCode);
        const res = await fetch(`/api/repairs/${repairCode}`);
        if (!res.ok) throw new Error("Reparación no encontrada");
        const data: Repair = await res.json();
        setRepair(data);
        console.log("Datos de la reparación:", data);
      } catch (err) {
        setError("Error al obtener los datos de la reparación");
      } finally {
        setLoading(false);
      }
    }

    fetchRepair();
  }, [repairCode]);

  if (loading) return <p className="text-center text-gray-500">Cargando...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;
  if (!repair)
    return (
      <p className="text-center text-gray-500">No se encontraron detalles.</p>
    );

  return (
    <div className="max-w-4xl mx-auto mt-8 p-6 bg-gray-900 shadow-lg rounded-md text-white">
      <h1 className="text-2xl font-bold mb-4">{repair.title}</h1>
      <p className="text-sm text-gray-400 mb-4">
        Código de reparación:{" "}
        <span className="font-mono text-gray-300">{repair.repairCode}</span>
      </p>

      <div className="grid grid-cols-2 gap-4">
        {/* Información del Cliente */}
        <div>
          <h2 className="font-semibold text-gray-300">
            Información del Cliente
          </h2>
          {repair.customerId ? (
            <>
              <p>Nombre: {repair.customerId.fullname}</p>
              <p>Email: {repair.customerId.email}</p>
            </>
          ) : (
            <p className="text-gray-400">Información no disponible</p>
          )}
        </div>

        {/* Estado de la Reparación */}
        <div>
          <h2 className="font-semibold text-gray-300">
            Estado de la Reparación
          </h2>
          <p>
            Estado: <span className="font-bold">{repair.status}</span>
          </p>
          <p>
            Prioridad: <span className="font-bold">{repair.priority}</span>
          </p>
          <p>
            Estimación de Finalización:{" "}
            <span className="font-bold">
              {formatDate(repair.estimatedCompletion)}
            </span>
          </p>
        </div>

        {/* Información del Técnico */}
        {repair.technician && (
          <div>
            <h2 className="font-semibold text-gray-300">Técnico Asignado</h2>
            <p>Nombre: {repair.technician.fullname}</p>
          </div>
        )}

        {/* Información del Dispositivo */}
        <div className="col-span-2">
          <h2 className="font-semibold text-gray-300">Dispositivo</h2>
          <p>Tipo: {repair.device.type}</p>
          <p>Marca: {repair.device.brand}</p>
          <p>Modelo: {repair.device.model}</p>
          <p>Serie: {repair.device.serialNumber}</p>
          <p>Condición física: {repair.device.physicalCondition}</p>
          <p>Descripción del problema: {repair.device.flaw}</p>
        </div>

        {/* Garantía */}
        <div>
          <h2 className="font-semibold text-gray-300">Garantía</h2>
          <p>{repair.warranty ? "Sí" : "No"}</p>
          <p>Duración: {repair.warrantyPeriod} días</p>
        </div>

        {/* Línea de Tiempo */}
        <div className="col-span-2">
          <h2 className="font-semibold text-gray-300">Línea de Tiempo</h2>
          <ul className="border-l-4 border-gray-700 pl-4">
            {repair.timeline.map((event) => (
              <li key={event._id} className="mb-2">
                <p className="text-sm text-gray-300">
                  <strong>[{formatDate(event.timestamp)}]</strong> -{" "}
                  {event.status} ({event.roleAtChange})
                </p>
                <p className="text-gray-400">{event.note}</p>
              </li>
            ))}
          </ul>
        </div>

        {/* Notificaciones al Cliente */}
        <div className="col-span-2">
          <h2 className="font-semibold text-gray-300">
            Notificaciones al Cliente
          </h2>
          {repair.customerNotifications.length > 0 ? (
            <ul>
              {repair.customerNotifications.map((notif) => (
                <li key={notif._id}>
                  [{formatDate(notif.sentAt)}] {notif.message} vía{" "}
                  {notif.method}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400">No hay notificaciones</p>
          )}
        </div>
      </div>
    </div>
  );
}
