import {browser} from '$app/env'

function browserSet(key, item) {
    if(browser) {
        localStorage.setItem(key, JSON.stringify(item))
    }
}  

function browserGet(key) {
    if(browser) {
        const item = localStorage.getItem(key)
        if(item) {
            return JSON.parse(item)
        }
    }
    return null
}

function browserRemove(key) {
    if(browser) {
        localStorage.removeItem(key)
    }
}

function browserSetPhotoFile(key, file) {
    if(browser) {
        localStorage.setItem(key + '-file-name', file.name)
        var reader = new FileReader()
        reader.onload = function(e) {
            try {
                localStorage.setItem(key, reader.result);
            }
            catch (error) {
                alert("Your image is not saved to browser storage. This may happen if you're using mobile browser.") // @dev/amartis: Review English message.
            }
        }
        reader.readAsDataURL(file);
    }
 }
 
 async function browserGetPhotoFile(key) {
    if(browser) {
        const fileName = localStorage.getItem(key + '-file-name')
        const image = localStorage.getItem(key);
        if(image && fileName) {
            try {
                const res = await fetch(image)
                const blob = await res.blob()
                const file = new File([blob], fileName, blob)
                return { file, imgSrc: image }
            } catch(err) {
                console.log(err)
                return { file: undefined, imgSrc: undefined }
            }
        }
    }
    return { file: undefined, imgSrc: undefined }
 }

 function browserRemovePhotoFile(key) {
    if(browser) {
        localStorage.removeItem(key)
        localStorage.removeItem(key + '-file-name')
    }
 }

export { browserSet, browserGet, browserRemove, browserGetPhotoFile, browserSetPhotoFile, browserRemovePhotoFile }