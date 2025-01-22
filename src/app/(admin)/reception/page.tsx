"use client";

import { Card } from "@/components/ui/card";
import { useState } from "react";

const ReceptionPage = () => {
  const [formData, setFormData] = useState({
    clientName: "",
    phone: "",
    email: "",
    deviceType: "",
    brand: "",
    model: "",
    serialNumber: "",
    problemDescription: "",
    physicalCondition: "",
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aquí puedes enviar los datos al backend
    console.log("Dispositivo registrado:", formData);
    alert("¡Dispositivo ingresado exitosamente!");
    setFormData({
      clientName: "",
      phone: "",
      email: "",
      deviceType: "",
      brand: "",
      model: "",
      serialNumber: "",
      problemDescription: "",
      physicalCondition: "",
    });
  };

  return (
    <Card>
      <div className="max-w-4xl mx-auto p-6 bg-gray-100 shadow-lg rounded-lg">
        <h1 className="text-2xl font-bold mb-6">Recepción de Dispositivos</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Datos del cliente */}
          <div>
            <label className="block font-medium">Nombre del cliente</label>
            <input
              type="text"
              name="clientName"
              value={formData.clientName}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-medium">Teléfono</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block font-medium">Correo Electrónico</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              />
            </div>
          </div>
          {/* Datos del dispositivo */}
          <div>
            <label className="block font-medium">Tipo de dispositivo</label>
            <select
              name="deviceType"
              value={formData.deviceType}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            >
              <option value="">Seleccione...</option>
              <option value="Celular">Celular</option>
              <option value="Computadora">Computadora</option>
              <option value="Tablet">Tablet</option>
              <option value="Otro">Otro</option>
            </select>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block font-medium">Marca</label>
              <input
                type="text"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block font-medium">Modelo</label>
              <input
                type="text"
                name="model"
                value={formData.model}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block font-medium">Número de serie</label>
              <input
                type="text"
                name="serialNumber"
                value={formData.serialNumber}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              />
            </div>
          </div>
          <div>
            <label className="block font-medium">
              Descripción del problema
            </label>
            <textarea
              name="problemDescription"
              value={formData.problemDescription}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              rows={3}
              required
            />
          </div>
          <div>
            <label className="block font-medium">Estado físico</label>
            <textarea
              name="physicalCondition"
              value={formData.physicalCondition}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              rows={3}
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Ingresar dispositivo
          </button>
        </form>
      </div>
    </Card>
  );
};

export default ReceptionPage;
