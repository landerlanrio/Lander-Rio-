#!/usr/bin/env python3
"""Create a deterministic site ZIP after a successful integrity check; never deploy."""
import argparse
import hashlib
import subprocess
import sys
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

def main():
    p = argparse.ArgumentParser()
    p.add_argument('--out', type=Path, required=True)
    args = p.parse_args()
    subprocess.run([sys.executable, str(ROOT/'scripts/verify_site.py')], check=True, cwd=ROOT)
    args.out.parent.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(args.out, 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=9) as z:
        for source in sorted((ROOT/'site').rglob('*')):
            if not source.is_file():
                continue
            info = zipfile.ZipInfo(str(source.relative_to(ROOT/'site')), (2026, 11, 13, 0, 0, 0))
            info.compress_type = zipfile.ZIP_DEFLATED
            info.external_attr = 0o100644 << 16
            z.writestr(info, source.read_bytes(), compresslevel=9)
    print(hashlib.sha256(args.out.read_bytes()).hexdigest() + '  ' + args.out.name)

if __name__ == '__main__':
    main()
