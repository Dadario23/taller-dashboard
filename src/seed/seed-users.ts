import { faker } from "@faker-js/faker";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/user";
import Repair from "@/models/repairs";

const seedData = async () => {
  try {
    await connectDB();
    console.log("MongoDB connected");

    // Eliminar datos existentes
    await User.deleteMany({});
    await Repair.deleteMany({});
    console.log("Usuarios y reparaciones existentes eliminados");

    // Crear usuarios
    const users = await User.insertMany(
      Array.from({ length: 20 }, () => {
        const firstName = faker.person.firstName();
        const lastName = faker.person.lastName();
        return {
          fullname: `${firstName} ${lastName}`,
          email: faker.internet.email({ firstName }).toLowerCase(),
          whatsapp: faker.phone.number("+54 11 ### ####"),
          status: faker.helpers.arrayElement([
            "active",
            "inactive",
            "invited",
            "suspended",
          ]),
          role: faker.helpers.arrayElement([
            "superadmin",
            "admin",
            "technician",
            "reception",
            "user",
          ]),
          createdAt: faker.date.past(),
          updatedAt: faker.date.recent(),
        };
      })
    );

    console.log("Usuarios generados exitosamente:", users);

    // Crear reparaciones para cada usuario
    const allRepairs = [];
    const technicians = users.filter((user) => user.role === "technician");

    for (const user of users) {
      const numberOfRepairs = faker.number.int({ min: 1, max: 5 });

      const repairs = Array.from({ length: numberOfRepairs }, () => {
        const repairCode = `TASK-${faker.number.int({ min: 1000, max: 9999 })}`;
        const status = faker.helpers.arrayElement([
          "Pending",
          "Under Review",
          "In Progress",
          "Ready for Pickup",
          "Delivered",
          "Cancelled",
          "Not Repairable",
          "Waiting for Customer Approval",
        ]);

        // Seleccionar un técnico aleatorio para los cambios de estado
        const changedBy = faker.helpers.arrayElement(technicians)._id;

        return {
          repairCode,
          title: faker.commerce.productName(),
          status,
          priority: faker.helpers.arrayElement(["Low", "Medium", "High"]),
          label: faker.helpers.arrayElement([
            "bug",
            "feature",
            "documentation",
          ]), // Nuevo campo label
          customerId: user._id,
          device: {
            type: faker.helpers.arrayElement([
              "Celular",
              "Computadora",
              "Tablet",
              "Consola",
            ]),
            brand: faker.company.name(),
            model: faker.commerce.productName(),
            serialNumber: faker.string.alphanumeric(10),
            physicalCondition: faker.helpers.arrayElement([
              "Rayones leves",
              "Pantalla rota",
              "Sin daños visibles",
              "Carcasa dañada",
            ]),
            problemDescription: faker.lorem.sentence(),
            passwordOrPattern: faker.helpers.maybe(
              () => faker.internet.password(),
              { probability: 0.5 }
            ),
          },
          timeline: [
            {
              status: "Pending",
              timestamp: faker.date.past(),
              note: "Dispositivo ingresado al taller",
              changedBy,
            },
            ...(status === "In Progress"
              ? [
                  {
                    status: "In Progress",
                    timestamp: faker.date.recent(),
                    note: "Reparación en curso",
                    changedBy,
                  },
                ]
              : []),
            ...(status === "Ready for Pickup"
              ? [
                  {
                    status: "Ready for Pickup",
                    timestamp: faker.date.recent(),
                    note: "Reparación completada y lista para entrega",
                    changedBy,
                  },
                ]
              : []),
          ],
        };
      });

      const insertedRepairs = await Repair.insertMany(repairs);
      allRepairs.push(...insertedRepairs);
    }

    console.log(`Reparaciones generadas exitosamente: ${allRepairs.length}`);
  } catch (error) {
    console.error("Error al generar datos:", error);
  }
};

seedData();
