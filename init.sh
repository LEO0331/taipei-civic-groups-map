#!/usr/bin/env sh
set -eu

npm run typecheck
npm test
npm run build
