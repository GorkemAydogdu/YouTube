const row = document.querySelector(".row");
const overview = document.querySelector(".overview");
const overviewLeft = document.querySelector(".overview__background--left");
const overviewLeftButton = document.querySelector(".overview__left");
const overviewRight = document.querySelector(".overview__background--right");
const overviewRightButton = document.querySelector(".overview__right");
const overviewWrapper = document.querySelectorAll(".overview__wrapper");
overview.scrollLeft = 0;

const menuBtn = document.querySelector(".header__menu");
const sidebar = document.querySelector(".sidebar");
const main = document.querySelector(".main");

const api_key = "AIzaSyB61dCiMiNQ0njfW4uUCORhE2P96oQrMs0";
const video_url = "https://www.googleapis.com/youtube/v3/videos?";
const channel_url = "https://www.googleapis.com/youtube/v3/channels?";

async function getVideo() {
    const video = await fetch(video_url + new URLSearchParams({
        key: api_key,
        part: 'snippet, statistics, contentDetails',
        chart: 'mostPopular',
        maxResults: 50,
        regionCode: 'TR'
    }));


    const data = await video.json();
    data.items.forEach(item => {

        // Video Date
        let now = new Date();
        let videoDate = new Date(item.snippet.publishedAt);

        let ms = now - videoDate;
        let second = ms / 1000;
        let minute = second / 60;
        let hour = minute / 60;
        let day = hour / 24;
        let month = day / 30;
        let year = month / 12;

        if (second < 60) {
            item.snippet.publishedAt = `${Math.floor(second)} seconds ago`;
        }
        else if (minute < 60) {
            if (minute < 2) {
                item.snippet.publishedAt = `${Math.floor(minute)} minute ago`;
            }
            else {
                item.snippet.publishedAt = `${Math.floor(minute)} minutes ago`;
            }
        }
        else if (hour < 24) {
            if (hour < 2) {
                item.snippet.publishedAt = `${Math.floor(hour)} hour ago`;
            }
            else {
                item.snippet.publishedAt = `${Math.floor(hour)} hours ago`;
            }
        }
        else if (day < 30) {
            if (day < 2) {
                item.snippet.publishedAt = `${Math.floor(day)} day ago`;
            }
            else {
                item.snippet.publishedAt = `${Math.floor(day)} days ago`;
            }
        }
        else if (month < 12) {
            if (month < 2) {
                item.snippet.publishedAt = `${Math.floor(month)} month ago`;
            }
            else {
                item.snippet.publishedAt = `${Math.floor(month)} months ago`;
            }
        }
        else if (year >= 1) {
            if (year < 2) {
                item.snippet.publishedAt = `${Math.floor(year)} year ago`;
            }
            else {
                item.snippet.publishedAt = `${Math.floor(year)} years ago`;
            }
        }

        // Video Views
        if (item.statistics.viewCount > 999 && item.statistics.viewCount < 1000000) {
            item.statistics.Count = convertToInternationalCurrencySystem(item.statistics.viewCount).substring(0, 3).replace(".", "") + "K";
        }
        else if (item.statistics.viewCount > 1000000 && item.statistics.viewCount < 1000000000) {
            item.statistics.Count = convertToInternationalCurrencySystem(item.statistics.viewCount).substring(0, 3).replace(".0", "") + "M";
        }
        else {
            item.statistics.Count = convertToInternationalCurrencySystem(item.statistics.viewCount).substring(0, 3) + "B"
        }

        // Video Duration
        item.contentDetails.duration = converTime(item.contentDetails.duration);
        getChannel(item);
    })
}

// Video id'e göre bilgiler alnıp thumbnail video'ya ekleniyor
async function getChannel(video) {
    const channel = await fetch(channel_url + new URLSearchParams({
        key: api_key,
        part: 'snippet',
        id: video.snippet.channelId,
    }));

    const data = await channel.json();
    video.snippet.channelLogo = data.items[0].snippet.thumbnails.default.url;
    createVideo(video);
}

