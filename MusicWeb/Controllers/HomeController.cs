using System;
using System.Data.SqlClient;
using System.Linq;
using System.Web.Mvc;
using MusicWeb.Models;
using System.Data.Entity;
namespace MusicWeb.Controllers
{
    public class HomeController : Controller
    {
        private readonly MusicAppDB_new_webEntities _context;

        public HomeController()
        {
            _context = new MusicAppDB_new_webEntities(); // Sử dụng DbContext tự động sinh
        }

        public ActionResult Index()
        {
            var viewModel = new HomeViewModel
            {
                Songs = _context.Songs.ToList(),
                Artists = _context.Artists.ToList(),
                Albums = _context.Albums.ToList(),
                Playlists = null 
            };

            if (Session["UserId"] != null)
            {
                int userId = (int)Session["UserId"];
                viewModel.Playlists = _context.Playlists.Where(p => p.UserId == userId).ToList();
            }

            return View(viewModel);
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                _context.Dispose();
            }
            base.Dispose(disposing);
        }

        [HttpGet]
        public JsonResult Search(string searchTerm)
        {
            var results = _context.Database.SqlQuery<Song>(
                "EXEC SearchMusic @SearchTerm",
                new SqlParameter("@SearchTerm", searchTerm ?? string.Empty)
            ).ToList();

            return Json(results, JsonRequestBehavior.AllowGet);
        }

        [HttpGet]
        public JsonResult GetSongsByPlaylist(int playlistId)
        {
            var songs = _context.Playlists
                                .Where(p => p.PlaylistId == playlistId)
                                .SelectMany(p => p.Songs)
                                .Select(s => new
                                {
                                    s.SongId,
                                    s.SongName,
                                    s.FilePath,
                                    s.ImagePath,
                                    ArtistName = s.Artists.Select(a => a.ArtistName).FirstOrDefault() ?? "Unknown Artist"
                                })
                                .ToList();

            return Json(songs, JsonRequestBehavior.AllowGet);
        }

        [HttpGet]
        public JsonResult GetAllSongs()
        {
            var songs = _context.Songs
                                .Select(s => new
                                {
                                    s.SongId,
                                    s.SongName,
                                    s.FilePath,
                                    s.ImagePath
                                })
                                .ToList();

            return Json(songs, JsonRequestBehavior.AllowGet);
        }

        public JsonResult GetPlaylistsByUserId()
        {
            if (Session["UserId"] == null)
            {
                return Json(new { success = false, message = "User is not logged in." }, JsonRequestBehavior.AllowGet);
            }

            int userId = (int)Session["UserId"];
            var playlists = _context.Playlists
                                    .Where(p => p.UserId == userId)
                                    .Select(p => new
                                    {
                                        PlaylistId = p.PlaylistId,
                                        PlaylistName = p.PlaylistName
                                    })
                                    .ToList();

            return Json(new { success = true, playlists }, JsonRequestBehavior.AllowGet);
        }

        [HttpGet]
        public JsonResult GetSongsByArtist(int artistId)
        {
            var songs = _context.Songs
                                .Where(s => s.Artists.Any(a => a.ArtistId == artistId))
                                .Select(s => new
                                {
                                    s.SongId,
                                    s.SongName,
                                    s.FilePath,
                                    s.ImagePath
                                })
                                .ToList();

            return Json(songs, JsonRequestBehavior.AllowGet);
        }

        [HttpGet]
        public JsonResult GetSongsByAlbum(int albumId)
        {
            var songs = _context.Songs
                                .Where(s => s.AlbumId == albumId)
                                .Select(s => new
                                {
                                    s.SongId,
                                    s.SongName,
                                    s.FilePath,
                                    s.ImagePath
                                })
                                .ToList();

            return Json(songs, JsonRequestBehavior.AllowGet);
        }
        [HttpGet]
        public JsonResult GetSongInfo(int songId)
        {
            var song = _context.Songs
                .Where(s => s.SongId == songId)
                .Select(s => new
                {
                    s.SongId,
                    s.SongName,
                    s.FilePath,
                    s.ImagePath,
                    Artist = s.Artists.Select(a => a.ArtistName).FirstOrDefault(),
                    ArtistBio = s.Artists.Select(a => a.Bio).FirstOrDefault(), 
                    Album = s.Album.AlbumName
                })
                .FirstOrDefault();

            if (song == null)
            {
                return Json(new { success = false, message = "Song not found." }, JsonRequestBehavior.AllowGet);
            }

            return Json(new { success = true, song }, JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public JsonResult AddPlaylist(string playlistName)
        {
            var userId = Session["UserId"] as int?;
            if (userId == null)
            {
                return Json(new { success = false, message = "User not logged in." });
            }

            // Kiểm tra trùng tên
            var existingPlaylist = _context.Playlists
                .FirstOrDefault(p => p.UserId == userId && p.PlaylistName.Equals(playlistName, StringComparison.OrdinalIgnoreCase));

            if (existingPlaylist != null)
            {
                return Json(new { success = false, message = "Playlist name already exists." });
            }

            var newPlaylist = new Playlist
            {
                PlaylistName = playlistName,
                UserId = userId.Value
            };

            _context.Playlists.Add(newPlaylist);
            _context.SaveChanges();

            return Json(new { success = true, message = "Playlist added successfully." });
        }

        [HttpPost]
        public JsonResult DeletePlaylist(string playlistName)
        {
            var userId = Session["UserId"] as int?;
            if (userId == null)
            {
                return Json(new { success = false, message = "User not logged in." });
            }

            var playlist = _context.Playlists
                .FirstOrDefault(p => p.UserId == userId && p.PlaylistName.Equals(playlistName, StringComparison.OrdinalIgnoreCase));

            if (playlist == null)
            {
                return Json(new { success = false, message = "Playlist not found." });
            }

            _context.Playlists.Remove(playlist);
            _context.SaveChanges();

            return Json(new { success = true, message = "Playlist deleted successfully." });
        }

        [HttpPost]
        public JsonResult AddSongToPlaylist(int playlistId, int songId)
        {
            var playlist = _context.Playlists
                .Include(p => p.Songs) 
                .FirstOrDefault(p => p.PlaylistId == playlistId);

            if (playlist == null)
            {
                return Json(new { success = false, message = "Playlist not found." });
            }

            if (playlist.Songs.Any(s => s.SongId == songId))
            {
                return Json(new { success = false, message = "Song already exists in the playlist." });
            }

            var song = _context.Songs.Find(songId); 
            if (song == null)
            {
                return Json(new { success = false, message = "Song not found." });
            }

            playlist.Songs.Add(song);
            _context.SaveChanges();

            return Json(new { success = true, message = "Song added to playlist successfully." });
        }

        [HttpPost]
        public JsonResult RemoveSongFromPlaylist(int playlistId, int songId)
        {
            try
            {
                var playlist = _context.Playlists
                    .Include(p => p.Songs)
                    .FirstOrDefault(p => p.PlaylistId == playlistId);

                if (playlist == null)
                {
                    return Json(new { success = false, message = "Playlist not found." });
                }

                var song = playlist.Songs.FirstOrDefault(s => s.SongId == songId);
                if (song == null)
                {
                    return Json(new { success = false, message = "Song not found in the playlist." });
                }

                playlist.Songs.Remove(song);
                _context.SaveChanges();

                return Json(new { success = true, message = "Song removed successfully." });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = ex.Message });
            }
        }
    }

}
