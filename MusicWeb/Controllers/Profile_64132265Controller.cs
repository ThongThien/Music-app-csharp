using System.Collections.Generic;
using System.Linq;
using System.Web.Mvc;
using MusicWeb.Data;
using MusicWeb.Models;

namespace MusicWeb.Controllers
{
    public class Profile_64132265Controller : Controller
    {
        private readonly MusicDbContext _context;

        public Profile_64132265Controller()
        {
            _context = new MusicDbContext();
        }

        public ActionResult Index()
        {
            var roleId = Session["RoleId"] as int?;
            var userId = Session["UserId"] as int?;

            if (roleId == null || userId == null)
            {
                return RedirectToAction("Login", "Account");
            }

            if (roleId == 2) // RoleId = 2 là Admin
            {
                var users = _context.User
                                   .Where(u => u.RoleId != 2)
                                   .Select(u => new
                                   {
                                       u.UserId,
                                       u.UserName,
                                       u.Email
                                   })
                                   .ToList();

                var songs = _context.Song
                    .Select(s => new
                    {
                        s.SongId,
                        s.SongName,
                        s.FilePath,
                        s.ImagePath
                    })
                    .ToList();

                ViewBag.Users = users;
                ViewBag.Songs = songs;

                return View("AdminDashboard_64132265");
            }

            var user = _context.User
                .Where(u => u.UserId == userId)
                .Select(u => new
                {
                    u.UserName,
                    u.Email,
                    u.Name
                })
                .FirstOrDefault();

            if (user == null)
            {
                return HttpNotFound("User not found.");
            }

            ViewBag.UserName = user.UserName;
            ViewBag.Email = user.Email;
            ViewBag.Name = user.Name;
            var achievements = new List<string>
            {
                "You have listened to 100 songs.",
                "You have created 10 playlists.",
                "You are a top listener this month.",
                "You unlocked the 'Music Enthusiast' badge.",
                "You have spent 50 hours listening to music."
            };

            ViewBag.Achievements = achievements;

            return View("UserDashboard_64132265");
        }
        protected override void Dispose(bool disposing)
        {
            _context.Dispose();
        }
    }
}
