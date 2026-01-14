export const up = async (queryInterface, Sequelize) => {
  const transaction = await queryInterface.sequelize.transaction();

  try {
    // 1. Agregar nuevas columnas
    await queryInterface.addColumn(
      "usuarios",
      "cedula",
      {
        type: Sequelize.STRING(20),
        allowNull: true, // Temporal para permitir migración
      },
      { transaction }
    );

    await queryInterface.addColumn(
      "usuarios",
      "primer_apellido",
      {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      { transaction }
    );

    await queryInterface.addColumn(
      "usuarios",
      "segundo_apellido",
      {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      { transaction }
    );

    await queryInterface.addColumn(
      "usuarios",
      "nombres",
      {
        type: Sequelize.STRING(150),
        allowNull: true,
      },
      { transaction }
    );

    await queryInterface.addColumn(
      "usuarios",
      "fecha_nacimiento",
      {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      { transaction }
    );

    await queryInterface.addColumn(
      "usuarios",
      "puesto",
      {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      { transaction }
    );

    await queryInterface.addColumn(
      "usuarios",
      "condicion_laboral",
      {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      { transaction }
    );

    await queryInterface.addColumn(
      "usuarios",
      "foto_url",
      {
        type: Sequelize.STRING(500),
        allowNull: true,
      },
      { transaction }
    );

    // 2. Migrar datos existentes
    await queryInterface.sequelize.query(
      `
      UPDATE usuarios 
      SET nombres = nombre,
          primer_apellido = apellido
      WHERE nombres IS NULL OR primer_apellido IS NULL
    `,
      { transaction }
    );

    // 3. Generar cédulas temporales para registros existentes
    await queryInterface.sequelize.query(
      `
      UPDATE usuarios 
      SET cedula = LPAD(id::text, 11, '0')
      WHERE cedula IS NULL
    `,
      { transaction }
    );

    // 4. Hacer columnas NOT NULL después de migrar datos
    await queryInterface.changeColumn(
      "usuarios",
      "cedula",
      {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      { transaction }
    );

    await queryInterface.changeColumn(
      "usuarios",
      "primer_apellido",
      {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      { transaction }
    );

    await queryInterface.changeColumn(
      "usuarios",
      "nombres",
      {
        type: Sequelize.STRING(150),
        allowNull: false,
      },
      { transaction }
    );

    // 5. Agregar índice único para cédula
    await queryInterface.addIndex(
      "usuarios",
      ["cedula"],
      {
        unique: true,
        name: "usuarios_cedula_unique",
      },
      { transaction }
    );

    // 6. Agregar índices para búsqueda
    await queryInterface.addIndex(
      "usuarios",
      ["condicion_laboral"],
      {
        name: "usuarios_condicion_laboral_idx",
      },
      { transaction }
    );

    await queryInterface.addIndex(
      "usuarios",
      ["puesto"],
      {
        name: "usuarios_puesto_idx",
      },
      { transaction }
    );

    await transaction.commit();
    console.log("✅ Migración completada exitosamente");
  } catch (error) {
    await transaction.rollback();
    console.error("❌ Error en la migración:", error);
    throw error;
  }
};

export const down = async (queryInterface, Sequelize) => {
  const transaction = await queryInterface.sequelize.transaction();

  try {
    // Revertir cambios en orden inverso
    await queryInterface.removeIndex("usuarios", "usuarios_puesto_idx", {
      transaction,
    });
    await queryInterface.removeIndex(
      "usuarios",
      "usuarios_condicion_laboral_idx",
      { transaction }
    );
    await queryInterface.removeIndex("usuarios", "usuarios_cedula_unique", {
      transaction,
    });

    await queryInterface.removeColumn("usuarios", "foto_url", { transaction });
    await queryInterface.removeColumn("usuarios", "condicion_laboral", {
      transaction,
    });
    await queryInterface.removeColumn("usuarios", "puesto", { transaction });
    await queryInterface.removeColumn("usuarios", "fecha_nacimiento", {
      transaction,
    });
    await queryInterface.removeColumn("usuarios", "nombres", { transaction });
    await queryInterface.removeColumn("usuarios", "segundo_apellido", {
      transaction,
    });
    await queryInterface.removeColumn("usuarios", "primer_apellido", {
      transaction,
    });
    await queryInterface.removeColumn("usuarios", "cedula", { transaction });

    await transaction.commit();
    console.log("✅ Rollback completado exitosamente");
  } catch (error) {
    await transaction.rollback();
    console.error("❌ Error en el rollback:", error);
    throw error;
  }
};
