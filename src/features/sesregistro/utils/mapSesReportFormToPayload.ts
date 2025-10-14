// src/features/sesregistro/utils/mapSesReportFormToPayload.ts
// Nota: Solo front. Este archivo mapea el estado del formulario al payload
// esperado por Lynx (CreateReportRequest). Incluye validaciones mínimas.

export type SesTravelerAddress = {
  additionalAddress: string;
  address: string;
  country: string; // ISO3
  municipalityCode: string; // Requerido si país = ESP
  municipalityName: string; // Requerido si país != ESP
  postalCode: string;
};

export type SesTraveler = {
  name: string;
  surname1: string;
  surname2: string;
  email: string;
  phone: string;
  phone2: string;
  birthdate: string; // YYYY-MM-DD (convertiremos a ISO)
  sex: string; // H/M
  nationality: string; // ISO3
  idType: string; // NIF/NIE/PAS/...
  idNum: string;
  idSupport: string; // Soporte documental (si España)
  kinship: string; // Menores
  address: SesTravelerAddress;
  signature: string; // ruta opcional
};

export type SesPayment = {
  cardExpiration: string; // YYYY-MM
  paymentDate: string; // YYYY-MM-DD
  paymentMethodCode: string; // TRANS/...
  paymentMethodHolder: string;
  paymentMethodId: string;
};

export type SesFormState = {
  checkInDate: string; // datetime-local
  checkOutDate: string; // datetime-local
  numPeople: number;
  numRooms: number;
  payment: SesPayment;
  travelers: SesTraveler[];
};

function toIsoDateTime(local: string): string {
  // Acepta 'YYYY-MM-DDTHH:mm' y devuelve ISO con 'Z'
  if (!local) return "";
  const d = new Date(local);
  return d.toISOString();
}

function ensure(value: any, message: string) {
  if (!value && value !== 0) throw new Error(message);
}

export function buildSesPayload(form: SesFormState) {
  // Validaciones mínimas indispensables basadas en Cloudbeds y ejemplo del proveedor
  ensure(form.checkInDate, "Fecha de entrada requerida");
  ensure(form.checkOutDate, "Fecha de salida requerida");
  ensure(form.numPeople, "Número de personas requerido");
  ensure(form.numRooms, "Número de habitaciones requerido");
  ensure(form.travelers?.length, "Debe incluir al menos un viajero");

  const t = form.travelers[0];
  ensure(t.name, "Nombre del viajero requerido");
  ensure(t.surname1, "Primer apellido requerido");
  ensure(t.birthdate, "Fecha de nacimiento requerida");
  ensure(t.address.address, "Dirección requerida");
  ensure(t.address.country, "País requerido");
  ensure(t.address.postalCode, "Código postal requerido");

  // Reglas SES (resumen):
  // - Si país = ESP => municipioCode requerido
  // - Si país != ESP => municipioName (ciudad) requerido
  if (t.address.country === "ESP") {
    ensure(t.address.municipalityCode, "Código de municipio (SES) requerido para España");
  } else {
    ensure(t.address.municipalityName, "Ciudad requerida si país no es España");
  }

  // Adultos: tipo doc, número doc, país emisor (no modelado aquí; idType/idNum obligatorios)
  if (t.idType || t.idNum) {
    ensure(t.idType, "Tipo de documento requerido para adultos");
    ensure(t.idNum, "Número de documento requerido para adultos");
  }

  // Normalización de fechas a ISO
  const checkInDateIso = toIsoDateTime(form.checkInDate);
  const checkOutDateIso = toIsoDateTime(form.checkOutDate);
  const birthIso = t.birthdate ? new Date(t.birthdate).toISOString() : "";

  const payload = {
    checkInDate: checkInDateIso,
    checkOutDate: checkOutDateIso,
    numPeople: form.numPeople,
    numRooms: form.numRooms,
    payment: {
      cardExpiration: form.payment.cardExpiration || "",
      paymentDate: form.payment.paymentDate || "",
      paymentMethodCode: form.payment.paymentMethodCode || "",
      paymentMethodHolder: form.payment.paymentMethodHolder || "",
      paymentMethodId: form.payment.paymentMethodId || "",
    },
    travelers: [
      {
        address: {
          additionalAddress: t.address.additionalAddress || "",
          address: t.address.address,
          country: t.address.country,
          municipalityCode: t.address.municipalityCode || "",
          municipalityName: t.address.municipalityName || "",
          postalCode: t.address.postalCode,
        },
        birthdate: birthIso,
        email: t.email || "",
        idNum: t.idNum || "",
        idSupport: t.idSupport || "",
        idType: t.idType || "",
        kinship: t.kinship || "",
        name: t.name,
        nationality: t.nationality || "",
        phone: t.phone || "",
        phone2: t.phone2 || "",
        sex: t.sex || "",
        signature: t.signature || "",
        surname1: t.surname1,
        surname2: t.surname2 || "",
      },
    ],
  };

  return payload;
}



