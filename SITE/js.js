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
        tagsNegative = searchNegative.value.split(' ') // Split the string by spaces
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
function containerElements(fileUrl, type, mob){
    file = document.createElement(type);
    file.src = fileUrl;
    if (type=="video"){
        file.controls = true;
    }

    if (mob){
        file.setAttribute('class', type+mob);
    }else{
        file.setAttribute('class', type);
    }

    div = document.createElement('div');
    if (mob){
        div.setAttribute('class', 'appendDiv'+mob);
    }else{
        div.setAttribute('class', 'appendDiv');
    }

    if (!mob&&type=="img"){
        aTag = document.createElement("a");
        aTag.href = fileUrl;
        //aTag.target = "_blank"; // Optional: open in a new tab
        aTag.appendChild(file);
        div.appendChild(aTag);
    }else{
        div.appendChild(file);
    }
    container.appendChild(div);
}

// Uses api to get and create images and or videos
function getR34(tags, tagsNegative, pageNumber) {
    while (container.hasChildNodes()) {// Remove old content
        container.removeChild(container.firstChild);
    }
    fetch('https://api.rule34.xxx/index.php?page=dapi&s=post&q=index&limit=50&pid=' + pageNumber + '&tags=' + tags + "+" + tagsNegative)
        .then(response => {
            return response.text(); // Get the raw response as text
        })
        .then(xmlString => {
            // Parse the raw XML string into an XML document
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlString, "application/xml");

            // Extract 'post' elements from the XML
            const posts = xmlDoc.getElementsByTagName('post');
            for (let i = 0; i < posts.length; i++) {
                const fileUrl = posts[i].getAttribute('file_url'); // Get the file_url attribute
                if (fileUrl) {
                    // Get the file extension from the URL
                    const fileExtension = fileUrl.substring(fileUrl.lastIndexOf('.')).toLowerCase();

                    // Check if the URL leads to an image
                    if (imageExtensions.includes(fileExtension)) {
                        if (mobile){
                            containerElements(fileUrl,"img","mobile")
                        }else{
                            containerElements(fileUrl,"img")
                        }
                    }
                    // Check if the URL leads to a video
                    else if (videoExtensions.includes(fileExtension)) {
                        if (mobile){
                            containerElements(fileUrl,"video","mobile")
                        }else{
                            containerElements(fileUrl,"video")
                        }
                    }
                }
            }
        })
}