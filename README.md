# Codex Usage Status

Extension local para VS Code/VSCodium que muestra en la barra inferior el porcentaje disponible de las ventanas de uso de Codex, por ejemplo:

`Codex 5h: 68% | semana: 92%`

## Requisitos

- Tener Codex CLI instalado.
- Haber iniciado sesion con `codex login` usando tu cuenta de ChatGPT.

## Instalacion en Windows

1. Descomprime el ZIP.
2. Abre PowerShell dentro de la carpeta descomprimida.
3. Ejecuta:

```powershell
powershell -ExecutionPolicy Bypass -File .\install.ps1
```

4. En VS Code ejecuta `Developer: Reload Window` desde `Ctrl+Shift+P`.

## Uso

- Haz clic en el indicador de la barra inferior para ver el detalle.
- Ejecuta `Codex Usage: Actualizar` desde `Ctrl+Shift+P` para forzar una consulta.
- Configura `Codex Usage: Refresh Minutes` si quieres cambiar los 5 minutos predeterminados.
- Si `codex` no se encuentra, configura `Codex Usage: Codex Path`, por ejemplo:

```text
C:\Users\TU_USUARIO\AppData\Roaming\npm\codex.cmd
```

La extension inicia temporalmente `codex app-server`, consulta `account/rateLimits/read` sin parametros (compatible con versiones antiguas y nuevas) y cierra el proceso. No lee ni copia tokens, claves o contrasenas.

## Alternativa oficial dentro del terminal

En una sesion interactiva de Codex CLI, usa `/statusline` y activa `rate limits`. Esto muestra el consumo en el pie del propio terminal, sin instalar esta extension.
