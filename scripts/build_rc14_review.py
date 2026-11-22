#!/usr/bin/env python3
"""Create a byte-checked REVIEW ZIP; compare to official Netlify ZIP only if supplied.
Does NOT deploy or declare an unreconciled candidate ready for production.
"""
from __future__ import annotations
import argparse, hashlib, json, sys, zipfile
from pathlib import Path, PurePosixPath
from xml.etree import ElementTree as ET

DEPLOY_ID = "6afd3619fe28100b27f41641"
NAME = "LANDER_RIO_RC14_3_REVIEW_NOT_FOR_PRODUCTION.zip"

def digest(b):
    return hashlib.sha256(b).hexdigest()

def safe(name):
    p = PurePosixPath(name)
    return bool(name and not name.startswith("/") and "\\" not in name
                and p.parts and all(part not in ("", ".", "..") for part in p.parts))

def archive_hashes(path):
    found = {}
    with zipfile.ZipFile(path) as z:
        for m in z.infolist():
            if m.is_dir(): continue
            if not safe(m.filename) or m.filename in found or m.file_size > 100_000_000:
                raise ValueError("Unsafe or duplicate ZIP entry: " + m.filename[:120])
            if (m.external_attr >> 16) & 0o170000 == 0o120000:
                raise ValueError("ZIP symlink forbidden: " + m.filename[:120])
            found[m.filename] = digest(z.read(m))
    return found

def candidate_hashes(site):
    values = {}
    for p in sorted(x for x in site.rglob("*") if x.is_file()):
        if p.is_symlink() or p.stat().st_size > 100_000_000:
            raise ValueError("Symlink or oversized candidate file: " + str(p))
        rel = p.relative_to(site).as_posix()
        if not safe(rel): raise ValueError("Unsafe candidate file: " + rel)
        values[rel] = digest(p.read_bytes())
    return values

def metrics(site, files):
    required = {"index.html", "_headers", "_redirects", "robots.txt",
                "sitemap.xml", "release.json", "marcas/index.html",
                "enciclopedia/cadernos/index.html", "enciclopedia/guias/index.html",
                "manifest-digital-flagship-2026-rc14.3.json"}
    missing = sorted(required - files.keys())
    if missing: raise ValueError("Missing critical file(s): " + ", ".join(missing))
    htmls = sum(k.endswith(".html") for k in files)
    cadernos = sum(k.startswith("enciclopedia/cadernos/") and
                   k.endswith("/index.html") and k != "enciclopedia/cadernos/index.html"
                   for k in files)
    brands = sum(k.startswith("marcas/") and k.endswith("/index.html")
                 and k != "marcas/index.html" for k in files)
    sitemap = ET.fromstring((site / "sitemap.xml").read_bytes())
    urls = [n.text for n in sitemap.iter() if n.tag.split("}")[-1] == "loc" and n.text]
    if (htmls, cadernos, len(urls)) != (106, 12, 59) or brands < 14:
        raise ValueError(f"Inventory mismatch: pages={htmls}, cadernos={cadernos}, "
                         f"brands={brands}, urls={len(urls)}")
    return dict(html_pages=htmls, cadernos=cadernos, brand_pages=brands, canonical_urls=len(urls))

def build_zip(site, target, hashes):
    with zipfile.ZipFile(target, "w", zipfile.ZIP_DEFLATED, compresslevel=9) as z:
        for rel in sorted(hashes):
            info = zipfile.ZipInfo(rel, date_time=(2026, 11, 19, 0, 0, 0))
            info.compress_type = zipfile.ZIP_DEFLATED
            info.external_attr = 0o644 << 16
            z.writestr(info, (site / rel).read_bytes(), compress_type=zipfile.ZIP_DEFLATED, compresslevel=9)
    if archive_hashes(target) != hashes:
        raise ValueError("ZIP verification failed: archive differs from repository")

def compare(candidate, previous):
    changed = sorted(x for x in candidate.keys() & previous.keys() if candidate[x] != previous[x])
    added = sorted(candidate.keys() - previous.keys())
    removed = sorted(previous.keys() - candidate.keys())
    return dict(source_files=len(previous), candidate_files=len(candidate),
                untouched_files=len(candidate.keys() & previous.keys()) - len(changed),
                changed_files=changed, added_files=added,
                source_only_files_at_risk=removed, status="REVIEW_REQUIRED" if changed or added or removed else "IDENTICAL")

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--site", type=Path, default=Path("site"))
    ap.add_argument("--out", type=Path, default=Path("dist/rc14-review"))
    ap.add_argument("--production-zip", type=Path)
    args = ap.parse_args()
    site, out = args.site.resolve(), args.out.resolve()
    out.mkdir(parents=True, exist_ok=True)
    candidate = candidate_hashes(site)
    stats = metrics(site, candidate)
    target = out / NAME
    build_zip(site, target, candidate)
    report = dict(release="RC14.3_candidate_REVIEW_ONLY",
                  production_deploy=DEPLOY_ID,
                  published=False, source_reconciled=False,
                  source_check="BLOCKED_OFFICIAL_NETLIFY_ZIP_NOT_AVAILABLE",
                  archive_name=NAME, archive_sha256=digest(target.read_bytes()),
                  archive_bytes=target.stat().st_size, archive_file_count=len(candidate),
                  archive_integrity="PASS", **stats)
    if args.production_zip:
        report["comparison"] = compare(candidate, archive_hashes(args.production_zip))
        report["source_check"] = "COMPARISON_COMPLETE_MANUAL_REVIEW_REQUIRED"
    (out / "REVIEW_REPORT.json").write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n")
    (out / "REVIEW_SHA256.txt").write_text(report["archive_sha256"] + "  " + NAME + "\n")
    (out / "README_REVIEW.txt").write_text(
        "LANDER RIO / RC14.3 / REVIEW ONLY - NOT FOR PRODUCTION\n\n"
        "The ZIP is created from the GitHub review branch, NOT from the exact\n"
        "Netlify RC14.2 production archive. It must NOT be published directly.\n"
        "Official deployed ID: " + DEPLOY_ID + "\n"
        "Download the original full deploy ZIP in the Netlify dashboard.\n"
        "Run build_rc14_review.py --production-zip ORIGINAL.zip for a full delta.\n"
        "Inspect remaining files, browser QA and behavior before any promotion.\n")
    print(json.dumps(report, ensure_ascii=False, indent=2))

if __name__ == "__main__":
    main()
