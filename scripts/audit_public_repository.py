#!/usr/bin/env python3
"""Fail-closed, dependency-free secret check for files tracked in a public Git repo.

Only path/line/category are printed; matched secrets are NEVER printed.
It is a high-confidence guard, not a full secret-scanning or history audit.
"""
from __future__ import annotations

import base64
import json
import re
import subprocess
import sys
from pathlib import Path

SECRET_PATTERNS = {
    "private-key": re.compile(r"-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----"),
    "github-token": re.compile(r"\b(?:ghp_|gho_|ghu_|ghs_|ghr_|github_pat_)[A-Za-z0-9_]{20,}\b"),
    "openai-key": re.compile(r"\bsk-(?:proj-|svcacct-)?[A-Za-z0-9_-]{32,}\b"),
    "groq-key": re.compile(r"\bgsk_[A-Za-z0-9]{24,}\b"),
    "aws-access-id": re.compile(r"\b(?:AKIA|ASIA)[A-Z0-9]{16}\b"),
    "supabase-secret": re.compile(r"\bsb_secret_[A-Za-z0-9_-]{20,}\b"),
    "netlify-token": re.compile(r"\bnfp_[A-Za-z0-9]{20,}\b"),
    "stripe-secret": re.compile(r"\b(?:sk_live_|rk_live_)[A-Za-z0-9]{20,}\b"),
    "slack-token": re.compile(r"\bxox[baprs]-[A-Za-z0-9-]{20,}\b"),
    "meta-access-token": re.compile(r"\bEAA[A-Za-z0-9]{50,}\b"),
    "hardcoded-server-secret": re.compile(
        r"\b(?:OPENAI_API_KEY|GROQ_API_KEY|NETLIFY_AUTH_TOKEN|SUPABASE_SERVICE_ROLE_KEY|META_APP_SECRET|WHATSAPP_ACCESS_TOKEN)\s*[:=]\s*['\"]([A-Za-z0-9._-]{20,})['\"]",
        re.I,
    ),
}
JWT = re.compile(r"\beyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b")
PROHIBITED_SUFFIXES = {".pem", ".p12", ".pfx", ".kdbx", ".sqlite", ".db"}
PROHIBITED_NAMES = {".npmrc", ".pypirc", "id_rsa", "id_ed25519", "credentials.json", "service-account.json"}


def prohibited_path(relative: Path) -> bool:
    parts = {part.lower() for part in relative.parts}
    name = relative.name.lower()
    return (
        name in PROHIBITED_NAMES
        or name in {".env", ".env.local", ".env.production", ".env.development", ".env.staging"}
        or name.endswith((".env.local", ".env.production"))
        or relative.suffix.lower() in PROHIBITED_SUFFIXES
        or bool(parts & {".ssh", ".aws"})
    )


def _service_role_jwt(value: str) -> bool:
    try:
        payload = value.split(".", 2)[1]
        payload += "=" * (-len(payload) % 4)
        claims = json.loads(base64.urlsafe_b64decode(payload).decode("utf-8"))
        return claims.get("role") == "service_role"
    except (UnicodeError, ValueError, KeyError, TypeError):
        return False


def scan_text(text: str) -> list[tuple[int, str]]:
    found = set()
    for category, pattern in SECRET_PATTERNS.items():
        for match in pattern.finditer(text):
            found.add((text.count("\n", 0, match.start()) + 1, category))
    for match in JWT.finditer(text):
        if _service_role_jwt(match.group(0)):
            found.add((text.count("\n", 0, match.start()) + 1, "service-role-jwt"))
    try:
        parsed = json.loads(text)
        if isinstance(parsed, dict) and parsed.get("type") == "service_account" and "private_key" in parsed:
            found.add((1, "google-service-account"))
    except (json.JSONDecodeError, ValueError):
        pass
    return sorted(found)


def audit_file(root: Path, relative: Path) -> list[tuple[str, int, str]]:
    path = root / relative
    if not path.is_file() or path.is_symlink():
        return []
    issue_path = relative.as_posix()
    result = [(issue_path, 0, "credential-file-path")] if prohibited_path(relative) else []
    try:
        data = path.read_bytes()
    except OSError:
        return result + [(issue_path, 0, "unreadable-file")]
    # Not an image, PDF, or archive validator. Binary files require independent review.
    if b"\x00" in data[:4096]:
        return result
    try:
        text = data.decode("utf-8")
    except UnicodeError:
        return result
    return result + [(issue_path, n, category) for n, category in scan_text(text)]


def tracked_files(root: Path) -> list[Path]:
    proc = subprocess.run(
        ["git", "-C", str(root), "ls-files", "-z", "--cached"],
        stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=True,
    )
    return [Path(p.decode("utf-8", "replace")) for p in proc.stdout.split(b"\x00") if p]


def main() -> int:
    root = Path(__file__).resolve().parents[1]
    try:
        paths = tracked_files(root)
    except (OSError, subprocess.CalledProcessError):
        print("Public repository audit could not list tracked files", file=sys.stderr)
        return 2
    if not paths:
        print("Public repository audit found no tracked files", file=sys.stderr)
        return 2
    findings = [entry for relative in paths for entry in audit_file(root, relative)]
    if findings:
        print(f"SECURITY GATE FAILED: {len(findings)} possible sensitive items. Redacted locations:")
        for path, line, category in findings[:100]:
            print(f"- {path}:{line} [{category}]")
        if len(findings) > 100:
            print(f"- {len(findings) - 100} further items omitted")
        return 1
    print(f"Security gate OK: {len(paths)} tracked paths scanned; no high-confidence secret detected")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
