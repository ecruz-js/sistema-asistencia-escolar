import db from "../models/index.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const exportarPasscodes = async () => {
  try {
    console.log("🔄 Consultando usuarios y passcodes...");

    // Obtener todos los usuarios activos con sus passcodes
    const usuarios = await db.Usuario.findAll({
      attributes: [
        "id",
        "cedula",
        "nombres",
        "primer_apellido",
        "segundo_apellido",
        "email",
        "passcode",
        "rol",
        "activo",
      ],
      order: [["primer_apellido", "ASC"], ["nombres", "ASC"]],
    });

    if (usuarios.length === 0) {
      console.log("⚠️  No hay usuarios en la base de datos");
      return;
    }

    // Crear CSV
    const csvHeader = "ID,Cédula,Nombre Completo,Email,Passcode,Rol,Activo\n";
    const csvRows = usuarios.map((u) => {
      const nombreCompleto = `${u.nombres} ${u.primer_apellido} ${u.segundo_apellido || ""}`.trim();
      return `${u.id},"${u.cedula}","${nombreCompleto}","${u.email}","${u.passcode}","${u.rol}","${u.activo ? "Sí" : "No"}"`;
    });
    const csvContent = csvHeader + csvRows.join("\n");

    // Crear JSON
    const jsonContent = JSON.stringify(
      usuarios.map((u) => ({
        id: u.id,
        cedula: u.cedula,
        nombreCompleto: u.getNombreCompleto(),
        email: u.email,
        passcode: u.passcode,
        rol: u.rol,
        activo: u.activo,
      })),
      null,
      2
    );

    // Guardar archivos
    const timestamp = new Date().toISOString().split("T")[0];
    const outputDir = path.join(__dirname, "../../exports");

    // Crear directorio si no existe
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const csvPath = path.join(outputDir, `passcodes-${timestamp}.csv`);
    const jsonPath = path.join(outputDir, `passcodes-${timestamp}.json`);

    fs.writeFileSync(csvPath, csvContent, "utf8");
    fs.writeFileSync(jsonPath, jsonContent, "utf8");

    console.log("\n✅ Passcodes exportados exitosamente:");
    console.log(`   📄 CSV:  ${csvPath}`);
    console.log(`   📄 JSON: ${jsonPath}`);
    console.log(`\n👥 Total de usuarios: ${usuarios.length}`);

    // Mostrar preview en consola
    console.log("\n📋 Preview (primeros 10 usuarios):");
    console.log("─".repeat(80));
    usuarios.slice(0, 10).forEach((u) => {
      console.log(
        `${u.passcode} | ${u.nombres} ${u.primer_apellido} | ${u.email}`
      );
    });
    console.log("─".repeat(80));

    // Cerrar conexión
    await db.sequelize.close();
    console.log("\n✅ Proceso completado");
  } catch (error) {
    console.error("\n❌ Error al exportar passcodes:", error.message);
    console.error(error.stack);

    try {
      await db.sequelize.close();
    } catch (closeError) {
      // Ignorar
    }

    process.exit(1);
  }
};

// Ejecutar script
exportarPasscodes();
