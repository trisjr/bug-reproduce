# ---------------------------------------------------------------------------
# repro spike P0-B — image for CT-3 services `spike-app` and `spike-httpstub`.
# Owner: B2 (devops). Application code owner: B1 (src/spike/app/).
#
# Build context is `src/spike/app/` — this Dockerfile deliberately COPYs the
# whole context so that B1 can add files without B2 editing this file.
#
# THROWAWAY (Spec-Spike-Protocol §0.3): no multi-stage hardening, no SBOM,
# no non-root hardening beyond the image default. Not a V0.1 base image.
# ---------------------------------------------------------------------------
FROM node:22-alpine

# Which entrypoint of B1's package to run: "app" or "httpstub".
ARG SPIKE_ENTRYPOINT=app
ENV SPIKE_ENTRYPOINT=${SPIKE_ENTRYPOINT}

WORKDIR /srv/spike

# B1 owns src/spike/app/. If a package.json + lockfile is present we install
# production deps; if B1 ships a zero-dependency app, this is a no-op.
COPY . /srv/spike/

RUN if [ -f package-lock.json ]; then npm ci --omit=dev; \
    elif [ -f package.json ]; then npm install --omit=dev; \
    else echo "no package.json in build context — zero-dependency app"; fi

# CT-4 defines no /health endpoint, so healthchecks are TCP-level and live in
# the compose file, not here.
#
# Entrypoint resolution order, first hit wins:
#   1. npm script  `start:${SPIKE_ENTRYPOINT}`
#   2. file        ./${SPIKE_ENTRYPOINT}.js
#   3. file        ./src/${SPIKE_ENTRYPOINT}.js
# This is the only coupling to B1's layout and it is intentionally forgiving.
# Written with printf rather than a COPY heredoc: heredocs need the
# dockerfile:1.4+ frontend, and the build context here is ../app (owned by B1),
# so a separate script file in this directory could not be COPYed anyway.
RUN printf '%s\n' \
  '#!/bin/sh' \
  'set -eu' \
  'if [ -f package.json ] && node -e "var p=require(\"./package.json\");process.exit(p.scripts&&p.scripts[\"start:\"+process.env.SPIKE_ENTRYPOINT]?0:1)" 2>/dev/null; then' \
  '  exec npm run --silent "start:${SPIKE_ENTRYPOINT}"' \
  'elif [ -f "./${SPIKE_ENTRYPOINT}.js" ]; then' \
  '  exec node "./${SPIKE_ENTRYPOINT}.js"' \
  'elif [ -f "./src/${SPIKE_ENTRYPOINT}.js" ]; then' \
  '  exec node "./src/${SPIKE_ENTRYPOINT}.js"' \
  'else' \
  '  echo "spike-entry: no entrypoint for SPIKE_ENTRYPOINT=${SPIKE_ENTRYPOINT}" >&2' \
  '  echo "spike-entry: expected npm script start:${SPIKE_ENTRYPOINT}, ./${SPIKE_ENTRYPOINT}.js or ./src/${SPIKE_ENTRYPOINT}.js" >&2' \
  '  exit 78' \
  'fi' \
  > /usr/local/bin/spike-entry && chmod 0755 /usr/local/bin/spike-entry

ENTRYPOINT ["/usr/local/bin/spike-entry"]
