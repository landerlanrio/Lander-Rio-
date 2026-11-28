import base64
import json
import tempfile
import unittest
from pathlib import Path
from scripts.audit_public_repository import audit_file, prohibited_path, scan_text


class PublicRepositorySecurityTests(unittest.TestCase):
    def test_public_analytics_tokens_and_variable_names_are_allowed(self):
        content = "window.public_token='phc_" + "X" * 40 + "';\ngetenv('OPENAI_API_KEY')"
        self.assertEqual(scan_text(content), [])

    def test_hardcoded_openai_key_is_blocked_without_revealing_value(self):
        secret = "sk-" + "proj-" + "A" * 40
        findings = scan_text("const key='" + secret + "'")
        self.assertEqual(findings, [(1, "openai-key")])
        self.assertNotIn(secret, repr(findings))

    def test_github_token_is_blocked(self):
        self.assertEqual(scan_text("ghp_" + "Z" * 40), [(1, "github-token")])

    def test_env_file_is_blocked_even_when_empty(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            (root / ".env.local").write_text("")
            self.assertIn((".env.local", 0, "credential-file-path"), audit_file(root, Path(".env.local")))
        self.assertFalse(prohibited_path(Path(".env.example")))

    def test_google_service_account_json_is_blocked(self):
        text = json.dumps({"type": "service_account", "private_key": "placeholder"})
        self.assertIn((1, "google-service-account"), scan_text(text))

    def test_service_role_jwt_blocked_anon_jwt_allowed(self):
        def jwt(role):
            enc = lambda x: base64.urlsafe_b64encode(json.dumps(x).encode()).decode().rstrip("=")
            return enc({"alg": "HS256"}) + "." + enc({"role": role, "iss": "supabase"}) + "." + "Y" * 40
        self.assertIn((1, "service-role-jwt"), scan_text(jwt("service_role")))
        self.assertEqual(scan_text(jwt("anon")), [])

    def test_binary_payload_does_not_crash(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            (root / "image.webp").write_bytes(b"RIFF\0" + b"sk-proj-" + b"X" * 50)
            self.assertEqual(audit_file(root, Path("image.webp")), [])


if __name__ == "__main__":
    unittest.main()
