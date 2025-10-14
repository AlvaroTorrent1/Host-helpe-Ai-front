// src/features/sesregistro/components/SesReportForm.tsx
import React, { useState } from "react";
import Button from "@/components/ui/Button";
import { buildSesPayload, SesFormState } from "../utils/mapSesReportFormToPayload";

const initialForm: SesFormState = {
  checkInDate: "",
  checkOutDate: "",
  numPeople: 1,
  numRooms: 1,
  payment: {
    paymentMethodCode: "TRANS",
    paymentMethodHolder: "",
    paymentMethodId: "",
    paymentDate: "",
    cardExpiration: "",
  },
  travelers: [
    {
      name: "",
      surname1: "",
      surname2: "",
      email: "",
      phone: "",
      phone2: "",
      birthdate: "",
      sex: "",
      nationality: "",
      idType: "",
      idNum: "",
      idSupport: "",
      kinship: "",
      address: {
        address: "",
        additionalAddress: "",
        country: "",
        municipalityCode: "",
        municipalityName: "",
        postalCode: "",
      },
      signature: "",
    },
  ],
};

const SesReportForm: React.FC = () => {
  const [form, setForm] = useState<SesFormState>(initialForm);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleChange = (
    path: string,
    value: string | number
  ) => {
    setForm((prev) => {
      const copy: any = structuredClone(prev);
      const parts = path.split(".");
      let current: any = copy;
      for (let i = 0; i < parts.length - 1; i++) {
        const key = parts[i];
        if (!(key in current)) current[key] = {};
        current = current[key];
      }
      current[parts[parts.length - 1]] = value;
      return copy;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    try {
      const payload = buildSesPayload(form);
      // Simulación de envío (solo front). Mostrar en consola.
      console.log("SES payload", payload);
      setSuccess("Datos validados y preparados correctamente (simulado)");
    } catch (err: any) {
      setError(err?.message || "Error validando datos");
    }
  };

  const first = form.travelers[0];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Estancia */}
      <section>
        <h2 className="text-lg font-semibold mb-3">Estancia</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Entrada</label>
            <input
              type="datetime-local"
              className="input"
              value={form.checkInDate}
              onChange={(e) => handleChange("checkInDate", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Salida</label>
            <input
              type="datetime-local"
              className="input"
              value={form.checkOutDate}
              onChange={(e) => handleChange("checkOutDate", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Personas</label>
            <input
              type="number"
              min={1}
              className="input"
              value={form.numPeople}
              onChange={(e) => handleChange("numPeople", Number(e.target.value))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Habitaciones</label>
            <input
              type="number"
              min={1}
              className="input"
              value={form.numRooms}
              onChange={(e) => handleChange("numRooms", Number(e.target.value))}
            />
          </div>
        </div>
      </section>

      {/* Pago */}
      <section>
        <h2 className="text-lg font-semibold mb-3">Pago</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Método (código)</label>
            <input
              type="text"
              className="input"
              value={form.payment.paymentMethodCode}
              onChange={(e) => handleChange("payment.paymentMethodCode", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Titular</label>
            <input
              type="text"
              className="input"
              value={form.payment.paymentMethodHolder}
              onChange={(e) => handleChange("payment.paymentMethodHolder", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Identificador</label>
            <input
              type="text"
              className="input"
              value={form.payment.paymentMethodId}
              onChange={(e) => handleChange("payment.paymentMethodId", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de pago</label>
            <input
              type="date"
              className="input"
              value={form.payment.paymentDate}
              onChange={(e) => handleChange("payment.paymentDate", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Expiración tarjeta</label>
            <input
              type="month"
              className="input"
              value={form.payment.cardExpiration}
              onChange={(e) => handleChange("payment.cardExpiration", e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* Viajero principal */}
      <section>
        <h2 className="text-lg font-semibold mb-3">Viajero</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
            <input
              type="text"
              className="input"
              value={first.name}
              onChange={(e) => handleChange("travelers.0.name", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Apellido 1</label>
            <input
              type="text"
              className="input"
              value={first.surname1}
              onChange={(e) => handleChange("travelers.0.surname1", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Apellido 2</label>
            <input
              type="text"
              className="input"
              value={first.surname2}
              onChange={(e) => handleChange("travelers.0.surname2", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              className="input"
              value={first.email}
              onChange={(e) => handleChange("travelers.0.email", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
            <input
              type="tel"
              className="input"
              value={first.phone}
              onChange={(e) => handleChange("travelers.0.phone", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono 2</label>
            <input
              type="tel"
              className="input"
              value={first.phone2}
              onChange={(e) => handleChange("travelers.0.phone2", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Nacimiento</label>
            <input
              type="date"
              className="input"
              value={first.birthdate}
              onChange={(e) => handleChange("travelers.0.birthdate", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sexo (H/M)</label>
            <input
              type="text"
              className="input"
              value={first.sex}
              onChange={(e) => handleChange("travelers.0.sex", e.target.value)}
              placeholder="H o M"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nacionalidad (ISO3)</label>
            <input
              type="text"
              className="input"
              value={first.nationality}
              onChange={(e) => handleChange("travelers.0.nationality", e.target.value)}
              placeholder="ESP, FRA, USA..."
            />
          </div>
          <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo Doc (NIF/NIE/PAS...)</label>
              <input
                type="text"
                className="input"
                value={first.idType}
                onChange={(e) => handleChange("travelers.0.idType", e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Número Doc</label>
              <input
                type="text"
                className="input"
                value={first.idNum}
                onChange={(e) => handleChange("travelers.0.idNum", e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Soporte Doc (solo España)</label>
              <input
                type="text"
                className="input"
                value={first.idSupport}
                onChange={(e) => handleChange("travelers.0.idSupport", e.target.value)}
                placeholder="p.ej. CHC123456"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Parentesco (menores)</label>
              <input
                type="text"
                className="input"
                value={first.kinship}
                onChange={(e) => handleChange("travelers.0.kinship", e.target.value)}
                placeholder="AB (ejemplo)"
              />
            </div>
          </div>

          {/* Dirección */}
          <div className="sm:col-span-2">
            <h3 className="text-md font-medium mb-2">Dirección</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Calle y número</label>
                <input
                  type="text"
                  className="input"
                  value={first.address.address}
                  onChange={(e) => handleChange("travelers.0.address.address", e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Info adicional</label>
                <input
                  type="text"
                  className="input"
                  value={first.address.additionalAddress}
                  onChange={(e) => handleChange("travelers.0.address.additionalAddress", e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">País (ISO3)</label>
                <input
                  type="text"
                  className="input"
                  value={first.address.country}
                  onChange={(e) => handleChange("travelers.0.address.country", e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Municipio (código SES)</label>
                <input
                  type="text"
                  className="input"
                  value={first.address.municipalityCode}
                  onChange={(e) => handleChange("travelers.0.address.municipalityCode", e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-1">Requiere código exacto cuando país = España.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Municipio (nombre)</label>
                <input
                  type="text"
                  className="input"
                  value={first.address.municipalityName}
                  onChange={(e) => handleChange("travelers.0.address.municipalityName", e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Código Postal</label>
                <input
                  type="text"
                  className="input"
                  value={first.address.postalCode}
                  onChange={(e) => handleChange("travelers.0.address.postalCode", e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Firma (placeholder) */}
      <section>
        <h2 className="text-lg font-semibold mb-3">Firma</h2>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ruta firma (opcional)</label>
            <input
              type="text"
              className="input"
              value={first.signature}
              onChange={(e) => handleChange("travelers.0.signature", e.target.value)}
              placeholder="account/123/lodging/.../signature-x"
            />
          </div>
        </div>
      </section>

      {error && (
        <div className="text-sm text-red-600">{error}</div>
      )}
      {success && (
        <div className="text-sm text-green-600">{success}</div>
      )}

      <div className="pt-2">
        <Button type="submit" variant="primary" size="md">
          Preparar parte (simular)
        </Button>
      </div>
    </form>
  );
};

export default SesReportForm;



