let account
let users = []
document.addEventListener("DOMContentLoaded", async (e) => {
    if (typeof (Storage) !== "undefined") {
        // Store
        account = JSON.parse(localStorage.getItem("account"))
        users = JSON.parse(localStorage.getItem("users"))
    }
})

window.addEventListener('load', (event) => {
    // $('#modalDeletePost').modal('show');

    let { CONST, wallet, api, u, rpc } = Neon
    const rpcClient = new rpc.RPCClient('https://testnet2.neo.coz.io:443');
    let networkMagic = 844378958
    let scriptHash = "0xefeb7fa101996240a35a88f388407f0027ce02e4"
    let rpcAddress = "https://testnet2.neo.coz.io:443";


    let posts
    let currentPostIndex
    let post
    let user

    // INITIALIZE

    if (typeof (Storage) !== "undefined") {
        // Store
        posts = JSON.parse(localStorage.getItem("posts"))
        currentPostIndex = JSON.parse(localStorage.getItem("currentPost"))
        populatePage()
    }


    //   CHECK IF USER HAS AN ACCOUNT

    function isUserLoggedIn() {
        if (typeof (Storage) !== "undefined") {
            // Store
            // account = JSON.parse(localStorage.getItem("account"))
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
                    // console.log('account: ',account)
                }

            } else {
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
        if(btnNewPost){
            btnNewPost.addEventListener('click', function () {
                window.location.href = "newPost.html";
            })
        }

    } else {
        let btnConnect = document.getElementById("btnConnect")
        btnConnect.addEventListener('click', function () {
            connect()
        })
    }

    function searchPostsByUser(key) {
        let user
        for (let i = 0; i < users.length; i++) {
            if (users[i].username.toLowerCase().includes(key.toLowerCase())) {
                user = users[i]
                break;
            }
        }

        if (user !== undefined) {

            let filteredPosts = []
            posts.forEach(post => {
                if (post.userAddress.includes(user.address)) {
                    filteredPosts.push(post)
                }
            })

            // console.log('users', filteredPosts)
            if (filteredPosts.length > 0) {
                $('#searchField').val('')
                showFilteredPosts(filteredPosts)
            } else {
                JSAlert.alert("0 posts found").dismissIn(1000 * 2);;
            }
        } else {
            JSAlert.alert("0 users found").dismissIn(1000 * 2);;

        }
    }


    function showFilteredPosts(filteredPosts) {
        if (typeof (Storage) !== "undefined") {
            // Store
            localStorage.setItem("filteredPosts", JSON.stringify(filteredPosts))
            localStorage.setItem("users", JSON.stringify(users))
            window.location.href = "filteredPosts.html";
        }
    }






    async function getPost(postId) {
        let args = [{ "type": "String", "value": postId }]
        let operation = "getPost";

        const contract = new Neon.experimental.SmartContract(
            Neon.u.HexString.fromHex(scriptHash),
            {
                networkMagic,
                rpcAddress,
            }
        );

        let res
        try {

            res = await contract.testInvoke(operation, args)
                .catch(err => {
                    // console.log('error', err)
                })
            // console.log(res.state, res.gasconsumed, res.exception)
            if (res.stack) {
                // console.log('stack', res.stack[0].value[0].value)
                let data = res.stack[0].value
                // console.log("data", data)

                post = JSON.parse(u.HexString.fromBase64(data).toAscii())
                post.id = postId
                // console.log('post retrieved: ', post)
            }


        } catch (e) {
            // console.log(e)
        }
        return res
    }


    async function getUser(userAddress) {
        let args = [{ "type": "String", "value": userAddress }]
        let operation = "getUser";

        const contract = new Neon.experimental.SmartContract(
            Neon.u.HexString.fromHex(scriptHash),
            {
                networkMagic,
                rpcAddress,
            }
        );

        let res
        try {

            res = await contract.testInvoke(operation, args)
                .catch(err => {
                    // console.log('error', err)
                })
            // console.log(res.state, res.gasconsumed, res.exception)
            if (res.stack) {
                // console.log('stack', res.stack[0].value[0].value)
                let data = res.stack[0].value
                // console.log("data", data)

                user = JSON.parse(u.HexString.fromBase64(data).toAscii())
                // console.log('user retrieved: ', user)
            }


        } catch (e) {
            // console.log(e)
        }
        return res
    }



    async function populatePage() {
        // users = JSON.parse(localStorage.getItem("users"))
        await getPost(posts[currentPostIndex].id)
        // post = posts[currentPostIndex]
        // console.log(currentPostIndex, posts, post)
        await getUser(post.userAddress)


        let pageTitle = document.getElementsByTagName("title")[0]
        pageTitle.innerText = post.title
        $('#postTitle').html(post.title)
        $('#username').html(user.username)
        $('#postFile').attr("src", "https://http.fs.neo.org/" + post.file);
        $('#postUserProfileImage').attr("src", "https://http.fs.neo.org/" + user.profileImage);

        let contentImg = `<img id="postFile" src="https://http.fs.neo.org/${post.file}" style="width:100%;height:100%">`
        let contentVideo = `<video draggable="false" autoplay loop  playsinline controls style="width:100%;height:100%">
        <source src="https://http.fs.neo.org/${post.file}" type="video/mp4">
    </video>`
        let media = post.fileType.includes("video") ? contentVideo : contentImg
        let divPost = document.getElementById("post_div")
        divPost.innerHTML = media

        if (post.userAddress.includes(account.address)) {
            // console.log("can set as profile pic")
            if (post.fileType.toLowerCase() !== "video") {
                $('#managePost').html(`<button id="btnSetProfilePic" style="color: white;" class="btn btn-info" type="submit">Set as profile
                pic</button>
            <button id="btnChangeTitle" style="color: white; margin-left: 10px;" class="btn btn-info"
                type="submit">Edit title</button>
            <button id="btnDelete" style="color: white; margin-left: 10px;" class="btn btn-danger"
                type="submit">Delete</button>`)
            } else {
                $('#managePost').html(`<button id="btnChangeTitle" style="color: white; margin-left: 80px;" class="btn btn-info"
                type="submit">Edit title</button>
            <button id="btnDelete" style="color: white; margin-left: 10px;" class="btn btn-danger"
                type="submit">Delete</button>`)
            }

            setTimeout(() => {
                managePost()
            }, 2000);

        } else {
            // console.log("cannot set as profile pic")
        }

    }




    // GO TO NEXT ITEM
    let btnNextPost = document.getElementById('btnNextPost')

    btnNextPost.addEventListener('click', function (e) {
        let totalPosts = posts.length - 1
        if (currentPostIndex < totalPosts) {
            currentPostIndex += 1
        } else {
            currentPostIndex = 0
        }
        viewPost(currentPostIndex)
    })

    // GO TO PREVIOUS ITEM
    let btnPreviousPost = document.getElementById('btnPreviousPost')
    btnPreviousPost.addEventListener('click', function (e) {
        let totalPosts = posts.length - 1
        if (currentPostIndex === 0) {
            currentPostIndex = totalPosts
        } else {
            currentPostIndex -= 1
        }
        viewPost(currentPostIndex)
    })

    function viewPost(i) {
        if (typeof (Storage) !== "undefined") {
            // Store
            localStorage.setItem("posts", JSON.stringify(posts))
            localStorage.setItem("currentPost", JSON.stringify(i));
            // console.log("local storage", localStorage.getItem("posts"), localStorage.getItem("currentPost"))
            window.location.href = "post.html";
        }
    }



    // COPY TO CLIPBOARD

    let btnCopy = document.getElementById('btnCopyUrl')
    btnCopy.addEventListener('click', function (e) {
        let fileUrl = `https://http.fs.neo.org/${post.file}`
        navigator.clipboard.writeText(fileUrl).then(res => {
            // console.log('success');
            JSAlert.alert("Link copied to clipboard").dismissIn(1000 * 2);;
        })
            .catch(error => {
                // console.log(error)
            })
    })





    // SET AS PROFILE PIC, EDIT TITLE, DELETE POST


    async function editUser(WIF, data, key) {
        let account = new Neon.wallet.Account(WIF)

        // console.log("account", account)

        // console.log(data)
        let args = [{ "type": "String", "value": JSON.stringify(data) }, { "type": "String", "value": key }]
        // console.log("args: ", args)
        let operation = "editUser";

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

            JSAlert.alert("User edited successfully").dismissIn(1000 * 2);;

        } catch (e) {
            JSAlert.alert(`Error`, e).dismissIn(1000 * 2);;
            // console.log(e)
        }
        return res
    }

    async function editPost(WIF, data, key) {
        let account = new Neon.wallet.Account(WIF)

        // console.log("account", account)

        // console.log(data)
        let args = [{ "type": "String", "value": JSON.stringify(data) }, { "type": "String", "value": key }]
        // console.log("args: ", args)
        let operation = "editPost";

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

            JSAlert.alert("Post edited successfully").dismissIn(1000 * 2);;

        } catch (e) {
            JSAlert.alert(`Error`, e).dismissIn(1000 * 2);;
            // console.log(e)
        }
        return res
    }

    async function deletePost(WIF, key) {
        let account = new Neon.wallet.Account(WIF)

        // console.log("account", account)

        let args = [{ "type": "String", "value": key }]
        // console.log("args: ", args)
        let operation = "deletePost";

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

            JSAlert.alert("Post deleted successfully").dismissIn(1000 * 2);;

        } catch (e) {
            JSAlert.alert(`Error`, e).dismissIn(1000 * 2);;
            // console.log(e)
        }
        return res
    }

    function managePost() {

        // CHANGE PROFILE PIC
        let btnSetProfilePic = document.getElementById('btnSetProfilePic')
        if (btnSetProfilePic) {
            btnSetProfilePic.addEventListener('click', async function (e) {
                // console.log("changing profile pic")
                $(this).attr('disabled', true)
                $(this).html(
                    `<span class="spinner-grow spinner-grow-sm" role="status" aria-hidden="true"></span>
                    Changing...`
                )
                account.user.profileImage = post.file
                try {
                    await editUser(account.WIF, account.user, account.address)
                    $(this).attr('disabled', false)
                    $(this).html("Set as profile pic")
                    localStorage.setItem("account", JSON.stringify(account))
                    location.reload();
                } catch (error) {
                    $(this).attr('disabled', false)
                    $(this).html("Set as profile pic")

                }
            })
        }


        // CHANGE POST TITLE

        let btnChangeTitle = document.getElementById('btnChangeTitle')
        btnChangeTitle.addEventListener('click', async function (e) {
            $('#modalEditPostTitle').modal('show');
        })

        let formEditPost = document.getElementById("formEditPost")
        formEditPost.addEventListener('submit', async function (ev) {
            ev.preventDefault()
            $("#btnSubmit").attr('disabled', true)
            $("#btnSubmit").html(
                `<span class="spinner-grow spinner-grow-sm" role="status" aria-hidden="true"></span>
                Changing...`
            )
            let postTitle = $("#inputPostTitle")[0].value
            // console.log(postTitle)
            // console.log("post title: ", postTitle, " - ", post.title)
            let editedPost = post
            editedPost.title = postTitle
            let key = post.id
            delete editedPost.id
            try {
                await editPost(account.WIF, editedPost, key)
                // console.log("edited post", editedPost)
                $("#btnSubmit").attr('disabled', false)
                $("#btnSubmit").html("Submit")
                $('#modalEditPostTitle').modal('hide');
            } catch (error) {
                $(this).attr('disabled', false)
                $(this).html("Submit")
                JSAlert.alert("Failed to edit post : \n " + error).dismissIn(1000 * 2);;

            }

        })

        // DELETE USER
        let btnDelete = document.getElementById('btnDelete')
        btnDelete.addEventListener('click', async function (e) {
            $('#modalDeletePost').modal('show');
        })

        let btnConfirmDelete = document.getElementById('btnConfirmDelete')
        btnConfirmDelete.addEventListener('click', async function (e) {
            // console.log("deleting post")

            $(this).attr('disabled', true)
            $(this).html(
                `<span class="spinner-grow spinner-grow-sm" role="status" aria-hidden="true"></span>
                Deleting...`
            )
            try {
                await deletePost(account.WIF, post.id)
                $(this).attr('disabled', false)
                $(this).html("yes")
                $('#modalDeletePost').modal('hide');
                window.location.href = "index.html";
            } catch (error) {
                $(this).attr('disabled', false)
                $(this).html("Yes")

            }

        })


        let btnCancelDelete = document.getElementById('btnCancelDelete')
        btnCancelDelete.addEventListener('click', async function (e) {
            $('#modalDeletePost').modal('hide');
        })




    }

})