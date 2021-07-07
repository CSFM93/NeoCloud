const { exec } = require("child_process");

function shellFunction() {
    this.run = function (cmd, cb) {
        exec(cmd, (err, stdout, stderr) => {
            if (err) {
                console.log(`error: ${err.message}`);
                cb( { error: true, message: err.message })
            }
            if (stderr) {
                console.log(`stderr: ${stderr}`);
                cb({ error: true, message: stderr })
            }
            console.log(`stdout: ${stdout}`);
            cb({ error:false,data: stdout})
        });
    }
}




module.exports = { shellFunction }