#!/usr/bin/env python3
"""Pin reviewed local site deltas against the preserved branch; never deploys."""
import hashlib,json,subprocess
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
SITE=ROOT/'site'
TARGET='manifest-commercial-capture-20261122.json'
BASE_REF='79cb510247b594d22c46005e9d9d22afc126197b'
# HEAD79cb510 added the reviewed PNG favicon redirect without an overlay.
# Preserve and pin that existing branch fix; it is covered by favicon-fallback.test.cjs.
PRESERVED_BRANCH_FIXES={'_redirects'}
def digest(data): return hashlib.sha256(data).hexdigest()
files={};replaces={}
for path in sorted(SITE.rglob('*')):
 if not path.is_file():continue
 rel=path.relative_to(SITE).as_posix()
 if (path.name.startswith('manifest-') and rel not in ('manifest-digital-flagship-2026-rc14.2.json','manifest-digital-flagship-2026-rc14.3.json')) or rel==TARGET:continue
 if path.is_symlink():raise SystemExit('Symlink forbidden: '+rel)
 original=subprocess.run(['git','show',BASE_REF+':site/'+rel],cwd=ROOT,stdout=subprocess.PIPE,stderr=subprocess.DEVNULL)
 current=path.read_bytes()
 if original.returncode==0 and original.stdout==current and rel not in PRESERVED_BRANCH_FIXES:continue
 files[rel]=digest(current)
 if original.returncode==0:replaces[rel]=digest(original.stdout)
value={'version':'commercial-capture-20261122','base_manifest':'manifest-v23-10.json','source_base_commit':BASE_REF,'upstream_deploy':'6afe96a8a12db106eae1b9cd','scope':'Isolated review candidate; production bytes recovered by HTTP where available; not published. Full original Netlify ZIP/config inventory remains a release gate.','preserved_branch_fixes':sorted(PRESERVED_BRANCH_FIXES),'files':files,'replaces_sha256':replaces}
(SITE/TARGET).write_text(json.dumps(value,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'manifest':TARGET,'pinned_files':len(files),'replaced_files':len(replaces),'published':False}))
