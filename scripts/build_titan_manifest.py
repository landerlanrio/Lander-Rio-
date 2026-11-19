#!/usr/bin/env python3
"""Explicit release preparation; NEVER run as part of verification/CI.

Keep historical manifests unchanged. Pin only additions/changes against the
ordered recovered baselines. Review the resulting diff before committing.
"""
import hashlib, json
from pathlib import Path
SITE = Path(__file__).resolve().parent.parent / 'site'
NAMES = ('manifest-v23-10.json', 'manifest-flagship-v25.json', 'manifest-openseo-20261112.json')
records = {}
for name in NAMES:
    records.update(json.loads((SITE/name).read_text())['files'])
changed = {}
for p in sorted(SITE.rglob('*')):
    if not p.is_file(): continue
    rel = p.relative_to(SITE).as_posix()
    if rel in (*NAMES, 'manifest-titan-v1.json'): continue
    observed = hashlib.sha256(p.read_bytes()).hexdigest()
    if records.get(rel) != observed: changed[rel] = observed
missing = sorted(p for p in records if not (SITE/p).is_file())
if missing: raise SystemExit('Refusing to hide deleted baseline files: '+str(missing))
(SITE/'manifest-titan-v1.json').write_text(json.dumps({
    'version':'titan-1.0.0-rc1', 'base_manifest':'manifest-v23-10.json',
    'upstream_commit':'2b6fa28a2785b97f883d18c2eca16157bc02f9cb',
    'scope':'Isolated integration candidate. No production deployment.',
    'files':changed}, ensure_ascii=False, indent=2)+'\n')
print(f'Pinned {len(changed)} TITAN changes. Run verify_site.py separately.')
