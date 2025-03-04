export interface RepairData {
  title: string;
  customer: string;
  receivedBy: string;
  device: {
    type: string;
    brand: string;
    model: string;
    physicalCondition: string;
    flaw: string;
    notes: string;
  };
  priority: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;
/**
 * Obtiene el ID del usuario autenticado a partir del email.
 */
export const getUserIdByEmail = async (email: string) => {
  try {
    const res = await fetch(`/api/users/get-by-email?email=${email}`);
    if (!res.ok) throw new Error("No se pudo obtener el usuario");
    const data = await res.json();
    return data.userId || null;
  } catch (error) {
    console.error("Error al obtener el usuario:", error);
    return null;
  }
};

/**
 * Obtiene la lista de clientes.
 */
export const getCustomers = async () => {
  try {
    const res = await fetch(`${API_URL}/api/users`);
    if (!res.ok) throw new Error("Error al obtener clientes");
    const data = await res.json();
    return data.sort((a: { fullname: string }, b: { fullname: string }) =>
      a.fullname.localeCompare(b.fullname)
    );
  } catch (error) {
    console.error("Error al obtener clientes:", error);
    return [];
  }
};

/**
 * Crea una nueva reparación y devuelve la URL del PDF generado.
 */
export const createRepair = async (repairData: RepairData) => {
  try {
    const response = await fetch("http://localhost:3000/api/repairs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(repairData),
    });

    if (!response.ok) throw new Error("Error al crear la reparación");

    const pdfBlob = await response.blob();
    return URL.createObjectURL(pdfBlob);
  } catch (error) {
    console.error("Error al crear la reparación:", error);
    return null;
  }
};

/**
 * Obtiene la URL del PDF de un ticket de reparación por código.
 */
export const getTicketPdf = async (repairCode: string) => {
  try {
    const response = await fetch(`/api/tickets?repairId=${repairCode}`);
    if (!response.ok) throw new Error("Error al obtener el ticket");
    const pdfBlob = await response.blob();
    return URL.createObjectURL(pdfBlob);
  } catch (error) {
    console.error("Error al obtener el ticket:", error);
    return null;
  }
};
