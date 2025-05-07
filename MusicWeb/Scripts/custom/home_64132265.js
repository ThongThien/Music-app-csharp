
    let songs = []; // Danh sách bài hát trong Playlist (nếu có)
    let playedSongs = []; // Mảng lưu bài hát đã phát
    let currentIndex = -1; // Chỉ mục bài hát hiện tại
    let isLoggedIn = false; // Kiểm tra trạng thái đăng nhập
    function redirectToProfile() {
        window.location.href = '/Profile_64132265'; 
    }
    function loadPlaylists() {
        $.ajax({
            url: '/Home/GetPlaylistsByUserId',
            method: 'GET',
            success: function (response) {
                if (response.success) {
                    let playlistHtml = '';
                    if (response.playlists.length > 0) {
                        response.playlists.forEach(playlist => {
                            playlistHtml += `
                                <li class="list-group-item playlist-item" data-playlist-id="${playlist.PlaylistId}">
                                    ${playlist.PlaylistName}
                                </li>`;
                        });
                    } else {
                        playlistHtml = '<p>No playlists available.</p>';
                    }
                    $('#playlists').html(playlistHtml);
                } else {
                    console.error(response.message);
                }
            },
            error: function () {
                console.error('Failed to load playlists.');
            }
        });
}
    function loadSongsByPlaylist(playlistId) {
        // Gửi yêu cầu AJAX đến API
        $.ajax({
            url: '/Home/GetSongsByPlaylist',
            method: 'GET',
            data: { playlistId: playlistId },
            success: function (data) {
                if (data.length > 0) {
                    updateSongs(data); // Cập nhật danh sách bài hát
                    let songList = '';
                    data.forEach((song, index) => {
                        songList += `
                    <li class="list-group-item song-item" 
                        data-index="${index}" 
                        data-song-id="${song.SongId}" 
                        data-song-image="${song.ImagePath}" 
                        data-song-file="${song.FilePath}">
                        <i class="btn-play-song bi bi-play-circle me-2" style="font-size: 1.5rem; cursor: pointer;"></i>
                        ${song.SongName}
                    </li>`;
                    });
                    $('#songs-list').html(songList);

                    // Gắn sự kiện click để phát bài khi click vào danh sách
                    $('.song-item').on('click', function () {
                        const index = $(this).data('index');
                        playSongAtIndex(index);
                    });
                }
            },
            error: function () {
                console.error('Failed to load songs for Playlist ID:', playlistId);
            }
        });




    }
    function filterList(selector, searchTerm) {
        $(selector).each(function () {
            const text = $(this).text().toLowerCase();
            $(this).toggle(text.includes(searchTerm));
        });
    }
    function performSearch() {
        const searchTerm = $('#search-input').val().toLowerCase().trim(); 
        if (searchTerm.length > 0) {
            const activeTab = $('.nav-tabs .nav-link.active').attr('href'); 
            if (activeTab === '#songs') {
                filterList('#songs-list .song-item', searchTerm);
            } else if (activeTab === '#artists') {
                filterList('#artists .list-group-item', searchTerm); 
            } else if (activeTab === '#albums') {
                filterList('#albums .list-group-item', searchTerm); 
            }
        }
    }
    function activateTabFromHash() {
        const hash = window.location.hash;
        if (hash) {
            const targetTab = $(`a[href="${hash}"]`);
            if (targetTab.length) {
                targetTab.tab('show');
            }
        } else {
            $('a[href="#songs"]').tab('show');
        }
    }
    function formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

    let currentPlayingSongId = null; 
    let currentPlayingAudio = null;
    function playSong(song) {
        if (currentPlayingAudio) {
            currentPlayingAudio.pause(); 
            $('#song-image').removeClass('playing');
        }

        currentPlayingSongId = song.id; 
        currentPlayingAudio = $('#audio-player')[0]; 

        $('#song-image').attr('src', song.image); 
        $('#now-playing-song-name').text(`Playing: ${song.name || 'Unknown Song'}`); 
        $('#audio-player').attr('src', song.file); 
        $('#audio-player')[0].play();  
        $('#song-image').addClass('playing');

        $.ajax({
            url: '/Home/GetSongInfo',
            method: 'GET',
            data: { songId: song.id },
            success: function (response) {
                if (response.success) {
                    const artistName = response.song.Artist || 'Unknown Artist';
                    const artistBio = response.song.ArtistBio || 'No biography available'; 

                    // Cập nhật link nghệ sĩ
                    $('#artist-details-link').text(artistName).data('artist', artistName);
                    $('#album-name').text(`Album: ${response.song.Album || 'Unknown Album'}`);

                    // Hiển thị thông tin chi tiết
                    $('#artist-name').text(artistName);
                    $('#artist-bio').text(artistBio);
                    $('#artist-details').hide(); // Ẩn chi tiết ban đầu
                } else {
                    console.error('Error fetching artist information:', response.message);
                }
            },
            error: function () {
                console.error('Failed to fetch song information.');
            }
        });
        $('#audio-player').on('loadedmetadata', function () {
            const duration = Math.floor(this.duration);
            $('#duration-time').text(formatTime(duration));
            $('#song-slider').attr('max', duration);
        });
        $('#audio-player').on('timeupdate', function () {
            const currentTime = Math.floor(this.currentTime);
            $('#current-time').text(formatTime(currentTime));
            $('#song-slider').val(currentTime);
        });
        $('#song-slider').on('input', function () {
            $('#audio-player')[0].currentTime = $(this).val();
        });
        $('#audio-player').on('ended', function () {
            $('#song-image').removeClass('playing'); 
        });
    }
    function updateMainContentTitle(title) {
        $('#main-content-title').text(title);
    }
    function updateSongs(newSongs) {
        songs = newSongs;
        currentIndex = -1; // Reset chỉ mục
        playedSongs = []; // Reset mảng bài đã phát
    }
    function playSongAtIndex(index) {
        if (songs.length === 0 && !isLoggedIn) {
            console.error("No songs available.");
            return;
        }

        if (index < 0 || index >= songs.length) {
            console.error("Invalid song index.");
            return;
        }

        const song = songs[index];
        currentIndex = index;

        // Lưu bài hát hiện tại vào mảng bài đã phát
        if (currentIndex !== -1) {
            playedSongs.push(songs[currentIndex]);
        }

        // Phát bài hát
        playSong({
            id: song.SongId,
            name: song.SongName,
            file: song.FilePath,
            image: song.ImagePath,
        });
}
    $(document).ready(function () {

            const userId = $('#user-id').val(); 

            if (!userId) {
                $.ajax({
                    url: '/Home/GetAllSongs',
                    method: 'GET',
                    success: function (data) {
                        if (data.length > 0) {
                            updateSongs(data); 
                        }
                    },
                    error: function () {
                        console.error('Failed to load all songs.');
                    }
                });
            }

            $('#search-btn').on('click', performSearch);
            $('#search-input').on('keypress', function (e) {
                if (e.which === 13) {
                    performSearch();
                }
            });

            $(window).on('hashchange', activateTabFromHash);

            activateTabFromHash();

            $('.nav-link').on('click', function () {
                const target = $(this).attr('href');
                history.replaceState(null, null, target);
            });
            $('#btn-add-playlist').on('click', function () {
                const playlistName = $('#playlist-name').val().trim();
                if (!playlistName) {
                    alert('Please enter a playlist name.');
                    return;
                }

                $.ajax({
                    url: '/Home/AddPlaylist',
                    method: 'POST',
                    data: { playlistName: playlistName },
                    success: function (response) {
                        if (response.success) {
                            alert('Playlist added successfully!');
                            $('#playlist-name').val(''); 
                            location.reload(); 
                        } else {
                            alert('Failed to add playlist: ' + response.message);
                        }
                    },
                    error: function () {
                        alert('Error occurred while adding playlist.');
                    }
                });
            });
            $('#btn-delete-playlist').on('click', function () {
                const playlistName = $('#playlist-name').val().trim();
                if (!playlistName) {
                    alert('Please enter a playlist name to delete.');
                    return;
                }

                $.ajax({
                    url: '/Home/DeletePlaylist',
                    method: 'POST',
                    data: { playlistName: playlistName },
                    success: function (response) {
                        if (response.success) {
                            alert('Playlist deleted successfully!');
                            $('#playlist-name').val(''); 
                            location.reload(); 
                        } else {
                            alert('Failed to delete playlist: ' + response.message);
                        }
                    },
                    error: function () {
                        alert('Error occurred while deleting playlist.');
                    }
                });
            });

            if ($('#playlist-section').length && $('#playlists').length) {
                    loadPlaylists();
            }

            // Audio player metadata and time update
            $('#audio-player').on('loadedmetadata', function () {
                const duration = Math.floor(this.duration);
                $('#duration-time').text(formatTime(duration));
                $('#song-slider').attr('max', duration);
            });

            $('#audio-player').on('timeupdate', function () {
                const currentTime = Math.floor(this.currentTime);
                $('#current-time').text(formatTime(currentTime));
                $('#song-slider').val(currentTime);
            });

            $('#song-slider').on('input', function () {
                $('#audio-player')[0].currentTime = $(this).val();
            });
    });
    $(document).on('click', '.add-to-playlist', function (e) {
                e.preventDefault();

                const songId = $(this).data('song-id');
                const playlistId = $(this).data('playlist-id');
                const playlistName = $(this).text().trim();

                $.ajax({
                    url: '/Home/AddSongToPlaylist',
                    method: 'POST',
                    data: {
                        playlistId: playlistId,
                        songId: songId
                    },
                    success: function (response) {
                        if (response.success) {
                            alert(`Song added to playlist "${playlistName}" successfully.`);
                        } else {
                            alert(response.message);
                        }
                    },
                    error: function () {
                        alert("An error occurred while adding the song to the playlist.");
                    }
                });
            });
    $(document).on('click', '.playlist-item', function () {
            $('.playlist-item').removeClass('active'); // Xóa lớp active khỏi tất cả các playlist
            $(this).addClass('active'); // Gán lớp active cho playlist được click
            const playlistName = $(this).text().trim();
            const playlistId = $(this).data('playlist-id');

            updateMainContentTitle(`Songs from Playlist: ${playlistName}`);

            // AJAX để lấy danh sách bài hát
            $.ajax({
                url: '/Home/GetSongsByPlaylist',
                method: 'GET',
                data: { playlistId: playlistId },
                success: function (data) {
                    let songList = '';
                    if (data.length > 0) {
                        // Tạo danh sách bài hát
                        data.forEach(song => {
                            songList += `
                        <li class="list-group-item song-item" 
                            data-song-id="${song.SongId}" 
                            data-song-image="${song.ImagePath}" 
                            data-song-file="${song.FilePath}">
                            <i class="btn-play-song bi bi-play-circle me-2" style="font-size: 1.5rem; cursor: pointer;"></i>
                            ${song.SongName}
                            <i class="btn-remove-song bi bi-dash-circle text-danger ms-auto" style="font-size: 1.5rem; cursor: pointer;" title="Remove song"></i>
                        </li>`;
                        });
                    } else {
                        songList = '<li class="list-group-item text-center">No songs found in this playlist.</li>';
                    }

                    $('#songs-list').html(songList);
                    $('a[href="#songs"]').tab('show');
                },
                error: function () {
                    console.error('Failed to load songs for Playlist ID:', playlistId);
                }
            });
        });
    $(document).on('click', '.btn-remove-song', function () {
            const songItem = $(this).closest('.song-item');
            const songId = songItem.data('song-id');
            const playlistId = $('.playlist-item.active').data('playlist-id'); // Lấy playlist đang active

            if (!playlistId || !songId) {
                console.error('Playlist ID or Song ID is missing.');
                return;
            }

            // Gửi AJAX để xóa bài hát khỏi playlist
            $.ajax({
                url: '/Home/RemoveSongFromPlaylist',
                method: 'POST',
                data: { playlistId: playlistId, songId: songId },
                success: function (response) {
                    if (response.success) {
                        songItem.remove(); // Xóa bài hát khỏi danh sách
                        console.log('Song removed successfully.');
                    } else {
                        alert(response.message || 'Failed to remove song.');
                    }
                },
                error: function () {
                    alert('An error occurred while removing the song.');
                }
            });
        });
    $(document).on('click', '.btn-play-song', function () {
            const songElement = $(this).closest('.song-item');
            const song = {
                id: songElement.data('song-id'),
                name: songElement.text().trim(),
                file: songElement.data('song-file'),
                image: songElement.data('song-image'),
                artist: {
                    id: songElement.data('artist-id'),
                    name: songElement.data('artist-name'),
                    bio: songElement.data('artist-bio'),
                    image: songElement.data('artist-image'),
                },
                album: {
                    id: songElement.data('album-id'),
                    name: songElement.data('album-name'),
                    releaseDate: songElement.data('album-release-date'),
                    genre: songElement.data('album-genre'),
                    info: songElement.data('album-info'),
                    image: songElement.data('album-image'),
                },
            };

            // Prevent duplicate play if song is already playing
            if (currentPlayingSongId === song.id) {
                console.log("Song is already playing.");
                return;
            }

            // Fetch album/artist details for Info tab
            if (song.album.id || song.album.name) {
                fetchAlbumDetails(song.album.id, song.album.name);
            } else if (song.artist.id || song.artist.name) {
                fetchArtistDetails(song.artist.id, song.artist.name);
            }

            playSong(song);
        });
    $(document).on('click', '.artist-item', function () {
            const artistName = $(this).text().trim(); 
            const artistId = $(this).data('artist-id'); 

            updateMainContentTitle(`Songs by Artist: ${artistName}`);

            $.ajax({
                url: '/Home/GetSongsByArtist', 
                method: 'GET',
                data: { artistId: artistId }, 
                success: function (data) {
                    let songList = '';
                    if (data.length > 0) {
                        // Tạo danh sách bài hát nếu có dữ liệu
                        data.forEach(song => {
                            songList += `
                            <li class="list-group-item song-item" 
                                data-song-id="${song.SongId}" 
                                data-song-image="${song.ImagePath}" 
                                data-song-file="${song.FilePath}">
                                <i class="btn-play-song bi bi-play-circle me-2" style="font-size: 1.5rem; cursor: pointer;"></i>
                                ${song.SongName}
                            </li>`;
                        });
                    } else {
                        songList = '<li class="list-group-item text-center">Không tìm thấy bài hát nào cho nghệ sĩ này.</li>';
                    }
                    // Cập nhật danh sách bài hát
                    $('#songs-list').html(songList);
                    $('a[href="#songs"]').tab('show'); // Chuyển sang tab Songs
                },
                error: function () {
                    console.error('Không tải được danh sách bài hát cho nghệ sĩ:', artistId);
                }
            });
        });
    $(document).on('click', '#artist-details-link', function (e) {
            e.preventDefault();
            const artistName = $(this).data('artist');

            if (artistName) {
                const artistDetails = $('#artist-details');

                if (artistDetails.is(':visible')) {
                    artistDetails.hide();
                } else {
                    artistDetails.show();
                }
            } else {
                console.error('Artist name is missing.');
            }
        });
    $(document).on('click', '.album-item', function () {
            const albumName = $(this).text().trim();
            const albumId = $(this).data('album-id');
            updateMainContentTitle(`Songs from Album: ${albumName}`);

            $.ajax({
                url: '/Home/GetSongsByAlbum',
                method: 'GET',
                data: { albumId: albumId },
                success: function (data) {
                    let songList = '';
                    if (data.length > 0) {
                        data.forEach(song => {
                            songList += `
                            <li class="list-group-item song-item" 
                                data-song-id="${song.SongId}" 
                                data-song-image="${song.ImagePath}" 
                                data-song-file="${song.FilePath}">
                                <i class="btn-play-song bi bi-play-circle me-2" style="font-size: 1.5rem; cursor: pointer;"></i>
                                ${song.SongName}
                            </li>`;
                        });
                    } else {
                        songList = '<li class="list-group-item text-center">Không có bài hát nào trong album này.</li>';
                    }
                    $('#songs-list').html(songList); // Cập nhật danh sách bài hát
                    $('a[href="#songs"]').tab('show'); // Chuyển sang tab Songs
                },
                error: function () {
                    console.error('Không tải được bài hát cho Album ID:', albumId);
                }
            });
    });

    // ===========================================================================
    // Hàm cập nhật danh sách bài hát (khi user chọn Playlist)
    $('#btn-next').on('click', function () {
        if (!isLoggedIn) {
            // User chưa login: phát bài ngẫu nhiên
            const randomIndex = Math.floor(Math.random() * songs.length);
            playSongAtIndex(randomIndex);
        } else {
            // User đã login: phát bài tiếp theo trong Playlist
            if (currentIndex < songs.length - 1) {
                playSongAtIndex(currentIndex + 1);
            } else {
                // Quay lại bài đầu tiên nếu hết danh sách
                playSongAtIndex(0);
            }
        }
    });
    $('#btn-prev').on('click', function () {
        if (playedSongs.length > 1) {
            // Xóa bài hiện tại khỏi mảng bài đã phát và phát bài trước đó
            playedSongs.pop();
            const previousSong = playedSongs[playedSongs.length - 1];
            if (previousSong) {
                playSong({
                    id: previousSong.SongId,
                    name: previousSong.SongName,
                    file: previousSong.FilePath,
                    image: previousSong.ImagePath,
                });
                currentIndex = songs.findIndex(song => song.SongId === previousSong.SongId);
            }
        } else {
            // Không có bài trước đó, replay bài hiện tại
            playSongAtIndex(currentIndex);
        }
    });

