using System.Data.Entity;
using MusicWeb.Models;

namespace MusicWeb.Data
{
    public class MusicDbContext : DbContext
    {
        public MusicDbContext() : base("name=MusicAppDB_new_webEntities") { }

        public DbSet<Playlist> Playlist { get; set; }
        public DbSet<Song> Song { get; set; }
        public DbSet<Album> Album { get; set; }
        public DbSet<Artist> Artist { get; set; }
        public DbSet<User> User { get; set; }

        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Playlist>().ToTable("Playlist");
            modelBuilder.Entity<Song>().ToTable("Song");
            modelBuilder.Entity<Album>().ToTable("Album");
            modelBuilder.Entity<Artist>().ToTable("Artist");

            // Thiết lập quan hệ nhiều-nhiều giữa Playlist và Song
            modelBuilder.Entity<Playlist>()
                .HasMany(p => p.Songs)
                .WithMany(s => s.Playlists)
                .Map(m =>
                {
                    m.ToTable("PlaylistSong"); // Tên bảng trung gian
                    m.MapLeftKey("PlaylistId"); // Khóa ngoại đến Playlist
                    m.MapRightKey("SongId"); // Khóa ngoại đến Song
                });
        }
    }
}
