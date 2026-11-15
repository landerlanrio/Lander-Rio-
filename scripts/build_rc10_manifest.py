#!/usr/bin/env python3
"""Explicit release preparation. Never run in CI or verification."""
import hashlib,json
from pathlib import Path
SITE=Path(__file__).resolve().parents[1]/'site'
NAMES=('manifest-v23-10.json','manifest-flagship-v25.json','manifest-openseo-20261112.json','manifest-titan-v1.json','manifest-digital-flagship-2026.json','manifest-digital-flagship-2026-rc2.json','manifest-digital-flagship-2026-rc3.json','manifest-digital-flagship-2026-rc4.json','manifest-digital-flagship-2026-rc5.json','manifest-digital-flagship-2026-rc6.json','manifest-digital-flagship-2026-rc6.1.json','manifest-digital-flagship-2026-rc6.2.json','manifest-digital-flagship-2026-rc6.3.json')
NAMES += ('manifest-digital-flagship-2026-rc8.json','manifest-digital-flagship-2026-rc9.json')
TARGET='manifest-digital-flagship-2026-rc10.json'
records={}
for name in NAMES: records.update(json.loads((SITE/name).read_text())['files'])
missing=[p for p in records if not (SITE/p).is_file()]
if missing:raise SystemExit('Refusing missing original files: '+str(missing))
changes={}
for p in sorted(SITE.rglob('*')):
    if not p.is_file():continue
    rel=p.relative_to(SITE).as_posix()
    if rel in (*NAMES,TARGET):continue
    if rel.startswith('__qa/'):raise SystemExit('Remove temporary QA harness before release')
    digest=hashlib.sha256(p.read_bytes()).hexdigest()
    if records.get(rel)!=digest:changes[rel]=digest
(SITE/TARGET).write_text(json.dumps({'version':'digital-flagship-2026-rc10','base_manifest':NAMES[0],'upstream_deploy':'6af7cf076327d7fe116d1858','scope':'Isolated preview candidate; no production publication','files':changes},ensure_ascii=False,indent=2)+'\n')
print(f'Pinned {len(changes)} changes against immutable TITAN RC2 manifests.')

