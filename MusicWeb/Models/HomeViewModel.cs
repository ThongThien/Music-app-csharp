using System.Collections.Generic;

namespace MusicWeb.Models
{
    public class HomeViewModel
    {
        public IEnumerable<Playlist> Playlists { get; set; } 
        public IEnumerable<Album> Albums { get; set; }
        public IEnumerable<Artist> Artists { get; set; }
        public IEnumerable<Song> Songs { get; set; }
    }

}
