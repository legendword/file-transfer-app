const {
    ipcRenderer
} = require('electron')
const path = require('path')
const request = require('request')
const fs = require('fs')
const http = require('http')
const unusedFilename = require('unused-filename')

/*
let downloadsPath = ''
ipcRenderer.on('downloads-path', (e, arg) => {
    downloadsPath = arg
})
*/
let downloadsPath = ''
ipcRenderer.invoke('get-path', 'downloads').then((result) => {
    downloadsPath = result
})

let uploadState = 0
let downloadState = 0

document.querySelectorAll(".sidebar-item").forEach((v, i) => v.addEventListener("click", (event) => {
    let elem = event.target.classList.contains('sidebar-item') ? event.target : event.target.parentElement
    document.getElementById(document.querySelector(".sidebar-item.active").dataset.target).classList.remove('active')
    document.querySelector(".sidebar-item.active").classList.remove('active')
    document.getElementById(elem.dataset.target).classList.add('active')
    elem.classList.add('active')
    if (uploadState == 2) {
        uploadState = 0
        document.querySelector('.upload-section.active').classList.remove('active')
        document.querySelector('#upload-dropzone').classList.add('active')
    }
}))

const dropZone = document.getElementById('upload-dropzone')
dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.dataTransfer.files.length > 1) {
        console.log('Too many files!')
        return
    }

    uploadFile(e.dataTransfer.files[0], 'form')

})
dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.stopPropagation();
})
dropZone.addEventListener('click', (e) => {
    ipcRenderer.send('upload-dialog')
})
ipcRenderer.on('upload-dialog-closed', (e, arg) => {
    uploadFile(arg, 'path')
})

const downloadBtn = document.querySelector('#download-btn')
const downloadInput = document.querySelector('#download-code')
downloadBtn.addEventListener('click', (e) => {
    e.preventDefault()
    e.stopPropagation()
    downloadFile(downloadInput.value)
})
downloadInput.addEventListener('keydown', (e) => {
    if (e.key == 'Enter') {
        downloadFile(downloadInput.value)
    }
})

function downloadFile(code) {
    if (code.length != 4 || isNaN(code) || parseInt(code) < 0) return

    let creq = new XMLHttpRequest()
    creq.addEventListener('load', checkCodeResponse)
    creq.open('GET', 'http://legendword.com/s/transfer/transfer_check.php?code='+code)
    creq.send()

    function checkCodeResponse(ev) {
        if (this.responseText!='true') {
            //file doesn't exist
            console.log(code, 'file doesn\'t exist')
        }
        else {

            let req = http.get({
                hostname: 'legendword.com',
                port: 80,
                path: '/s/transfer/transfer_download.php?code='+code
            }, (res) => {
                console.log(res)
                let bytes = 0
                let totalBytes = parseInt(res.headers['content-length'])
                let fname = res.headers["content-disposition"].substring(22, res.headers["content-disposition"].length-1)

                if (downloadsPath == '') return;
                const filePath = unusedFilename.sync(path.join(downloadsPath,fname))
                const saveFile = fs.createWriteStream(filePath)
                res.pipe(saveFile)

                res.on('data', (chunk) => {
                    //console.log(`BODY: ${chunk}`)
                    bytes += chunk.length
                    downloadProgress({
                        loaded: bytes,
                        total: totalBytes
                    })
                })
                res.on('end', () => {
                    console.log('File downloaded')
                    downloadInput.value = ''
                    downloadState = 0
                    document.querySelector('.download-section.active').classList.remove('active')
                    document.querySelector('#download-input').classList.add('active')
                    let ntf = {
                        title: 'Download Complete',
                        body: fname
                    }
                    const notification = new window.Notification(ntf.title, ntf)
                })

                downloadState = 1
                document.querySelector('#download-filename').innerHTML = fname
                document.querySelector('#download-progressbar').style.width = 0
                document.querySelector('.download-section.active').classList.remove('active')
                document.querySelector('#download-info').classList.add('active')
            })
            req.end()

            

            function downloadProgress(ev) {
                document.querySelector('#download-progressbar').style.width = ((ev.loaded / ev.total) * 100) + '%'
                document.querySelector('#download-status').innerHTML = formatBytes(ev.loaded) + ' / ' + formatBytes(ev.total)
        
                function formatBytes(bt) {
                    if (bt < 1000) return bt + 'B'
                    if (bt < 1000000) return (bt / 1000).toFixed(1) + 'KB'
                    return (bt / 1000000).toFixed(1) + 'MB'
                }
            }
        }
    }
}

function uploadFile(f, method) {

    let filename = method == 'path' ? path.basename(f) : f.name

    if (method == 'path') {
        let totalBytes = fs.statSync(f).size
        let bytes = 0
        uploadStart()
        let fileStream = fs.createReadStream(f)
        request.post({
            url: 'https://legendword.com/s/transfer/transfer_query.php',
            formData: {
                'uploadfile': fileStream
            }
        }, (err, response, body) => {
            uploadFinish(body)
        })
        fileStream.on('data', (chunk) => {
            bytes += chunk.length
            uploadProgress({
                loaded: bytes,
                total: totalBytes
            })
        })
    } else {
        let formdata = new FormData()
        formdata.append('uploadfile', f)
        let re = new XMLHttpRequest()
        re.open('POST', 'https://legendword.com/s/transfer/transfer_query.php', true);
        re.addEventListener('loadstart', uploadStart)
        re.addEventListener('load', uploadFinish)
        re.upload.addEventListener('progress', uploadProgress)
        re.send(formdata)
    }


    uploadState = 1
    document.querySelector('#upload-filename').innerHTML = filename
    document.querySelector('#success-filename').innerHTML = filename
    document.querySelector('#upload-progressbar').style.width = 0
    document.querySelector('.upload-section.active').classList.remove('active')
    document.querySelector('#upload-info').classList.add('active')


    function uploadStart() {
        console.log('Upload started...', filename)
    }

    function uploadFinish(res) {
        //todo: handle error code from server
        if (method == 'path') {
            console.log('Upload finished.', res)
            document.querySelector('#success-code').innerHTML = res
        } else {
            console.log('Upload finished.', this.responseText)
            document.querySelector('#success-code').innerHTML = this.responseText
        }
        uploadState = 2
        document.querySelector('.upload-section.active').classList.remove('active')
        document.querySelector('#upload-success').classList.add('active')
    }

    function uploadProgress(ev) {
        document.querySelector('#upload-progressbar').style.width = ((ev.loaded / ev.total) * 100) + '%'
        document.querySelector('#upload-status').innerHTML = formatBytes(ev.loaded) + ' / ' + formatBytes(ev.total)

        function formatBytes(bt) {
            if (bt < 1000) return bt + 'B'
            if (bt < 1000000) return (bt / 1000).toFixed(1) + 'KB'
            return (bt / 1000000).toFixed(1) + 'MB'
        }
    }
}