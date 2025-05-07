using System.Linq;
using System.Web.Mvc;
using MusicWeb.Data;
using MusicWeb.Models;

namespace MusicWeb.Controllers
{
    public class Songs_64132265Controller : Controller
    {
        private readonly MusicDbContext _context;

        public Songs_64132265Controller()
        {
            _context = new MusicDbContext();
        }

        public ActionResult Index()
        {
            var songs = _context.Song.ToList(); 
            return View(songs); 
        }

        public ActionResult Details(int id)
        {
            var song = _context.Song.SingleOrDefault(s => s.SongId == id);
            if (song == null)
                return HttpNotFound();

            return View(song);
        }

        public ActionResult Create()
        {
            ViewBag.AlbumId = new SelectList(_context.Album, "AlbumId", "AlbumName"); 
            return View();
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult Create(Song song)
        {
            if (ModelState.IsValid)
            {
                _context.Song.Add(song);
                _context.SaveChanges();
                return RedirectToAction("Index");
            }
            ViewBag.AlbumId = new SelectList(_context.Album, "AlbumId", "AlbumName", song.AlbumId);
            return View(song);
        }

        public ActionResult Edit(int id)
        {
            var song = _context.Song.SingleOrDefault(s => s.SongId == id);
            if (song == null)
                return HttpNotFound();

            ViewBag.AlbumId = new SelectList(_context.Album, "AlbumId", "AlbumName", song.AlbumId);
            return View(song);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult Edit(Song song)
        {
            if (ModelState.IsValid)
            {
                _context.Entry(song).State = System.Data.Entity.EntityState.Modified;
                _context.SaveChanges();
                return RedirectToAction("Index");
            }
            ViewBag.AlbumId = new SelectList(_context.Album, "AlbumId", "AlbumName", song.AlbumId);
            return View(song);
        }

        public ActionResult Delete(int id)
        {
            var song = _context.Song.SingleOrDefault(s => s.SongId == id);
            if (song == null)
                return HttpNotFound();

            return View(song);
        }

        [HttpPost, ActionName("Delete")]
        [ValidateAntiForgeryToken]
        public ActionResult DeleteConfirmed(int id)
        {
            var song = _context.Song.SingleOrDefault(s => s.SongId == id);
            if (song != null)
            {
                _context.Song.Remove(song);
                _context.SaveChanges();
            }

            return RedirectToAction("Index");
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                _context.Dispose();
            }
            base.Dispose(disposing);
        }
    }
}