function converTime(d) {
    //ignore the "PT" part
    d = d.search(/PT/i) > -1 ? d.slice(2) : d;
    let h, m, s;
    //indexes of the letters h, m, s in the duration
    let hIndex = d.search(/h/i),
        mIndex = d.search(/m/i),
        sIndex = d.search(/s/i);
    //is h, m, s inside the duration
    let dContainsH = hIndex > -1,
        dContainsM = mIndex > -1,
        dContainsS = sIndex > -1;
    //setting h, m, s
    h = dContainsH ? d.slice(0, hIndex) + ":" : "";
    m = dContainsM ? d.slice(dContainsH ? hIndex + 1 : 0, mIndex) : dContainsH ? "0" : "0";
    s = dContainsS ? d.slice(dContainsM ? mIndex + 1 : hIndex + 1, sIndex) : "0";
    //adding 0 before m or s
    s = (dContainsM || dContainsS) && s < 10 ? "0" + s : s;
    m = (dContainsH || dContainsM) && m < 10 ? "0" + m + ":" : m + ":";
    return d !== "0S" ? h + m + s : "LIVE"
}

// gelen sayının karşılığını döndürür
function convertToInternationalCurrencySystem(count) {
    // Nine Zeroes for Billions
    return Math.abs(Number(count)) >= 1.0e+9

        ? (Math.abs(Number(count)) / 1.0e+9).toFixed(3) + "B"
        // Six Zeroes for Millions
        : Math.abs(Number(count)) >= 1.0e+6

            ? (Math.abs(Number(count)) / 1.0e+6).toFixed(3) + "M"
            // Three Zeroes for Thousands
            : Math.abs(Number(count)) >= 1.0e+3

                ? (Math.abs(Number(count)) / 1.0e+3).toFixed(3) + "K"

                : Math.abs(Number(count));
}
// Video oluşturma
function createVideo(data) {
    const video = `
    <div class="video__thumbnail">
      <img
        class="video__img"
        src="${data.snippet.thumbnails.medium.url}"
        alt="${data.snippet.title}"
      />
      <span class="video__time">${data.contentDetails.duration}</span>
    </div>
    <div class="video__details">
      <div class="video__logo">
        <img src="${data.snippet.channelLogo}" alt="${data.snippet.title}" />
      </div>
      <div class="video__info">
        <span class="video__name"
          >${data.snippet.title}</span
        >
        <span class="video__channel-name"
          >${data.snippet.channelTitle}</span
        >
        <div class="video__statistics">
          <span class="video__views">${data.statistics.Count} views</span>
          <span class="video__date">${data.snippet.publishedAt}</span>
        </div>
      </div>
    </div>
    `;
    const videoGroup = document.createElement("div");
    videoGroup.classList.add("video__group");
    videoGroup.innerHTML += video;

    row.appendChild(videoGroup);

}

// Butonlara tıklandığında sağa sola kaydır
overviewRightButton.addEventListener('click', () => {
    overview.scrollLeft += 100;
    if (overview.scrollLeft === overview.scrollWidth - overview.clientWidth) {
        overviewRight.style.display = "none";
    }
    else {
        overviewRight.style.display = "block";
    }

    overviewLeft.style.display = "block";
})

overviewLeftButton.addEventListener('click', () => {
    overview.scrollLeft -= 100;
    if (overview.scrollLeft === 0) {
        overviewLeft.style.display = "none";
    }
    overviewRight.style.display = "block";
})

// Scroll olduğunda overview butonları none
window.addEventListener('scroll', () => {
    if (window.scrollY > 0) {
        overviewWrapper.forEach(item => {
            item.style.display = "none";
        })
    }
    else {
        overviewWrapper.forEach(item => {
            item.style.display = "flex";
        })
    }

})

window.onresize = displayWindowSize;
window.onload = displayWindowSize;

function displayWindowSize() {
    let myWidth = window.innerWidth;
    // your size calculation code here
    if (myWidth < 1000) {
        sidebar.style.transform = "translateX(-100%)";
        main.style.left = "0";
    } else {
        sidebar.style.transform = "translateX(0%)";
        main.style.left = "25.6rem"
    }
};

menuBtn.addEventListener('click', () => {
    let myWidth = window.innerWidth;

    if (sidebar.style.transform === "translateX(-100%)") {
        if (myWidth < 1000) {
            main.style.left = "0";
        } else {
            main.style.left = "25.6rem";
        }
        sidebar.style.transform = "translateX(0%)";
    }
    else {
        sidebar.style.transform = "translateX(-100%)";
        main.style.left = "0";

    }
})

getVideo();