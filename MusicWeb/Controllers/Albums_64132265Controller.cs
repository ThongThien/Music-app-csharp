using System.Linq;
using System.Web.Mvc;
using MusicWeb.Data;
using MusicWeb.Models;

namespace MusicWeb.Controllers
{
    public class AlbumsController : Controller
    {
        private readonly MusicDbContext _context;

        public AlbumsController()
        {
            _context = new MusicDbContext();
        }

        [HttpGet]
        public JsonResult GetAlbumDetails(string albumName)
        {
            if (string.IsNullOrWhiteSpace(albumName))
            {
                return Json(new { success = false, message = "Album name is required" }, JsonRequestBehavior.AllowGet);
            }

            var album = _context.Album.FirstOrDefault(a => a.AlbumName == albumName);
            if (album == null)
            {
                return Json(new { success = false, message = "Album not found" }, JsonRequestBehavior.AllowGet);
            }

            return Json(new { success = true, data = album }, JsonRequestBehavior.AllowGet);
        }


    }
}
