export type DeviceType =
  | "Celular"
  | "Tablet"
  | "CPU"
  | "Notebook"
  | "Consola de video juego";
export type Brand = string;
export type Model = string;

export interface DeviceData {
  marcas: Brand[];
  modelos: Record<Brand, Model[]>;
}

export const deviceIssues = {
  Celular: [
    "Diagnosticar por el tecnico",
    "No enciende",
    "Pantalla dañada",
    "Enciende pero no da imagen",
    "No tiene sonido",
    "No carga",
    "No tiene señal",
    "El auricular no funciona",
    "Se reinicia",
    "Imagen congelada",
    "Problema con el táctil",
    "Batería se descarga rápido",
    "Cámara no funciona",
  ],
  Tablet: [
    "Diagnosticar por el tecnico",
    "No enciende",
    "Pantalla táctil no responde",
    "No carga",
    "Se reinicia solo",
  ],
  CPU: [
    "Diagnosticar por el tecnico",
    "No enciende",
    "Pantalla azul",
    "Se calienta demasiado",
    "No detecta el disco duro",
    "Problema con el sistema operativo",
  ],
  Notebook: [
    "Diagnosticar por el tecnico",
    "No enciende",
    "Batería no carga",
    "Pantalla dañada",
    "Teclado no funciona",
  ],
  "Consola de video juego": [
    "Diagnosticar por el tecnico",
    "No enciende",
    "No detecta los controles",
    "No lee los discos",
    "Se congela en el inicio",
  ],
};

