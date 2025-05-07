using System.Linq;
using System.Web.Mvc;
using MusicWeb.Data;
using MusicWeb.Models;

namespace MusicWeb.Controllers
{
    public class Artists_64132265Controller : Controller
    {
        private readonly MusicDbContext _context;

        public Artists_64132265Controller()
        {
            _context = new MusicDbContext();
        }

        public ActionResult Index()
        {
            var artists = _context.Artist.ToList();
            return View(artists);
        }

        [HttpGet]
        public JsonResult GetArtistDetails(string artistName)
        {
            if (string.IsNullOrWhiteSpace(artistName))
            {
                return Json(new { success = false, message = "Artist name is required" }, JsonRequestBehavior.AllowGet);
            }

            var artist = _context.Artist.FirstOrDefault(a => a.ArtistName == artistName);
            if (artist == null)
            {
                return Json(new { success = false, message = "Artist not found" }, JsonRequestBehavior.AllowGet);
            }
            return Json(new { success = true, data = artist }, JsonRequestBehavior.AllowGet);
        }

        protected override void Dispose(bool disposing)
        {
            _context.Dispose();
        }
    }
}
