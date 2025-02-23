var container = document.getElementById("container")
var pageNumber = document.getElementById('pageNumber');


// Supported file types
const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
const videoExtensions = ['.mp4', '.webm', '.ogg', '.avi', '.mov', '.mkv'];

// Checks if user is on mobile and proceeds to load mobile css and remove logo.png
function isMobile() {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    return /android|iphone|ipad|ipod|blackberry|windows phone/i.test(userAgent.toLowerCase());
}
if (isMobile()) {
    imgDiv.remove();
    var mobile=true;
}

// Get presets
var PresetW
var PresetS
fetch('./BLPreset.json')
.then(response => {
    return response.json(); // Parse the JSON data
})
.then(data => {
    PresetW = data.W
    PresetS = data.S
})

// search Tags logic
var tags = ""
var search = document.getElementById('search');
search.addEventListener('change', function (event) {
    const input = search.value;

    // Match groupings with parentheses as a single unit
    const regex = /\([^)]*\)|\S+/g;

    // Find matches, preserving groupings and replacing spaces outside parentheses with '+'
    const matches = input.match(regex);
    if (matches) {
        tags = matches.map(tag => tag.trim()).join('+');
    }
});
// Blacklist tags Logic
function negativeTagsLogic(){
    if (searchNegative.value) {
        if(searchNegative.value == "W"){
            tagsNegative = PresetW;
        } else if (searchNegative.value == "S"){
            tagsNegative = PresetS;
        } else{
            tagsNegative = searchNegative.value;
        }
        searchNegative.value = tagsNegative;
        tagsNegative = tagsNegative.split(' ') // Split the string by spaces
                .map(word => `-${word}`) // Prefix each word with '-'
                .join('+'); // Join the words with a '+'
    } else {
        tagsNegative = ""
    }
}
var searchNegative = document.getElementById('searchNegative');
negativeTagsLogic()
searchNegative.addEventListener('change', function (event) {
    negativeTagsLogic()
});

// Press enter to load if you dont want to change page
document.addEventListener('keyup', function (event) {
    if (event.key === 'Enter') {
        getR34(tags, tagsNegative, pageNumber.value)
    }
})

// Page panel functionality
pageNumber.addEventListener('change', function (event) {
    getR34(tags, tagsNegative, pageNumber.value)
});
// Increase button functionality
var increaseButton = document.getElementById('increaseButton');
increaseButton.addEventListener('click', function() {
    pageNumber.value = parseInt(pageNumber.value) + 1;
    getR34(tags, tagsNegative, pageNumber.value);
});
// Decrease button functionality
var decreaseButton = document.getElementById('decreaseButton');
decreaseButton.addEventListener('click', function() {
    if (parseInt(pageNumber.value) > 0) {
        pageNumber.value = parseInt(pageNumber.value) - 1;
        getR34(tags, tagsNegative, pageNumber.value);
    }
});

// Creates content from url and is modified depending on file type and user device
async function containerElements(fileUrl, type, mob) {
    return new Promise((resolve) => {
        let file;

        if (type === "video") {
            file = document.createElement("video");
            file.controls = true;
            file.oncanplaythrough = () => resolve(); // Wait for the video to be ready to play

            let source = document.createElement("source");
            source.src = fileUrl;
            source.type = "video/" + fileUrl.split('.').pop(); // Extracts the file extension
            file.appendChild(source);
        } else {
            file = document.createElement(type);
            file.src = fileUrl;
            file.onload = () => resolve(); // Wait for the image to fully load
        }

        if (mob) {
            file.setAttribute("class", type + mob);
        } else {
            file.setAttribute("class", type);
        }

        let div = document.createElement("div");
        div.setAttribute("class", mob ? "appendDiv" + mob : "appendDiv");

        if (!mob && type === "img") {
            let aTag = document.createElement("a");
            aTag.href = fileUrl;
            aTag.appendChild(file);
            div.appendChild(aTag);
        } else {
            div.appendChild(file);
        }

        container.appendChild(div);
    });
}

async function getR34(tags, tagsNegative, pageNumber) {
    const loadingIcon = document.getElementById("loading");
    loadingIcon.style.display = "block"; // Show loading icon

    while (container.hasChildNodes()) {
        container.removeChild(container.firstChild);
    }

    fetch('https://api.rule34.xxx/index.php?page=dapi&s=post&q=index&limit=50&pid=' + pageNumber + '&tags=' + tags + "+" + tagsNegative)
        .then(response => response.text())
        .then(async xmlString => {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlString, "application/xml");
            const posts = xmlDoc.getElementsByTagName('post');

            for (let i = 0; i < posts.length; i++) {
                const fileUrl = posts[i].getAttribute('file_url');
                if (fileUrl) {
                    const fileExtension = fileUrl.substring(fileUrl.lastIndexOf('.')).toLowerCase();

                    if (imageExtensions.includes(fileExtension)) {
                        await containerElements(fileUrl, "img", mobile ? "mobile" : "");
                    } else if (videoExtensions.includes(fileExtension)) {
                        await containerElements(fileUrl, "video", mobile ? "mobile" : "");
                    }
                }
            }
            loadingIcon.style.display = "none"; // Hide loading icon when the last element is loaded
        });
}
