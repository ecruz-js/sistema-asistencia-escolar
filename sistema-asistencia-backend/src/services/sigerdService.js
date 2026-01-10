import axios from "axios";
import { CookieJar } from "tough-cookie";
import { wrapper } from "axios-cookiejar-support";
import env from "../config/environment.js";
import db from "../models/index.js";
import logger from "../utils/logger.js";
import * as cheerio from "cheerio";

// Configurar axios con soporte de cookies
const jar = new CookieJar();
const client = wrapper(
  axios.create({
    jar,
    baseURL: env.sigerd.baseUrl,
    timeout: 30000,
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    },
  })
);

// Interceptor para ver los headers de las peticiones
client.interceptors.request.use((config) => {
  logger.info("📤 Request:", {
    method: config.method.toUpperCase(),
    url: config.url,
    headers: config.headers,
    data: config.data,
  });
  return config;
});

// Interceptor para ver las respuestas
client.interceptors.response.use(
  (response) => {
    logger.info("📥 Response:", {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      data: response.data,
    });
    return response;
  },
  (error) => {
    logger.error("📥 Response Error:", {
      status: error.response?.status,
      statusText: error.response?.statusText,
      headers: error.response?.headers,
      data: error.response?.data,
    });
    return Promise.reject(error);
  }
);

class SigerdService {
  constructor() {
    this.autenticado = false;
    this.cookies = null;
  }

  /**
   * Autenticar con SIGERD
   */
  async autenticar() {
    try {
      logger.info("🔐 Iniciando proceso de autenticación en dos pasos...");

      // PASO 0: Obtener el token anti-falsificación del HTML
      // Esto es vital porque el servidor valida que el token del body coincida con el de la cookie
      const loginPage = await client.get("/");
      const $ = cheerio.load(loginPage.data);
      const token = $('input[name="__RequestVerificationToken"]').val();
      logger.info("📡 Token anti-falsificación obtenido:", { token });

      if (!token) {
        throw new Error(
          "No se pudo encontrar el __RequestVerificationToken en la página."
        );
      }

      // PASO 1: CargarInformacion (La función AJAX que viste en el JS)
      // Esta petición valida las credenciales y prepara la sesión en el backend
      const formValidacion = new URLSearchParams();
      formValidacion.append("Usuario", env.sigerd.username);
      formValidacion.append("Password", env.sigerd.password);

      // Paso 1: Validación intermedia (AJAX)
      const validacionResponse = await client.post(
        `${env.sigerd.loginEndpoint}`, // Debe apuntar a /Account/CargarInformacion
        formValidacion.toString(),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            "X-Requested-With": "XMLHttpRequest", // Indica al servidor que es una petición AJAX
            Accept: "application/json, text/javascript, */*; q=0.01",
            Referer: `${env.sigerd.baseUrl}/Account/Login`, // Muy importante para evitar bloqueos
            Origin: env.sigerd.baseUrl,
          },
        }
      );

      // Verificamos si la respuesta es el número 1 o el JSON de perfiles
      logger.info(
        `Respuesta CargarInformacion: ${JSON.stringify(
          validacionResponse.data
        )}`
      );

      logger.info("📡 Respuesta de validación recibida.", {
        data: validacionResponse.data,
      });

      // El servidor responde '1' si el usuario/pass es correcto
      if (
        validacionResponse.data !== 1 &&
        !Array.isArray(validacionResponse.data)
      ) {
        throw new Error(
          `Credenciales inválidas. Respuesta del servidor: ${validacionResponse.data}`
        );
      }

      logger.info("📡 Credenciales validadas. Realizando submit final...");

      // PASO 2: Submit del formulario (El $("#inicio-form").submit() que viste)
      // Este paso es el que genera la "LoginCookie" real
      const formFinal = new URLSearchParams();
      formFinal.append("__RequestVerificationToken", token);
      formFinal.append("Usuario", env.sigerd.username);
      formFinal.append("Password", env.sigerd.password);

