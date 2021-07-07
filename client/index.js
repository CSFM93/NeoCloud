
let { wallet, api, u } = Neon
let posts = []
let users = []

document.addEventListener("DOMContentLoaded", (e) => {
    if (typeof (Storage) !== "undefined") {
        // console.log(" loaded before load", Neon)
        localStorage.removeItem("filteredPosts")
        localStorage.removeItem("userPosts")
    }

})


window.addEventListener('load', async (event) => {
    // SC invocation variables
    let networkMagic = 844378958
    let scriptHash = "0xefeb7fa101996240a35a88f388407f0027ce02e4"
    let rpcAddress = "https://testnet2.neo.coz.io:443";

    let currentCol = 0

    let account

    // // console.log(wallet, api,u)
    let args

    //   CHECK IF USER HAS AN ACCOUNT

    function isUserLoggedIn() {
        if (typeof (Storage) !== "undefined") {
            // Store
            account = JSON.parse(localStorage.getItem("account"))
            if (account) {
                $("#profileOrSignIn").html(`<li class="nav-item dropdown " style="margin-right: 50px;">
                <a class="nav-link dropdown-toggle" href="account.html" id="navbarDropdown" role="button"
                    data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" style="display: inline-block; text-overflow: ellipsis;">
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
        if (btnNewPost) {
            btnNewPost.addEventListener('click', function () {
                if (typeof (Storage) !== "undefined") {
                    localStorage.setItem("posts", JSON.stringify(posts))
                    localStorage.setItem("users", JSON.stringify(users))
                }
                window.location.href = "newPost.html";
            })
        }
    } else {
        let btnConnect = document.getElementById("btnConnect")
        btnConnect.addEventListener('click', function () {
            connect()
        })
    }

    function cacheUserPosts() {
        if (account) {


            let userPosts = []
            for (let i = 0; i < posts.length; i++) {

                if (posts[i].userAddress.includes(account.address)) {
                    // console.log("found")
                    userPosts.push(posts[i])
                }
            }
            // console.log("found")
            localStorage.setItem("userPosts", JSON.stringify(userPosts))
        }
    }



    // GET POSTS AND USERS

    async function getPosts() {
        let args = []
        let operation = "getPosts";

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
                for (let i = 0; i < data.length; i++) {
                    let value = JSON.parse(u.HexString.fromBase64(data[i].value).toAscii())
                    let postId = value[0].replace("posts", "")
                    let post = JSON.parse(value[1])
                    post.id = postId
                    posts.push(post)
                }
                // console.log(posts, posts.length)
                populatePage(posts)
            }


        } catch (e) {
            // console.log(e)
        }
        return res
    }

    async function getUsers() {
        let args = []
        let operation = "getUsers";

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

                for (let i = 0; i < data.length; i++) {
                    let d = data[i].value
                    // // console.log("d: ", d);
                    let value = u.HexString.fromBase64(d).toAscii()
                    let obj = JSON.parse(JSON.parse(value))
                    users.push(obj)
                }
                // console.log("users ", users, users.length)
            }


        } catch (e) {
            // console.log(e)
        }
        return res
    }

    await getPosts()
    await getUsers()
    cacheUserPosts()


    async function populatePage(posts) {

        let columns = document.getElementsByClassName("column")
        for (let i = 0; i < posts.length; i++) {
            // // console.log("is empty")

            let post = posts[i]
            setTimeout(() => {

                if (columns[0].getElementsByClassName("card").length === 0) {
                    // console.log("column 0 its empty")
                    let div = document.createElement("div")
                    let contentVideo = `<video draggable="false" autoplay loop muted playsinline>
                <source src="https://http.fs.neo.org/${post.file}" type="video/mp4">
            </video>
            <div class="card-body">
                <p class="card-text">${post.title}</p>
            </div>`
                    let contentImg = `<img
                src="https://http.fs.neo.org/${post.file}"><img>
            <div class="card-body">
                <p class="card-text">${post.title}</p>
            </div>`
                    let media = post.fileType.includes("video") ? contentVideo : contentImg
                    div.classList = "card";
                    div.innerHTML = media
                    div.addEventListener("click", function (ev) {
                        viewPost(i)
                    })
                    columns[0].appendChild(div)
                    selectDiv(currentCol)

                } else {


                    let post = posts[i]
                    let div = document.createElement("div")
                    div.classList = "card";
                    let contentVideo = `<video draggable="false" autoplay loop muted playsinline controls>
                <source src="https://http.fs.neo.org/${post.file}" type="video/mp4">
            </video>
            <div class="card-body">
                <p class="card-text">${post.title}</p>
            </div>`
                    let contentImg = `<img
                src="https://http.fs.neo.org/${post.file}"><img>
            <div class="card-body">
                <p class="card-text">${post.title}</p>
            </div>`
                    let media = post.fileType.includes("video") ? contentVideo : contentImg
                    div.classList = "card";
                    div.innerHTML = media

                    div.addEventListener("click", function (ev) {
                        viewPost(i)
                    })
                    columns[currentCol].appendChild(div)
                    // console.log("column has children ")

                    selectDiv(currentCol)

                }
            }, 200);
        }

        function selectDiv() {
            // // console.log("before", currentCol)
            if (currentCol < 3) {
                currentCol += 1
            } else {
                currentCol = 0
            }
            // // console.log("after", currentCol)

        }
    }

    function clearPosts() {
        let columns = document.getElementsByClassName("column")
        for (let i = 0; i < columns.length; i++) {
            columns[i].innerHTML = ""
            // while (columns[i].firstChild) {
            // columns[i].firstChild.remove()
            // 
        }
    }

    // Search
    // console.log($)
    let form = document.getElementById('form-search');
    form.addEventListener('submit', function (event) {
        event.preventDefault()
        let key = $('#searchField').val()
        // console.log('form', key)

        if (!key.includes("@")) {
            searchPosts(key)
        } else {
            let editedKey = key.replace("@", "")
            searchPostsByUser(editedKey)
        }

    })

    function searchPosts(key) {
        let filteredPosts = []
        posts.forEach(post => {
            if (post.title.toLowerCase().includes(key.toLowerCase())) {
                filteredPosts.push(post)
            }
        })

        // console.log(filteredPosts)
        if (filteredPosts.length > 0) {
            $('#searchField').val('')
            showFilteredPosts(filteredPosts)
        } else {
            JSAlert.alert("0 posts found").dismissIn(1000 * 2);;
        }
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



    // OPEN POST page

    let btnViewPost = document.getElementById("btnViewPost")
    function viewPost(i) {
        if (typeof (Storage) !== "undefined") {
            // Store
            localStorage.setItem("posts", JSON.stringify(posts))
            localStorage.setItem("users", JSON.stringify(users))
            localStorage.setItem("currentPost", JSON.stringify(i));
            // console.log("local storage", localStorage.getItem("posts"), localStorage.getItem("currentPost"))
            window.location.href = "post.html";
        }
    }













});

