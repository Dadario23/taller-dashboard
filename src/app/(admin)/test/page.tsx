"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react"; // ✅ Importamos useSession para obtener el usuario autenticado

export default function NewRepair() {
  const { data: session } = useSession(); // ✅ Obtener usuario autenticado

  //console.log("SESSION", session);
  const [userId, setUserId] = useState<string | null>(null); // ✅ Guardamos el ID de MongoDB
  const [customers, setCustomers] = useState([]);
  const [formData, setFormData] = useState({
    customerId: "",
    title: "",
    device: {
      type: "",
      brand: "",
      model: "",
      physicalCondition: "",
      flaw: "",
    },
    diagnosis: "",
    priority: "Normal",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // Diagnósticos iniciales estáticos
  const diagnoses = [
    "Parlante dañado",
    "Pin de carga dañado",
    "Dado de baja",
    "Cuenta olvidada",
    "Pantalla dañada",
    "Batería dañada",
    "Diagnosticar por el tecnico",
  ];

  useEffect(() => {
    fetch(`http://localhost:3000/api/users`)
      .then((res) => res.json())
      .then((data) => setCustomers(data))
      .catch((err) => console.error("Error al cargar clientes", err));
  }, []);

  // 🔹 Obtener el ID del usuario desde MongoDB usando su email de la sesión
  useEffect(() => {
    if (!session?.user?.email) return;

    fetch(`/api/users/get-by-email?email=${session.user.email}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.userId) {
          setUserId(data.userId); // ✅ Guardamos el ID de MongoDB en el estado
        } else {
          console.error("No se pudo obtener el ID del usuario.");
        }
      })
      .catch((err) => console.error("Error al obtener el ID del usuario", err));
  }, [session?.user?.email]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    if (
      ["type", "brand", "model", "physicalCondition", "flaw"].includes(name)
    ) {
      setFormData((prev) => ({
        ...prev,
        device: {
          ...prev.device,
          [name]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    if (!userId) {
      setError("No se ha podido obtener el usuario autenticado.");
      setLoading(false);
      return;
    }

    if (
      !formData.customerId ||
      !formData.title ||
      !formData.device.type ||
      !formData.device.flaw ||
      !formData.diagnosis
    ) {
      setError("Todos los campos requeridos deben completarse.");
      setLoading(false);
      return;
    }

    const repairData = {
      ...formData,
      receivedBy: userId, // ✅ Enviamos el ID obtenido de MongoDB
      status: "Ingresado",
    };

    try {
      const response = await fetch("http://localhost:3000/api/repairs/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(repairData),
      });

      if (!response.ok) throw new Error("Error al crear la reparación.");

      setSuccess(true);
      setFormData({
        customerId: "",
        title: "",
        device: {
          type: "",
          brand: "",
          model: "",
          physicalCondition: "",
          flaw: "",
        },
        diagnosis: "",
        priority: "Normal",
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-gray-800 p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-center mb-4">
          Nueva Reparación
        </h2>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        {success && (
          <p className="text-green-500 text-sm mb-4">
            ✅ Reparación creada con éxito.
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Cliente */}
          <select
            name="customerId"
            value={formData.customerId}
            onChange={handleChange}
            required
            className="w-full p-3 bg-gray-700 rounded"
          >
            <option value="">Selecciona un cliente</option>
            {customers.map((user) => (
              <option key={user._id} value={user._id}>
                {user.fullname} - {user.email}
              </option>
            ))}
          </select>

          {/* Título del problema */}
          <input
            type="text"
            name="title"
            placeholder="Título del problema"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full p-3 bg-gray-700 rounded"
          />

          {/* Tipo de dispositivo */}
          <select
            name="type"
            value={formData.device.type}
            onChange={handleChange}
            required
            className="w-full p-3 bg-gray-700 rounded"
          >
            <option value="">Selecciona un tipo de dispositivo</option>
            <option value="Celular">Celular</option>
            <option value="Computadora">Computadora</option>
            <option value="Tablet">Tablet</option>
            <option value="Consola">Consola</option>
          </select>

          {/* Marca */}
          <input
            type="text"
            name="brand"
            placeholder="Marca"
            value={formData.device.brand}
            onChange={handleChange}
            required
            className="w-full p-3 bg-gray-700 rounded"
          />

          {/* Modelo */}
          <input
            type="text"
            name="model"
            placeholder="Modelo"
            value={formData.device.model}
            onChange={handleChange}
            required
            className="w-full p-3 bg-gray-700 rounded"
          />

          {/* Descripción del problema */}
          <textarea
            name="flaw"
            placeholder="Descripción del problema"
            value={formData.device.flaw}
            onChange={handleChange}
            required
            className="w-full p-3 bg-gray-700 rounded"
          ></textarea>

          {/* Diagnóstico inicial */}
          <label className="block text-gray-300">Diagnóstico inicial</label>
          <select
            name="diagnosis"
            value={formData.diagnosis}
            onChange={handleChange}
            required
            className="w-full p-3 bg-gray-700 rounded"
          >
            <option value="">Selecciona un diagnóstico</option>
            {diagnoses.map((diagnosis) => (
              <option key={diagnosis} value={diagnosis}>
                {diagnosis}
              </option>
            ))}
          </select>

          {/* Botón de enviar */}
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded"
            disabled={loading}
          >
            {loading ? "Enviando..." : "Crear Reparación"}
          </button>
        </form>
      </div>
    </div>
  );
}
