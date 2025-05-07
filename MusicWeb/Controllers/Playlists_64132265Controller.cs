using System.Linq;
using System.Web.Mvc;
using MusicWeb.Data;
using MusicWeb.Models;

namespace MusicWeb.Controllers
{
    public class Playlists_64132265Controller : Controller
    {
        private readonly MusicDbContext _context;

        public Playlists_64132265Controller()
        {
            _context = new MusicDbContext();
        }

        public ActionResult Index()
        {
            var playlists = _context.Playlist.ToList();
            return View(playlists);
        }

        protected override void Dispose(bool disposing)
        {
            _context.Dispose();
        }
    }
}
