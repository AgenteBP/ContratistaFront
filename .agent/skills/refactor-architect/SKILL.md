---
name: refactor-architect
description: Analiza la base de código para identificar necesidades de refactorización, reducir la deuda técnica y proponer mejoras en la arquitectura modular.
---

# Refactor Architect Skill

Esta habilidad permite a Antigravity realizar auditorías de código y proponer cambios estructurales profundos.

## Capacidades
- **Auditoría de Arquitectura:** Identifica "olores" arquitectónicos (acoplamiento fuerte, lógica dispersa).
- **Planificación de Refactorización:** Crea planes paso a paso para mover lógica de componentes a servicios o hooks.
- **Estandarización:** Asegura que los nuevos patrones sigan principios como SOLID o Clean Architecture.

## Instrucciones para el Agente
1. Al recibir una solicitud de "mejora de arquitectura", realiza primero un mapeo de dependencias.
2. Identifica archivos con más de 500 líneas o lógica de negocio mezclada con UI.
3. Propone una estructura modular (servicios, hooks, componentes atómicos).
4. Ejecuta los cambios de forma incremental, asegurando que el sistema siga funcionando en cada paso.