export const deviceBrandsAndModels: Record<DeviceType, DeviceData> = {
  Celular: {
    marcas: [
      "Samsung",
      "Apple",
      "Xiaomi",
      "Huawei",
      "Motorola",
      "LG",
      "Sin especificar",
    ],
    modelos: {
      Samsung: [
        "Sin especificar",
        "Galaxy S21",
        "Galaxy S20",
        "Galaxy S10",
        "Galaxy Note 20",
        "Galaxy Note 10",
        "Galaxy A52",
        "Galaxy A72",
        "Galaxy Z Fold 3",
        "Galaxy Z Flip 3",
      ],
      Apple: [
        "Sin especificar",
        "iPhone 13",
        "iPhone 12",
        "iPhone 11",
        "iPhone SE (2020)",
        "iPhone XR",
        "iPhone XS",
        "iPhone X",
        "iPhone 8",
        "iPhone 7",
      ],
      Xiaomi: [
        "Sin especificar",
        "Redmi Note 10",
        "Redmi Note 9",
        "Mi 11",
        "Mi 10",
        "Poco X3",
        "Poco F3",
        "Mi Mix 4",
        "Mi 9T",
      ],
      Huawei: [
        "Sin especificar",
        "P40 Pro",
        "P30 Pro",
        "Mate 40",
        "Mate 30",
        "Nova 7",
        "Nova 5T",
        "Y9 Prime",
        "Y7 Prime",
      ],
      Motorola: [
        "Sin especificar",
        "Moto G Power (2021)",
        "Moto G Stylus (2021)",
        "Moto G100",
        "Moto Edge+",
        "Moto G9 Plus",
        "Moto G8",
        "Moto Z4",
        "Moto X4",
      ],
      LG: [
        "Sin especificar",
        "LG Velvet",
        "LG Wing",
        "LG G8 ThinQ",
        "LG V60 ThinQ",
        "LG G7 ThinQ",
        "LG V50 ThinQ",
        "LG Q70",
        "LG K92",
      ],
      "Sin especificar": [], // No hay modelos si la marca no está especificada
    },
  },
  Tablet: {
    marcas: ["Samsung", "Apple", "Lenovo", "Huawei", "Sin especificar"],
    modelos: {
      Samsung: [
        "Sin especificar",
        "Galaxy Tab S7",
        "Galaxy Tab S6",
        "Galaxy Tab A7",
        "Galaxy Tab S5e",
        "Galaxy Tab A8",
      ],
      Apple: [
        "Sin especificar",
        "iPad Pro (2021)",
        "iPad Air (2020)",
        "iPad Mini (2021)",
        "iPad 9th Gen",
        "iPad 8th Gen",
      ],
      Lenovo: [
        "Sin especificar",
        "Tab P11 Pro",
        "Tab M10 Plus",
        "Tab P11",
        "Tab M8",
        "Tab 4 10",
      ],
      Huawei: [
        "Sin especificar",
        "MatePad Pro",
        "MatePad 11",
        "MediaPad M6",
        "MediaPad T5",
        "MediaPad M5 Lite",
      ],
      "Sin especificar": [], // No hay modelos si la marca no está especificada
    },
  },
  CPU: {
    marcas: ["Dell", "HP", "Lenovo", "Apple", "Sin especificar"],
    modelos: {
      Dell: [
        "Sin especificar",
        "XPS 8950",
        "XPS 8940",
        "Inspiron 3880",
        "Inspiron 3670",
        "Alienware Aurora R10",
      ],
      HP: [
        "Sin especificar",
        "Pavilion Gaming Desktop",
        "OMEN 30L",
        "OMEN 25L",
        "EliteDesk 800 G6",
        "ProDesk 600 G6",
      ],
      Lenovo: [
        "Sin especificar",
        "ThinkCentre M90n",
        "IdeaCentre 5",
        "Legion Tower 5",
        "ThinkStation P340",
        "IdeaCentre G5",
      ],
      Apple: [
        "Sin especificar",
        "Mac mini (M1, 2020)",
        "iMac 24-inch (M1, 2021)",
        "Mac Pro (2019)",
        "iMac 27-inch (2020)",
        "Mac Studio (2022)",
      ],
      "Sin especificar": [], // No hay modelos si la marca no está especificada
    },
  },
  Notebook: {
    marcas: ["Dell", "HP", "Lenovo", "Apple", "Asus", "Sin especificar"],
    modelos: {
      Dell: [
        "Sin especificar",
        "XPS 13 (9310)",
        "XPS 15 (9500)",
        "Inspiron 15 5000",
        "Latitude 7420",
        "Alienware m15 R6",
      ],
      HP: [
        "Sin especificar",
        "Spectre x360 (2021)",
        "Envy 13 (2021)",
        "Pavilion 15",
        "OMEN 15",
        "EliteBook 840 G8",
      ],
      Lenovo: [
        "Sin especificar",
        "ThinkPad X1 Carbon (Gen 9)",
        "Yoga 9i (2021)",
        "IdeaPad 5 Pro",
        "Legion 5 Pro",
        "ThinkBook 14",
      ],
      Apple: [
        "Sin especificar",
        "MacBook Air (M1, 2020)",
        "MacBook Pro 13-inch (M1, 2020)",
        "MacBook Pro 16-inch (2021)",
        "MacBook Pro 14-inch (2021)",
        "MacBook Pro 16-inch (2019)",
      ],
      Asus: [
        "Sin especificar",
        "ZenBook 13 UX325",
        "ROG Zephyrus G14",
        "VivoBook S14",
        "TUF Gaming A15",
        "ExpertBook B9",
      ],
      "Sin especificar": [], // No hay modelos si la marca no está especificada
    },
  },
  "Consola de video juego": {
    marcas: ["Sony", "Microsoft", "Nintendo", "Sin especificar"],
    modelos: {
      Sony: [
        "Sin especificar",
        "PlayStation 5",
        "PlayStation 4 Pro",
        "PlayStation 4 Slim",
        "PlayStation VR",
      ],
      Microsoft: [
        "Sin especificar",
        "Xbox Series X",
        "Xbox Series S",
        "Xbox One X",
        "Xbox One S",
      ],
      Nintendo: [
        "Sin especificar",
        "Switch OLED",
        "Switch (2019)",
        "Switch Lite",
        "Nintendo 3DS XL",
      ],
      "Sin especificar": [], // No hay modelos si la marca no está especificada
    },
  },
};

export const physicalConditions = [
  "Excelente",
  "Rayado",
  "Golpeado",
  "Pantalla rota",
  "Batería inflada",
  "Falta tornillo",
  "Humedad",
  "Otro",
];
