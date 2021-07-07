const shellFunction = require('./runShellcommand').shellFunction


let shell = new shellFunction()

let neoFS_CLI = {
    async checkBalance(WIF, cb) {
        try {
            shell.run(`neofs-cli accounting balance -r st1.storage.fs.neo.org:8080 -k ${WIF}`, (response) => {
                console.log(response)
                if (!response.error) {
                    response.data = response.data.trim()
                    let data = response.data.split('\n')
                    console.log(data)
                    let balance = parseFloat(data[0])
                    console.log(parseFloat(data[0]))
                    cb({ error: false, balance: balance })
                } else {
                    cb({ error: true, message: response.message })
                }
            })
        } catch (error) {
            cb({ error: true, message: error })
        }
    },
    async createContainer(WIF,cb) {
        try {
            shell.run(`neofs-cli container create -r st1.storage.fs.neo.org:8080 -k ${WIF} --basic-acl public-read --policy "REP 1"  --await`, (response) => {
                console.log(response)
                if (!response.error) {
                    response.data = response.data.trim()
                    let data = response.data.split('\n')
                    console.log(data)
                    let containerID = data[0].replace('container ID:', '').trim()
                    console.log('containerID:', containerID)
                    cb( { error: false, containerID: containerID })
                } else {
                    cb( { error: true, message: response.message })
                }
            })
        } catch (error) {
            cb ({ error: true, message: error })
        }
    },
    async uploadFile(WIF, containerID, filePath, cb) {
        try {
            shell.run(`neofs-cli -r st1.storage.fs.neo.org:8080 -k ${WIF} object put --file ${filePath} --cid ${containerID} `, (response) => {
                console.log(response)
                if (!response.error) {
                    response.data = response.data.trim()
                    let data = response.data.split('\n')
                    let fileID = data[1].replace('ID: ', '').trim()
                    let containerID = data[2].replace('CID: ', '').trim()
                    let filePath = `${containerID}/${fileID}`
                    console.log(`file path ${containerID}/${fileID}`)

                    cb({ error: false, filePath: filePath })
                } else {
                    cb({ error: true, message: response.message })
                }
            })
        } catch (error) {
            cb({ error: true, message: error })
        }
    },
}


module.exports = { neoFS_CLI }
