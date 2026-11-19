import tempfile, unittest, zipfile
from pathlib import Path
from build_rc14_review import safe, candidate_hashes, archive_hashes, build_zip, compare

class ReviewPackageTests(unittest.TestCase):
    def test_safe_paths(self):
        self.assertFalse(safe("../escape"))
        self.assertFalse(safe("/abs"))
        self.assertFalse(safe("foo\\\\bar"))
        self.assertTrue(safe("enciclopedia/guias/index.html"))
    def test_source_only_files_are_not_ignored(self):
        result = compare({"index.html":"a", "new":"b"}, {"index.html":"c", "legacy":"d"})
        self.assertEqual(result["status"], "REVIEW_REQUIRED")
        self.assertEqual(result["source_only_files_at_risk"], ["legacy"])
        self.assertEqual(result["changed_files"], ["index.html"])
    def test_zip_exact_bytes(self):
        with tempfile.TemporaryDirectory() as temp:
            src=Path(temp)/"site"; src.mkdir()
            (src/"index.html").write_bytes(b"test")
            (src/"img.webp").write_bytes(b"RIFF\\x00\\x01")
            hashes=candidate_hashes(src)
            z=Path(temp)/"candidate.zip"
            build_zip(src,z,hashes)
            self.assertEqual(archive_hashes(z), hashes)
    def test_traversal_zip_rejected(self):
        with tempfile.TemporaryDirectory() as temp:
            z=Path(temp)/"bad.zip"
            with zipfile.ZipFile(z,"w") as f:f.writestr("../escape", "x")
            with self.assertRaises(ValueError):archive_hashes(z)

if __name__=="__main__":
    unittest.main()
