let express = require('express')
let router = express.Router()
let neoFsCli = require('../helpers/neoFsCLIHelper').neoFS_CLI
const fs = require('fs')
const path = require('path')




router.get('/api/ping', (req, res) => {
    try {
        res.status(200).json({ isRunning: true });
    } catch (error) {
        res.status(200).json({ error: true, message: error })
    }
});

router.post('/api/getBalance', async (req, res) => {
    try {
        console.log(req.body)
        neoFsCli.checkBalance(req.body.WIF, function (neoFsResponse) {
            if (!neoFsResponse.error) {
                res.status(200).json({ error: false, balance: neoFsResponse.balance });
            } else {
                res.status(200).json({ error: true })
            }

        })
    } catch (error) {
        res.status(200).json({ error: true, message: error })
    }
})

router.post('/api/storeFileToLocalServer', async (req, res) => {
    try {
        console.log(req.body)
        let file;
        let uploadPath = "./tempFiles/";

        if (!req.files || Object.keys(req.files).length === 0) {
            console.log("no file found")
            return res.status(400).json({ error: true, message: "no file found" });
        }
        console.log(req.files)
        file = req.files.file;
        let fileName = file.name.replace(/\s+/g, '')
        console.log("file found", file.name, file.mimetype)
        let filePath = uploadPath + fileName;
        file.mv(filePath, function (err) {
            if (err) {
                return res.status(500).json({ error: true, message: err });
            }


            res.status(200).json({ error: false, filePath: filePath })
        })
    } catch (error) {
        res.status(200).json({ error: true, message: error })
    }


})

router.post('/api/uploadFileToNeoFs', async (req, res) => {
    try {
        console.log(req.body)
        neoFsCli.uploadFile(req.body.WIF, req.body.containerID, req.body.filePath, function (neoFsResponse) {
            if (!neoFsResponse.error) {
                deleteFile(req.body.filePath)
                res.status(200).json({ error: false, neoFsFilePath: neoFsResponse.filePath });
            } else {
                deleteFile(req.body.filePath)
                res.status(200).json({ error: true })
            }
        })
    } catch (error) {
        res.status(200).json({ error: true, message: error })
    }
})


router.post('/api/CreateContainer', async (req, res) => {
    try {
        console.log(req.body)
        neoFsCli.createContainer(req.body.WIF, function (neoFsResponse) {
            if (!neoFsResponse.error) {
                res.status(200).json({ error: false, containerID: neoFsResponse.containerID });
            } else {
                res.status(200).json({ error: true, message: neoFsResponse.message })
            }
        })
    } catch (error) {
        res.status(200).json({ error: true, message: error })
    }
})



const deleteFile = (filePath) => {
    fs.unlink(filePath, (err) => {
        if (err) {
            return
        }
        console.log('file deleted')
    })
}


module.exports = router