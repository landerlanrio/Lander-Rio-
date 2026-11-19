#!/usr/bin/env python3
"""Small, independently visible RC14+ CI gates; never writes to production."""
import json
import sys
import verify_site as v

CHECKS = {
    "manifest": lambda: v.verify_manifest(),
    "html": lambda: v.verify_html(),
    "css": lambda: v.verify_css(),
    "metadata": lambda: (v.verify_sitemap(), v.verify_json()),
    "security": lambda: v.verify_credentials(),
}

if __name__ == "__main__":
    category = sys.argv[1] if len(sys.argv) == 2 else None
    if category not in CHECKS:
        print("Expected a category: " + ", ".join(CHECKS), file=sys.stderr)
        sys.exit(2)
    count = CHECKS[category]()
    report = {"category": category, "result": "PASS" if not v.ISSUES else "FAIL",
              "count": count, "issues": v.ISSUES}
    print(json.dumps(report, ensure_ascii=False, indent=2))
    sys.exit(0 if not v.ISSUES else 1)
