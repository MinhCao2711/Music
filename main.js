const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)

const PLAYER_STORAGE_KEY = 'F8_PLAYER'

const player = $('.player')
const cd = $('.cd')
const heading = $('header h2')
const cdThumb = $('.cd-thumb')
const audio = $('#audio')
const playBtn = $('.btn-toggle-play')
const progress = $('#progress')
const prevBtn = $('.btn-prev')
const nextBtn = $('.btn-next')
const randomBtn = $('.btn-random')
const repeatBtn = $('.btn-repeat')
const playlist = $('.playlist')


const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    songs: [
        {
            name: 'Lúc Nhỏ',
            singer: 'Kid',
            path: './asset/music/luc_nho.mp3',
            img: './asset/img/luc_nho.jpg'
        },
        {
            name: 'Nevada',
            singer: 'Vicetone',
            path: './asset/music/nevada.mp3',
            img: './asset/img/nevada.jpg'
        },
        {
            name: 'All Night',
            singer: 'Icona Pop',
            path: './asset/music/all_night.mp3',
            img: './asset/img/all_night.jpg'
        },
        {
            name: 'Cưới Thôi',
            singer: 'Masiu x Masew',
            path: './asset/music/cuoi_thoi.mp3',
            img: './asset/img/cuoi_thoi.jpg'
        },
        {
            name: 'Blue',
            singer: 'Steve Void',
            path: './asset/music/blue.mp3',
            img: './asset/img/blue.jpg'
        },
        {
            name: 'Có Hẹn Với Thanh Xuân',
            singer: 'Monstar x Freak D',
            path: './asset/music/co_hen_voi_thanh_xuan.mp3',
            img: './asset/img/co_hen_voi_thanh_xuan.jpg'
        },
        {
            name: 'Point The Star',
            singer: 'ANT Muzik',
            path: './asset/music/point_the_star.mp3',
            img: './asset/img/point_the_star.jpg'
        },
        {
            name: 'Trước Khi Tuổi Trẻ Này Đóng Lối',
            singer: '1 9 6 7',
            path: './asset/music/truoc_khi_tuoi_tre_nay_dong_loi.mp3',
            img: './asset/img/truoc_khi_tuoi_tre_nay_dong_loi.jpg'
        },
        {
            name: 'REEVES',
            singer: 'MANBO',
            path: './asset/music/manbo.mp3',
            img: './asset/img/manbo.jpg'
        },
        {
            name: 'Bài Ca Tuổi Trẻ',
            singer: 'TamKa PKL',
            path: './asset/music/bai_ca_tuoi_tre.mp3',
            img: './asset/img/bai_ca_tuoi_tre.jpg'
        },
    ],
    setConfig: function(key, value) {
        this.config[key] = value;
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config))
    },
    render: function() {
        const htmls = this.songs.map((song, index) => {
            return `
                <div class="song ${index === this.currentIndex ? 'active' : ''}" data-index="${index}">
                <div class="thumb" style="background-image: url('${song.img}')">
                </div>
                <div class="body">
                <h3 class="title">${song.name}</h3>
                <p class="author">${song.singer}</p>
                </div>
                <div class="option">
                <i class="fas fa-ellipsis-h"></i>
                </div>
            </div>
            `
        })
        playlist.innerHTML = htmls.join('')
    },
    defineProperties: function() {
        Object.defineProperty(this, 'currentSong', {
            get: function() {
                return this.songs[this.currentIndex]
            }
        })
    },
    handleEvents: function() {
        const _this = this
        const cdWidth = cd.offsetWidth

        // xử lí cd quay và dừng
        const cdThumbAnimate = cdThumb.animate([
            { transform: 'rotate(360deg)'}
        ], {
            duration: 10000,
            iterations: Infinity
        })
        cdThumbAnimate.pause()

        // xử lí phóng to / thu nhỏ cd
        document.onscroll = function() {
            const scrollTop = window.scrollY || document.documentElement.scrollTop
            const newCdWidth = cdWidth - scrollTop

            cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0
            cd.style.opacity = newCdWidth / cdWidth
        }

        // xử lí khi click play
        playBtn.onclick = function() {
            if (_this.isPlaying) {
                audio.pause()
            } else {
                audio.play()
            }
        }

        // khi song được play
        audio.onplay = function() {
            _this.isPlaying = true
            player.classList.add('playing')
            cdThumbAnimate.play()
        }
        // khi song được pause
        audio.onpause = function() {
            _this.isPlaying = false
            player.classList.remove('playing')
            cdThumbAnimate.pause()
        }

        // khi tiến độ bài hát thay đổi
        audio.ontimeupdate = function() {
            if (audio.duration) {
                const progressPercent = Math.floor(audio.currentTime / audio.duration * 100)
                progress.value = progressPercent
            }
        }

        // xử lí khi tua song
        progress.onchange = function(e) {
            const seekTime = audio.duration / 100 * e.target.value
            audio.currentTime = seekTime
        }

        // khi next song
        nextBtn.onclick = function() {
            if (_this.isRandom) {
            _this.playRamdomSong()
            } else {
                _this.nextSong()
            }
            audio.play()
            _this.render()
            _this.scrollToActiveSong()
        }

        // khi prev song
        prevBtn.onclick = function() {
            if (_this.isRandom) {
                _this.playRamdomSong()
                } else {
                    _this.prevSong()
                }
            audio.play()
            _this.render()
        }

        // xử lí bật tắt random Song
        randomBtn.onclick = function(e) {
            _this.isRandom = !_this.isRandom
            _this.setConfig('isRandom', _this.isRandom)
            randomBtn.classList.toggle('active', _this.isRandom)
        }

        // xử lí phát lại song
        repeatBtn.onclick = function() {
            _this.isRepeat = !_this.isRepeat
            _this.setConfig('isRepeat', _this.isRepeat)
            repeatBtn.classList.toggle('active', _this.isRepeat)
        }

        // xử lí next song khi audio end
        audio.onended = function() {
            if (_this.isRepeat) {
                audio.play()
            } else {
                nextBtn.click()
            }
        }

        // lăng nghe click vào playlist
        playlist.onclick = function(e) {
            const songNode = e.target.closest('.song:not(.active)')
            if(songNode || e.target.closest('.option')) {
                // xử lí khi click vào song
                if(songNode) {
                    _this.currentIndex = Number(songNode.dataset.index)
                    _this.loadCurrentSong()
                    _this.render()
                    audio.play()
                }

                // xử lí khi click vào song option
                if (e.target.closest('.option')) {

                }
            }
        }
    },
    loadCurrentSong: function() {
        heading.textContent = this.currentSong.name
        cdThumb.style.backgroundImage = `url('${this.currentSong.img}')`
        audio.src = this.currentSong.path

        console.log(heading, cdThumb, audio)
    },
    loadConfig: function() {
        this.isRandom = this.config.isRandom
        this.isRepeat = this.config.isRepeat
    },
    nextSong: function() {
        this.currentIndex++
        if (this.currentIndex >= this.songs.length) {
            this.currentIndex = 0
        }
        this.loadCurrentSong()
    },  
    prevSong: function() {
        this.currentIndex--
        if (this.currentIndex < 0) {
            this.currentIndex = this.songs.length - 1
        }
        this.loadCurrentSong()
    },
    scrollToActiveSong: function() {
        setTimeout(() => {
            $('.song.active').scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            })
        }, 300)
    },
    playRamdomSong: function() {
        let newIndex
        do {
            newIndex = Math.floor(Math.random() * this.songs.length)
        } while (newIndex === this.currentIndex)

        this.currentIndex = newIndex
        this.loadCurrentSong()
    },
    
    start: function() {
        // Gán cấu hình từ config
        this.loadConfig()

        // Định nghĩa các Ofjet
        this.defineProperties()

        // Xử lí các sự kiện (DOM events)
        this.handleEvents()

        // Tải thông tin bài hát đầu tiên vào UI
        this.loadCurrentSong()

        // Render playlist
        this.render()

        // Hiển thị trạng thái
        randomBtn.classList.toggle('active', this.isRandom)
        repeatBtn.classList.toggle('active', this.isRepeat)
    }
}

app.start()


