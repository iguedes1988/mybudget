# ─────────────────────────────────────────────────────────────────────────────
# This Dockerfile is used by Hyperlift (low-memory build environment).
# The real multi-stage build runs in GitHub Actions and pushes to GHCR.
# Hyperlift just pulls the pre-built image — no compilation needed here.
# ─────────────────────────────────────────────────────────────────────────────
FROM ghcr.io/iguedes1988/mybudget:latest
