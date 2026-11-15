#!/usr/bin/env python3
"""Read-only release gate. Does not regenerate manifests, deploy or call live APIs."""
import argparse
import glob
import json
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--out', type=Path, default=ROOT.parent / 'titan-validation')
    args = parser.parse_args()
    args.out.mkdir(parents=True, exist_ok=True)
    patterns = ['scripts/*.test.cjs', 'scripts/test_seo_metadata.cjs',
                'prototypes/rox-ai-v2/*.test.mjs',
                'prototypes/rox-ai-v2/preview-private/server.test.mjs',
                'revenue-intelligence/test-*.cjs']
    tests = sorted({str(p.relative_to(ROOT)) for pattern in patterns for p in ROOT.glob(pattern)})
    jobs = [('integrity', [sys.executable, 'scripts/verify_site.py']),
            ('structure', [sys.executable, 'scripts/test_flagship_2026.py']),
            ('universe', [sys.executable, 'scripts/test_universe.py']),
            ('rc10', [sys.executable, 'scripts/test_rc10.py']),
            ('brand-profiles', [sys.executable, 'scripts/test_brand_profiles.py']),
            ('metadata-and-binary', [sys.executable, 'scripts/test_integrity.py']),
            ('node-tests', ['node', '--experimental-strip-types', '--test', *tests]),
            ('http-smoke', [sys.executable, 'scripts/smoke_http.py'])]
    jobs += [('syntax-' + str(i), ['node', '--check', str(p)]) for i, p in enumerate(sorted((ROOT/'site').rglob('*.js')))]
    results = []
    for name, cmd in jobs:
        try:
            p = subprocess.run(cmd, cwd=ROOT, capture_output=True, text=True, timeout=120)
            output, code = p.stdout + p.stderr, p.returncode
        except (OSError, subprocess.TimeoutExpired) as err:
            output, code = str(err), 1
        (args.out / (name + '.log')).write_text(output, encoding='utf-8')
        results.append({'name': name, 'command': cmd, 'exit_code': code, 'passed': code == 0})
        print(('PASS' if code == 0 else 'FAIL') + ' ' + name, flush=True)
    result = {'candidate': json.loads((ROOT/'site/release.json').read_text())['version'], 'created_at': datetime.now(timezone.utc).isoformat(),
              'status': 'PASS' if all(r['passed'] for r in results) else 'FAIL',
              'network_scope': 'HTTP loopback and mocks; no external integration writes',
              'checks': results}
    (args.out/'validation.json').write_text(json.dumps(result, indent=2, ensure_ascii=False)+'\n')
    return 0 if result['status'] == 'PASS' else 1

if __name__ == '__main__':
    sys.exit(main())
