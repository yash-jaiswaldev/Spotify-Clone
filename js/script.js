console.log("Lets write some Javascript");

let songs = [];
let currFolder = "";
let currentSong = new Audio();
let globalData = {};

function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) return "00:00";
    let minutes = Math.floor(seconds / 60);
    let secs = Math.floor(seconds % 60);
    if (secs < 10) secs = "0" + secs;
    return `${minutes}:${secs}`;
}

const playMusic = (track, pause = false) => {
    currentSong.src = `/${currFolder}/${track}`;
    if (!pause) {
        let playPromise = currentSong.play();
        if (playPromise !== undefined) {
            playPromise.then(() => {
                play.src = "img/pause.svg";
            }).catch(error => {
                console.log("Playback error:", error);
            });
        }
    }
    document.querySelector(".songinfo").innerHTML = decodeURIComponent(track);
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
};

async function getSongs(folder) {
    currFolder = folder;
    let folderKey = folder.split("/").pop();

    if (globalData[folderKey]) {
        songs = globalData[folderKey].songs;
    } else {
        songs = [];
    }

    let songUL = document.querySelector(".songList ul");
    songUL.innerHTML = "";

    for (const song of songs) {
        songUL.innerHTML += `
        <li>
            <img class="invert" src="img/music.svg" alt="">
            <div class="info">
                <div>${song.replaceAll("%20", " ")}</div>
                <div>Artist</div>
            </div>
            <div class="playnow">
                Play Now
                <img class="invert" src="img/play.svg" alt="">
            </div>
        </li>`;
    }

    Array.from(document.querySelectorAll(".songList li")).forEach(e => {
        e.addEventListener("click", () => {
            let track = e.querySelector(".info div").innerHTML.trim();
            playMusic(track);
        });
    });

    return songs;
}

async function displayAlbums() {
    try {
        let res = await fetch('/songs.json');
        globalData = await res.json();

        let cardContainer = document.querySelector(".cardContainer");
        cardContainer.innerHTML = "";

        for (let folder in globalData) {
            let album = globalData[folder];
            cardContainer.innerHTML += `
            <div data-folder="${folder}" class="card">
                <div class="play">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                        <circle cx="12" cy="12" r="12" fill="#22c55e" />
                        <polygon points="7.2,5.6 17.6,12 7.2,18.4" fill="#000000" />
                    </svg>
                </div>
                <img src="/songs/${folder}/cover.jpg" alt="">
                <h3>${album.title}</h3>
                <p>${album.description}</p>
            </div>`;
        }

        Array.from(document.getElementsByClassName("card")).forEach(e => {
            e.addEventListener("click", async item => {
                songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
                playMusic(songs[0]);
            });
        });
    } catch (err) {
        console.error("Error loading songs.json:", err);
    }
}

async function main() {
    await displayAlbums();
    await getSongs("songs/cs");
    if (songs.length > 0) {
        playMusic(songs[0], true);
    }

    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "img/pause.svg";
        } else {
            currentSong.pause();
            play.src = "img/play.svg";
        }
    });

    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${formatTime(currentSong.currentTime)} / ${formatTime(currentSong.duration)}`;
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    });

    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = (currentSong.duration * percent) / 100;
    });

    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
    });

    previous.addEventListener("click", () => {
        let currentTrack = decodeURIComponent(currentSong.src.split("/").pop()).trim();
        let index = songs.indexOf(currentTrack);
        if (index > 0) {
            playMusic(songs[index - 1]);
        }
    });

    next.addEventListener("click", () => {
        let currentTrack = decodeURIComponent(currentSong.src.split("/").pop()).trim();
        let index = songs.indexOf(currentTrack);
        if (index !== -1 && (index + 1) < songs.length) {
            playMusic(songs[index + 1]);
        } else {
            playMusic(songs[0]);
        }
    });

    document.querySelector(".range input").addEventListener("change", (e) => {
        currentSong.volume = parseInt(e.target.value) / 100;
    });

    document.querySelector(".volume img").addEventListener("click", e => {
        if (e.target.src.includes("img/volume.svg")) {
            e.target.src = e.target.src.replace("img/volume.svg", "img/mute.svg");
            currentSong.volume = 0;
            document.querySelector(".range input").value = 0;
        } else {
            e.target.src = e.target.src.replace("img/mute.svg", "img/volume.svg");
            currentSong.volume = 0.10;
            document.querySelector(".range input").value = 10;
        }
    });
}

main();