#!/usr/bin/env python3
"""Repeatable static generation. Does not approve or deploy a release."""
import subprocess,sys
from pathlib import Path
R=Path(__file__).resolve().parents[1]
(R/'site/assets/brand-universe-rc8.css').write_text((R/'site/assets/brand-profiles-rc6.3.css').read_text()+'\n'+(R/'content/universe.css').read_text())
for script in ['build_universe.py','build_editorial.py','finalize_rc8.py']:
    subprocess.run([sys.executable,str(R/'scripts'/script)],cwd=R,check=True)
