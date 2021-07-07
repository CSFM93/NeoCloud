let isServerRunning = undefined
let baseUrl = "http://localhost:3021"
let account
let users
let posts

document.addEventListener("DOMContentLoaded", (e) => {

    if (typeof (Storage) !== "undefined") {
        // Store
        account = JSON.parse(localStorage.getItem("account"))
        users = JSON.parse(localStorage.getItem("users"))
        posts = JSON.parse(localStorage.getItem("posts"))

        // console.log("account", account)
        if (account) {
            // console.log('user exists')
        } else {
            // console.log('user don\'t exist')
            window.location.href = "index.html";
        }
    } else {
        window.location.href = "index.html";
    }




    // console.log(" loaded before load", Neon)
    axios.get(`${baseUrl}/api/ping`)
        .then(res => {
            // console.log(res)
            isServerRunning = true
        })
        .catch(function (error) {
            // console.log(JSON.stringify(error))
            isServerRunning = false
        });

})


function checkServer() {
    setTimeout(() => {
        // console.log('checking server')
        if (isServerRunning === undefined) {
            checkServer()
        } else {
            // console.log('isServer running', isServerRunning)
        }
    }, 500);
}





window.addEventListener('load', (e) => {
    // SC invocation variables
    let { CONST, wallet, api, u, rpc } = Neon
    const rpcClient = new rpc.RPCClient('https://testnet2.neo.coz.io:443');
    let networkMagic = 844378958
    let scriptHash = "0xefeb7fa101996240a35a88f388407f0027ce02e4"
    let rpcAddress = "https://testnet2.neo.coz.io:443";


    // INITIALIZE

    // async function initialize() {
    //     checkServer()


    //     if ( account !== "undefined") {
    //         // Store
    //         // console.log("account", account)
    //         if (account) {
    //             $("#profileOrSignIn").html(`<li class="nav-item dropdown " style="margin-right: 50px;">
    //             <a class="nav-link dropdown-toggle" href="account.html" id="navbarDropdown" role="button"
    //                 data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" style="display: inline-block">
    //                 ${account.user.username} <img id="userProfileImage" src="https://http.fs.neo.org/${account.user.profileImage}"
    //                 alt="Avatar" class="user_avatar" style=" margin-left: 5px;display: inline-block">
    //             </a>
    //             <div class="dropdown-menu bg-dark " aria-labelledby="navbarDropdown" style="margin-left: 0px;">
    //                 <a class="dropdown-item" style="color: lightgray;" href="userPosts.html">Posts</a>
    //                 <a class="dropdown-item" style="color: lightgray;" href="account.html">Settings</a>
    //                 <a id="btnLogout" class="dropdown-item" style="color: lightgray;" >Logout</a>
    //             </div>
    //         </li> `)



    //         } else {
    //             window.location.href = "index.html";
    //         }
    //     } else {
    //         window.location.href = "index.html";
    //     }
    // }

    // initialize()




    //   CHECK IF USER HAS AN ACCOUNT

    function isUserLoggedIn() {
        if (typeof (Storage) !== "undefined") {
            // Store
            account = JSON.parse(localStorage.getItem("account"))
            if (account) {
                $("#profileOrSignIn").html(`<li class="nav-item dropdown " style="margin-right: 50px;">
                    <a class="nav-link dropdown-toggle" href="account.html" id="navbarDropdown" role="button"
                        data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" style="display: inline-block">
                        ${account.user.username} <img id="userProfileImage" src="https://http.fs.neo.org/${account.user.profileImage}"
                        alt="Avatar" class="user_avatar" style=" margin-left: 5px;display: inline-block">
                    </a>
                    <div class="dropdown-menu bg-dark " aria-labelledby="navbarDropdown" style="margin-left: 0px;">
                        <a id="btnPosts" class="dropdown-item" style="color: lightgray;" >Posts</a>
                        <a class="dropdown-item" style="color: lightgray;" href="account.html">Settings</a>
                        <a id="btnLogout" class="dropdown-item" style="color: lightgray;" >Logout</a>
                    </div>
                </li> `)
                if (account.user.container !== "") {
                    $("#navbarLeftSide").html(`<li class="nav-item" style="margin-right: 50px;"><button id="btnNewPost" class="btn btn-success" type="submit">New Post</button></li>`)
                }

            } else {
                window.location.href = "index.html";

                $("#profileOrSignIn").html(`<li class="nav-item" style="margin-right: 50px;">
                    <button  id="btnConnect" class="btn btn-success"  type="button" >Connect</button>
                </li>`)
            }

        }
    }

    isUserLoggedIn()

    function logOut() {
        // console.log("logout")
        localStorage.removeItem("account");
        window.location.href = "index.html";
    }

    function connect() {
        window.location.href = "connect.html";
    }


    let btnLogout = document.getElementById("btnLogout")
    if (btnLogout) {
        btnLogout.addEventListener('click', function (e) {
            logOut()
        })

        let btnPosts = document.getElementById("btnPosts")
        btnPosts.addEventListener('click', function () {
            localStorage.setItem("filteredPosts", localStorage.getItem("userPosts"))
            localStorage.setItem("users", JSON.stringify(users))
            window.location.href = "filteredPosts.html";
        })

        let btnNewPost = document.getElementById("btnNewPost")
        btnNewPost.addEventListener('click', function () {
            window.location.href = "newPost.html";
        })
    } else {
        let btnConnect = document.getElementById("btnConnect")
        btnConnect.addEventListener('click', function () {
            connect()
        })
    }

 


    function showFilteredPosts(filteredPosts) {
        if (typeof (Storage) !== "undefined") {
            // Store
            localStorage.setItem("filteredPosts", JSON.stringify(filteredPosts))
            localStorage.setItem("users", JSON.stringify(users))
            window.location.href = "filteredPosts.html";
        }
    }





    let formNewPost = document.getElementById("formNewPost")
    formNewPost.addEventListener('submit', async function (ev) {
        ev.preventDefault()
        $("#btnSubmit").attr('disabled', true)
        $("#btnSubmit").html(
            `<span class="spinner-grow spinner-grow-sm" role="status" aria-hidden="true"></span>
            Creating...`
        )

        let postTitle = $("#inputPostTitle").val()
        var formData = new FormData();
        var file = document.querySelector('#mediaFile');
        // console.log("uploading", file.files[0])
        formData.append("file", file.files[0]);

        try {
            await axios.post(`${baseUrl}/api/storeFileToLocalServer`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })
                .then(async (res) => {
                    if (!res.data.error) {
                        // // console.log("response", res.data)
                        let data = res.data
                        data.fileType = file.files[0].type.split('/')[0]
                        data.title = postTitle
                        data.containerID = account.user.container
                        // console.log(" ready to upload", data)
                        await uploadFile(data)
                    } else {
                        JSAlert.alert(`Error uploading file to local server`).dismissIn(2000 * 2);;
                    }
                })
                .catch(err => {
                    JSAlert.alert(`Error uploading file to local server`).dismissIn(2000 * 2);;
                })
            $("#btnSubmit").attr('disabled', false)
            $("#btnSubmit").html("Submit")
        } catch (error) {
            $("#btnSubmit").attr('disabled', false)
            $("#btnSubmit").html("Submit")
        }
    })


    async function uploadFile(payload) {
        let data = {
            WIF: account.WIF,
            filePath: payload.filePath,
            containerID: account.user.container
        }
        // console.log('data', data)
        await axios.post(`${baseUrl}/api/uploadFileToNeoFs`, data)
            .then(async (res) => {
                if (!res.data.error) {
                    // console.log('response', res.data.neoFsFilePath)
                    payload.filePath = res.data.neoFsFilePath
                    // console.log(data)
                    let post = {
                        title: payload.title,
                        userAddress: account.address,
                        file: res.data.neoFsFilePath,
                        fileType: payload.fileType
                    }
                    let key = uuidv4()
                    // console.log('length', (new TextEncoder().encode(key)).length, " key ", key)
                    await createPost(account.WIF,post, key)
                } else {
                    // console.log('couldn\'t upload file')
                    JSAlert.alert(`Error uploading file to NeoFs`).dismissIn(1000 * 2);;
                }
            })
            .catch(err => {
                JSAlert.alert(`Error uploading file to NeoFs`).dismissIn(2000 * 2);;
            })
    }


    async function createPost(WIF,data, key) {
        let account = new Neon.wallet.Account(WIF)

        // console.log("acc", account)
        // console.log(data)
        let args = [{ "type": "String", "value": JSON.stringify(data) }, { "type": "String", "value": key }]
        // console.log("args: ", args)
        let operation = "addPost";

        const contract = new Neon.experimental.SmartContract(
            Neon.u.HexString.fromHex(scriptHash),
            {
                networkMagic,
                rpcAddress,
                account
            }
        );

        let res
        try {

            res = await contract.invoke(operation, args)
                .catch(err => {
                    // console.log('error', err)
                    JSAlert.alert(`Error`, err).dismissIn(1000 * 2);;

                })
            // console.log('success', res)
            JSAlert.alert("Post created successfully").dismissIn(1000 * 2);;

        } catch (e) {
            // console.log(e)
        }
        return res
    }



















});

