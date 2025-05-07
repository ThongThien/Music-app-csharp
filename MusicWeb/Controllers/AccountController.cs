using System;
using System.Linq;
using System.Web.Mvc;
using MusicWeb.Models;

public class AccountController : Controller
{
    private readonly MusicAppDB_new_webEntities _context;

    public AccountController()
    {
        _context = new MusicAppDB_new_webEntities();
    }
    public ActionResult Login()
    {
        return View();
    }

    [HttpPost]
    public ActionResult Login(string username, string password)
    {
        var user = _context.Users.FirstOrDefault(u => u.UserName == username && u.PasswordHash == password);

        if (user != null)
        {
            Session["UserId"] = user.UserId;
            Session["RoleId"] = user.RoleId;

            return Json(new { success = true, redirectUrl = Url.Action("Index", "Home") });
        }

        return Json(new { success = false, message = "Invalid username or password." });
    }

    public ActionResult Logout()
    {
        Session.Clear(); 
        return RedirectToAction("Login", "Account");
    }
}
