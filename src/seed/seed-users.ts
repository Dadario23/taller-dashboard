import { faker } from "@faker-js/faker";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/user";
import Repair from "@/models/repairs";

const seedData = async () => {
  try {
    console.log("🔵 Conectando a MongoDB...");
    await connectDB();
    console.log("✅ MongoDB conectado");

    console.log("🔴 Eliminando datos existentes...");
    await User.deleteMany({});
    await Repair.deleteMany({});
    console.log("✅ Datos eliminados");

    console.log("🟡 Creando usuarios...");
    const users = await User.insertMany(
      Array.from({ length: 20 }, () => ({
        fullname: faker.person.fullName(),
        email: faker.internet.email(),
        whatsapp: faker.phone.number("+54 11 ### ####"),
        role: faker.helpers.arrayElement([
          "superadmin",
          "admin",
          "technician",
          "reception",
        ]),
      }))
    );

    console.log("🟡 Creando reparaciones...");
    let repairCounter = 1000;
    let allRepairs = [];

    const deviceTypes = {
      Celular: [
        { brand: "Samsung", model: "Galaxy S21" },
        { brand: "Apple", model: "iPhone 13" },
      ],
      Computadora: [
        { brand: "Dell", model: "XPS 15" },
        { brand: "Apple", model: "MacBook Pro M1" },
      ],
      Tablet: [
        { brand: "Samsung", model: "Galaxy Tab S7" },
        { brand: "Apple", model: "iPad Air 4" },
      ],
      Consola: [
        { brand: "Sony", model: "PlayStation 5" },
        { brand: "Microsoft", model: "Xbox Series X" },
      ],
    };

    const validReceivers = users.filter((u) =>
      ["admin", "superadmin", "reception"].includes(u.role)
    );
    if (validReceivers.length === 0) {
      throw new Error(
        "❌ Error: Se necesita al menos un usuario con rol válido para recibir las reparaciones."
      );
    }

    const technicians = users.filter((u) => u.role === "technician");
    if (technicians.length === 0) {
      throw new Error("❌ Error: No hay técnicos disponibles.");
    }

    for (const customer of validReceivers) {
      const repairs = Array.from(
        { length: faker.number.int({ min: 1, max: 4 }) },
        () => {
          repairCounter++;
          const technician = faker.helpers.arrayElement(technicians);
          const receivedBy = faker.helpers.arrayElement(validReceivers);
          const createdAt = faker.date.recent({ days: 60 });

          // Variar prioridades
          const priority = faker.helpers.arrayElement([
            "Normal",
            "Alta",
            "Urgente",
          ]); // ✅ Solo valores válidos

          // Estados de reparación posibles
          const possibleStatuses = [
            "Ingresado",
            "En Revisión",
            "Esperando Repuesto",
            "Reparación en Progreso",
            "Reparación Finalizada",
            "Reparación Cancelada por el Cliente",
          ];
          let status = faker.helpers.arrayElement(
            possibleStatuses.filter((s) => s !== "Reparación Finalizada")
          ); // No todas serán finalizadas

          let timeline = [];

          const deviceType = faker.helpers.objectKey(
            deviceTypes
          ) as keyof typeof deviceTypes;
          const { brand, model } = faker.helpers.arrayElement(
            deviceTypes[deviceType]
          );

          const problemDescription = faker.helpers.arrayElement([
            "Pantalla rota",
            "No enciende",
            "Error de software",
          ]);

          const device = {
            type: deviceType,
            brand,
            model,
            serialNumber: faker.string.alphanumeric(10),
            physicalCondition: faker.helpers.arrayElement([
              "Pantalla agrietada",
              "Batería inflada",
              "Sin daños físicos",
            ]),
            problemDescription,
          };

          timeline.push({
            status: "Ingresado",
            timestamp: createdAt,
            note: "Reparación creada automáticamente.",
            changedBy: receivedBy._id,
            roleAtChange: receivedBy.role,
          });

          const reviewTimestamp = faker.date.soon({
            days: 1,
            refDate: createdAt,
          });
          timeline.push({
            status: "En Revisión",
            timestamp: reviewTimestamp,
            note: `Técnico ${technician.fullname} ha tomado la reparación.`,
            changedBy: technician._id,
            roleAtChange: "technician",
          });

          let totalCost = 0;
          const diagnosticTimestamp = faker.date.soon({
            days: 1,
            refDate: reviewTimestamp,
          });

          timeline.push({
            status: "Equipo Diagnosticado",
            timestamp: diagnosticTimestamp,
            note: "Diagnóstico completado.",
            changedBy: technician._id,
            roleAtChange: "technician",
          });

          if (
            status === "Esperando Repuesto" ||
            status === "Reparación en Progreso"
          ) {
            totalCost = parseFloat(faker.finance.amount(50, 500, 2));
            timeline.push({
              status,
              timestamp: faker.date.soon({
                days: 2,
                refDate: diagnosticTimestamp,
              }),
              note: "Reparación en curso.",
              changedBy: technician._id,
              roleAtChange: "technician",
            });
          }

          let warranty = faker.datatype.boolean();
          let warrantyPeriod = warranty
            ? faker.helpers.arrayElement([30, 60, 90])
            : 0;
          let warrantyExpiresAt = new Date(diagnosticTimestamp);
          warrantyExpiresAt.setDate(
            warrantyExpiresAt.getDate() + warrantyPeriod
          );

          let remainingWarrantyDays = warranty
            ? Math.max(
                0,
                Math.ceil(
                  (warrantyExpiresAt.getTime() - Date.now()) /
                    (1000 * 60 * 60 * 24)
                )
              )
            : 0;

          let customerNotifications = [
            {
              message: "Su equipo está en proceso de reparación.",
              sentAt: new Date(diagnosticTimestamp.getTime() + 10 * 60000),
              method: "whatsapp",
            },
          ];

          let attachments = [
            {
              url: faker.image.url(),
              description: "Foto del equipo antes de la reparación",
              uploadedAt: createdAt,
            },
          ];

          let usedParts =
            problemDescription === "Error de software"
              ? []
              : [
                  {
                    partName: "Pantalla OLED",
                    partCost: 150,
                    partSupplier: "TechParts Inc.",
                  },
                ];

          return {
            repairCode: `TASK-${repairCounter}`,
            title: problemDescription,
            status,
            priority,
            device,
            customerId: customer._id,
            technicianId: technician._id,
            receivedBy: receivedBy._id,
            repairVerifiedBy: technician._id,
            estimatedCompletion:
              status !== "Reparación Cancelada por el Cliente"
                ? faker.date.future()
                : null,
            warranty,
            warrantyPeriod,
            warrantyExpiresAt,
            remainingWarrantyDays,
            timeline,
            attachments,
            customerNotifications,
            usedParts,
            totalCost,
            technicianNotes: faker.lorem.sentence(),
            internalNotes: faker.lorem.sentence(),
            createdAt,
            updatedAt: timeline[timeline.length - 1].timestamp,
            totalProcessingTimeHours: faker.number.int({ min: 1, max: 48 }),
          };
        }
      );

      allRepairs.push(...(await Repair.insertMany(repairs)));
    }

    console.log(`✅ Reparaciones generadas: ${allRepairs.length}`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
};

seedData();
