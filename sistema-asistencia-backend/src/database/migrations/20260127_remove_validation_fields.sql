-- Migración: Eliminar campos de validación de registro_asistencia_grado
-- Fecha: 2026-01-27
-- Descripción: Se simplifica el flujo para basarse únicamente en la completitud
--              de la asistencia, eliminando la validación manual por dirección

-- Eliminar columnas de validación
ALTER TABLE registro_asistencia_grado
DROP COLUMN IF EXISTS validada,
DROP COLUMN IF EXISTS validada_por,
DROP COLUMN IF EXISTS hora_validacion;