      await client.post("/", formFinal.toString(), {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Referer: `${env.sigerd.baseUrl}`,
        },
      });

      // VERIFICACIÓN FINAL: Comprobar si tenemos la cookie de login
      const cookies = jar.getCookiesSync(env.sigerd.baseUrl);
      const tieneLoginCookie = cookies.some((c) =>
        c.key.toLowerCase().includes("login")
      );

      if (tieneLoginCookie) {
        this.autenticado = true;
        logger.info("🍪 Cookies después del submit final:", { cookies });
        logger.info("✅ Sesión de SIGERD establecida y persistida.");
        return true;
      } else {
        throw new Error("No se generó la cookie de sesión después del submit.");
      }
    } catch (error) {
      logger.error("❌ Error en el flujo de SIGERD:", error.message);
      this.autenticado = false;
      throw error;
    }
  }

  /**
   * Verificar si está autenticado
   */
  async verificarAutenticacion() {
    if (!this.autenticado) {
      await this.autenticar();
    }
  }

  /**
   * Obtener grados de un servicio
   */
  async obtenerGrados(servicioId) {
    try {
      await this.verificarAutenticacion();

      logger.info(`📚 Obteniendo grados del servicio ${servicioId}...`);

      const response = await client.post(
        `/commons/tiposperiodos/tipos-periodos-por-servicioscentro/?id=${servicioId}&mostrarTodosTiposPeriodos=0`,
        null,
        {
          headers: {
            "X-Requested-With": "XMLHttpRequest",
            Accept: "application/json, text/javascript, */*; q=0.01",
            Referer:
              "https://sigerd.minerd.gob.do/modulo-registro/inscripcion/relacion-estudiantes",
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
          },
        }
      );
      // Verificación de seguridad
      if (
        typeof response.data === "string" &&
        response.data.includes("<!DOCTYPE html>")
      ) {
        logger.warn("⚠️ El servidor respondió con HTML. Revisando permisos...");
        return [];
      }

      // Logging detallado para debug
      logger.info("✅ Respuesta recibida del servicio");
      logger.info(`Tipo de response.data: ${typeof response.data}`);
      logger.info(`Es array: ${Array.isArray(response.data)}`);
      logger.info(
        `Estructura completa:`,
        JSON.stringify(response.data, null, 2)
      );

      // Verificar si los datos están en response.data directamente
      if (response.data && Array.isArray(response.data)) {
        logger.info(`✅ ${response.data.length} grados obtenidos`);
        return response.data; // [{Id: 27, Nombre: "Primero"}, ...]
      }

      // Verificar si los datos están en response.data.data u otra propiedad
      if (
        response.data &&
        response.data.data &&
        Array.isArray(response.data.data)
      ) {
        logger.info(
          `✅ ${response.data.data.length} grados obtenidos (en data.data)`
        );
        return response.data.data;
      }

      logger.warn("⚠️ No se encontraron grados o formato inesperado");
      return [];
    } catch (error) {
      logger.error(
        `❌ Error al obtener grados del servicio ${servicioId}:`,
        error.message
      );
      throw error;
    }
  }

  /**
   * Obtener secciones de un grado
   */
  async obtenerSecciones(servicioId, gradoId) {
    try {
      await this.verificarAutenticacion();

      logger.info(`📋 Obteniendo secciones del grado ${gradoId}...`);

      const formData = new URLSearchParams();
      formData.append("idServicioCentro", servicioId);
      formData.append("idTipoPeriodo", gradoId);
      formData.append("idAnoAcademico", "NaN");

      const response = await client.post(
        "/commons/secciones/secciones-por-idserviciocentro-idtipoperiodo",
        formData.toString(),
        {
          headers: {
            "X-Requested-With": "XMLHttpRequest",
            Accept: "application/json, text/javascript, */*; q=0.01",
            Referer:
              "https://sigerd.minerd.gob.do/modulo-registro/inscripcion/relacion-estudiantes",
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
          },
        }
      );

      if (response.data && Array.isArray(response.data)) {
        logger.info(`✅ ${response.data.length} secciones obtenidas`);
        return response.data; // [{Id: 3948690, Nombre: "A"}, ...]
      }

      return [];
    } catch (error) {
      logger.error(
        `❌ Error al obtener secciones del grado ${gradoId}:`,
        error.message
      );
      throw error;
    }
  }

  /**
   * Obtener estudiantes de una sección
   */
  async obtenerEstudiantes(servicioId, gradoId, seccionId) {
    try {
      await this.verificarAutenticacion();

      logger.info(`👥 Obteniendo estudiantes de la sección ${seccionId}...`);

      const formData = new URLSearchParams();
      formData.append("current", "1");
      formData.append("rowCount", "-1"); // Todos los estudiantes
      formData.append("sort[idEstudiante]", "asc");
      formData.append("searchPhrase", "");

      const response = await client.post(
        `/modulo-registro/inscripcion/lista-relacion-estudiantes-json?idServicioCentro=${servicioId}&idGrado=${gradoId}&idSeccion=${seccionId}&esPrimerIngreso=true`,
        formData.toString(),
        {
          headers: {
            "X-Requested-With": "XMLHttpRequest",
            Accept: "application/json, text/javascript, */*; q=0.01",
            Referer:
              "https://sigerd.minerd.gob.do/modulo-registro/inscripcion/relacion-estudiantes",
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
          },
        }
      );

      if (response.data && response.data.rows) {
        logger.info(`✅ ${response.data.rows.length} estudiantes obtenidos`);
        return response.data.rows;
      }

      return [];
    } catch (error) {
      logger.error(
        `❌ Error al obtener estudiantes de la sección ${seccionId}:`,
        error.message
      );
      throw error;
    }
  }

  /**
   * Sincronizar todos los datos de SIGERD
   */
  async sincronizarCompleto() {
    const inicioSincronizacion = new Date();
    let estudiantes_nuevos = 0;
    let estudiantes_actualizados = 0;
    let estudiantes_desactivados = 0;
    const detalles = {
      servicios: [],
      errores: [],
    };

    try {
      logger.info("🔄 Iniciando sincronización completa con SIGERD...");

      // Autenticar
      await this.autenticar();

      // Obtener servicios activos
      const servicios = await db.SigerdServicio.findAll({
        where: { activo: true },
      });

      logger.info(`📊 ${servicios.length} servicios a sincronizar`);

      // Mantener track de estudiantes encontrados
      const estudiantesEncontrados = new Set();

      // Procesar cada servicio
      for (const servicio of servicios) {
        const servicioDetalle = {
          servicio_id: servicio.sigerd_servicio_id,
          nombre: servicio.nombre,
          grados: [],
        };

        try {
          logger.info(`\n📚 Sincronizando servicio: ${servicio.nombre}`);

          // Obtener grados del servicio
          const grados = await this.obtenerGrados(servicio.sigerd_servicio_id);

          for (const grado of grados) {
            const gradoDetalle = {
              grado_id: grado.Id,
              nombre: grado.Nombre,
              secciones: [],
            };

            try {
              // Obtener secciones del grado
              const secciones = await this.obtenerSecciones(
                servicio.sigerd_servicio_id,
                grado.Id
              );

              for (const seccion of secciones) {
                const seccionDetalle = {
                  seccion_id: seccion.Id,
                  nombre: seccion.Nombre,
                  estudiantes: 0,
                };

                try {
                  // Buscar o crear el grado en nuestra BD
                  const [gradoLocal] = await db.Grado.findOrCreate({
                    where: {
                      sigerd_servicio_id: servicio.sigerd_servicio_id,
                      sigerd_grado_id: grado.Id,
                      sigerd_seccion_id: seccion.Id,
                    },
                    defaults: {
                      nombre: `${grado.Nombre} ${seccion.Nombre}`,
                      nivel: servicio.nombre,
                      seccion: seccion.Nombre,
                      año_escolar: await db.ConfiguracionSistema.getValor(
                        "año_escolar_actual"
                      ),
                      activo: true,
                    },
                  });

                  // Obtener estudiantes de la sección
                  const estudiantes = await this.obtenerEstudiantes(
                    servicio.sigerd_servicio_id,
                    grado.Id,
                    seccion.Id
                  );

                  seccionDetalle.estudiantes = estudiantes.length;

                  // Procesar cada estudiante
                  for (const estudianteData of estudiantes) {
                    // Marcar como encontrado
                    estudiantesEncontrados.add(estudianteData.idEstudiante);

                    // Buscar estudiante existente
                    const estudianteExistente = await db.Estudiante.findOne({
                      where: {
                        sigerd_id_estudiante: estudianteData.idEstudiante,
                      },
                    });

                    // Preparar datos del estudiante
                    const datosEstudiante = {
                      nombre: estudianteData.Nombres,
                      nombre2: estudianteData.Nombre2 || null,
                      apellido: estudianteData.Apellido1,
                      apellido2: estudianteData.Apellido2 || null,
                      fecha_nacimiento: this.convertirFechaSIGERD(
                        estudianteData.fechaNacimiento
                      ),
                      grado_id: gradoLocal.id,
                      sigerd_id_estudiante: estudianteData.idEstudiante,
                      sigerd_id_matricula: estudianteData.idMatricula,
                      sigerd_id_seccion: estudianteData.idSeccion,
                      estado_matricula: estudianteData.estadoMatricula,
                      sigerd_id_estado_matricula:
                        estudianteData.idEstadoMatricula,
                      orden_en_seccion: estudianteData.ordenEnSeccion,
                      sigerd_id_tanda: estudianteData.idTanda,
                      tanda_nombre: estudianteData.tandaNombre,
                      activo: estudianteData.estadoMatricula === "Inscrito",
                      ultima_sincronizacion: new Date(),
                    };

                    if (estudianteExistente) {
                      // Actualizar estudiante existente
                      await estudianteExistente.update(datosEstudiante);
                      estudiantes_actualizados++;
                    } else {
                      // Crear nuevo estudiante
                      await db.Estudiante.create(datosEstudiante);
                      estudiantes_nuevos++;
                    }
                  }

                  gradoDetalle.secciones.push(seccionDetalle);
                  logger.info(
                    `  ✅ Sección ${seccion.Nombre}: ${estudiantes.length} estudiantes`
                  );
                } catch (error) {
                  logger.error(
                    `  ❌ Error en sección ${seccion.Nombre}:`,
                    error.message
                  );
                  detalles.errores.push({
                    servicio: servicio.nombre,
                    grado: grado.Nombre,
                    seccion: seccion.Nombre,
                    error: error.message,
                  });
                }
              }

              servicioDetalle.grados.push(gradoDetalle);
            } catch (error) {
              logger.error(
                `  ❌ Error en grado ${grado.Nombre}:`,
                error.message
              );
              detalles.errores.push({
                servicio: servicio.nombre,
                grado: grado.Nombre,
                error: error.message,
              });
            }
          }

          detalles.servicios.push(servicioDetalle);
        } catch (error) {
          logger.error(
            `❌ Error en servicio ${servicio.nombre}:`,
            error.message
          );
          detalles.errores.push({
            servicio: servicio.nombre,
            error: error.message,
          });
        }
      }

      // Desactivar estudiantes que ya no están en SIGERD
      const estudiantesActivos = await db.Estudiante.findAll({
        where: {
          activo: true,
          sigerd_id_estudiante: { [db.Sequelize.Op.ne]: null },
        },
      });

      for (const estudiante of estudiantesActivos) {
        if (!estudiantesEncontrados.has(estudiante.sigerd_id_estudiante)) {
          await estudiante.update({ activo: false });
          estudiantes_desactivados++;
          logger.info(
            `  ⚠️ Estudiante desactivado: ${estudiante.getNombreCompleto()}`
          );
        }
      }

      // Registrar sincronización exitosa
      await db.SincronizacionSIGERD.create({
        fecha: inicioSincronizacion,
        exitosa: true,
        estudiantes_nuevos,
        estudiantes_actualizados,
        estudiantes_desactivados,
        detalles,
      });

      logger.info("\n🎉 Sincronización completada exitosamente");
      logger.info(`  ✨ Estudiantes nuevos: ${estudiantes_nuevos}`);
      logger.info(`  🔄 Estudiantes actualizados: ${estudiantes_actualizados}`);
      logger.info(`  ⚠️ Estudiantes desactivados: ${estudiantes_desactivados}`);

      return {
        exitosa: true,
        estudiantes_nuevos,
        estudiantes_actualizados,
        estudiantes_desactivados,
        detalles,
      };
    } catch (error) {
      logger.error("❌ Error en sincronización con SIGERD:", error);

      // Registrar sincronización fallida
      await db.SincronizacionSIGERD.create({
        fecha: inicioSincronizacion,
        exitosa: false,
        estudiantes_nuevos,
        estudiantes_actualizados,
        estudiantes_desactivados,
        detalles,
        error_mensaje: error.message,
      });

      throw error;
    }
  }

  /**
   * Convertir fecha de SIGERD (DD/MM/YYYY) a formato ISO (YYYY-MM-DD)
   */
  convertirFechaSIGERD(fechaString) {
    if (!fechaString) return null;

    try {
      const [dia, mes, año] = fechaString.split("/");
      return `${año}-${mes.padStart(2, "0")}-${dia.padStart(2, "0")}`;
    } catch (error) {
      logger.error("Error al convertir fecha:", fechaString);
      return null;
    }
  }
}

// Exportar instancia singleton
const sigerdService = new SigerdService();
export default sigerdService;
